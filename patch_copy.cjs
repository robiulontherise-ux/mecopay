const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

// Update state definition
content = content.replace(/const \[copied, setCopied\] = useState\(false\);/, 'const [copied, setCopied] = useState<string | false>(false);');

// Update copy function
const oldCopyFn = `  const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      fallbackCopyTextToClipboard(text);
    });
  };`;

const newCopyFn = `  const copyToClipboard = (text: string, id: string = 'number') => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      fallbackCopyTextToClipboard(text);
    });
  };`;
content = content.replace(oldCopyFn, newCopyFn);

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched copy function");
