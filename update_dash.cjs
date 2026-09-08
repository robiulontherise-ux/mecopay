const fs = require('fs');
const file = '/app/applet/src/components/DashboardShell.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import WebsiteBuilderHub')) {
  code = code.replace(/import MySiteApp from '\.\.\/mysite\/App';/, `import MySiteApp from '../mysite/App';\nimport WebsiteBuilderHub from './WebsiteBuilderHub';`);
}

const oldLogic = `if (activeSubMenu === 'Website Builder') {
      return (
        <div className="h-[calc(100vh-100px)] overflow-y-auto w-full -mx-4 sm:mx-0 bg-slate-950 rounded-xl">
          <MySiteApp />
        </div>
      );
    }`;

const newLogic = `if (activeSubMenu === 'Website Builder') {
      return (
        <div className="w-full">
          <WebsiteBuilderHub user={user} />
        </div>
      );
    }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
} else {
  console.log("Could not find old logic in DashboardShell.tsx");
}

fs.writeFileSync(file, code);
