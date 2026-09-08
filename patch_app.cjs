const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import Toast')) {
  content = content.replace("import Login", "import Toast from './components/shared/Toast';\nimport Login");
}

if (!content.includes('<Toast />')) {
  content = content.replace("</BrowserRouter>", "  <Toast />\n        </BrowserRouter>");
}

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx patched");
