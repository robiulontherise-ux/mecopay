const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

const replacement = `
              <p className="text-sm font-medium text-slate-400 mb-2">{user?.email}</p>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">Client ID:</span>
                <code className="text-xs text-slate-300 font-bold">{user?.id || 'USR-2024-X8F9A2B'}</code>
                <button onClick={() => navigator.clipboard.writeText(user?.id || 'USR-2024-X8F9A2B')} className="text-slate-500 hover:text-white transition-colors" title="Copy Client ID">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
`;

code = code.replace(
  '<p className="text-sm font-medium text-slate-400">{user?.email}</p>\n            </div>',
  replacement
);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
