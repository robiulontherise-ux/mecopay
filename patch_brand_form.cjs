const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Update initial state
content = content.replace(
  /const \[brandForm, setBrandForm\] = useState\(\{\n\s*name: '',\n\s*website_url: '',\n\s*allow_telegram: false,\n\s*allow_tally: false,\n\s*allow_facebook: false,\n\s*allow_whatsapp: false,\n\s*allow_drive: false,\n\s*allow_youtube: false,\n\s*logo_url: '',\n\s*support_email: '',\n\s*verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false\n\s*\}\);/,
  `const [brandForm, setBrandForm] = useState({
    name: '',
    website_url: '',
    allow_telegram: false,
    allow_tally: false,
    allow_facebook: false,
    allow_whatsapp: false,
    allow_drive: false,
    allow_youtube: false,
    logo_url: '',
    support_email: '',
    verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
    payment_amount_type: 'equal',
    amount_format: 'as_is',
    transaction_fee: '0',
    transaction_fee_type: 'fixed'
  });`
);

// 2. Update handleOpenCreateBrand
content = content.replace(
  /setBrandForm\(\{\n\s*name: '', website_url: '', allow_telegram: false, allow_tally: false, allow_facebook: false, allow_whatsapp: false, allow_drive: false, allow_youtube: false, logo_url: '', support_email: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false\n\s*\}\);/,
  `setBrandForm({
      name: '', website_url: '', allow_telegram: false, allow_tally: false, allow_facebook: false, allow_whatsapp: false, allow_drive: false, allow_youtube: false, logo_url: '', support_email: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
      payment_amount_type: 'equal', amount_format: 'as_is', transaction_fee: '0', transaction_fee_type: 'fixed'
    });`
);

// 3. Update handleOpenEditBrand
content = content.replace(
  /merchant_api: brand\.redirect_links\?\.merchant_api \?\? true,\n\s*personal_api: brand\.redirect_links\?\.personal_api \?\? false\n\s*\}\);/,
  `merchant_api: brand.redirect_links?.merchant_api ?? true,
      personal_api: brand.redirect_links?.personal_api ?? false,
      payment_amount_type: brand.payment_amount_type || 'equal',
      amount_format: brand.amount_format || 'as_is',
      transaction_fee: brand.transaction_fee?.toString() || '0',
      transaction_fee_type: brand.transaction_fee_type || 'fixed'
    });`
);

// 4. Update dbPayload in handleSaveBrand
content = content.replace(
  /const dbPayload = \{\n\s*name: brandForm\.name\.trim\(\),\n\s*website_url: brandForm\.website_url,\n\s*logo_url: brandForm\.logo_url,\n\s*support_email: brandForm\.support_email,\n\s*redirect_links: \{/,
  `const dbPayload = {
      name: brandForm.name.trim(),
      website_url: brandForm.website_url,
      logo_url: brandForm.logo_url,
      support_email: brandForm.support_email,
      payment_amount_type: brandForm.payment_amount_type,
      amount_format: brandForm.amount_format,
      transaction_fee: Number(brandForm.transaction_fee) || 0,
      transaction_fee_type: brandForm.transaction_fee_type,
      redirect_links: {`
);

// 5. Update finally block in handleSaveBrand
content = content.replace(
  /setBrandForm\(\{\n\s*name: '', websites: \[''\], logo_url: '', support_email: '', support_phone: '', whatsapp_number: '', facebook_page_id: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false\n\s*\}\);/,
  `setBrandForm({
        name: '', website_url: '', allow_telegram: false, allow_tally: false, allow_facebook: false, allow_whatsapp: false, allow_drive: false, allow_youtube: false, logo_url: '', support_email: '', verify_trx_id: true, verify_phone: false, merchant_api: true, personal_api: false,
        payment_amount_type: 'equal', amount_format: 'as_is', transaction_fee: '0', transaction_fee_type: 'fixed'
      });`
);

// 6. Update JSX
const jsxRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">[\s\S]*?<div className="mb-4">\s*<div className="flex items-center gap-2 mb-1">\s*<label className="block text-sm font-medium text-slate-300">Theme<\/label>/;
const newJsx = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Payment Amount Type <span className="text-red-500">*</span></label>
                    <select 
                      value={brandForm.payment_amount_type} 
                      onChange={(e) => setBrandForm({...brandForm, payment_amount_type: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="equal">Equal Amount Only</option>
                      <option value="allow_overpayment">Allow Overpayment</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Choose whether to accept exact amount or allow overpayment</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount Format <span className="text-red-500">*</span></label>
                    <select 
                      value={brandForm.amount_format} 
                      onChange={(e) => setBrandForm({...brandForm, amount_format: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="as_is">As Is (20.40 &rarr; 20.40)</option>
                      <option value="round_up">Round Up (20.40 &rarr; 21.00)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Choose how decimal amounts should be displayed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Transaction Fee</label>
                    <p className="text-xs text-slate-400 mt-1 mb-2">Add a brand-level fee for customer payments</p>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={brandForm.transaction_fee} 
                      onChange={(e) => setBrandForm({...brandForm, transaction_fee: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" 
                      min="0"
                      step="0.1"
                    />
                    <label className="block text-sm font-medium text-slate-300 mb-1">Transaction Fee Type</label>
                    <select 
                      value={brandForm.transaction_fee_type} 
                      onChange={(e) => setBrandForm({...brandForm, transaction_fee_type: e.target.value})}
                      className="w-full bg-[#242d42] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Fixed amount or percentage of the payment amount</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium text-slate-300">Theme</label>`;

if (jsxRegex.test(content)) {
  content = content.replace(jsxRegex, newJsx);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log("Patched successfully.");
} else {
  console.log("JSX Regex didn't match");
}
