const fs = require('fs');
const file = 'src/components/payment-hub/PaymentLinks.tsx';
let content = fs.readFileSync(file, 'utf8');

const replaceStr = `  const handleDeleteLink = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment link?")) {
      try {
        setLoading(true);
        // Only delete the payment link, keep the invoices as records
        const { error } = await supabase.from('payment_links').delete().eq('id', id);
        
        if (error) {
           if (error.code === '23503') {
              throw new Error("Cannot delete this link because it has existing invoices attached to it.");
           }
           throw error;
        }
        setLinks(links.filter(l => l.id !== id));
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };`;

content = content.replace(
  /const handleDeleteLink = async \(id: string\) => \{[\s\S]*?\}\n  \};/,
  replaceStr
);

fs.writeFileSync(file, content);
