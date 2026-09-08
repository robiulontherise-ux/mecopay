const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf8');

const targetHeader = `      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Invoices & Receipts</h2>
          <p className="text-sm text-slate-400">Manage and download your transactions</p>
        </div>
      </div>`;

const newHeader = `      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Invoices & Receipts</h2>
          <p className="text-sm text-slate-400">Manage and download your transactions</p>
        </div>
      </div>
      
      {selectedInvoiceIds.length > 0 && (
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

if (content.includes(targetHeader)) {
  content = content.replace(targetHeader, newHeader);
  console.log("Successfully added bulk action bar.");
} else {
  console.log("Could not find target header!");
}

fs.writeFileSync('src/components/payment-hub/Invoices.tsx', content);
