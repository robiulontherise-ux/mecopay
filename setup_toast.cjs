const fs = require('fs');

// 1. Create toast.ts
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/toast.ts', `export const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};`);

// 2. Patch DashboardShell.tsx
let dbShell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf-8');

// Add imports
dbShell = dbShell.replace(
  /import \{ supabase \} from '\.\.\/lib\/supabase';/,
  `import { supabase } from '../lib/supabase';\nimport { showToast } from '../lib/toast';`
);

// Add State & Effect
dbShell = dbShell.replace(
  /const \[activeTab, setActiveTab\] = useState\('dashboard'\);/,
  `const [activeTab, setActiveTab] = useState('dashboard');\n  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error', id: number} | null>(null);\n\n  useEffect(() => {\n    const handleToast = (e: Event) => {\n      const customEvent = e as CustomEvent;\n      const id = Date.now();\n      setToast({ ...customEvent.detail, id });\n      setTimeout(() => {\n        setToast(prev => prev?.id === id ? null : prev);\n      }, 1500);\n    };\n    window.addEventListener('show-toast', handleToast);\n    return () => window.removeEventListener('show-toast', handleToast);\n  }, []);`
);

// Replace alerts
dbShell = dbShell.replace(/alert\("Brand updated successfully!"\);/g, `showToast("Updated successfully!", 'success');`);
dbShell = dbShell.replace(/alert\("Error updating brand: " \+ \(e as any\)\.message\);/g, `showToast("Failed to update!", 'error');`);
dbShell = dbShell.replace(/alert\("Brand created successfully!"\);/g, `showToast("Created successfully!", 'success');`);
dbShell = dbShell.replace(/alert\("Failed to create brand: " \+ err\.message\);/g, `showToast("Failed to create!", 'error');`);
dbShell = dbShell.replace(/alert\("Brand deleted successfully\."\);/g, `showToast("Deleted successfully!", 'success');`);
dbShell = dbShell.replace(/alert\("Failed to delete brand: " \+ err\.message\);/g, `showToast("Failed to delete!", 'error');`);
dbShell = dbShell.replace(/alert\("HMAC Secret Regenerated successfully!"\);/g, `showToast("Regenerated successfully!", 'success');`);
dbShell = dbShell.replace(/alert\("Failed to regenerate HMAC Secret"\);/g, `showToast("Failed to regenerate!", 'error');`);

// Cancel buttons
dbShell = dbShell.replace(
  /onClick=\{\(\) => \{\n\s*setShowBrandModal\(false\);\n\s*setActiveBrandDropdown\(null\);\n\s*\}\}/g,
  `onClick={() => {\n                        setShowBrandModal(false);\n                        setActiveBrandDropdown(null);\n                        showToast("Cancelled", "error");\n                      }}`
);

// Inject UI at the very end of return
dbShell = dbShell.replace(
  /(\s*)<\/div>\s*\);\s*\}\s*$/g,
  `$1  {toast && (
        <div className="fixed top-12 right-12 z-[9999] pointer-events-none animate-in fade-in slide-in-from-top-5 duration-200">
          <p className={\`font-bold text-lg drop-shadow-sm \${toast.type === 'success' ? 'text-emerald-500' : 'text-red-500'}\`}>
            {toast.msg}
          </p>
        </div>
      )}
    </div>
  );
}`
);
fs.writeFileSync('src/components/DashboardShell.tsx', dbShell);

// 3. Patch GatewaySettings.tsx
let gwSet = fs.readFileSync('src/components/payment-hub/GatewaySettings.tsx', 'utf-8');
gwSet = gwSet.replace(
  /import \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';/,
  `import { supabase } from '../../lib/supabase';\nimport { showToast } from '../../lib/toast';`
);

gwSet = gwSet.replace(/alert\("Please fill all required fields \(Brand, select at least one Provider, and Primary Account Number\)"\);/g, `showToast("Please fill required fields!", 'error');`);
gwSet = gwSet.replace(/alert\(\`Gateway credentials saved successfully for: \$\{selectedProviders\.join\(\', \'\)\\}!\`\);/g, `showToast("Saved successfully!", 'success');`);
gwSet = gwSet.replace(/alert\(\`Failed to save: \$\{err\.message\}\`\);/g, `showToast("Failed to save!", 'error');`);
gwSet = gwSet.replace(
  /onClick=\{\(\) => \{ setIsCreating\(false\); setSelectedProvider\(null\); setSelectedProviders\(\[\]\); \}\}/g,
  `onClick={() => { setIsCreating(false); setSelectedProvider(null); setSelectedProviders([]); showToast("Cancelled", "error"); }}`
);
fs.writeFileSync('src/components/payment-hub/GatewaySettings.tsx', gwSet);

// 4. Patch PaymentLinks.tsx
let plSet = fs.readFileSync('src/components/payment-hub/PaymentLinks.tsx', 'utf-8');
plSet = plSet.replace(
  /import \{ supabase \} from '\.\.\/\.\.\/lib\/supabase';/,
  `import { supabase } from '../../lib/supabase';\nimport { showToast } from '../../lib/toast';`
);

plSet = plSet.replace(/alert\("Payment link copied to clipboard"\);/g, `showToast("Copied successfully!", 'success');`);
plSet = plSet.replace(/alert\("Please fill all required fields"\);/g, `showToast("Please fill all fields!", 'error');`);
plSet = plSet.replace(/alert\("Payment link created successfully!"\);/g, `showToast("Created successfully!", 'success');`);
plSet = plSet.replace(/alert\("Error saving link: " \+ error\.message\);/g, `showToast("Failed to create!", 'error');`);
plSet = plSet.replace(/alert\("Payment link deleted successfully"\);/g, `showToast("Deleted successfully!", 'success');`);
plSet = plSet.replace(/alert\("Error deleting link: " \+ error\.message\);/g, `showToast("Failed to delete!", 'error');`);
plSet = plSet.replace(
  /onClick=\{\(\) => setIsCreating\(false\)\}/g,
  `onClick={() => { setIsCreating(false); showToast("Cancelled", "error"); }}`
);
fs.writeFileSync('src/components/payment-hub/PaymentLinks.tsx', plSet);

console.log("Replaced alerts with custom toast.");
