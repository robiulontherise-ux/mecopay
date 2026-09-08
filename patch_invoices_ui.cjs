const fs = require('fs');
let file = 'src/components/payment-hub/Invoices.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update the Search/Filter header to include Delete Selected button
const filterHeaderOldStr = `<div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by ID, email, name, phone, amount..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none hidden md:block">`;

const filterHeaderNewStr = `<div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by ID, email, name, phone, amount..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        {selectedInvoiceIds.length > 0 && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" /> Delete ({selectedInvoiceIds.length})
          </button>
        )}
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-4 py-2.5 outline-none hidden md:block">`;

content = content.replace(filterHeaderOldStr, filterHeaderNewStr);

// 2. Update the thead checkbox
const theadCheckboxOldStr = `<th className="px-4 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                </th>`;

const theadCheckboxNewStr = `<th className="px-4 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-800 cursor-pointer" 
                    checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length}
                    onChange={handleSelectAll}
                  />
                </th>`;

content = content.replace(theadCheckboxOldStr, theadCheckboxNewStr);

// 3. Update the tbody checkbox
const tbodyCheckboxOldStr = `filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                    </td>`;

const tbodyCheckboxNewStr = `filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={\`\${selectedInvoiceIds.includes(inv.id) ? 'bg-[#00E5FF]/5' : ''} hover:bg-slate-800/20 transition-colors group\`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-700 bg-slate-800 cursor-pointer" 
                        checked={selectedInvoiceIds.includes(inv.id)}
                        onChange={(e) => handleSelectSingle(inv.id, e)}
                      />
                    </td>`;

content = content.replace(tbodyCheckboxOldStr, tbodyCheckboxNewStr);

// 4. Add the Delete Modal before the last </div>
const deleteModalStr = `
      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Delete Invoices</h3>
              <p className="text-slate-400 text-sm">
                You are about to delete {selectedInvoiceIds.length} invoice(s). This action cannot be undone.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type <span className="text-rose-400 font-bold">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-rose-500 transition-colors"
                placeholder="delete"
              />
            </div>
            <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteInput.toLowerCase() !== 'delete' || isDeleting}
                onClick={handleDeleteSelected}
                className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

const rootDivCloseStr = `    </div>
  );
}`;

content = content.replace(rootDivCloseStr, deleteModalStr + rootDivCloseStr);

fs.writeFileSync(file, content);
