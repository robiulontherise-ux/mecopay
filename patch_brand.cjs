const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

// Update initial state
content = content.replace(
  /const \[brandForm, setBrandForm\] = useState\(\{[\s\S]*?logo_url:/,
  `const [brandForm, setBrandForm] = useState({
    name: '',
    website_url: '',
    telegram_link: '',
    tally_link: '',
    facebook_link: '',
    drive_link: '',
    logo_url:`
);

// Update handleSaveBrand
content = content.replace(
  /redirect_links: \{[\s\S]*?personal_api: brandForm\.personal_api\s*\}/,
  `redirect_links: {
        telegram_link: brandForm.telegram_link,
        tally_link: brandForm.tally_link,
        facebook_link: brandForm.facebook_link,
        drive_link: brandForm.drive_link,
        verify_trx_id: brandForm.verify_trx_id,
        verify_phone: brandForm.verify_phone,
        merchant_api: brandForm.merchant_api,
        personal_api: brandForm.personal_api
      }`
);

// Update handleEditBrand
content = content.replace(
  /setBrandForm\(\{[\s\S]*?name: brand\.name \|\| '',/,
  `setBrandForm({
      name: brand.name || '',
      website_url: brand.website_url || '',
      telegram_link: brand.redirect_links?.telegram_link || '',
      tally_link: brand.redirect_links?.tally_link || '',
      facebook_link: brand.redirect_links?.facebook_link || '',
      drive_link: brand.redirect_links?.drive_link || '',`
);
content = content.replace(
  /allow_telegram: brand\.redirect_links\?\.allow_telegram \|\| false,[\s\S]*?allow_youtube: brand\.redirect_links\?\.allow_youtube \|\| false,/,
  ``
);


fs.writeFileSync('src/components/DashboardShell.tsx', content);
