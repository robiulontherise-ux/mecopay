const fs = require('fs');
const file = 'src/components/DashboardShell.tsx';
let content = fs.readFileSync(file, 'utf8');

const replaceStr = `  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    
    try {
      if (user?.id) {
        // Only delete payment links associated with this brand
        await supabase.from('payment_links').delete().eq('brand_id', id);
        
        // Attempt to delete the brand
        const { error } = await supabase.from('brands').delete().eq('id', id);
        if (error) {
          if (error.code === '23503') {
             throw new Error("This brand has existing invoices or gateways. It cannot be deleted to keep your transaction records safe.");
          }
          throw error;
        }
      }
      const filtered = brands.filter(b => b.id !== id);
      setBrands(filtered);
      localStorage.setItem('app_brands', JSON.stringify(filtered));
      setActiveBrandDropdown(null);
      alert("Brand deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };`;

content = content.replace(
  /const handleDeleteBrand = async \(id: string\) => \{[\s\S]*?\} catch \(err: any\) \{\n      console\.error\(err\);\n      alert\("Failed to delete brand: " \+ err\.message\);\n    \}\n  \};/,
  replaceStr
);

fs.writeFileSync(file, content);
