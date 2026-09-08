const fs = require('fs');

let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Update state type
dbShell = dbShell.replace(
  /const \[confirmDialog, setConfirmDialog\] = useState<string \| null>\(null\);/,
  `const [confirmDialog, setConfirmDialog] = useState<any | null>(null);\n  const [confirmInput, setConfirmInput] = useState('');\n  const [confirmCheckbox, setConfirmCheckbox] = useState(false);`
);

// 2. Update handleConfirmRequest effect to initialize defaults
dbShell = dbShell.replace(
  /const handleConfirmRequest = \(e: Event\) => \{\n\s*setConfirmDialog\(\(e as CustomEvent\)\.detail\);\n\s*\};/,
  `const handleConfirmRequest = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setConfirmDialog(detail);
      setConfirmInput('');
      if (typeof detail === 'object' && detail.defaultCheckbox !== undefined) {
        setConfirmCheckbox(detail.defaultCheckbox);
      } else {
        setConfirmCheckbox(false);
      }
    };`
);

// 3. Update the UI
const confirmUI = `
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3 text-red-400 flex items-center gap-2">⚠️ Danger Zone</h3>
            <p className="text-slate-300 mb-6">{typeof confirmDialog === 'string' ? confirmDialog : confirmDialog.msg}</p>
            
            {typeof confirmDialog === 'object' && confirmDialog.checkboxLabel && (
              <label className="flex items-center gap-3 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={confirmCheckbox} 
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="w-5 h-5 accent-red-500 cursor-pointer"
                />
                <span className="text-sm text-red-200">{confirmDialog.checkboxLabel}</span>
              </label>
            )}

            {typeof confirmDialog === 'object' && confirmDialog.requireType && (
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  Type <strong className="text-red-400 select-all">{confirmDialog.requireType}</strong> to confirm:
                </label>
                <input 
                  type="text" 
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={confirmDialog.requireType}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-red-500 focus:outline-none"
                />
              </div>
            )}

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
                disabled={typeof confirmDialog === 'object' && confirmDialog.requireType && confirmInput !== confirmDialog.requireType}
                onClick={() => {
                  if (typeof confirmDialog === 'object' && (confirmDialog.checkboxLabel || confirmDialog.requireType)) {
                     window.dispatchEvent(new CustomEvent('confirm-response', { detail: { confirmed: true, checked: confirmCheckbox } }));
                  } else {
                     window.dispatchEvent(new CustomEvent('confirm-response', { detail: true }));
                  }
                  setConfirmDialog(null);
                }}
                className={\`px-4 py-2 rounded-lg font-bold text-white transition-colors \${(typeof confirmDialog === 'object' && confirmDialog.requireType && confirmInput !== confirmDialog.requireType) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'}\`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
`;

// Replace the old UI
dbShell = dbShell.replace(/\{confirmDialog && \([\s\S]*?<\/div>\s*\)\s*\}/, confirmUI);

// Now change the brand delete logic
const brandDeleteMatch = /const handleDeleteBrand = async \(id: string\) => \{\s*if \(!\(await showConfirm\("Are you sure you want to delete this brand\? Its payment links will be deleted, but your transaction records \(invoices and gateways\) will be kept safe\."\)\)\) return;\s*try \{/m;
const brandDeleteReplacement = `const handleDeleteBrand = async (id: string) => {
    const res = await showConfirm({
      msg: "Are you sure you want to delete this brand? Its payment links will be deleted.",
      requireType: "delete",
      checkboxLabel: "Also delete associated Gateways",
      defaultCheckbox: true
    });
    
    if (!res || !res.confirmed) return;
    
    try {`;

dbShell = dbShell.replace(brandDeleteMatch, brandDeleteReplacement);

// Change the inside of try to handle gateway deletion based on checkbox
const keepNumbersMatch = /\/\/ 2\. Keep payment numbers safe \(detach brand\)\n\s*await supabase\.from\('payment_numbers'\)\.update\(\{ brand_id: null \}\)\.eq\('brand_id', id\);/;
const keepNumbersReplacement = `// 2. Gateway logic
        if (res.checked) {
          await supabase.from('payment_numbers').delete().eq('brand_id', id);
        } else {
          await supabase.from('payment_numbers').update({ brand_id: null }).eq('brand_id', id);
        }`;
dbShell = dbShell.replace(keepNumbersMatch, keepNumbersReplacement);

fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
console.log("Patched confirm UI in DashboardShell.");
