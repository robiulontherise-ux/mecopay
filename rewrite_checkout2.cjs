const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Loader2, Lock, Copy, Clock, RefreshCw, AlertCircle, CheckCircle2, Flag, QrCode, ShoppingCart } from 'lucide-react';

// Brand Logos
const LOGOS = {
  bkash: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/bkash.png',
  nagad: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png',
  rocket: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/rocket.png',
  upay: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/upay.png',
};

// Gateway Configs
const getGatewayConfig = (provider: string) => {
  const p = provider?.toLowerCase();
  switch (p) {
    case 'bkash':
      return { 
        headerBg: 'bg-white', headerText: 'text-slate-800', 
        bodyBg: 'bg-[#e2136e]', bodyText: 'text-white', inputColor: 'text-[#e2136e]',
        btnPrimary: 'bg-white text-[#e2136e]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'nagad':
      return { 
        headerBg: 'bg-[#ED1C24]', headerText: 'text-white', 
        bodyBg: 'bg-[#ED1C24]', bodyText: 'text-white', inputColor: 'text-[#ED1C24]',
        btnPrimary: 'bg-white/30 text-white', btnSecondary: 'bg-white text-[#ED1C24]'
      };
    case 'rocket':
      return { 
        headerBg: 'bg-white', headerText: 'text-slate-800', 
        bodyBg: 'bg-[#8c3494]', bodyText: 'text-white', inputColor: 'text-[#8c3494]',
        btnPrimary: 'bg-white/20 text-white', btnSecondary: 'bg-white/20 text-white'
      };
    case 'upay':
      return { 
        headerBg: 'bg-[#FFCC00]', headerText: 'text-[#0033A0]', 
        bodyBg: 'bg-[#FFCC00]', bodyText: 'text-[#0033A0]', inputColor: 'text-[#0033A0]',
        btnPrimary: 'bg-slate-200 text-[#0033A0]', btnSecondary: 'bg-white border border-[#0033A0] text-[#0033A0]'
      };
    default:
      return { 
        headerBg: 'bg-slate-800', headerText: 'text-white', 
        bodyBg: 'bg-slate-900', bodyText: 'text-white', inputColor: 'text-slate-900',
        btnPrimary: 'bg-blue-600 text-white', btnSecondary: 'bg-slate-700 text-white'
      };
  }
};

export default function CheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [linkData, setLinkData] = useState<any>(null);
  const [brandData, setBrandData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1);
  const [invoiceId, setInvoiceId] = useState('');
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [verifyMethod, setVerifyMethod] = useState<'live' | 'trxid' | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  
  // Report Modal
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 5 && verifyMethod === 'live' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && verifyMethod === 'live') {
      alert("Session expired. Please try again or use TrxID verification.");
      setVerifyMethod('trxid');
      setStep(4);
    }
    return () => clearInterval(timer);
  }, [step, verifyMethod, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: link, error: linkErr } = await supabase
        .from('payment_links')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (linkErr) throw linkErr;
      if (!link) throw new Error("Payment link not found");
      
      setLinkData(link);
      
      const { data: brand, error: brandErr } = await supabase
        .from('brands')
        .select('*')
        .eq('id', link.brand_id)
        .single();
        
      if (brandErr) throw brandErr;
      setBrandData(brand);
      
      const { data: gws, error: gwErr } = await supabase
        .from('payment_numbers')
        .select('*')
        .eq('brand_id', link.brand_id);
        
      if (gwErr) throw gwErr;
      setGateways(gws || []);

      // Check device online status
      const { data: devices } = await supabase
        .from('device_status')
        .select('last_heartbeat_at')
        .eq('user_id', link.user_id);
        
      let online = false;
      if (devices && devices.length > 0) {
        const now = new Date();
        for (const dev of devices) {
          if (dev.last_heartbeat_at) {
            const hb = new Date(dev.last_heartbeat_at);
            if ((now.getTime() - hb.getTime()) / 1000 < 90) { // 90 seconds
              online = true;
              break;
            }
          }
        }
      }
      setIsDeviceOnline(online);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let primaryName = formData['Name'] || formData['name'] || 'Customer';
      let primaryPhone = formData['Phone'] || formData['phone'] || '';
      let primaryEmail = formData['Email'] || formData['email'] || '';
      
      const payload: any = {
        user_id: linkData.user_id,
        brand_id: linkData.brand_id,
        payment_link_id: linkData.id,
        amount: linkData.price,
        status: 'Pending',
        customer_name: primaryName,
        customer_phone: primaryPhone,
        customer_email: primaryEmail
      };

      payload.customer_data = formData;

      const { data, error } = await supabase
        .from('invoices')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.message.includes('customer_data')) {
           delete payload.customer_data;
           const retry = await supabase.from('invoices').insert(payload).select().single();
           if (retry.error) throw retry.error;
           setInvoiceId(retry.data.id);
        } else {
           throw error;
        }
      } else {
        setInvoiceId(data.id);
      }
      
      setStep(2);
    } catch (err: any) {
      console.error(err);
      alert("Failed to continue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGateway = (gw: any) => {
    setSelectedGateway(gw);
    const hasLive = brandData?.redirect_links?.verify_phone;
    const hasTrxId = brandData?.redirect_links?.verify_trx_id !== false;

    if (isDeviceOnline) {
      if (hasLive && hasTrxId) {
        setStep(3); // Choose method
      } else if (hasLive) {
        setVerifyMethod('live');
        setStep(4);
      } else {
        setVerifyMethod('trxid');
        setStep(4);
      }
    } else {
      setVerifyMethod('trxid');
      setStep(4);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const { error } = await supabase
        .from('invoices')
        .update({
          gateway_number: selectedGateway.number,
          trx_id: trxId,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;
      setStep(6);
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
      setStep(5); // Proceed to countdown
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
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
  };

  if (loading && step === 1 && !linkData) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-center text-red-500 max-w-sm w-full">
        <p className="font-bold">{error}</p>
      </div>
    </div>;
  }

  const customFields = linkData?.custom_fields || [
    { name: 'Name', type: 'text', required: true },
    { name: 'Phone', type: 'tel', required: true }
  ];

  const providerKey = selectedGateway?.provider?.toLowerCase() || '';
  const gConfig = getGatewayConfig(providerKey);
  const logoUrl = LOGOS[providerKey as keyof typeof LOGOS] || '';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="max-w-md w-full mx-auto p-4 pt-8 pb-20">
        
        {/* Title / Brand (Only show on Steps 1, 2, 3) */}
        {step < 4 && (
          <div className="text-center mb-6">
            {brandData?.logo_url ? (
              <img src={brandData.logo_url} alt={brandData.name} className="h-16 w-16 mx-auto object-cover rounded-full shadow-sm mb-3" />
            ) : (
              <div className="h-16 w-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm mb-3">
                {brandData?.name?.charAt(0)}
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800">{brandData?.name || 'MecoPay Checkout'}</h2>
          </div>
        )}

        {/* Main Card */}
        <div className={\`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative \${step >= 4 ? 'min-h-[650px] flex flex-col' : ''}\`}>
          
          {/* Default Header for steps 1-3 */}
          {step < 4 && (
            <div className="bg-[#1e293b] p-6 text-white flex items-center gap-4">
              {linkData?.product_image ? (
                <img src={linkData.product_image} alt={linkData.product_name} className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">📦</div>
              )}
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{linkData?.product_name}</h3>
                <div className="text-emerald-400 font-bold text-xl">৳ {linkData?.price}</div>
              </div>
            </div>
          )}

          {/* Gateway Specific Header for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <div className={\`\${gConfig.headerBg} \${gConfig.headerText} p-6 border-b border-black/5\`}>
              {providerKey === 'nagad' && (
                <div className="flex justify-end mb-4">
                  <div className="flex bg-white/20 rounded border border-white/30 text-[10px] font-bold overflow-hidden">
                    <span className="px-2 py-1 bg-white text-red-600">বাং</span>
                    <span className="px-2 py-1">Eng</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col items-center mb-6">
                 {providerKey === 'upay' ? (
                   <div className="bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center shadow-sm mb-4">
                     <img src={logoUrl} alt="Upay" className="h-10 object-contain" />
                   </div>
                 ) : providerKey === 'nagad' ? (
                   <div className="mb-4">
                     <ShoppingCart className="w-10 h-10 mx-auto text-white opacity-80" />
                   </div>
                 ) : (
                   <img src={logoUrl} alt={selectedGateway.provider} className="h-10 object-contain mb-4" />
                 )}
                 <h2 className="text-lg font-bold text-center tracking-wide">{linkData?.product_name || brandData?.name}</h2>
                 {providerKey === 'bkash' && (
                   <p className="text-xs opacity-60 flex items-center gap-1 mt-1">Inv No: {invoiceId || 'b51bfea0...'} <Copy className="w-3 h-3" /></p>
                 )}
                 {providerKey === 'nagad' && (
                   <p className="text-xs opacity-80 flex items-center gap-1 mt-1 font-mono">Invoice No: {invoiceId.substring(0, 15)}...</p>
                 )}
              </div>

              {providerKey === 'nagad' && (
                <div className="border border-white/30 rounded-lg p-4 flex justify-between items-center mb-2">
                  <div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Amount:</div>
                    <div className="text-2xl font-bold">BDT {linkData?.price}</div>
                  </div>
                  <button className="bg-white text-red-600 p-2 rounded-full"><Copy className="w-4 h-4" /></button>
                </div>
              )}
              {providerKey === 'nagad' && (
                <div className="text-sm font-bold opacity-90">Charge: <span className="font-normal">BDT 0</span></div>
              )}
              
              {providerKey !== 'nagad' && (
                 <div className={\`\${providerKey === 'upay' ? 'bg-white text-slate-800 rounded-2xl py-4 px-6 text-center shadow-sm' : 'flex justify-between items-center border-t border-black/10 pt-4'}\`}>
                    {providerKey === 'upay' ? (
                       <div className="text-lg font-bold">Amount: <span className="font-black">BDT {linkData?.price}</span></div>
                    ) : (
                       <div className="text-xl font-bold">৳{linkData?.price}</div>
                    )}
                 </div>
              )}
            </div>
          )}

          {/* Standard Body Content */}
          {step < 4 && (
            <div className="p-6">
              {/* STEP 1: Details */}
              {step === 1 && (
                <form onSubmit={handleDetailsSubmit} className="space-y-4 animate-in fade-in">
                  {linkData?.payment_note && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-4">
                      {linkData.payment_note}
                    </div>
                  )}
                  
                  {customFields.map((field: any, idx: number) => (
                    <div key={idx}>
                      <label className="block text-sm font-bold text-[#1e293b] mb-1.5">{field.name} {field.required && '*'}</label>
                      <input 
                        required={field.required}
                        type={field.type || 'text'} 
                        value={formData[field.name] || ''} 
                        onChange={e => handleFieldChange(field.name, e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                        placeholder={\`Enter \${field.name}\`} 
                      />
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#4051b5] hover:bg-[#303f9f] text-white font-bold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    Continue to Payment
                  </button>
                </form>
              )}

              {/* STEP 2: Select Gateway */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#1e293b] text-lg">Select Payment Method</h4>
                    <button onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                  </div>
                  
                  {gateways.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                      This brand has not configured any payment methods yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {gateways.map(gw => {
                        let gwLogo = LOGOS[gw.provider.toLowerCase() as keyof typeof LOGOS] || '';
                        return (
                          <button 
                            key={gw.id} 
                            onClick={() => handleSelectGateway(gw)}
                            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md flex flex-col items-center justify-center gap-2 transition-all h-24 group"
                          >
                            {gwLogo ? (
                              <img src={gwLogo} alt={gw.provider} className="h-8 object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                              <span className="text-sm font-bold text-slate-700 capitalize">{gw.provider}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {/* STEP 3: Choose Method */}
              {step === 3 && selectedGateway && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-[#1e293b] text-lg">Verification Method</h4>
                    <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                  </div>
                  
                  <button 
                    onClick={() => { setVerifyMethod('live'); setStep(4); }}
                    className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-colors relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Recommended</div>
                    <div className="flex items-center gap-3 mb-1 mt-1">
                      <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1e293b] text-lg">Live Auto-Verification</span>
                    </div>
                    <p className="text-sm text-blue-800 ml-11">Send money from your phone right now. Verified automatically within 10 minutes.</p>
                  </button>

                  <button 
                    onClick={() => { setVerifyMethod('trxid'); setStep(4); }}
                    className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-4 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="bg-slate-700 text-white p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1e293b] text-lg">Manual TrxID</span>
                    </div>
                    <p className="text-sm text-slate-600 ml-11">Send money and provide the Transaction ID. Verified manually within 24 hours.</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <div className={\`flex-1 \${gConfig.bodyBg} \${gConfig.bodyText} flex flex-col relative\`}>
              
              {!isDeviceOnline && verifyMethod === 'trxid' && step === 4 && (
                <div className="bg-black/20 text-white p-3 text-xs font-medium border-b border-white/10 text-center">
                  Merchant device is offline. Proceeding with Manual TrxID verification.
                </div>
              )}

              {/* STEP 4: Live Input OR TrxID Input */}
              {step === 4 && selectedGateway && (
                <div className="p-6 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4">
                  {verifyMethod === 'live' ? (
                    // LIVE - ENTER SENDER NUMBER
                    <div className="text-center w-full max-w-xs mx-auto">
                      <h4 className="font-bold text-lg mb-6">
                        {providerKey === 'upay' ? 'Enter Your upay Account Number' : \`Your \${selectedGateway.provider} Account Number\`}
                      </h4>
                      <input 
                        type="tel" 
                        value={senderNumber}
                        onChange={e => setSenderNumber(e.target.value)}
                        className={\`w-full bg-white rounded-lg px-4 py-3.5 font-bold text-center text-lg \${gConfig.inputColor} outline-none border-2 border-transparent focus:border-black/20 shadow-inner mb-6\`}
                        placeholder="e.g 01XXXXXXXXX"
                      />
                      <p className="text-sm font-medium opacity-90 mb-8">
                        {providerKey === 'nagad' ? (
                           <>By clicking/tapping "Proceed" you are agreeing to our<br/><b>Terms and Conditions</b></>
                        ) : providerKey === 'upay' ? (
                           <>By clicking on Confirm, you are agreeing to the <br/><u>terms & conditions</u></>
                        ) : (
                           <>Confirm and proceed, <u>terms & conditions</u></>
                        )}
                      </p>
                    </div>
                  ) : (
                    // TRXID - INSTRUCTIONS & ENTER TRXID
                    <div className="w-full">
                      {providerKey === 'upay' ? (
                         <div className="bg-black/10 rounded-xl p-4 mb-6 flex justify-between items-center border border-black/10">
                            <div>
                              <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Personal Number</div>
                              <div className="text-2xl font-bold">{selectedGateway.number}</div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => navigator.clipboard.writeText(selectedGateway.number)} className="bg-white/50 p-2.5 rounded-full hover:bg-white text-[#0033A0] transition-colors"><Copy className="w-4 h-4" /></button>
                               <button className="bg-white/50 p-2.5 rounded-full hover:bg-white text-[#0033A0] transition-colors"><QrCode className="w-4 h-4" /></button>
                            </div>
                         </div>
                      ) : (
                         <div className="border border-white/30 rounded-xl p-4 mb-6 flex justify-between items-center bg-black/5">
                            <div>
                              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Personal Number</div>
                              <div className="text-2xl font-bold tracking-wider">{selectedGateway.number}</div>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(selectedGateway.number)} className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                              <Copy className="w-5 h-5" />
                            </button>
                         </div>
                      )}

                      <div className="space-y-3 text-sm mb-8 font-medium">
                         <p className="flex gap-2"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">1</span> উপরের পার্সোনাল একাউন্ট নম্বর কপি করুন</p>
                         <p className="flex gap-2"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">2</span> {selectedGateway.provider} অ্যাপ এ যান তারপর 'সেন্ড মানি' নির্বাচন করুন</p>
                         <p className="flex gap-2"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">3</span> একাউন্ট নম্বর পেস্ট করুন এবং কাঙ্ক্ষিত এমাউন্ট ({linkData.price} BDT) সেন্ড মানি করুন।</p>
                         <p className="flex gap-2"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs shrink-0">4</span> সেন্ড মানি সম্পন্ন করে ট্রানজেকশন আইডি (TrxID) নিচের বক্সে দিন এবং VERIFY বাটনে ক্লিক করুন।</p>
                      </div>

                      <div className="text-center font-bold mb-4 text-lg">ট্রানজেকশন আইডি দিন</div>
                      <input 
                        required 
                        type="text" 
                        value={trxId} 
                        onChange={e => setTrxId(e.target.value)} 
                        className={\`w-full bg-white px-4 py-3.5 font-bold text-center text-lg \${gConfig.inputColor} outline-none uppercase rounded-lg shadow-inner mb-2\`} 
                        placeholder="e.g 9FX4K..." 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Live - Waiting */}
              {step === 5 && selectedGateway && (
                <div className="p-6 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
                  {providerKey === 'upay' ? (
                     <div className="bg-black/10 rounded-xl p-4 mb-6 flex justify-between items-center border border-black/10">
                        <div>
                          <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Personal Number</div>
                          <div className="text-2xl font-bold">{selectedGateway.number}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => navigator.clipboard.writeText(selectedGateway.number)} className="bg-white p-2.5 rounded-full shadow-sm text-[#0033A0] transition-transform hover:scale-105"><Copy className="w-4 h-4" /></button>
                           <button className="bg-[#0033A0] p-2.5 rounded-full shadow-sm text-white transition-transform hover:scale-105"><QrCode className="w-4 h-4" /></button>
                        </div>
                     </div>
                  ) : (
                     <div className="border border-white/30 rounded-xl p-4 mb-6 flex justify-between items-center bg-black/5">
                        <div>
                          <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Personal Number</div>
                          <div className="text-2xl font-bold tracking-wider">{selectedGateway.number}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => navigator.clipboard.writeText(selectedGateway.number)} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                             <Copy className="w-4 h-4" />
                           </button>
                           <button className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                             <QrCode className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  )}

                  <div className="space-y-3 text-sm mb-8 font-medium">
                     <p className="flex gap-2 items-start"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">1</span> <span>উপরের পার্সোনাল একাউন্ট নম্বর কপি করুন</span></p>
                     <p className="flex gap-2 items-start"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">2</span> <span>{selectedGateway.provider} অ্যাপ এ যান তারপর 'সেন্ড মানি' নির্বাচন করুন</span></p>
                     <div className="ml-7 my-4 border-2 border-white/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-4">
                        {/* Generic visual representation of an app menu since we don't have the real image asset */}
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center gap-1">
                              <div className={\`w-12 h-12 rounded-full border-2 \${providerKey === 'nagad' ? 'border-red-500 bg-red-50' : providerKey === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center animate-pulse\`}>
                                 <ShoppingCart className={\`w-5 h-5 \${providerKey === 'nagad' ? 'text-red-500' : providerKey === 'bkash' ? 'text-pink-500' : 'text-blue-500'}\`} />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">সেন্ড মানি</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-40">
                              <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <RefreshCw className="w-5 h-5 text-slate-400" />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">ক্যাশ আউট</div>
                           </div>
                           <div className="flex flex-col items-center gap-1 opacity-40">
                              <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
                                 <Lock className="w-5 h-5 text-slate-400" />
                              </div>
                              <div className="text-[10px] text-slate-800 font-bold">পেমেন্ট</div>
                           </div>
                        </div>
                     </div>
                     <p className="flex gap-2 items-start"><span className="bg-white text-black font-bold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">3</span> <span>একাউন্ট নম্বর পেস্ট করুন এবং কাঙ্ক্ষিত এমাউন্ট সেন্ড মানি করুন। সেন্ড মানি সম্পন্ন করে এই পেজে অপেক্ষা করুন, পেজটি বন্ধ করবেন না।</span></p>
                  </div>

                  <div className="mt-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-2 font-bold text-lg">
                       <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                       Waiting for payment...
                    </div>
                    <div className="text-sm font-bold opacity-90 mb-6">Session expires in {formatTime(timeLeft)}</div>
                    
                    {providerKey === 'upay' && (
                       <button onClick={() => { setVerifyMethod('trxid'); setStep(4); }} className="w-full bg-transparent border-2 border-[#0033A0] text-[#0033A0] py-3 rounded-lg font-bold mb-4">
                         Add Transaction ID
                       </button>
                    )}
                  </div>
                </div>
              )}

              {/* Gateway Footer Actions (Step 4 & 5) */}
              <div className={\`mt-auto p-4 flex gap-4 \${providerKey === 'upay' ? 'bg-slate-100 rounded-b-2xl border-t border-black/10' : ''}\`}>
                 {step === 4 ? (
                    verifyMethod === 'live' ? (
                      <>
                        <button onClick={() => setStep(3)} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary}\`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleLiveSubmit} disabled={isVerifying || senderNumber.length < 11} className={\`flex-1 py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 \${gConfig.btnPrimary} \${senderNumber.length < 11 ? 'opacity-50' : ''}\`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (providerKey === 'nagad' ? 'Proceed' : 'Confirm')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setStep(3)} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary} opacity-80\`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleManualVerify} disabled={isVerifying || trxId.length < 5} className={\`flex-[2] py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 \${gConfig.btnPrimary} \${trxId.length < 5 ? 'opacity-50' : ''}\`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY TRANSACTION'}
                        </button>
                      </>
                    )
                 ) : step === 5 ? (
                    <>
                      <button onClick={() => setStep(4)} className={\`flex-1 py-3.5 rounded-lg font-bold \${gConfig.btnSecondary}\`}>
                         {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                      </button>
                      <button disabled className={\`flex-1 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 \${gConfig.btnPrimary} opacity-50\`}>
                         <RefreshCw className="w-5 h-5 animate-spin" /> 
                         {providerKey === 'upay' ? "I've Paid - Check" : 'Auto verifying...'}
                      </button>
                    </>
                 ) : null}
              </div>

              {/* Upay Footer Logo */}
              {providerKey === 'upay' && (
                <div className="bg-white py-3 text-center text-[#0033A0] font-black tracking-widest text-sm rounded-b-2xl border-t border-slate-200 flex justify-center items-center gap-2">
                   <div className="bg-[#0033A0] text-white w-5 h-5 rounded flex items-center justify-center text-xs">U</div>
                   16268
                </div>
              )}
              {/* Nagad Footer Logo */}
              {providerKey === 'nagad' && (
                <div className="py-4 flex justify-center opacity-80">
                   <img src={logoUrl} alt="Nagad" className="h-8 grayscale brightness-200" />
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 6 && (
            <div className="text-center py-12 px-6 animate-in zoom-in-95 duration-500 flex-1 flex flex-col justify-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Submitted!</h2>
              <p className="text-slate-500 mb-10 text-lg">Thank you, <span className="font-medium text-slate-800">{formData.Name || formData.name || 'Customer'}</span>. Your payment of ৳{linkData.price} via {selectedGateway?.provider} has been received and is being verified.</p>
              
              <Link 
                to="/dashboard"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold py-4 px-6 rounded-xl transition-colors inline-block w-full"
              >
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Footer Features (Secured & Report) */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-in fade-in">
          <div className="flex items-center justify-center text-emerald-600 gap-2 text-sm font-bold bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-200 shadow-sm">
            <ShieldCheck className="w-5 h-5" /> Secured by <span className="font-black tracking-wide text-emerald-700">MecoPay</span>
          </div>
          <button onClick={() => setShowReport(true)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full border border-red-200 shadow-sm">
            <Flag className="w-3.5 h-3.5" /> Report this payment
          </button>
        </div>

      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" /> Report Merchant
              </h3>
              <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-md shadow-sm"><Lock className="w-5 h-5" /></button>
            </div>
            {reportSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-xl mb-2 text-slate-800">Report Submitted</h4>
                <p className="text-sm text-slate-500">Our admin team will review this transaction and merchant. Thank you for helping keep MecoPay secure.</p>
              </div>
            ) : (
              <form onSubmit={submitReport} className="p-6">
                <p className="text-sm text-slate-600 mb-4 font-medium">If you believe this payment link is fraudulent or you have not received your product, please submit a report below.</p>
                <textarea 
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none resize-none h-32 mb-6 font-medium text-slate-800 transition-all"
                  placeholder="Explain what happened..."
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-md shadow-red-500/20 transition-colors">Submit Report</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`
fs.writeFileSync('./src/components/checkout/CheckoutPage.tsx', code);
