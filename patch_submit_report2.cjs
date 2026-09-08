const fs = require('fs');
let content = fs.readFileSync('./src/components/checkout/CheckoutPage.tsx', 'utf-8');

const oldSubmit = `const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('fraud_reports').insert({
        payment_link_id: linkData?.id,
        invoice_id: invoiceId || null,
        user_id: linkData?.user_id,
        reason: reportReason,
        status: 'Open'
      });
      setReportSubmitted(true);
      setTimeout(() => setShowReport(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };`;

const newSubmit = `const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let proofUrl = null;
      if (reportProof) {
        const fileExt = reportProof.name.split('.').pop();
        const fileName = \`\${Math.random()}.\${fileExt}\`;
        const filePath = \`fraud-proofs/\${fileName}\`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, reportProof);
          
        if (uploadData) {
          const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
          proofUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from('fraud_reports').insert({
        payment_link_id: linkData?.id,
        invoice_id: invoiceId || null,
        user_id: linkData?.user_id,
        reason: reportReason,
        proof_url: proofUrl,
        status: 'Open'
      });
      setReportSubmitted(true);
      setReportProof(null);
      setTimeout(() => setShowReport(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', content);
console.log("Patched submit report for real");
