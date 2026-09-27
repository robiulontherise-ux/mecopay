import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle2, ShieldCheck, Zap, Info, RefreshCw, Smartphone, Key, Globe, Send, AlertTriangle, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface SmsServiceSettingsProps {
  user: any;
  brands?: any[];
}

export default function SmsServiceSettings({ user, brands = [] }: SmsServiceSettingsProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [phoneToPair, setPhoneToPair] = useState<string>('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingPair, setIsGeneratingPair] = useState<boolean>(false);
  const [gatewayStatus, setGatewayStatus] = useState<{ connected: boolean; phone?: string }>({ connected: false });

  // Template States
  const [templatePaymentSuccess, setTemplatePaymentSuccess] = useState<string>(
    'ধন্যবাদ {customer_name}! আপনার {amount} টাকার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। TrxID: {trx_id}। ইনভয়েস লিংক: {invoice_url}'
  );
  const [templateOrderCreated, setTemplateOrderCreated] = useState<string>(
    'প্রিয় {customer_name}, আপনার {amount} টাকার অর্ডারটি গৃহীত হয়েছে। অর্ডার ট্র্যাকিং: {tracking_url}'
  );
  const [isSavingTemplates, setIsSavingTemplates] = useState<boolean>(false);
  const [fallbackToSms, setFallbackToSms] = useState<boolean>(true);

  // Select first brand by default
  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(String(brands[0].id));
    }
  }, [brands]);

  // Fetch status and templates directly from Supabase for selected brand
  useEffect(() => {
    if (!selectedBrandId) return;
    fetchTemplatesAndStatus();
  }, [selectedBrandId]);

  const fetchTemplatesAndStatus = async () => {
    try {
      // 1. Fetch templates from Supabase
      const { data: tpls } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('brand_id', selectedBrandId);

      if (tpls) {
        const paymentTpl = tpls.find((t: any) => t.event_type === 'payment_success');
        const orderTpl = tpls.find((t: any) => t.event_type === 'order_created');
        if (paymentTpl) setTemplatePaymentSuccess(paymentTpl.template_body);
        if (orderTpl) setTemplateOrderCreated(orderTpl.template_body);
      }

      // 2. Fetch gateway pairing status
      const { data: gw } = await supabase
        .from('whatsapp_gateway_settings')
        .select('*')
        .eq('brand_id', selectedBrandId)
        .maybeSingle();

      if (gw) {
        setGatewayStatus({ connected: gw.is_connected, phone: gw.phone_number });
        if (gw.phone_number && !phoneToPair) setPhoneToPair(gw.phone_number);
        if (gw.pairing_code && !gw.is_connected) setPairingCode(gw.pairing_code);
      }
    } catch (e) {
      console.warn('Could not load settings from Supabase:', e);
    }
  };

  const handleGeneratePairingCode = async () => {
    const cleanPhone = phoneToPair.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid phone number with country code (e.g. 88017XXXXXXXX)', 'error');
      return;
    }
    if (!selectedBrandId) {
      showToast('Please select a brand first', 'error');
      return;
    }

    setIsGeneratingPair(true);
    setPairingCode(null);
    try {
      // Call Supabase Edge Function (Never touches Oracle directly from browser!)
      const { data, error } = await supabase.functions.invoke('headless-orchestrator', {
        body: {
          action: 'pair_phone',
          brand_id: selectedBrandId,
          phone: cleanPhone
        }
      });

      if (!error && data?.pairing_code) {
        setPairingCode(data.pairing_code);
        showToast('Pairing code generated! Enter in WhatsApp.', 'success');
      } else if (data?.connected) {
        setGatewayStatus({ connected: true, phone: cleanPhone });
        showToast('WhatsApp is already connected for this brand!', 'success');
      } else {
        showToast(data?.error || error?.message || 'Failed to generate pairing code', 'error');
      }
    } catch (err: any) {
      showToast('Error requesting pairing code: ' + err.message, 'error');
    } finally {
      setIsGeneratingPair(false);
    }
  };

  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) {
      showToast('Please select a brand', 'error');
      return;
    }
    setIsSavingTemplates(true);
    try {
      await supabase.from('notification_templates').upsert([
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'payment_success',
          channel: 'whatsapp',
          template_body: templatePaymentSuccess,
          updated_at: new Date().toISOString()
        },
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'order_created',
          channel: 'whatsapp',
          template_body: templateOrderCreated,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'brand_id,event_type,channel' });

      showToast('Templates saved in Supabase successfully!', 'success');
    } catch (e: any) {
      showToast('Failed to save templates: ' + e.message, 'error');
    } finally {
      setIsSavingTemplates(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">WhatsApp & Smart SMS Hub</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Connect your official WhatsApp number via 8-Digit Pairing Code with smart fallback to Mobile SIM SMS.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Selection */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Select Active Brand
        </label>
        <select
          value={selectedBrandId}
          onChange={(e) => setSelectedBrandId(e.target.value)}
          className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
        >
          {brands.length === 0 ? (
            <option value="">No brand created yet</option>
          ) : (
            brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.website_url || 'Brand'})
              </option>
            ))
          )}
        </select>
      </div>

      {/* 1. WhatsApp Headless Pairing Code Section */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">1. Connect WhatsApp Device (Pairing Code)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              No secondary phone or camera needed! Enter phone number to receive an 8-character pairing code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Multi-Tenant Isolated Session
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                WhatsApp Phone Number (with Country Code)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="8801712345678"
                  value={phoneToPair}
                  onChange={(e) => setPhoneToPair(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleGeneratePairingCode}
                  disabled={isGeneratingPair}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isGeneratingPair ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Get Code
                    </>
                  )}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Do not add '+' or spaces. Example: 8801711223344
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> How to pair on your phone:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                <li>Open WhatsApp on your phone & go to <strong>Linked Devices</strong>.</li>
                <li>Tap <strong>Link a device</strong>.</li>
                <li>Tap <strong>"Link with phone number instead"</strong> at the bottom.</li>
                <li>Enter the 8-character pairing code shown here!</li>
              </ol>
            </div>
          </div>

          {/* Pairing Code Display Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-dashed border-slate-800 rounded-2xl min-h-[190px]">
            {pairingCode ? (
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                  Your 8-Character Pairing Code
                </span>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-white bg-slate-900 px-6 py-3 rounded-xl border border-emerald-500/40 shadow-inner">
                    {pairingCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingCode);
                      showToast('Pairing code copied!', 'success');
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    title="Copy code"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Enter this code in your WhatsApp Linked Devices prompt within 2 minutes.
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <Key className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-medium">No active pairing code requested</p>
                <p className="text-xs text-slate-600 max-w-xs">
                  Enter your number on the left and click "Get Code" to generate your link code.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Smart Notification Templates */}
      <form onSubmit={handleSaveTemplates} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">2. Automated Message Templates</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize what message your customers receive when they buy or complete an order.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSavingTemplates}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            {isSavingTemplates ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Templates
          </button>
        </div>

        <div className="space-y-5">
          {/* Payment Success */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Success Message (WhatsApp + SMS)
            </label>
            <textarea
              rows={3}
              value={templatePaymentSuccess}
              onChange={(e) => setTemplatePaymentSuccess(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {['{customer_name}', '{amount}', '{trx_id}', '{invoice_url}'].map((tag) => (
                <span
                  key={tag}
                  onClick={() => setTemplatePaymentSuccess((prev) => prev + ' ' + tag)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                >
                  +{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Order Created */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Order Created Message (Advance / COD)
            </label>
            <textarea
              rows={3}
              value={templateOrderCreated}
              onChange={(e) => setTemplateOrderCreated(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {['{customer_name}', '{amount}', '{tracking_url}'].map((tag) => (
                <span
                  key={tag}
                  onClick={() => setTemplateOrderCreated((prev) => prev + ' ' + tag)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                >
                  +{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Fallback Options */}
        <div className="border-t border-slate-800/80 pt-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                Automatic Mobile SMS Fallback
              </span>
              <p className="text-xs text-slate-400">
                If customer has no WhatsApp account, automatically route SMS via your connected Android SMS Gateway device.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fallbackToSms}
                onChange={(e) => setFallbackToSms(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
