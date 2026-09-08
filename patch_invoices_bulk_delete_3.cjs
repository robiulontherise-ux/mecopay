const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf8');

const targetHeader = `<div className="flex flex-col sm:flex-row gap-4 items-center">`;

const newHeader = `{selectedInvoiceIds.length > 0 && (
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
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">`;

if (content.includes(targetHeader)) {
  content = content.replace(targetHeader, newHeader);
  console.log("Successfully added bulk action bar.");
} else {
  console.log("Could not find target header!");
}

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', content);
