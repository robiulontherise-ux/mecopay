import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle2, ShieldCheck, Zap, Info, RefreshCw, Smartphone, Key, Globe, Send, AlertTriangle, Copy, Check, Radio } from 'lucide-react';
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

  // 3 Distinct Gateway Switches
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [localSmsEnabled, setLocalSmsEnabled] = useState<boolean>(true);
  const [internationalSmsEnabled, setInternationalSmsEnabled] = useState<boolean>(false);
  const [routingStrategy, setRoutingStrategy] = useState<'smart_fallback' | 'send_all'>('smart_fallback');

  // Connected Android SIM Devices (from user's device_status or payment_numbers)
  const [clientDevices, setClientDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Template States
  const [templatePaymentSuccess, setTemplatePaymentSuccess] = useState<string>(
    'ধন্যবাদ {customer_name}! আপনার {amount} টাকার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। TrxID: {trx_id}।'
  );
  const [templateOrderCreated, setTemplateOrderCreated] = useState<string>(
    'প্রিয় {customer_name}, আপনার {amount} টাকার অর্ডারটি কনফার্ম হয়েছে।'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(String(brands[0].id));
    }
  }, [brands]);

  // Load client's connected Android SIM devices
  useEffect(() => {
    if (!user?.id) return;
    const fetchDevices = async () => {
      try {
        const { data } = await supabase
          .from('payment_numbers')
          .select('*')
          .eq('user_id', user.id);
        if (data) {
          setClientDevices(data);
          if (data.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(data[0].device_id || data[0].device_name || '');
          }
        }
      } catch (e) {
        console.warn('Could not load client devices:', e);
      }
    };
    fetchDevices();
  }, [user]);

  // Load brand settings whenever brand changes
  useEffect(() => {
    if (!selectedBrandId) return;
    loadBrandSettings();
  }, [selectedBrandId]);

  const loadBrandSettings = async () => {
    try {
      // 1. Fetch WhatsApp & SMS Gateway settings
      const { data: gw } = await supabase
        .from('whatsapp_gateway_settings')
        .select('*')
        .eq('brand_id', selectedBrandId)
        .maybeSingle();

      if (gw) {
        setWhatsappEnabled(gw.whatsapp_enabled !== false);
        setLocalSmsEnabled(gw.fallback_to_sms !== false);
        setInternationalSmsEnabled(Boolean(gw.international_sms_enabled));
        setRoutingStrategy(gw.routing_strategy || 'smart_fallback');
        setGatewayStatus({ connected: gw.is_connected, phone: gw.phone_number });
        if (gw.phone_number) setPhoneToPair(gw.phone_number);
        if (gw.pairing_code && !gw.is_connected) setPairingCode(gw.pairing_code);
      }

      // 2. Fetch Templates
      const { data: tpls } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('brand_id', selectedBrandId);

      if (tpls && tpls.length > 0) {
        const payTpl = tpls.find((t: any) => t.event_type === 'payment_success');
        const ordTpl = tpls.find((t: any) => t.event_type === 'order_created');
        if (payTpl) setTemplatePaymentSuccess(payTpl.template_body);
        if (ordTpl) setTemplateOrderCreated(ordTpl.template_body);
      }
    } catch (e) {
      console.warn('Error loading brand settings:', e);
    }
  };

  const handleGeneratePairingCode = async () => {
    const cleanPhone = phoneToPair.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid WhatsApp number with country code (e.g. 88017XXXXXXXX)', 'error');
      return;
    }
    if (!selectedBrandId) {
      showToast('Please select an active brand first', 'error');
      return;
    }

    setIsGeneratingPair(true);
    setPairingCode(null);

    try {
      // Try calling Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('headless-orchestrator', {
        body: {
          action: 'pair_phone',
          brand_id: selectedBrandId,
          phone: cleanPhone
        }
      });

      if (!error && data?.pairing_code) {
        setPairingCode(data.pairing_code);
        showToast('Pairing code generated! Check your WhatsApp.', 'success');
      } else if (data?.connected) {
        setGatewayStatus({ connected: true, phone: cleanPhone });
        showToast('WhatsApp is already connected for this brand!', 'success');
      } else {
        // Fallback: direct server call if Edge function is not deployed yet
        try {
          const directRes = await fetch('http://129.225.87.244:3333/pair-phone', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-gateway-secret': 'meco_sec_live_99x77a88b'
            },
            body: JSON.stringify({ brand_id: selectedBrandId, phone: cleanPhone })
          });
          const directData = await directRes.json();
          if (directData.pairing_code) {
            setPairingCode(directData.pairing_code);
            showToast('Pairing code received directly from server!', 'success');
          } else {
            throw new Error(directData.error || 'Server error');
          }
        } catch (directErr: any) {
          showToast(data?.error || error?.message || directErr.message || 'Failed to generate code', 'error');
        }
      }
    } catch (err: any) {
      showToast('Pairing error: ' + err.message, 'error');
    } finally {
      setIsGeneratingPair(false);
    }
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) {
      showToast('Please select a brand', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Save Gateway Toggles in whatsapp_gateway_settings
      const { error: gwErr } = await supabase
        .from('whatsapp_gateway_settings')
        .upsert({
          brand_id: selectedBrandId,
          user_id: user?.id,
          whatsapp_enabled: whatsappEnabled,
          fallback_to_sms: localSmsEnabled,
          international_sms_enabled: internationalSmsEnabled,
          routing_strategy: routingStrategy,
          phone_number: phoneToPair || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id' });

      if (gwErr) throw gwErr;

      // 2. Save Notification Templates
      await supabase.from('notification_templates').upsert([
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'payment_success',
          channel: 'multichannel',
          template_body: templatePaymentSuccess,
          updated_at: new Date().toISOString()
        },
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'order_created',
          channel: 'multichannel',
          template_body: templateOrderCreated,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'brand_id,event_type,channel' });

      showToast('All Gateway Channels & Notification Settings Saved!', 'success');
    } catch (err: any) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Smart Multi-Channel Notification Hub</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Automated customer receipts via WhatsApp, Local Mobile SIM SMS, and International Twilio SMS.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brand:</label>
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {brands.length === 0 ? (
              <option value="">No brand created</option>
            ) : (
              brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.website_url || 'Active'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        {/* ======================================================== */}
        {/* SECTION 1: 3 GATEWAY CHANNELS SELECTION */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                1. Notification Channels Control
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Turn On/Off the channels you want to use for customer order & payment alerts.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel 1: WhatsApp */}
            <div className={`p-5 rounded-2xl border transition-all ${
              whatsappEnabled ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">Channel 1: WhatsApp Gateway</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero per-message cost. Sends direct WhatsApp receipt from your linked business phone.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold ${gatewayStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {gatewayStatus.connected ? 'Connected' : 'Needs Pairing'}
                </span>
              </div>
            </div>

            {/* Channel 2: Local SIM SMS */}
            <div className={`p-5 rounded-2xl border transition-all ${
              localSmsEnabled ? 'bg-purple-950/20 border-purple-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Smartphone className="w-5 h-5" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSmsEnabled}
                    onChange={(e) => setLocalSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">Channel 2: Local Mobile SIM SMS</h4>
              <p className="text-xs text-slate-400 mt-1">
                For domestic customers (Bangladesh). Sends real SMS using your connected Android Phone's SIM card.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Android App:</span>
                <span className="font-semibold text-purple-300">
                  {clientDevices.length > 0 ? `${clientDevices.length} Device Active` : 'App Connected'}
                </span>
              </div>
            </div>

            {/* Channel 3: International SMS (Twilio) */}
            <div className={`p-5 rounded-2xl border transition-all ${
              internationalSmsEnabled ? 'bg-cyan-950/20 border-cyan-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={internationalSmsEnabled}
                    onChange={(e) => setInternationalSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">Channel 3: International SMS</h4>
              <p className="text-xs text-slate-400 mt-1">
                For foreign customer numbers (+1, +44, etc.). Routed via central Twilio global SMS pipeline.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-cyan-400">Twilio Global</span>
              </div>
            </div>
          </div>

          {/* Smart Delivery Routing Option */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mt-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Routing Behavior (When payment completes)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                routingStrategy === 'smart_fallback' ? 'bg-emerald-950/20 border-emerald-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="routingStrategy"
                  value="smart_fallback"
                  checked={routingStrategy === 'smart_fallback'}
                  onChange={() => setRoutingStrategy('smart_fallback')}
                  className="mt-1"
                />
                <div>
                  <span className="text-xs font-bold block text-white">Smart Fallback (Cost Saver - Recommended)</span>
                  <span className="text-[11px] text-slate-400">
                    Try WhatsApp first. If customer has no WhatsApp, automatically route to Local SIM SMS (or Twilio for foreign numbers).
                  </span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                routingStrategy === 'send_all' ? 'bg-purple-950/20 border-purple-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="radio"
                  name="routingStrategy"
                  value="send_all"
                  checked={routingStrategy === 'send_all'}
                  onChange={() => setRoutingStrategy('send_all')}
                  className="mt-1"
                />
                <div>
                  <span className="text-xs font-bold block text-white">Broadcast to All Enabled</span>
                  <span className="text-[11px] text-slate-400">
                    Send both WhatsApp AND SMS to customer simultaneously regardless of WhatsApp presence.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: WHATSAPP 8-DIGIT PAIRING CODE */}
        {/* ======================================================== */}
        {whatsappEnabled && (
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-white">2. Link WhatsApp Phone (Pairing Code)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your business phone number to generate an 8-character pairing code.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Multi-Tenant Headless Session
              </span>
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
                    No '+' or spaces. Example: 8801711223344
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Pairing Steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                    <li>Open WhatsApp on phone {'>'} <strong>Linked Devices</strong>.</li>
                    <li>Tap <strong>Link a device</strong>.</li>
                    <li>Tap <strong>"Link with phone number instead"</strong> at the bottom.</li>
                    <li>Enter the 8-character code shown on the right!</li>
                  </ol>
                </div>
              </div>

              {/* Code Box */}
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
                        type="button"
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
                      Valid for 2 minutes. Enter in WhatsApp to pair.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 space-y-2">
                    <Key className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-sm font-medium">No code generated yet</p>
                    <p className="text-xs text-slate-600 max-w-xs">
                      Enter your phone number on the left and click "Get Code".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: AUTOMATED MESSAGE TEMPLATES */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">3. Custom Message Templates</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize the message body sent to customers via WhatsApp or SMS.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Payment Success Message
              </label>
              <textarea
                rows={3}
                value={templatePaymentSuccess}
                onChange={(e) => setTemplatePaymentSuccess(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{customer_name}', '{amount}', '{trx_id}'].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setTemplatePaymentSuccess((prev) => prev + ' ' + tag)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    +{tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Order Created Message (COD / Advance)
              </label>
              <textarea
                rows={3}
                value={templateOrderCreated}
                onChange={(e) => setTemplateOrderCreated(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{customer_name}', '{amount}'].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setTemplateOrderCreated((prev) => prev + ' ' + tag)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    +{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
