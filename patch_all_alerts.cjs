const fs = require('fs');

function replaceFile(path, replacements) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf-8');
    
    // Auto import showToast if not present
    if (!content.includes("import { showToast }") && content.includes("alert(")) {
        content = content.replace(/(import React.*?;\n)/, `$1import { showToast } from '../../lib/toast';\n`);
    }

    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(path, content);
    console.log(`Patched ${path}`);
}

const dbShellReplacements = [
    ['alert("Error changing status: " + err.error);', 'showToast("Error changing status!", "error");'],
    ['alert("Failed to update status");', 'showToast("Failed to update status!", "error");'],
    ['alert("Brand Name is required!");', 'showToast("Brand Name is required!", "error");'],
    ['alert("New Brand created successfully!");', 'showToast("Created successfully!", "success");'],
    ['alert("Error creating brand: " + e.message);', 'showToast("Failed to create!", "error");'],
    ["alert('API Key copied to clipboard!');", 'showToast("Copied!", "success");'],
    ["alert('API Key copied to clipboard! (Fallback)');", 'showToast("Copied!", "success");'],
    ["alert('Failed to copy API key.');", 'showToast("Failed to copy!", "error");'],
    ["alert('API Key not found for this brand.');", 'showToast("Not found!", "error");'],
    ['alert("API Key copied to clipboard!");', 'showToast("Copied!", "success");'],
    ["alert('Copied to clipboard!');", 'showToast("Copied!", "success");'],
    ['alert("Please complete your Identity Verification and save your profile first to unlock this section.");', 'showToast("Complete Identity Verification first!", "error");']
];

replaceFile('src/components/DashboardShell.tsx', dbShellReplacements);

const gwReplacements = [
    ["alert(`Gateway credentials saved successfully for: ${selectedProviders.join(', ')}!`);", 'showToast("Saved successfully!", "success");']
];

replaceFile('src/components/payment-hub/GatewaySettings.tsx', gwReplacements);

const plReplacements = [
    ['alert("Failed to save link: " + err.message);', 'showToast("Failed to save!", "error");'],
    ['alert("Payment link copied!");', 'showToast("Copied!", "success");'],
    ['alert(err.message);', 'showToast("Failed: " + err.message, "error");']
];

replaceFile('src/components/payment-hub/PaymentLinks.tsx', plReplacements);

const invReplacements = [
    ["alert(`Invoice marked as ${newStatus} successfully.`);", 'showToast("Status updated!", "success");'],
    ["alert(`Failed to update status: ` + err.message);", 'showToast("Failed to update!", "error");'],
    ['alert("Please allow popups to print invoices");', 'showToast("Allow popups to print!", "error");'],
    ["alert('Payment link copied to clipboard');", 'showToast("Copied!", "success");'],
    ["alert('Invoice ID copied');", 'showToast("Copied!", "success");']
];

replaceFile('src/components/payment-hub/Invoices.tsx', invReplacements);

// Fix Invoices.tsx import path if it's not correct
let invContent = fs.readFileSync('src/components/payment-hub/Invoices.tsx', 'utf-8');
if (!invContent.includes("import { showToast }")) {
    invContent = invContent.replace(/import React/, "import { showToast } from '../../lib/toast';\nimport React");
    fs.writeFileSync('src/components/payment-hub/Invoices.tsx', invContent);
}

