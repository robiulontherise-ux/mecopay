const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const regex = /website_url: brand.website_url \|\| '',\s*telegram_link:/g;
content = content.replace(regex, 'telegram_link:');

fs.writeFileSync('src/components/DashboardShell.tsx', content);
