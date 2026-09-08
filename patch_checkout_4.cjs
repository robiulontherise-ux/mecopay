const fs = require('fs');
const file = 'src/components/checkout/CheckoutPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const jsxOptions = `            {/* STEP 3: Choose Method */}
            {step === 3 && selectedGateway && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[#1e293b] text-lg">Verification Method</h4>
                  <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                </div>
                
                <button 
                  onClick={() => { setVerifyMethod('live'); setStep(4); }}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#1e293b]">Live Auto-Verification (10 Min)</span>
                  </div>
                  <p className="text-sm text-blue-800 ml-11">Send money from your phone right now. We will automatically verify it.</p>
                </button>

                <button 
                  onClick={() => { setVerifyMethod('trxid'); setStep(4); }}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-slate-700 text-white p-1.5 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[#1e293b]">Manual TrxID (24 Hours)</span>
                  </div>
                  <p className="text-sm text-slate-600 ml-11">Best if you are paying from a shop or prefer entering TrxID manually.</p>
                </button>
              </div>
            )}

            {/* STEP 4: Live or TrxID Input */}
            {step === 4 && selectedGateway && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[#1e293b] text-lg">
                    {verifyMethod === 'live' ? 'Live Verification' : 'TrxID Verification'}
                  </h4>
                  <button type="button" onClick={() => (brandData?.verify_phone && brandData?.verify_trx_id) ? setStep(3) : setStep(2)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500 mb-1">Send exactly</p>
                  <p className="text-3xl font-bold text-slate-800 font-mono">৳ {linkData?.price}</p>
                  <p className="text-sm text-slate-500 mt-2">To <span className="capitalize font-bold text-slate-700">{selectedGateway.provider}</span>: <code className="font-bold text-[#1e293b] text-lg">{selectedGateway.number}</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText(selectedGateway.number)} className="ml-2 inline-flex items-center justify-center p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500">
                      <Copy className="w-4 h-4" />
                    </button>
                  </p>
                </div>

                {verifyMethod === 'live' ? (
                  <form onSubmit={handleLiveSubmit} className="space-y-4">
                    <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                      <p>You have <strong>{formatTime(timeLeft)}</strong> to send the money. Do not close this page.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1e293b] mb-1">Your Sender Number</label>
                      <input required type="text" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="01XXXXXXXXX" />
                    </div>
                    <button disabled={isVerifying} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
                      {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Verification'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleManualVerify} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
                      <Clock className="w-5 h-5 shrink-0 text-blue-600" />
                      <p>You can close this page and return within 24 hours to verify using your TrxID.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1e293b] mb-1">Transaction ID (TrxID)</label>
                      <input required type="text" value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none uppercase" placeholder="e.g. 9FX4K..." />
                    </div>
                    <button disabled={isVerifying} type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
                      {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Payment'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* STEP 5: Waiting State */}
            {step === 5 && (
              <div className="py-10 text-center animate-in zoom-in-95 duration-500 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto relative mb-4">
                  <Loader2 className="w-8 h-8 text-[#4051b5] animate-spin absolute" />
                  <div className="w-3 h-3 bg-[#4051b5] rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b]">Verifying Payment</h3>
                <p className="text-slate-500 text-sm max-w-[260px] mx-auto leading-relaxed">
                  {verifyMethod === 'live' 
                    ? \`Listening for your payment... \${formatTime(timeLeft)} remaining.\`
                    : "Querying database for your transaction..."}
                </p>
                {verifyMethod === 'live' && (
                  <button onClick={handleSimulateAutoVerify} className="mt-4 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded">
                    Simulate Payment Received (Dev)
                  </button>
                )}
              </div>
            )}

            {/* STEP 6: Success */}
            {step === 6 && (
              <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Payment Successful!</h2>
                <p className="text-slate-500 mb-8">Thank you! Your payment of ৳{linkData?.price} via {selectedGateway?.provider} has been verified.</p>
              </div>
            )}`;

content = content.replace(
  /\{\/\* STEP 3: Verify Payment \*\/\}[\s\S]*?\{\/\* STEP 4: Live Verification Wait \*\/\}[\s\S]*?<\/div>\n            \)\}/,
  jsxOptions
);

fs.writeFileSync(file, content);
