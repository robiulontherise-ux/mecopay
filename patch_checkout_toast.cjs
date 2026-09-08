const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetImports = `import { showToast } from '../../lib/toast';`;
// We will replace showToast with a local toast function OR just implement a local toast listener.

const localToastLogic = `  // Local Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error', id: number} | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = Date.now();
      setToast({ ...customEvent.detail, id });
      setTimeout(() => {
        setToast(prev => prev?.id === id ? null : prev);
      }, 3000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => {
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);`;

// Insert the localToastLogic just inside CheckoutPage component
if (!content.includes('const handleToast')) {
    const componentStart = `export default function CheckoutPage() {`;
    content = content.replace(componentStart, componentStart + "\n" + localToastLogic);
}

// Add the Toast UI just before the closing </div> of CheckoutPage main return
const toastUI = `
      {/* Toast Notification */}
      {toast && (
        <div className={\`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 \${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }\`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <p className="font-medium text-sm">{toast.msg}</p>
        </div>
      )}`;

const returnIndex = content.lastIndexOf('</div>');
if (returnIndex !== -1 && !content.includes('Toast Notification')) {
    let before = content.substring(0, returnIndex);
    let after = content.substring(returnIndex);
    content = before + toastUI + "\n" + after;
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Checkout toast patched");
