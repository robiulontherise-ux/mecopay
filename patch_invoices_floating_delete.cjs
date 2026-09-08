const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf8');

// 1. Remove the old bulk delete block
const oldBlock = `{selectedInvoiceIds.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 p-3 mb-4 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <span className="text-slate-300 font-medium">{selectedInvoiceIds.length} invoice(s) selected</span>
          <button 
            onClick={() => {
              const invalidSelections = invoices.filter(inv => 
                selectedInvoiceIds.includes(inv.id) && 
                (inv.status?.toLowerCase() === 'completed' || (inv.status?.toLowerCase() === 'pending' && inv.trx_id && inv.trx_id.trim().length > 0))
              );
              
              if (invalidSelections.length > 0) {
                showToast("Please unselect 'Completed' and 'Pending (Manual Verify)' invoices before deleting.", "error");
                return;
              }
              
              setShowDeleteModal(true);
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}`;

content = content.replace(oldBlock, "");

// 2. Add bulkError state
const stateTarget = `const [isDeleting, setIsDeleting] = useState(false);`;
const stateReplacement = `const [isDeleting, setIsDeleting] = useState(false);
  const [bulkError, setBulkError] = useState('');`;

if(content.includes(stateTarget)) {
   content = content.replace(stateTarget, stateReplacement);
}

// 3. Add the floating block before the final closing div
const floatingBlock = `
      {/* Floating Bulk Action Bar */}
      {selectedInvoiceIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="bg-rose-500/20 text-rose-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{selectedInvoiceIds.length}</span>
            <span className="text-slate-200 font-medium whitespace-nowrap">Invoices Selected</span>
          </div>
          
          {bulkError ? (
            <div className="text-rose-400 font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-in fade-in zoom-in">
              {bulkError}
            </div>
          ) : (
            <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>
          )}

          <button 
            onClick={() => {
              const invalidSelections = invoices.filter(inv => 
                selectedInvoiceIds.includes(inv.id) && 
                (inv.status?.toLowerCase() === 'completed' || (inv.status?.toLowerCase() === 'pending' && inv.trx_id && inv.trx_id.trim().length > 0))
              );
              
              if (invalidSelections.length > 0) {
                setBulkError("Please unselect 'Completed' and 'Pending (Manual Verify)' invoices before deleting.");
                setTimeout(() => setBulkError(''), 4000);
                return;
              }
              
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(/    <\/div>\s*  \);\s*\}\s*$/, floatingBlock);

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', content);
console.log("Patched successfully");
