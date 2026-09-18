const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldCheck = `    if (!isDeviceOnline) {
      setVerifyMethod('offline');
      setStep(4);
    } else {`;

const newCheck = `    // If gateway has a specific device_name, check if THAT device is online
    let isThisGatewayOnline = isDeviceOnline;
    if (gw.device_name) {
      isThisGatewayOnline = onlineDevices.some(d => d.device_name === gw.device_name);
    }

    if (!isThisGatewayOnline) {
      setVerifyMethod('offline');
      setStep(4);
    } else {`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
