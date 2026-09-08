const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const regex = /redirect_links: \{[\s\S]*?personal_api: brandForm\.personal_api\s*\}/m;

const newPayload = `redirect_links: {
        allow_telegram: brandForm.allow_telegram,
        allow_tally: brandForm.allow_tally,
        allow_facebook: brandForm.allow_facebook,
        allow_drive: brandForm.allow_drive,
        verify_trx_id: brandForm.verify_trx_id,
        verify_phone: brandForm.verify_phone,
        merchant_api: brandForm.merchant_api,
        personal_api: brandForm.personal_api
      }`;

if (content.match(regex)) {
  content = content.replace(regex, newPayload);
  fs.writeFileSync('src/components/DashboardShell.tsx', content);
  console.log('Fixed handleSaveBrand!');
} else {
  console.log('Regex did not match handleSaveBrand.');
}
