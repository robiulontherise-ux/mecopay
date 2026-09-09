const fs = require('fs');

// 1. Fix server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
  "          await supabaseAdmin.from('sms_forwarder_settings').upsert({\n            device_name: '__GLOBAL_CONFIG__',\n            ...updated\n          }, { onConflict: 'device_name' });",
  "          if (updated.user_id) {\n            await supabaseAdmin.from('sms_forwarder_settings').upsert({\n              user_id: updated.user_id,\n              device_name: '__GLOBAL_CONFIG__',\n              ...updated\n            }, { onConflict: 'user_id,device_name' });\n          }"
);
fs.writeFileSync('server.ts', server);

// 2. Fix DashboardShell.tsx
let dash = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');
dash = dash.replace(
  "body: JSON.stringify(forwarderSettings)",
  "body: JSON.stringify({ ...forwarderSettings, user_id: user?.id })"
);
fs.writeFileSync('src/components/DashboardShell.tsx', dash);

console.log('Fixed API and UI');
