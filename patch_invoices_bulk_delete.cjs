const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf8');

const targetFilters = `      <div className="flex flex-wrap gap-3 mb-6">`;

const newFilters = `      {selectedInvoiceIds.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center justify-between mb-4 animate-in fade-in duration-200">
          <span className="text-slate-300 font-medium">{selectedInvoiceIds.length} invoice(s) selected</span>
          <button 
            onClick={() => {
              // Validation logic
              const invalidSelections = invoices.filter(inv => 
                selectedInvoiceIds.includes(inv.id) && 
                (inv.status?.toLowerCase() === 'completed' || (inv.status?.toLowerCase() === 'pending' && inv.trx_id && inv.trx_id.trim().length > 0))
              );
              
              if (invalidSelections.length > 0) {
                showToast("Please unselect 'Completed' and 'Pending (Manual Verify)' invoices. These cannot be deleted.", "error");
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
      )}

      <div className="flex flex-wrap gap-3 mb-6">`;

if (content.includes(targetFilters)) {
  content = content.replace(targetFilters, newFilters);
  console.log("Added bulk action bar.");
}

// Add Trash2 import if missing
if (!content.includes('Trash2')) {
  content = content.replace('Search, Filter', 'Search, Filter, Trash2');
  console.log("Added Trash2 import.");
}

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', content);
