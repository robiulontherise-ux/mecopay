const fs = require('fs');

let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// Add import
if (!dbShell.includes("import { showConfirm }")) {
    dbShell = dbShell.replace(/(import { showToast } from '\.\.\/lib\/toast';)/, `$1\nimport { showConfirm } from '../lib/confirm';`);
}

// Add State
if (!dbShell.includes("const [confirmDialog, setConfirmDialog]")) {
    dbShell = dbShell.replace(
        /const \[toast, setToast\] = useState<.*?null>\(null\);/,
        `const [toast, setToast] = useState<{msg: string, type: 'success' | 'error', id: number} | null>(null);\n  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);`
    );
}

// Add Effect for confirm
if (!dbShell.includes("window.addEventListener('show-confirm'")) {
    dbShell = dbShell.replace(
        /window\.addEventListener\('show-toast', handleToast\);/,
        `window.addEventListener('show-toast', handleToast);\n    const handleConfirmRequest = (e: Event) => {\n      setConfirmDialog((e as CustomEvent).detail);\n    };\n    window.addEventListener('show-confirm', handleConfirmRequest);`
    );
    dbShell = dbShell.replace(
        /return \(\) => window\.removeEventListener\('show-toast', handleToast\);/,
        `return () => {\n      window.removeEventListener('show-toast', handleToast);\n      window.removeEventListener('show-confirm', handleConfirmRequest);\n    };`
    );
}

// Add the Confirm UI to the render
if (!dbShell.includes("setConfirmDialog(null)")) {
    const confirmUI = `
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">Please Confirm</h3>
            <p className="text-slate-300 mb-6">{confirmDialog}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('confirm-response', { detail: false }));
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded-lg font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('confirm-response', { detail: true }));
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    `;
    dbShell = dbShell.replace(
        /\{toast && \(/,
        `${confirmUI}\n      {toast && (`
    );
}

fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
console.log("Added confirm UI to DashboardShell.");
