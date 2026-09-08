const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldCode = `  const handleSelectGateway = (gw: any) => {
    setSelectedGateway(gw);
    const hasLive = true; // brandData?.redirect_links?.verify_phone;
    const hasTrxId = true; // brandData?.redirect_links?.verify_trx_id !== false;

    if (isDeviceOnline) {
      if (hasLive && hasTrxId) {
        setStep(3); // Choose method
      } else if (hasLive) {
        setVerifyMethod('live');
        setStep(4);
      } else {
        setVerifyMethod('trxid');
        setStep(4);
      }
    } else {
      setVerifyMethod('trxid');
      setStep(4);
    }
  };`;

const newCode = `  const handleSelectGateway = (gw: any) => {
    setSelectedGateway(gw);
    const hasLive = true;
    const hasTrxId = true;
    
    // Always go to step 3 so the user can see both options (Live and TrxID)
    setStep(3);
  };`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log('Patched step 3 transition');
