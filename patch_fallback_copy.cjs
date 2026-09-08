const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldFallback = `  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy error', err);
    }
    document.body.removeChild(textArea);
  };`;

const newFallback = `  const fallbackCopyTextToClipboard = (text: string, id: string = 'number') => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy error', err);
    }
    document.body.removeChild(textArea);
  };`;

content = content.replace(oldFallback, newFallback);
content = content.replace(/fallbackCopyTextToClipboard\(text\);/g, 'fallbackCopyTextToClipboard(text, id);');

fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
