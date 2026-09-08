const fs = require('fs');
let content = fs.readFileSync('src/components/checkout/CheckoutPage.tsx', 'utf8');

// 1. Remove the error from the footer
const oldFooterStr = `                    ) : (
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

const newFooterStr = `                    ) : (
                      <>
                        <button onClick={handleCancelPayment} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary} opacity-80\`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleManualVerify} disabled={isVerifying || trxId.length < 5} className={\`flex-[2] py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 \${gConfig.btnPrimary} \${trxId.length < 5 ? 'opacity-50' : ''}\`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY TRANSACTION'}
                        </button>
                      </>
                    )`;

if (content.includes(oldFooterStr)) {
  content = content.replace(oldFooterStr, newFooterStr);
  console.log("Removed error from footer.");
} else {
  console.log("Could not find oldFooterStr");
}

// 2. Add the error right under the TrxID input
const inputStr = `                      <input 
                        required 
                        type="text" 
                        value={trxId} 
                        onChange={e => setTrxId(e.target.value)} 
                        className={\`w-full bg-white px-4 py-3.5 font-bold text-center text-lg \${gConfig.inputColor} outline-none uppercase rounded-lg shadow-inner mb-2\`} 
                        placeholder="e.g 9FX4K..." 
                      />`;

const newInputWithErr = `                      <input 
                        required 
                        type="text" 
                        value={trxId} 
                        onChange={e => {
                          setTrxId(e.target.value);
                          if (verifyError) setVerifyError('');
                        }} 
                        className={\`w-full bg-white px-4 py-3.5 font-bold text-center text-lg \${gConfig.inputColor} outline-none uppercase rounded-lg shadow-inner \${verifyError ? 'mb-1 border-2 border-red-500' : 'mb-2'}\`} 
                        placeholder="e.g 9FX4K..." 
                      />
                      {verifyError && (
                        <div className="bg-red-50 text-red-600 font-bold text-center text-sm p-3 rounded-lg mb-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                          {verifyError}
                        </div>
                      )}`;

if (content.includes(inputStr)) {
  content = content.replace(inputStr, newInputWithErr);
  console.log("Added error under input.");
} else {
  console.log("Could not find inputStr");
}

fs.writeFileSync('src/components/checkout/CheckoutPage.tsx', content);
