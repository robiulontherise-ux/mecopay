const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. In add-device route:
// Replace the hardcoded dashboard_url with adminSettings.dashboard_url
content = content.replace(
  "dashboard_url: 'https://mecopay.pages.dev/dashboard',",
  "dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',"
);

// Add dashboard_url to the update block in add-device if it isn't there (wait, add-device does an upsert on line 158)
content = content.replace(
  "heartbeat_edge_url: adminSettings.heartbeat_edge_url,",
  "heartbeat_edge_url: adminSettings.heartbeat_edge_url,\n        dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',"
);

// 2. In /api/admin/sync-devices route:
// Replace hardcoded dashboard_url
content = content.replace(
  "dashboard_url: 'https://mecopay.pages.dev/dashboard',",
  "dashboard_url: settings.dashboard_url || 'https://mecopay.pages.dev/dashboard',"
);

// 3. In /api/system-settings POST route:
// Add missing fields to the update block
const old_update = `              await supabaseAdmin.from('sms_forwarder_settings').update({
                sender_number: updated.sender_number,
                text_filter: updated.text_filter,
                webhook_edge_url: updated.webhook_edge_url,
                headers: updated.headers,
                project_url: updated.project_url,
                anon_key: updated.anon_key,
                ws_channel: updated.ws_channel,
                heartbeat_edge_url: updated.heartbeat_edge_url,
                webhook_url: updatedWebhook,
                heartbeat_ws_url: updatedWs,
                updated_at: new Date().toISOString()
              }).match({ user_id: row.user_id, device_name: row.device_name });`;

const new_update = `              await supabaseAdmin.from('sms_forwarder_settings').update({
                sender_number: updated.sender_number,
                text_filter: updated.text_filter,
                webhook_edge_url: updated.webhook_edge_url,
                headers: updated.headers,
                json_payload_template: updated.json_payload_template,
                project_url: updated.project_url,
                anon_key: updated.anon_key,
                ws_channel: updated.ws_channel,
                heartbeat_edge_url: updated.heartbeat_edge_url,
                dashboard_url: updated.dashboard_url || 'https://mecopay.pages.dev/dashboard',
                webhook_url: updatedWebhook,
                heartbeat_ws_url: updatedWs,
                updated_at: new Date().toISOString()
              }).match({ user_id: row.user_id, device_name: row.device_name });`;

content = content.replace(old_update, new_update);

fs.writeFileSync('server.ts', content);
