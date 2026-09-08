const fs = require('fs');
const file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

const replaceStr = `  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand? Its payment links will be deleted, but your transaction records (invoices and gateways) will be kept safe.")) return;
    
    try {
      if (user?.id) {
        // 1. Keep invoices safe (detach brand)
        await supabase.from('invoices').update({ brand_id: null }).eq('brand_id', id);
        
        // 2. Keep payment numbers safe (detach brand)
        await supabase.from('payment_numbers').update({ brand_id: null }).eq('brand_id', id);
        
        // 3. Delete Payment Links under this brand
        await supabase.from('payment_links').delete().eq('brand_id', id);
        
        // 4. Finally, delete the brand itself
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) throw error;
      }
      
      const filtered = brands.filter(b => b.id !== id);
      setBrands(filtered);
      localStorage.setItem('app_brands', JSON.stringify(filtered));
      setActiveBrandDropdown(null);
      alert("Brand deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete brand: " + err.message);
    }
  };`;

content = content.replace(
  /const handleDeleteBrand = async \(id: string\) => \{[\s\S]*?\} catch \(err: any\) \{\n      console\.error\(err\);\n      alert\(err\.message\);\n    \}\n  \};/,
  replaceStr
);

fs.writeFileSync(file, content);
