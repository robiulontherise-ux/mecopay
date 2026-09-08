const fs = require('fs');
const file = '/app/applet/package.json';
let pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.scripts['build:cloudflare'] = 'vite build';
fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
