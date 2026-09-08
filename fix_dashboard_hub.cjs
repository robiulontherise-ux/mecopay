const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// 1. Ensure Lock icon is imported from lucide-react
if (!code.includes('Lock,')) {
    code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { Lock,$1} from 'lucide-react';");
}

// 2. Change Payments Center to Payments Hub
code = code.replace(/Payments Center/g, "Payments Hub");

// 3. Replace ShieldAlert with Lock for the locked tabs
const lockedTabPayment = `{!isIdentityLocked && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}`;
const newLockedTabPayment = `{!isIdentityLocked && <Lock className="w-3.5 h-3.5 text-red-500" />}`;

code = code.split(lockedTabPayment).join(newLockedTabPayment);

fs.writeFileSync('src/components/DashboardShell.tsx', code);
console.log('Fixed Payments Hub and Lock icons');
