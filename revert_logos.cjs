const fs = require('fs');
let content = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');

content = content.replace(
  /"https:\/\/blogger\.googleusercontent\.com\/img\/b\/[^"]+Nagad\.png"/g,
  "'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png'"
);

content = content.replace(
  /"https:\/\/blogger\.googleusercontent\.com\/img\/b\/[^"]+Upay\.png"/g,
  "'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/upay.png'"
);

content = content.replace(
  /"https:\/\/blogger\.googleusercontent\.com\/img\/b\/[^"]+Rocket\.png"/g,
  "'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/rocket.png'"
);

fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', content);
console.log('Logos reverted in GatewaySettings.tsx');
