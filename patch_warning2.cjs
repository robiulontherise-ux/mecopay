const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Change type of warnings
content = content.replace(
  /let warnings: string\[\] = \[\];/,
  `let warnings: { brand: string, msg: string }[] = [];`
);

// 2. Add brand to warnings.push
content = content.replace(
  /const providerName = \(gw\.provider \|\| 'Gateway'\)\.toUpperCase\(\);/g,
  `const providerName = (gw.provider || 'Gateway').toUpperCase();\n                   const bName = gw.brands?.name || 'Unknown Brand';`
);

// We need to replace all warnings.push(`${providerName}...`) with warnings.push({ brand: bName, msg: `${providerName}...` })
content = content.replace(/warnings\.push\((`.*?`)\)/g, 'warnings.push({ brand: bName, msg: $1 })');
content = content.replace(/warnings\.push\((.*?)\)/g, (match, p1) => {
  if (p1.startsWith('{')) return match; // already patched or object
  return `warnings.push({ brand: bName, msg: ${p1} })`;
});


// 3. Update the rendering
content = content.replace(
  /\{warnings\.map\(\(msg, i\) => \([\s\S]*?<\/span>\s*\)\)\}/,
  `{warnings.map((w, i) => (
                       <span key={i} className="text-xs font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20 flex items-center gap-1.5 w-fit">
                         ⚠️ <span className="text-white">[{w.brand}]</span> {w.msg}
                       </span>
                     ))}`
);

fs.writeFileSync('src/components/DashboardShell.tsx', content);
console.log("Patched warnings to include brand name.");
