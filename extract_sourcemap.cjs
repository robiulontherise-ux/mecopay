const fs = require('fs');
const map = JSON.parse(fs.readFileSync('dist/assets/index-x_wT8Rb1.js.map', 'utf-8'));
const sources = map.sources;
const contents = map.sourcesContent;

for (let i = 0; i < sources.length; i++) {
  if (sources[i].includes('DashboardShell.tsx')) {
    fs.writeFileSync('src/components/DashboardShell.tsx', contents[i]);
    console.log('Restored DashboardShell.tsx!');
    break;
  }
}
