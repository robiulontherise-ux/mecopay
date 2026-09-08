const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetMethod = `  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    try {
      setIsVerifying(true);
      
      // Update invoice first
      const { error } = await supabase`;

const newMethod = `  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    try {
      setIsVerifying(true);
      
      // 1. Check if invoice is older than 24 hours
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('created_at')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceData && invoiceData.created_at) {
        const invoiceTime = new Date(invoiceData.created_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - invoiceTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
          setVerifyError("Time expired! You can only verify within 24 hours of initiating the payment.");
          setIsVerifying(false);
          return;
        }
      }

      // Update invoice first
      const { error } = await supabase`;

if (content.includes(targetMethod)) {
  content = content.replace(targetMethod, newMethod);
  fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
  console.log("Patched handleManualVerify to enforce 24 hour limit.");
} else {
  console.log("Could not find handleManualVerify target string.");
}
