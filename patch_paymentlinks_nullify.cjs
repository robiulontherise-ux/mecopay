const fs = require('fs');
const file = 'src/components/payment-hub/PaymentLinks.tsx';
let content = fs.readFileSync(file, 'utf8');

const replaceStr = `  const handleDeleteLink = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment link? Your past transaction records will be kept safe.")) {
      try {
        setLoading(true);
        // Step 1: Detach the link from existing invoices so records are kept but link can be deleted
        await supabase.from('invoices').update({ payment_link_id: null }).eq('payment_link_id', id);
        
        // Step 2: Delete the link itself
        const { error } = await supabase.from('payment_links').delete().eq('id', id);
        
        if (error) throw error;
        
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
