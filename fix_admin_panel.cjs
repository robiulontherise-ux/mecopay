const fs = require('fs');
let content = fs.readFileSync('src/mysite/components/AdminPanel.tsx', 'utf-8');
content = content.replace(/accept="image\/\*"/, 'accept="image/*"');
fs.writeFileSync('src/mysite/components/AdminPanel.tsx', content);
