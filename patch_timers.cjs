const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    let timer: any;
    let pollTimer: any;

    if (step === 5 && verifyMethod === 'live' && timeLeft > 0) {
      // Countdown timer
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      // Polling timer for checking payment via API (No SQL required)
      pollTimer = setInterval(async () => {
        if (!invoiceId || !senderNumber || !linkData || !selectedGateway) return;
        
        try {
          const res = await fetch('/api/verify-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId,
              senderNumber,
              provider: selectedGateway.provider,
              userId: linkData.user_id
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.matched) {
               window.location.href = '/access/' + invoiceId;
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Check every 3 seconds

    } else if (timeLeft === 0 && verifyMethod === 'live') {
      showToast("Session expired. Please use TrxID verification.", "error");
      setVerifyMethod('trxid');
      setStep(4);
    }

    return () => {
       if (timer) clearInterval(timer);
       if (pollTimer) clearInterval(pollTimer);
    };
  }, [step, verifyMethod, timeLeft, invoiceId, senderNumber, linkData, selectedGateway]);`;

const newStr = `  // Separate effect for Countdown Timer
  useEffect(() => {
    let timer: any;
    if (step === 5 && verifyMethod === 'live' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && verifyMethod === 'live') {
      showToast("Session expired. Please use TrxID verification.", "error");
      setVerifyMethod('trxid');
      setStep(4);
    }
    return () => clearInterval(timer);
  }, [step, verifyMethod, timeLeft]);

  // Separate effect for Polling Timer (no dependency on timeLeft)
  useEffect(() => {
    let pollTimer: any;
    if (step === 5 && verifyMethod === 'live') {
      pollTimer = setInterval(async () => {
        if (!invoiceId || !senderNumber || !linkData || !selectedGateway) return;
        
        try {
          const res = await fetch('/api/verify-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId,
              senderNumber,
              provider: selectedGateway.provider,
              userId: linkData.user_id
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.matched) {
               window.location.href = '/access/' + invoiceId;
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(pollTimer);
  }, [step, verifyMethod, invoiceId, senderNumber, linkData, selectedGateway]);`;

if (content.includes(targetStr.substring(0, 100))) {
  // It's safer to just replace the whole thing if we can, but since whitespace can vary, let's use regex or just replace manually.
  let startIndex = content.indexOf('  useEffect(() => {\n    let timer: any;\n    let pollTimer: any;');
  let endIndex = content.indexOf('}, [step, verifyMethod, timeLeft, invoiceId, senderNumber, linkData, selectedGateway]);') + '}, [step, verifyMethod, timeLeft, invoiceId, senderNumber, linkData, selectedGateway]);'.length;
  
  if (startIndex !== -1 && endIndex !== -1) {
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex);
    content = before + newStr + after;
    fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
    console.log("Patched timers successfully!");
  } else {
    console.log("Failed to find start or end index.");
  }
} else {
  console.log("Target string not found (even first 100 chars)");
}
