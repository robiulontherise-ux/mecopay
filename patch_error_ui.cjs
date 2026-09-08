const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

// 1. Add state
if (!content.includes('const [verifyError, setVerifyError]')) {
  content = content.replace(
    "const [trxId, setTrxId] = useState('');",
    "const [trxId, setTrxId] = useState('');\n  const [verifyError, setVerifyError] = useState('');"
  );
}

// 2. Clear error on submit
if (!content.includes("setVerifyError('');")) {
  content = content.replace(
    "const handleManualVerify = async (e: React.FormEvent) => {\n    e.preventDefault();\n    try {\n      setIsVerifying(true);",
    "const handleManualVerify = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setVerifyError('');\n    try {\n      setIsVerifying(true);"
  );
}

// 3. Replace toasts in manual verify
content = content.replace(
  'showToast("Amount mismatch! Paid amount is less than required.", "error");',
  'setVerifyError("Amount mismatch! Paid amount is less than required.");'
);
content = content.replace(
  /showToast\("Transaction ID not match! Please give accurate TrxID.", "error"\);/g,
  'setVerifyError("Transaction ID not match! Please give accurate TrxID.");'
);

// 4. Insert UI for the error
const buttonGroupStr = `                    ) : (
                      <>
                        <button onClick={handleCancelPayment} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary} opacity-80\`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleManualVerify} disabled={isVerifying || trxId.length < 5} className={\`flex-[2] py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 \${gConfig.btnPrimary} \${trxId.length < 5 ? 'opacity-50' : ''}\`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY TRANSACTION'}
                        </button>
                      </>
                    )`;

const newButtonGroupStr = `                    ) : (
                      <div className="w-full">
                        {verifyError && (
                          <div className="bg-red-50 text-red-600 font-bold text-center text-sm p-3 rounded-lg mb-4 border border-red-100">
                            {verifyError}
                          </div>
                        )}
                        <div className="flex gap-4">
                          <button onClick={handleCancelPayment} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary} opacity-80\`}>
                             {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                          </button>
                          <button onClick={handleManualVerify} disabled={isVerifying || trxId.length < 5} className={\`flex-[2] py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 \${gConfig.btnPrimary} \${trxId.length < 5 ? 'opacity-50' : ''}\`}>
                             {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY TRANSACTION'}
                          </button>
                        </div>
                      </div>
                    )`;

if (content.includes(buttonGroupStr)) {
  content = content.replace(buttonGroupStr, newButtonGroupStr);
} else {
  console.log("Could not find button group!");
  // fallback search
  const idx = content.indexOf("{isVerifying ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : 'VERIFY TRANSACTION'}");
  console.log(content.substring(idx - 200, idx + 200));
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
console.log("Error UI patched!");
