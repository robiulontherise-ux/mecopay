const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');
content = content.replace('const PORT = 3000;', 'const PORT = process.env.PORT || 3000;');
fs.writeFileSync('server.ts', content);
