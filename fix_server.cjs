const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  "        dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',\n        dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',",
  "        dashboard_url: adminSettings.dashboard_url || 'https://mecopay.pages.dev/dashboard',"
);
fs.writeFileSync('server.ts', content);
