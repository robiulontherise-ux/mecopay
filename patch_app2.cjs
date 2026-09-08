const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import Toast from './components/shared/Toast';\n", "");
content = content.replace("  <Toast />\n        </BrowserRouter>", "        </BrowserRouter>");

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx reverted");
