const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

if (!content.includes('showToast')) {
    content = content.replace("import React,", "import { showToast } from '../../lib/toast';\nimport React,");
}

const targetAlert1 = `alert("Session expired. Please try again or use TrxID verification.");`;
const newAlert1 = `showToast("Session expired. Please use TrxID verification.", "error");`;

const targetAlert2 = `alert("Failed to continue: " + err.message);`;
const newAlert2 = `showToast("Failed to continue: " + err.message, "error");`;

const targetAlert3 = `alert("Failed to submit verification: " + err.message);`;
const newAlert3 = `showToast("Failed to submit verification: " + err.message, "error");`;

content = content.replace(targetAlert1, newAlert1);
content = content.replace(targetAlert2, newAlert2);
content = content.replace(targetAlert3, newAlert3);

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Checkout patched successfully");
