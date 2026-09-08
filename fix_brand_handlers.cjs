const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const regex = /const handleOpenCreateBrand = \(\) => \{[\s\S]*?setShowBrandModal\(true\);\s*\};/m;

const newHandlers = `  const handleOpenCreateBrand = () => {
    setEditingBrandId(null);
    setBrandForm({
      name: '',
      website_url: '',
      allow_telegram: false,
      allow_tally: false,
      allow_facebook: false,
      allow_drive: false,
      logo_url: '',
      support_email: '',
      verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
      payment_amount_type: 'equal',
      amount_format: 'as_is',
      transaction_fee: '0',
      transaction_fee_type: 'fixed'
    });
    setShowBrandModal(true);
  };

  const handleOpenEditBrand = (brand: any) => {
    setEditingBrandId(brand.id);
    setBrandForm({
      name: brand.name || '',
      website_url: brand.website_url || '',
      allow_telegram: !!brand.redirect_links?.allow_telegram,
      allow_tally: !!brand.redirect_links?.allow_tally,
      allow_facebook: !!brand.redirect_links?.allow_facebook,
      allow_drive: !!brand.redirect_links?.allow_drive,
      logo_url: brand.logo_url || '',
      support_email: brand.support_email || '',
      payment_amount_type: brand.payment_amount_type || 'equal',
      amount_format: brand.amount_format || 'as_is',
      transaction_fee: (brand.transaction_fee || 0).toString(),
      transaction_fee_type: brand.transaction_fee_type || 'fixed',
      verify_trx_id: brand.redirect_links?.verify_trx_id ?? true,
      verify_phone: brand.redirect_links?.verify_phone ?? false,
      merchant_api: brand.redirect_links?.merchant_api ?? true,
      personal_api: brand.redirect_links?.personal_api ?? false
    });
    setActiveBrandDropdown(null);
    setShowBrandModal(true);
  };`;

if (content.match(regex)) {
  content = content.replace(regex, newHandlers);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log('Fixed handlers!');
} else {
  console.log('Regex did not match.');
}
