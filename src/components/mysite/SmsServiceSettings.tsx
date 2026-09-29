import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle2, ShieldCheck, Zap, Info, RefreshCw, Smartphone, Key, Globe, Send, AlertTriangle, Copy, Check, Radio, Truck, Download, Mail, Lock, Code, Eye, ExternalLink } from 'lucide-react';
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

  // 4 Primary Channels Switches
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [localSmsEnabled, setLocalSmsEnabled] = useState<boolean>(true);
  const [internationalSmsEnabled, setInternationalSmsEnabled] = useState<boolean>(false);

  // SMS Sender Mode: Phone SIM vs Pure Cloud API
  const [smsSenderMode, setSmsSenderMode] = useState<'device_sim' | 'cloud_api'>('device_sim');
  const [customSmsApiUrl, setCustomSmsApiUrl] = useState<string>('');
  const [customSmsApiKey, setCustomSmsApiKey] = useState<string>('');

  // Smart Routing Hierarchy (Cost-Saving Flow)
  const [routingStrategy, setRoutingStrategy] = useState<'smart_fallback' | 'send_all'>('smart_fallback');
  const [fallbackToEmail, setFallbackToEmail] = useState<boolean>(true);

  // Digital Products & Courier Automation
  const [digitalProductSmsEnabled, setDigitalProductSmsEnabled] = useState<boolean>(true);
  const [autoCourierAdvance, setAutoCourierAdvance] = useState<boolean>(true);
  const [autoCourierCod, setAutoCourierCod] = useState<boolean>(false);

  // Real Devices & SIM Selection (Mode A)
  const [realDevices, setRealDevices] = useState<any[]>([]);
  const [paymentNumbers, setPaymentNumbers] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedSimNumber, setSelectedSimNumber] = useState<string>('');

  // Email Mailbox Verification (Smart Lock Check)
  const [hasBrandMailbox, setHasBrandMailbox] = useState<boolean>(false);
  const [brandMailboxAddress, setBrandMailboxAddress] = useState<string>('');

  // Template States
  const [templatePaymentSuccess, setTemplatePaymentSuccess] = useState<string>(
    'ধন্যবাদ {customer_name}! আপনার {amount} টাকার অগ্রিম পেমেন্ট সফল হয়েছে (বাকি {due_amount} টাকা সিওডি)। কুরিয়ার ট্র্যাকিং: {tracking_url}'
  );
  const [templateOrderCreated, setTemplateOrderCreated] = useState<string>(
    'প্রিয় {customer_name}, আপনার {amount} টাকার ক্যাশ অন ডেলিভারি অর্ডারটি কনফার্ম হয়েছে। ট্র্যাকিং: {tracking_url}'
  );
  const [templateDigitalDelivery, setTemplateDigitalDelivery] = useState<string>(
    'ধন্যবাদ {customer_name}! আপনার ৳{amount} টাকার পেমেন্ট সফল হয়েছে। আপনার ফাইল ডাউনলোড লিংক: {download_url}'
  );

  // HTML Email Template State
  const [emailSubject, setEmailSubject] = useState<string>('পেমেন্ট রিসিট ও অর্ডার কনফার্মেশন - MecoPay');
  const [emailHtmlBody, setEmailHtmlBody] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .box { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; padding: 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px; }
    .amount-box { background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; }
    .amount { font-size: 32px; font-weight: bold; color: #059669; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <h2 style="margin:0;">পেমেন্ট কনফার্মেশন</h2>
      <p style="margin:6px 0 0; font-size:13px; opacity:0.8;">অর্ডার রিসিট ও ট্র্যাকিং বিবরণী</p>
    </div>
    <div class="content">
      <p>প্রিয় <strong>{customer_name}</strong>,</p>
      <p>আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। আপনার অর্ডারের যাবতীয় তথ্য নিচে দেওয়া হলো:</p>
      <div class="amount-box">
        <div style="font-size:13px; color:#64748b; text-transform:uppercase;">পরিশোধিত অর্থ</div>
        <div class="amount">৳{amount}</div>
        <div style="font-size:12px; color:#475569; margin-top:4px;">TrxID: {trx_id}</div>
      </div>
      <p style="font-size:14px; line-height:1.6;">বাকি সিওডি বকেয়া: <strong>৳{due_amount}</strong><br>কুরিয়ার ট্র্যাকিং লিংক: <a href="{tracking_url}">{tracking_url}</a></p>
      <center><a href="{download_url}" class="btn">ডেলিভারি / ইনভয়েস লিংক</a></center>
    </div>
    <div class="footer">
      MecoPay Secure Multi-Channel Automated Gateway
    </div>
  </div>
</body>
</html>`);

  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(String(brands[0].id));
    }
  }, [brands]);

  // Load Real Device Status & Payment Numbers
  useEffect(() => {
    if (!user?.id) return;
    const fetchRealData = async () => {
      try {
        const { data: devData } = await supabase.from('device_status').select('*').eq('user_id', user.id);
        if (devData) setRealDevices(devData);

        const { data: numData } = await supabase.from('payment_numbers').select('*').eq('user_id', user.id);
        if (numData) setPaymentNumbers(numData);
      } catch (e) {
        console.warn('Error loading devices & numbers:', e);
      }
    };
    fetchRealData();
  }, [user]);

  // Check Brand Mailbox & Load Settings
  useEffect(() => {
    if (!selectedBrandId) return;
    loadBrandSettings();
    checkBrandMailbox();
  }, [selectedBrandId]);

  const checkBrandMailbox = async () => {
    try {
      const { data } = await supabase
        .from('brand_mailboxes')
        .select('*')
        .eq('brand_id', selectedBrandId)
        .maybeSingle();

      if (data && (data.email_address || data.forward_to_email)) {
        setHasBrandMailbox(true);
        setBrandMailboxAddress(data.email_address || data.forward_to_email);
      } else {
        setHasBrandMailbox(false);
        setBrandMailboxAddress('');
      }
    } catch (_e) {
      setHasBrandMailbox(false);
    }
  };

  const loadBrandSettings = async () => {
    try {
      const { data: gw } = await supabase
        .from('whatsapp_gateway_settings')
        .select('*')
        .eq('brand_id', selectedBrandId)
        .maybeSingle();

      if (gw) {
        setWhatsappEnabled(gw.whatsapp_enabled !== false);
        setEmailEnabled(gw.email_notification_enabled !== false);
        setLocalSmsEnabled(gw.fallback_to_sms !== false);
        setInternationalSmsEnabled(Boolean(gw.international_sms_enabled));
        setSmsSenderMode(gw.sms_sender_mode || 'device_sim');
        setCustomSmsApiUrl(gw.custom_sms_api_url || '');
        setCustomSmsApiKey(gw.custom_sms_api_key || '');
        setRoutingStrategy(gw.routing_strategy || 'smart_fallback');
        setFallbackToEmail(gw.fallback_to_email !== false);
        setAutoCourierAdvance(gw.auto_courier_advance !== false);
        setAutoCourierCod(Boolean(gw.auto_courier_cod));
        setDigitalProductSmsEnabled(gw.digital_product_sms_enabled !== false);
        setSelectedDeviceId(gw.selected_device_id || '');
        setSelectedSimNumber(gw.selected_sim_number || '');
        setGatewayStatus({ connected: gw.is_connected, phone: gw.phone_number });
        if (gw.phone_number) setPhoneToPair(gw.phone_number);
        if (gw.pairing_code && !gw.is_connected) setPairingCode(gw.pairing_code);
      }

      // Templates
      const { data: tpls } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('brand_id', selectedBrandId);

      if (tpls && tpls.length > 0) {
        const payTpl = tpls.find((t: any) => t.event_type === 'payment_success');
        const ordTpl = tpls.find((t: any) => t.event_type === 'order_created');
        const digTpl = tpls.find((t: any) => t.event_type === 'digital_delivery');
        if (payTpl) setTemplatePaymentSuccess(payTpl.template_body);
        if (ordTpl) setTemplateOrderCreated(ordTpl.template_body);
        if (digTpl) setTemplateDigitalDelivery(digTpl.template_body);

        const emailTpl = tpls.find((t: any) => t.event_type === 'email_invoice');
        if (emailTpl) {
          if (emailTpl.email_subject) setEmailSubject(emailTpl.email_subject);
          if (emailTpl.email_html_body) setEmailHtmlBody(emailTpl.email_html_body);
        }
      }
    } catch (e) {
      console.warn('Error loading brand settings:', e);
    }
  };

  // Pure Edge Function Handshake for Pairing Code
  const handleGeneratePairingCode = async () => {
    const cleanPhone = phoneToPair.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid WhatsApp phone number with country code (e.g. 8801973891388)', 'error');
      return;
    }
    if (!selectedBrandId) {
      showToast('Please select an active brand first', 'error');
      return;
    }

    setIsGeneratingPair(true);
    setPairingCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('headless-orchestrator', {
        body: {
          action: 'pair_phone',
          brand_id: selectedBrandId,
          phone: cleanPhone
        }
      });

      if (error) throw new Error(error.message || 'Edge function error');

      if (data?.pairing_code) {
        setPairingCode(data.pairing_code);
        showToast('Pairing code generated! Check your WhatsApp.', 'success');
      } else if (data?.connected) {
        setGatewayStatus({ connected: true, phone: cleanPhone });
        showToast('WhatsApp is already connected for this brand!', 'success');
      } else {
        throw new Error(data?.error || 'Unable to generate pairing code');
      }
    } catch (err: any) {
      showToast('Pairing Error: ' + err.message, 'error');
    } finally {
      setIsGeneratingPair(false);
    }
  };

  // Save All Settings
  const handleSaveAllSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedBrandId) {
      showToast('Please select a brand', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const { error: gwErr } = await supabase
        .from('whatsapp_gateway_settings')
        .upsert({
          brand_id: selectedBrandId,
          user_id: user?.id,
          whatsapp_enabled: whatsappEnabled,
          email_notification_enabled: emailEnabled,
          fallback_to_email: fallbackToEmail,
          fallback_to_sms: localSmsEnabled,
          international_sms_enabled: internationalSmsEnabled,
          sms_sender_mode: smsSenderMode,
          custom_sms_api_url: customSmsApiUrl || null,
          custom_sms_api_key: customSmsApiKey || null,
          routing_strategy: routingStrategy,
          auto_courier_advance: autoCourierAdvance,
          auto_courier_cod: autoCourierCod,
          digital_product_sms_enabled: digitalProductSmsEnabled,
          selected_device_id: selectedDeviceId || null,
          selected_sim_number: selectedSimNumber || null,
          phone_number: phoneToPair || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id' });

      if (gwErr) throw gwErr;

      // Save Templates
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
        },
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'digital_delivery',
          channel: 'multichannel',
          template_body: templateDigitalDelivery,
          updated_at: new Date().toISOString()
        },
        {
          brand_id: selectedBrandId,
          user_id: user?.id,
          event_type: 'email_invoice',
          channel: 'email',
          email_subject: emailSubject,
          email_html_body: emailHtmlBody,
          template_body: 'HTML Email Invoice Template',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'brand_id,event_type,channel' });

      showToast('All WhatsApp, Email & SMS Gateway Settings Saved!', 'success');
    } catch (err: any) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activeConnectedDevices = realDevices.filter(d => d.connected === true);

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Multi-Channel Receipt Hub</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Automate customer delivery receipts via WhatsApp, Custom Brand Email, and High-Speed SMS.
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
        {/* SECTION 1: 4 CHANNELS SELECTION */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                1. Delivery Channels Control
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Turn On/Off individual channels according to your business model.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Channel 1: WhatsApp */}
            <div className={`p-4 rounded-2xl border transition-all ${
              whatsappEnabled ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">1. WhatsApp</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero-cost instant message from linked business phone.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold ${gatewayStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {gatewayStatus.connected ? 'Connected' : 'Unlinked'}
                </span>
              </div>
            </div>

            {/* Channel 2: Brand Email Invoice */}
            <div className={`p-4 rounded-2xl border transition-all ${
              emailEnabled && hasBrandMailbox ? 'bg-blue-950/20 border-blue-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Mail className="w-4 h-4" />
                </span>
                {hasBrandMailbox ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                ) : (
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white">2. Brand Email</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Professional HTML invoice & tracking sent to customer inbox.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Mailbox:</span>
                <span className={`font-semibold truncate max-w-[120px] ${hasBrandMailbox ? 'text-blue-400' : 'text-amber-400'}`}>
                  {hasBrandMailbox ? (brandMailboxAddress || 'Ready') : 'Setup in MySite'}
                </span>
              </div>
            </div>

            {/* Channel 3: Local SIM SMS */}
            <div className={`p-4 rounded-2xl border transition-all ${
              localSmsEnabled ? 'bg-purple-950/20 border-purple-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSmsEnabled}
                    onChange={(e) => setLocalSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">3. Domestic SMS</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Via Connected Android Phone SIM or Central Cloud SMS API.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Mode:</span>
                <span className="font-semibold text-purple-300">
                  {smsSenderMode === 'device_sim' ? 'Android SIM' : 'Cloud API'}
                </span>
              </div>
            </div>

            {/* Channel 4: International SMS */}
            <div className={`p-4 rounded-2xl border transition-all ${
              internationalSmsEnabled ? 'bg-cyan-950/20 border-cyan-500/40 shadow-lg' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Globe className="w-4 h-4" />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={internationalSmsEnabled}
                    onChange={(e) => setInternationalSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">4. Global SMS</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Routes foreign numbers (+1, +44) via Twilio pipeline.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-cyan-400">Twilio Global</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SMS SENDER MODE SWITCHER: ANDROID SIM VS CLOUD API */}
          {/* ======================================================== */}
          {localSmsEnabled && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    SMS Sender Engine (Choose according to your business setup)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select whether SMS should dispatch using a shop's Android Phone SIM or direct Cloud API without any phone.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Android SIM */}
                <label className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  smsSenderMode === 'device_sim' ? 'bg-purple-950/30 border-purple-500/60 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="smsSenderMode"
                      value="device_sim"
                      checked={smsSenderMode === 'device_sim'}
                      onChange={() => setSmsSenderMode('device_sim')}
                    />
                    <span className="text-xs font-bold text-white">Mode A: Shop Android Phone SIM (Free SMS)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    Uses the local SIM card in your shop's Android Phone. Zero extra API cost.
                  </p>
                </label>

                {/* Option B: Pure Cloud API */}
                <label className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  smsSenderMode === 'cloud_api' ? 'bg-emerald-950/30 border-emerald-500/60 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="smsSenderMode"
                      value="cloud_api"
                      checked={smsSenderMode === 'cloud_api'}
                      onChange={() => setSmsSenderMode('cloud_api')}
                    />
                    <span className="text-xs font-bold text-white">Mode B: Pure Cloud SMS API (No Phone Needed)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    For pure Merchant/Corporate clients. Dispatches via Central MecoPay Gateway or your own SMS API.
                  </p>
                </label>
              </div>

              {/* Dynamic Details based on selected mode */}
              {smsSenderMode === 'device_sim' ? (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Select Outgoing SIM Number:</span>
                    <select
                      value={selectedSimNumber}
                      onChange={(e) => {
                        const num = e.target.value;
                        setSelectedSimNumber(num);
                        const matched = paymentNumbers.find(p => p.number === num);
                        if (matched) setSelectedDeviceId(matched.device_name || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select phone number from payment_numbers</option>
                      {paymentNumbers.map(p => (
                        <option key={p.id} value={p.number}>
                          {p.provider ? p.provider.toUpperCase() : 'SIM'}: {p.number} (Device: {p.device_name || 'Not bound'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Target Android Device ID:</span>
                    <input
                      type="text"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      placeholder="e.g. tzy25"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Custom SMS API Endpoint (Optional):</span>
                    <input
                      type="text"
                      value={customSmsApiUrl}
                      onChange={(e) => setCustomSmsApiUrl(e.target.value)}
                      placeholder="Default: Central MecoPay SMS Gateway"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">SMS API Secret / Token (Optional):</span>
                    <input
                      type="password"
                      value={customSmsApiKey}
                      onChange={(e) => setCustomSmsApiKey(e.target.value)}
                      placeholder="Your SMS Gateway Key"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Delivery Routing with Email Option */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Smart Cost-Saver Routing Chain
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
                  <span className="text-xs font-bold block text-white">Smart Cascade Fallback (Cost Saver - 95% Savings)</span>
                  <span className="text-[11px] text-slate-400">
                    Try <strong>WhatsApp</strong> first (0 cost). If customer has no WhatsApp ➔ Send <strong>Brand Email</strong>. If no email ➔ Send <strong>SMS</strong>.
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
                  <span className="text-xs font-bold block text-white">Broadcast to All Channels</span>
                  <span className="text-[11px] text-slate-400">
                    Send simultaneously to WhatsApp, Email, and SMS for maximum visibility.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: DIGITAL PRODUCTS & COURIER NOTIFICATIONS */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                2. Automated Notification Rules (Courier & Digital)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Control which product types trigger automated receipts with courier tracking or download links.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Auto-Notification for Advance Pay */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Advance Pay Receipt
                </span>
                <p className="text-xs text-slate-400">
                  Sends 1 single receipt message with courier tracking code when advance payment is received.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={autoCourierAdvance}
                  onChange={(e) => setAutoCourierAdvance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Auto-Notification for Full COD */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  100% COD Receipt
                </span>
                <p className="text-xs text-slate-400">
                  Sends confirmation message with tracking when a 100% COD order is booked into courier.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={autoCourierCod}
                  onChange={(e) => setAutoCourierCod(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Auto-Notification for Digital Products */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-cyan-400" />
                  Digital Instant Delivery
                </span>
                <p className="text-xs text-slate-400">
                  Sends instant receipt with file download or access link upon 100% full payment.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={digitalProductSmsEnabled}
                  onChange={(e) => setDigitalProductSmsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: WHATSAPP 8-DIGIT PAIRING CODE */}
        {/* ======================================================== */}
        {whatsappEnabled && (
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-white">3. Link WhatsApp Phone (Pairing Code)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your business phone number to generate an 8-character pairing code via Edge Function.
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
                      placeholder="8801973891388"
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
                    No '+' or spaces. Example: 8801973891388
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
        {/* SECTION 4: PROFESSIONAL HTML EMAIL TEMPLATE EDITOR */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                4. Professional HTML Email Invoice Template
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sent to customers when email notification is triggered. Supports full HTML branding.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {showEmailPreview ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showEmailPreview ? 'View HTML Code' : 'Preview Email'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {showEmailPreview ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-4">
                <span className="text-[11px] text-slate-500 block mb-2 font-mono">Live Rendered HTML Preview:</span>
                <div
                  className="bg-white rounded-lg p-2 text-slate-900 overflow-auto max-h-[380px]"
                  dangerouslySetInnerHTML={{
                    __html: emailHtmlBody
                      .replace(/{customer_name}/g, 'করিম উল্লাহ')
                      .replace(/{amount}/g, '১,৫০০')
                      .replace(/{trx_id}/g, 'TXN998877')
                      .replace(/{due_amount}/g, '১,০০০')
                      .replace(/{tracking_url}/g, 'https://steadfast.com.bd/t/ST-998877')
                      .replace(/{download_url}/g, 'https://mecopay.space/pay/invoice-123')
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Responsive HTML Template Code
                </label>
                <textarea
                  rows={8}
                  value={emailHtmlBody}
                  onChange={(e) => setEmailHtmlBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {['{customer_name}', '{amount}', '{due_amount}', '{trx_id}', '{tracking_url}', '{download_url}'].map((tag) => (
                <span
                  key={tag}
                  onClick={() => setEmailHtmlBody((prev) => prev + ' ' + tag)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                >
                  +{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 5: AUTOMATED MESSAGE TEMPLATES */}
        {/* ======================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">5. Custom WhatsApp & SMS Templates</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize the message body sent to customers via WhatsApp or SMS.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAllSettings()}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Templates & Settings
            </button>
          </div>

          <div className="space-y-5">
            {/* Template 1: Advance Pay */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Advance Payment & Courier Tracking Message
              </label>
              <textarea
                rows={3}
                value={templatePaymentSuccess}
                onChange={(e) => setTemplatePaymentSuccess(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{customer_name}', '{amount}', '{due_amount}', '{tracking_url}'].map((tag) => (
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

            {/* Template 2: Full COD */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full COD Order & Courier Tracking Message
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
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    +{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Template 3: Digital Product Delivery */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Digital Product Instant Delivery Message
              </label>
              <textarea
                rows={3}
                value={templateDigitalDelivery}
                onChange={(e) => setTemplateDigitalDelivery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{customer_name}', '{amount}', '{download_url}'].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setTemplateDigitalDelivery((prev) => prev + ' ' + tag)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                  >
                    +{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAllSettings()}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Templates & Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
