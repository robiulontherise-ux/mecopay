const fs = require('fs');
const file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const updatedVerify = `  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          trx_id: trxId,
          status: 'Pending' // Actually wait for 24h
        })
        .eq('id', invoiceId);

      if (error) throw error;
      setStep(5); // Success / wait message
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit verification: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          sender_number: senderNumber,
          status: 'Pending'
        })
        .eq('id', invoiceId);

      if (error) throw error;
      // Start waiting for live verification
      setStep(5);
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateAutoVerify = async () => {
    setIsVerifying(true);
    setTimeout(() => {
       setIsVerifying(false);
       setStep(6);
    }, 2000);
  };`;

content = content.replace(
  /const handleVerify = async \(e: React\.FormEvent\) => \{[\s\S]*?setLoading\(false\);\n    \}\n  \};/,
  updatedVerify
);

fs.writeFileSync(file, content);
