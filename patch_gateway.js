const fs = require('fs');
const content = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');

const startIndex = content.indexOf("if (activeSubMenu === 'Gateway Settings') {");
const endIndex = content.indexOf("if (activeSubMenu === 'Plugins & Apps') {");

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `if (activeSubMenu === 'Gateway Settings') {
      return <GatewaySettings brands={brands} />;
    }

    if (activeSubMenu === 'Payment Links') {
      return <PaymentLinks brands={brands} />;
    }

    `;
  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/components/DashboardShell.tsx', newContent);
  console.log("Patched successfully!");
} else {
  console.log("Could not find blocks.");
}
