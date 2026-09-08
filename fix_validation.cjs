const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf8');

const regex = /const handleCreateOrUpdate = async \(\) => \{[\s\S]*?if \(!user\) return;/;

const newBlock = `const handleCreateOrUpdate = async () => {
    if (!title || !amount || !selectedBrandId) {
      showToast("Please fill all fields!", 'error');
      return;
    }
    
    // Validation for redirectLink based on allowed domains for this brand
    const selectedBrand = brands.find(b => b.id === selectedBrandId);
    if (selectedBrand && redirectLink) {
      const rl = redirectLink.toLowerCase();
      let isValid = false;
      
      // If it matches primary website
      if (selectedBrand.website_url && rl.includes(selectedBrand.website_url.toLowerCase().replace(/^https?:\\/\\//, ''))) isValid = true;
      if (selectedBrand.redirect_links?.allow_telegram && rl.includes('t.me/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_facebook && rl.includes('facebook.com/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_tally && rl.includes('tally.so/')) isValid = true;
      if (selectedBrand.redirect_links?.allow_drive && (rl.includes('drive.google.com/') || rl.includes('docs.google.com/'))) isValid = true;
      
      if (!isValid) {
        showToast("The provided link domain is not allowed. Please check Brand settings or use a valid allowed platform.", "error");
        return;
      }
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;`;

if(content.match(regex)) {
  content = content.replace(regex, newBlock);
  fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', content);
  console.log("Patched handleCreateOrUpdate successfully.");
} else {
  console.log("Failed to patch handleCreateOrUpdate.");
}
