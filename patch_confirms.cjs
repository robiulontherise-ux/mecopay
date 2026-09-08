const fs = require('fs');

let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');
dbShell = dbShell.replace(
  /if \(!confirm\("Are you sure you want to delete this brand\? Its payment links will be deleted, but your transaction records \(invoices and gateways\) will be kept safe\."\)\) return;/g,
  `if (!(await showConfirm("Are you sure you want to delete this brand? Its payment links will be deleted, but your transaction records (invoices and gateways) will be kept safe."))) return;`
);
dbShell = dbShell.replace(
  /if \(!confirm\("Admin Action: Are you sure you want to completely reset your profile data to test again\?"\)\) return;/g,
  `if (!(await showConfirm("Admin Action: Are you sure you want to completely reset your profile data to test again?"))) return;`
);

// For the onClick ones, they can't use await directly inside inline function if it's not async.
// Let's replace the inline onClick with an async function.
dbShell = dbShell.replace(
  /onClick=\{\(\) => \{ if\(confirm\('Are you sure you want to block this user\? They will lose access to all features\.'\)\) toggleUserStatus\(client\.id, client\.status\) \}\}/g,
  `onClick={async () => { if(await showConfirm('Are you sure you want to block this user? They will lose access to all features.')) toggleUserStatus(client.id, client.status) }}`
);
dbShell = dbShell.replace(
  /onClick=\{\(\) => \{ if\(confirm\('Are you sure you want to unblock this user\?'\)\) toggleUserStatus\(client\.id, client\.status\) \}\}/g,
  `onClick={async () => { if(await showConfirm('Are you sure you want to unblock this user?')) toggleUserStatus(client.id, client.status) }}`
);

fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);
console.log("Patched confirm in DashboardShell.");

let pl = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf-8');
if (!pl.includes("import { showConfirm }")) {
    pl = pl.replace(/(import { showToast } from '\.\.\/\.\.\/lib\/toast';)/, `$1\nimport { showConfirm } from '../../lib/confirm';`);
}
pl = pl.replace(
  /if \(confirm\("Are you sure you want to delete this payment link\? Your past transaction records will be kept safe\."\)\) \{/g,
  `if (await showConfirm("Are you sure you want to delete this payment link? Your past transaction records will be kept safe.")) {`
);
// Make handleDeleteLink async if it's not already
pl = pl.replace(
  /const handleDeleteLink = \(id: string\) => \{/g,
  `const handleDeleteLink = async (id: string) => {`
);
fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', pl);
console.log("Patched confirm in PaymentLinks.");
