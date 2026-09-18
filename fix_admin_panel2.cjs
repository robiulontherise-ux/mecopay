const fs = require('fs');
let content = fs.readFileSync('src/mysite/components/AdminPanel.tsx', 'utf-8');
const lines = content.split('\n');

const cleanLines = [
  '                    <input',
  '                      type="file"',
  '                      accept="image/*"',
  '                      onChange={handleLogoUpload}',
  '                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"',
  '                      disabled={isUploading}',
  '                    />',
  '                    <button',
  '                      type="button"',
  '                      disabled={isUploading}',
  '                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center h-full border border-slate-700"',
  '                    >',
  '                      {isUploading ? "..." : "Upload"}',
  '                    </button>'
];

lines.splice(839, 14, ...cleanLines);
fs.writeFileSync('src/mysite/components/AdminPanel.tsx', lines.join('\n'));
