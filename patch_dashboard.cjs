const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the double project_url
content = content.replace(/project_url: cfg\.project_url \|\| prev\.project_url,\n\s*project_url: cfg\.project_url \|\| prev\.project_url,/, 'project_url: cfg.project_url || prev.project_url,');

// 2. We need to refactor the useEffect so it fetches global config FIRST, then checks devices.
// But wait, the easiest way to get the global config is from the `__GLOBAL_CONFIG__` row.
// Let's rewrite the sync logic entirely inside that useEffect.

const old_sync = `      // 1. Fetch devices and auto-sync any existing devices from device_status into sms_forwarder_settings
      Promise.all([
        supabase.from('sms_forwarder_settings').select('*').eq('user_id', user.id),
        supabase.from('device_status').select('*').eq('user_id', user.id)
      ]).then(async ([{ data: fData }, { data: dData }]) => {
        if (!isMounted) return;

        const forwarderDevices = new Set((fData || []).map(d => d.device_name).filter(d => Boolean(d) && d !== '__GLOBAL_CONFIG__'));
        const statusDevices = Array.from(new Set((dData || []).map(d => d.device_id).filter(d => d && d !== 'android-app-1' && d !== 'default-device')));

        
        // Check if there are any devices in device_status not yet saved in sms_forwarder_settings
        const missingInForwarder = statusDevices.filter(d => !forwarderDevices.has(d));
        if (missingInForwarder.length > 0) {
          for (const dev of missingInForwarder) {
            const hostUrl = forwarderSettings.project_url ;
            const anonKey = forwarderSettings.anon_key ;
            const channel = forwarderSettings.ws_channel ;
            const edgeUrl = forwarderSettings.heartbeat_edge_url ;
            const genWebhookUrl = \`\${forwarderSettings.webhook_edge_url }?user_id=\${user.id}\`;
            const genWsUrl = \`wss://\${hostUrl}/realtime/v1/websocket?apikey=\${anonKey}&vsn=1.0.0&channel=\${channel}&user_id=\${user.id}&secret=\${hmacSecret || ''}&device_id=\${encodeURIComponent(dev)}&edge_url=\${edgeUrl}\`;

            await supabase.from('sms_forwarder_settings').upsert({
              user_id: user.id,
              device_name: dev,
              hmac_secret: hmacSecret || '',
              sender_number: forwarderSettings.sender_number,
              text_filter: forwarderSettings.text_filter,
              webhook_edge_url: forwarderSettings.webhook_edge_url,
              headers: forwarderSettings.headers,
              json_payload_template: forwarderSettings.json_payload_template,
              project_url: forwarderSettings.project_url,
              anon_key: forwarderSettings.anon_key,
              ws_channel: forwarderSettings.ws_channel,
              heartbeat_edge_url: forwarderSettings.heartbeat_edge_url,
              webhook_url: genWebhookUrl,
              heartbeat_ws_url: genWsUrl,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,device_name' });
          }
        }

        const allDevices = Array.from(new Set([...forwarderDevices, ...statusDevices]));
        setCustomDevices(allDevices);
        if (dData) {
          const activeStatuses = dData.filter(d => d && d.device_id !== 'android-app-1' && d.device_id !== 'default-device');
          setDeviceStatuses(activeStatuses);
        }
      });`

const new_sync = `      // 1. Fetch devices and auto-sync any existing devices from device_status into sms_forwarder_settings
      Promise.all([
        supabase.from('sms_forwarder_settings').select('*').eq('user_id', user.id),
        supabase.from('device_status').select('*').eq('user_id', user.id)
      ]).then(async ([{ data: fData }, { data: dData }]) => {
        if (!isMounted) return;

        const forwarderDevices = new Set((fData || []).map(d => d.device_name).filter(d => Boolean(d) && d !== '__GLOBAL_CONFIG__'));
        const statusDevices = Array.from(new Set((dData || []).map(d => d.device_id).filter(d => d && d !== 'android-app-1' && d !== 'default-device')));
        
        // Find __GLOBAL_CONFIG__ to use for missing devices
        const globalConfigRow = (fData || []).find(d => d.device_name === '__GLOBAL_CONFIG__');

        // Check if there are any devices in device_status not yet saved in sms_forwarder_settings
        const missingInForwarder = statusDevices.filter(d => !forwarderDevices.has(d));
        if (missingInForwarder.length > 0 && globalConfigRow) {
          for (const dev of missingInForwarder) {
            const hostUrl = globalConfigRow.project_url || '';
            const anonKey = globalConfigRow.anon_key || '';
            const channel = globalConfigRow.ws_channel || '';
            const edgeUrl = globalConfigRow.heartbeat_edge_url || '';
            const webEdgeUrl = globalConfigRow.webhook_edge_url || '';
            const genWebhookUrl = \`\${webEdgeUrl}?user_id=\${user.id}\`;
            const genWsUrl = \`wss://\${hostUrl}/realtime/v1/websocket?apikey=\${anonKey}&vsn=1.0.0&channel=\${channel}&user_id=\${user.id}&secret=\${hmacSecret || ''}&device_id=\${encodeURIComponent(dev)}&edge_url=\${edgeUrl}\`;

            await supabase.from('sms_forwarder_settings').upsert({
              user_id: user.id,
              device_name: dev,
              hmac_secret: hmacSecret || '',
              sender_number: globalConfigRow.sender_number,
              text_filter: globalConfigRow.text_filter,
              webhook_edge_url: webEdgeUrl,
              headers: globalConfigRow.headers,
              json_payload_template: globalConfigRow.json_payload_template,
              project_url: hostUrl,
              anon_key: anonKey,
              ws_channel: channel,
              heartbeat_edge_url: edgeUrl,
              dashboard_url: 'https://mecopay.pages.dev/dashboard',
              webhook_url: genWebhookUrl,
              heartbeat_ws_url: genWsUrl,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,device_name' });
          }
        }

        const allDevices = Array.from(new Set([...forwarderDevices, ...statusDevices]));
        setCustomDevices(allDevices);
        if (dData) {
          const activeStatuses = dData.filter(d => d && d.device_id !== 'android-app-1' && d.device_id !== 'default-device');
          setDeviceStatuses(activeStatuses);
        }
      });`

content = content.replace(old_sync, new_sync);

fs.writeFileSync(file, content);
console.log('Patched DashboardShell.tsx sync devices');
