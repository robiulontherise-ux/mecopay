const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

content = content.replace(
  /const \[brandForm, setBrandForm\] = useState\(\{[\s\S]*?transaction_fee_type: 'fixed'\s*\}\);/,
  `const [brandForm, setBrandForm] = useState({
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
  });`
);

fs.writeFileSync('src/components/DashboardShell.tsx', content);
