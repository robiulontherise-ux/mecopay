const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

// Patch /api/user/add-device
const addDeviceOld = `
      if (!user_id || !device_name) return res.status(400).json({ error: "Missing required fields" });
      
      const genWebhookUrl = \`\${settings.webhook_edge_url}?user_id=\${user_id}\`;
      const genWsUrl = \`wss://\${settings.project_url}/realtime/v1/websocket?apikey=\${settings.anon_key}&vsn=1.0.0&channel=\${settings.ws_channel}&user_id=\${user_id}&secret=\${hmac_secret}&device_id=\${encodeURIComponent(device_name)}&edge_url=\${settings.heartbeat_edge_url}\`;
      
      // 1. Insert into sms_forwarder_settings
      const { error: sfErr } = await supabaseAdmin.from('sms_forwarder_settings').upsert({
        user_id,
        device_name,
        hmac_secret,
        sender_number: settings.sender_number,
        text_filter: settings.text_filter,
        webhook_edge_url: settings.webhook_edge_url,
        headers: settings.headers,
        project_url: settings.project_url,
        anon_key: settings.anon_key,
        ws_channel: settings.ws_channel,
        heartbeat_edge_url: settings.heartbeat_edge_url,
        webhook_url: genWebhookUrl,
        heartbeat_ws_url: genWsUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,device_name' });
`;

const addDeviceNew = `
      if (!user_id || !device_name) return res.status(400).json({ error: "Missing required fields" });
      
      // Fetch global config dynamically so new devices always get the latest admin settings
      const { data: globalConfig, error: globalErr } = await supabaseAdmin
        .from('sms_forwarder_settings')
        .select('*')
        .eq('device_name', '__GLOBAL_CONFIG__')
        .single();
        
      if (globalErr || !globalConfig) {
         return res.status(500).json({ error: "Global configuration not found" });
      }

      const adminSettings = globalConfig;
      
      const genWebhookUrl = \`\${adminSettings.webhook_edge_url}?user_id=\${user_id}\`;
      const genWsUrl = \`wss://\${adminSettings.project_url}/realtime/v1/websocket?apikey=\${adminSettings.anon_key}&vsn=1.0.0&channel=\${adminSettings.ws_channel}&user_id=\${user_id}&secret=\${hmac_secret}&device_id=\${encodeURIComponent(device_name)}&edge_url=\${adminSettings.heartbeat_edge_url}\`;
      
      // 1. Insert into sms_forwarder_settings
      const { error: sfErr } = await supabaseAdmin.from('sms_forwarder_settings').upsert({
        user_id,
        device_name,
        hmac_secret,
        sender_number: adminSettings.sender_number,
        text_filter: adminSettings.text_filter,
        webhook_edge_url: adminSettings.webhook_edge_url,
        headers: adminSettings.headers,
        json_payload_template: adminSettings.json_payload_template,
        project_url: adminSettings.project_url,
        anon_key: adminSettings.anon_key,
        ws_channel: adminSettings.ws_channel,
        heartbeat_edge_url: adminSettings.heartbeat_edge_url,
        webhook_url: genWebhookUrl,
        heartbeat_ws_url: genWsUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,device_name' });
`;

content = content.replace(addDeviceOld.trim(), addDeviceNew.trim());

// Patch /api/admin/sync-devices
const syncOld = `
        await supabaseAdmin.from('sms_forwarder_settings').update({
          sender_number: settings.sender_number,
          text_filter: settings.text_filter,
          webhook_edge_url: settings.webhook_edge_url,
          headers: settings.headers,
          project_url: settings.project_url,
          anon_key: settings.anon_key,
          ws_channel: settings.ws_channel,
          heartbeat_edge_url: settings.heartbeat_edge_url,
          webhook_url: genWebhookUrl,
          heartbeat_ws_url: genWsUrl,
          updated_at: new Date().toISOString()
        }).eq('id', d.id);
`;

const syncNew = `
        await supabaseAdmin.from('sms_forwarder_settings').update({
          sender_number: settings.sender_number,
          text_filter: settings.text_filter,
          webhook_edge_url: settings.webhook_edge_url,
          headers: settings.headers,
          json_payload_template: settings.json_payload_template,
          project_url: settings.project_url,
          anon_key: settings.anon_key,
          ws_channel: settings.ws_channel,
          heartbeat_edge_url: settings.heartbeat_edge_url,
          webhook_url: genWebhookUrl,
          heartbeat_ws_url: genWsUrl,
          updated_at: new Date().toISOString()
        }).eq('id', d.id);
`;

content = content.replace(syncOld.trim(), syncNew.trim());

fs.writeFileSync('server.ts', content, 'utf-8');
console.log('server.ts patched');
