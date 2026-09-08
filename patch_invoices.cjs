const fs = require('fs');
let file = 'src/components/payment-hub/Invoices.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename "Cancelled" to "Cut Invoices" in the dropdown
content = content.replace(
  '<option value="Cancelled">Cancelled</option>',
  '<option value="Cancelled">Cut Invoices</option>'
);

// 2. Add handleCutInvoice function
const handleDownloadStr = `  const handleDownload = (inv: any) => {`;
const newHandleCutStr = `  const handleCutInvoice = async (id: string) => {
    if (confirm("Are you sure you want to cut this invoice?")) {
      const { error } = await supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', id);
      if (error) {
        alert("Failed to cut invoice");
      } else {
        setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'Cancelled' } : i));
      }
    }
  };

  const handleDownload = (inv: any) => {`;
content = content.replace(handleDownloadStr, newHandleCutStr);

// 3. Add the Cut Invoice button to the action row
const actionRowStr = `<Eye className="w-4 h-4" /> View
                        </button>`;
const newActionRowStr = `<Eye className="w-4 h-4" /> View
                        </button>
                        {inv.status?.toLowerCase() !== 'cancelled' && (
                          <button 
                            onClick={() => handleCutInvoice(inv.id)}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold text-xs ml-2 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded"
                            title="Cut Invoice"
                          >
                            <X className="w-3 h-3" /> Cut
                          </button>
                        )}`;
content = content.replace(actionRowStr, newActionRowStr);

fs.writeFileSync(file, content);
