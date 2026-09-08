import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 'details' | 'method' | 'verify_select' | 'auto_verify' | 'manual_verify' | 'success';

export default function Checkout() {
  const [step, setStep] = useState<Step>('details');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [method, setMethod] = useState<'bKash' | 'Nagad' | null>(null);
  
  // Auto Verify State
  const [senderNumber, setSenderNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  
  // Manual Verify State
  const [trxId, setTrxId] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);

  // Timer logic for auto-verify
  useEffect(() => {
    if (step === 'auto_verify' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateAutoVerify = () => {
    // In a real app, this would be a WebSocket listener to Supabase waiting for n8n/SMS forwarder updates
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
    }, 2500);
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId) return;
    setIsVerifying(true);
    // Simulate Supabase query checking for TrxID
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="bg-neutral-900 p-6 text-white text-center relative">
          <Link to="/dashboard" className="text-xs text-neutral-400 hover:text-white absolute top-4 left-4 flex items-center">
             &larr; Back
          </Link>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 mt-4">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold">Secure Checkout</h1>
          <p className="text-neutral-400 text-sm mt-1">Pay ৳1,500 to Merchant</p>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Step 1: Details */}
          {step === 'details' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Your Details</h2>
                <p className="text-sm text-neutral-500 mb-4">Please provide your details for the invoice.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Robiul Islam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={customer.phone}
                  onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <button 
                onClick={() => setStep('method')}
                disabled={!customer.name || !customer.phone}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Method */}
          {step === 'method' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-semibold text-neutral-900">Select Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={() => { setMethod('bKash'); setStep('verify_select'); }}
                  className="border border-neutral-200 hover:border-pink-500 hover:shadow-md rounded-2xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-pink-50/50"
                >
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-xs">
                    bKash
                  </div>
                  <span className="font-medium text-neutral-900">bKash</span>
                </button>
                <button 
                  onClick={() => { setMethod('Nagad'); setStep('verify_select'); }}
                  className="border border-neutral-200 hover:border-orange-500 hover:shadow-md rounded-2xl p-4 flex flex-col items-center gap-3 transition-all hover:bg-orange-50/50"
                >
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                    Nagad
                  </div>
                  <span className="font-medium text-neutral-900">Nagad</span>
                </button>
              </div>
              
              <button 
                onClick={() => setStep('details')}
                className="w-full mt-4 text-neutral-500 text-sm font-medium hover:text-neutral-900 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: Verify Select */}
          {step === 'verify_select' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-semibold text-neutral-900">How do you want to verify?</h2>
              
              <div className="space-y-3 mt-4">
                <button 
                  onClick={() => setStep('auto_verify')}
                  className="w-full text-left border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-neutral-900">Option 1: Auto-Verification</span>
                  </div>
                  <p className="text-sm text-neutral-600 ml-11">Best if you are sending money right now from your phone. (10 min live session)</p>
                </button>

                <button 
                  onClick={() => setStep('manual_verify')}
                  className="w-full text-left border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="bg-neutral-200 text-neutral-700 p-1.5 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-neutral-900">Option 2: TrxID Verification</span>
                  </div>
                  <p className="text-sm text-neutral-500 ml-11">Best if paying from a shop or verifying later. (24 hour flexible session)</p>
                </button>
              </div>

              <button 
                onClick={() => setStep('method')}
                className="w-full mt-4 text-neutral-500 text-sm font-medium hover:text-neutral-900 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Option 1: Auto Verify */}
          {step === 'auto_verify' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                <p><strong>Do not close this page!</strong> The payment will automatically verify once you send the money.</p>
              </div>

              <div className="text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner">
                <p className="text-sm text-neutral-500 mb-1">Send EXACTLY ৳1,500 to</p>
                <p className="text-3xl font-bold text-neutral-900 tracking-wider font-mono">017XXXXXXXX</p>
                <p className="text-xs font-semibold text-neutral-500 mt-2 uppercase tracking-wide">{method} Personal</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Number you are sending from</label>
                <input 
                  type="tel" 
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-mono"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="flex flex-col items-center justify-center py-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="text-3xl font-mono font-bold text-blue-600 tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Listening for WebSockets from Supabase...
                </p>
              </div>

              {/* Dev Simulation Button */}
              {senderNumber.length >= 11 && (
                <button 
                  onClick={handleSimulateAutoVerify}
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                >
                  {isVerifying ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Verifying with Supabase...</>
                  ) : (
                    "Simulate Receiving SMS"
                  )}
                </button>
              )}
              
              <button 
                onClick={() => setStep('verify_select')}
                className="w-full text-neutral-500 text-sm font-medium hover:text-neutral-900 transition-colors"
              >
                Change verification method
              </button>
            </div>
          )}

          {/* Option 2: Manual Verify */}
          {step === 'manual_verify' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
                <Clock className="w-5 h-5 shrink-0 text-blue-600" />
                <p>You can close this page and return within <strong>24 hours</strong> to verify using your TrxID.</p>
              </div>

              <div className="text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner">
                <p className="text-sm text-neutral-500 mb-1">Send EXACTLY ৳1,500 to</p>
                <p className="text-3xl font-bold text-neutral-900 tracking-wider font-mono">017XXXXXXXX</p>
                <p className="text-xs font-semibold text-neutral-500 mt-2 uppercase tracking-wide">{method} Personal</p>
              </div>

              <form onSubmit={handleManualVerify}>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Transaction ID (TrxID)</label>
                <input 
                  type="text" 
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono uppercase"
                  placeholder="e.g. 9J2K1L9M"
                  required
                />
                
                <button 
                  type="submit"
                  disabled={!trxId || isVerifying}
                  className="w-full mt-6 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md"
                >
                  {isVerifying ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Querying Database...</>
                  ) : (
                    "Verify Payment"
                  )}
                </button>
              </form>
              
              <button 
                onClick={() => setStep('verify_select')}
                className="w-full text-neutral-500 text-sm font-medium hover:text-neutral-900 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 'success' && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h2>
              <p className="text-neutral-500 mb-8">Thank you, <span className="font-medium text-neutral-900">{customer.name}</span>. Your payment of ৳1,500 via {method} has been verified.</p>
              
              <Link 
                to="/dashboard"
                className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 font-semibold py-3 px-6 rounded-xl transition-colors inline-block"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
