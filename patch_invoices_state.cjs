const fs = require('fs');
let file = 'src/components/payment-hub/Invoices.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const [smsEventData, setSmsEventData] = useState<any>(null);
  const [isLoadingSms, setIsLoadingSms] = useState(false);`;

const replacementStr = `  const [smsEventData, setSmsEventData] = useState<any>(null);
  const [isLoadingSms, setIsLoadingSms] = useState(false);

  // Selection & Deletion State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  };

  const handleSelectSingle = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(prev => [...prev, id]);
    } else {
      setSelectedInvoiceIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (deleteInput.toLowerCase() !== 'delete') return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('invoices').delete().in('id', selectedInvoiceIds);
      if (error) throw error;
      setInvoices(prev => prev.filter(inv => !selectedInvoiceIds.includes(inv.id)));
      setSelectedInvoiceIds([]);
      setShowDeleteModal(false);
      setDeleteInput('');
      showToast("Invoices deleted successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete invoices", "error");
    } finally {
      setIsDeleting(false);
    }
  };`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
