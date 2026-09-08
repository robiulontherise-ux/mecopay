const fs = require('fs');
let file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="flex-1 bg-[#050505] overflow-y-auto p-4 sm:p-8 w-full">',
  '<div id="main-scroll-container" className="flex-1 bg-[#050505] overflow-y-auto p-4 sm:p-8 w-full">'
);

content = content.replace(
  'window.scrollTo(0, 0);',
  `const container = document.getElementById('main-scroll-container');\n    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });`
);

fs.writeFileSync(file, content);
