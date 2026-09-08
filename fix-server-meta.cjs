const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/import { fileURLToPath } from 'url';\n/g, '');
code = code.replace(/const __filename = fileURLToPath\(import\.meta\.url\);\n/g, '');
code = code.replace(/const __dirname = path\.dirname\(__filename\);\n/g, '');

fs.writeFileSync('server.ts', code);
