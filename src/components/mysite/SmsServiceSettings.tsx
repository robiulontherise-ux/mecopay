import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle2, ShieldCheck, Zap, Info, RefreshCw, Smartphone, Key, Globe, Send, AlertTriangle, Copy, Check, Radio, Truck, Download, Mail, Lock, Code, Eye, ExternalLink, PackageCheck } from 'lucide-react';
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
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [localSmsEnabled, setLocalSmsEnabled] = useState<boolean>(false);
  const [internationalSmsEnabled, setInternationalSmsEnabled] = useState<boolean>(false);
  const [internationalProvider, setInternationalProvider] = useState<'twilio' | 'infobip' | 'vonage' | 'messagebird' | 'custom'>('twilio');

  // SMS Sender Mode: Phone SIM vs Pure Cloud API
  const [smsSenderMode, setSmsSenderMode] = useState<'device_sim' | 'cloud_api'>('device_sim');
  const [customSmsApiUrl, setCustomSmsApiUrl] = useState<string>('');
  const [customSmsApiKey, setCustomSmsApiKey] = useState<string>('');
  const [customSmsApiSecret, setCustomSmsApiSecret] = useState<string>('');

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

  // Supabase Permission Fix State
  const [permissionDeniedDetected, setPermissionDeniedDetected] = useState<boolean>(false);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

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

  const SUPABASE_PERMISSION_SQL = `-- Run this in Supabase SQL Editor:
GRANT ALL ON TABLE public.whatsapp_gateway_settings TO anon, authenticated, service_role, postgres;
GRANT ALL ON TABLE public.notification_templates TO anon, authenticated, service_role, postgres;

ALTER TABLE public.whatsapp_gateway_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_gateway_settings_all" ON public.whatsapp_gateway_settings;
CREATE POLICY "whatsapp_gateway_settings_all" ON public.whatsapp_gateway_settings FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_templates_all" ON public.notification_templates;
CREATE POLICY "notification_templates_all" ON public.notification_templates FOR ALL TO public USING (true) WITH CHECK (true);`;

  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(String(brands[0].id));
    }
  }, [brands]);

  // Helper to normalize phone numbers for accurate matching
  const normalizePhone = (str: string) => (str || '').replace(/[^0-9]/g, '');

  // Helper to accurately extract device name from payment_numbers record or its JSON meta
  const getDeviceFromRecord = (p: any): string => {
    if (!p) return '';
    if (p.device_name && String(p.device_name).trim() && String(p.device_name) !== 'null') {
      return String(p.device_name).trim();
    }
    if (p.device_id && String(p.device_id).trim() && String(p.device_id) !== 'null') {
      return String(p.device_id).trim();
    }
    if (p.device_name_2 && String(p.device_name_2).trim() && String(p.device_name_2) !== 'null') {
      return String(p.device_name_2).trim();
    }

    // Check additional_numbers JSON array/object
    if (Array.isArray(p.additional_numbers)) {
      for (const item of p.additional_numbers) {
        if (item?.device_name && String(item.device_name).trim()) return String(item.device_name).trim();
        if (item?.device_id && String(item.device_id).trim()) return String(item.device_id).trim();
      }
    } else if (typeof p.additional_numbers === 'object' && p.additional_numbers !== null) {
      if (p.additional_numbers.device_name) return String(p.additional_numbers.device_name).trim();
      if (p.additional_numbers.device_id) return String(p.additional_numbers.device_id).trim();
    }
    return '';
  };

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

  // Check Brand Mailbox & Load Settings + Auto-poll WhatsApp status from Database Table (Zero edge-invocation cost)
  useEffect(() => {
    if (!selectedBrandId) return;
    loadBrandSettings();
    checkBrandMailbox();

    // Auto-poll WhatsApp connection status every 4 seconds purely from Database Table
    const interval = setInterval(async () => {
      try {
        let query = supabase
          .from('whatsapp_gateway_settings')
          .select('is_connected, phone_number, pairing_code, brand_id');

        if (selectedBrandId) {
          query = query.or(`brand_id.eq.${selectedBrandId},user_id.eq.${user?.id}`);
        } else if (user?.id) {
          query = query.eq('user_id', user.id);
        }

        const { data: rows } = await query;
        if (rows && rows.length > 0) {
          const matched = rows.find((r: any) => r.brand_id === selectedBrandId) || rows[0];
          const isConn = Boolean(matched.is_connected);
          setGatewayStatus({ connected: isConn, phone: matched.phone_number || phoneToPair });
          if (isConn) {
            setPairingCode(null);
          } else if (matched.pairing_code && !pairingCode) {
            setPairingCode(matched.pairing_code);
          }
        }
      } catch (_pollErr) {}
    }, 4000);

    return () => clearInterval(interval);
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
      let query = supabase
        .from('whatsapp_gateway_settings')
        .select('*');

      if (selectedBrandId) {
        query = query.or(`brand_id.eq.${selectedBrandId},user_id.eq.${user?.id}`);
      } else if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data: rows, error: gwSelectErr } = await query;
      if (gwSelectErr && (gwSelectErr.code === '42501' || gwSelectErr.message?.includes('permission denied'))) {
        setPermissionDeniedDetected(true);
      }
      const gw = (rows && rows.length > 0) ? (rows.find((r: any) => r.brand_id === selectedBrandId) || rows[0]) : null;

      if (gw) {
        setWhatsappEnabled(gw.whatsapp_enabled !== false);
        setEmailEnabled(false); // Locked - coming soon
        setLocalSmsEnabled(Boolean(gw.fallback_to_sms));
        setInternationalSmsEnabled(Boolean(gw.international_sms_enabled));
        setInternationalProvider(gw.international_provider || 'twilio');
        setSmsSenderMode(gw.sms_sender_mode || 'device_sim');
        setCustomSmsApiUrl(gw.custom_sms_api_url || gw.sms_api_endpoint || '');
        setCustomSmsApiKey(gw.custom_sms_api_key || gw.sms_api_key || '');
        setCustomSmsApiSecret(gw.sms_api_secret || '');
        const strat = gw.routing_strategy || (gw.send_all_channels ? 'send_all' : 'smart_fallback');
        setRoutingStrategy(strat);
        setFallbackToEmail(gw.fallback_to_email !== false);
        setAutoCourierAdvance(gw.auto_courier_advance !== false);
        setAutoCourierCod(Boolean(gw.auto_courier_cod));
        setDigitalProductSmsEnabled(gw.digital_product_sms_enabled !== false);
        setSelectedDeviceId(gw.selected_device_id || '');
        setSelectedSimNumber(gw.selected_sim_number || '');
        setGatewayStatus({ connected: Boolean(gw.is_connected), phone: gw.phone_number });
        if (gw.phone_number) setPhoneToPair(gw.phone_number);
        if (gw.pairing_code && !gw.is_connected) setPairingCode(gw.pairing_code);
      }

      // Templates
      const { data: tpls, error: tplsErr } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('brand_id', selectedBrandId);

      if (tplsErr && (tplsErr.code === '42501' || tplsErr.message?.includes('permission denied'))) {
        setPermissionDeniedDetected(true);
      }

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

  // Pure Edge Function Handshake for Pairing Code (Dual-Name + Active JWT Header + Clear Session Support)
  const handleGeneratePairingCode = async (forceReset = false) => {
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
      // 1. Get Fresh JWT Access Token for Supabase JWT verification
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};

      const payload = {
        action: forceReset ? 'reset_and_pair_phone' : 'pair_phone',
        brand_id: selectedBrandId,
        phone: cleanPhone,
        clear_session: forceReset,
        force_new: forceReset
      };

      // Timeout promise wrapper (15 seconds) so spinner never hangs indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Server response timed out (15s). Please ensure port 3333 is open on server.')), 15000)
      );

      // 2. Try 'send-notification' first with timeout race
      const invokeCall = async () => {
        let fnResult = await supabase.functions.invoke('send-notification', {
          body: payload,
          headers: authHeader
        });

        // 3. Fallback to 'headless-orchestrator' if 404 or missing
        if (fnResult.error && (fnResult.error.message?.includes('404') || fnResult.error.message?.includes('Failed to send a request'))) {
          fnResult = await supabase.functions.invoke('headless-orchestrator', {
            body: payload,
            headers: authHeader
          });
        }
        return fnResult;
      };

      const fnResult: any = await Promise.race([invokeCall(), timeoutPromise]);

      const { data, error } = fnResult;

      if (error) {
        console.error('Edge Function Error Details:', error);
        throw new Error(error.message || 'Edge function request failed');
      }

      if (forceReset) {
        // Cleanly remove pairing code and reset connection state in database
        await supabase
          .from('whatsapp_gateway_settings')
          .update({
            pairing_code: null,
            is_connected: false,
            updated_at: new Date().toISOString()
          })
          .eq('brand_id', selectedBrandId);
      }

      if (data?.pairing_code) {
        setPairingCode(data.pairing_code);
        // Persist code directly to database so polling can track immediately
        await supabase
          .from('whatsapp_gateway_settings')
          .upsert({
            brand_id: selectedBrandId,
            user_id: user?.id,
            phone_number: cleanPhone,
            pairing_code: data.pairing_code,
            is_connected: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'brand_id' });

        showToast(forceReset ? 'Session reset done. New pairing code ready.' : 'Pairing code generated. Enter in WhatsApp.', 'success');
      } else if (data?.connected || data?.status === 'connected') {
        setGatewayStatus({ connected: true, phone: cleanPhone });
        setPairingCode(null);
        await supabase
          .from('whatsapp_gateway_settings')
          .upsert({
            brand_id: selectedBrandId,
            user_id: user?.id,
            phone_number: cleanPhone,
            pairing_code: null,
            is_connected: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'brand_id' });
        showToast('WhatsApp connected successfully!', 'success');
      } else {
        throw new Error(data?.error || (forceReset ? 'Reset completed. Click Get Code now.' : 'Could not get pairing code'));
      }
    } catch (err: any) {
      console.error('Pairing process error:', err);
      showToast(err.message || 'Error communicating with server', 'error');
    } finally {
      setIsGeneratingPair(false);
    }
  };

  // Mutual Exclusion & Auto-Save on Channel Toggle
  const handleToggleChannel = async (channel: 'whatsapp' | 'email' | 'local_sms' | 'global_sms') => {
    if (!selectedBrandId) {
      showToast('Please select a brand', 'error');
      return;
    }

    let nextWa = whatsappEnabled;
    let nextEmail = emailEnabled;
    let nextLocalSms = localSmsEnabled;
    let nextGlobalSms = internationalSmsEnabled;

    if (channel === 'whatsapp') {
      nextWa = !whatsappEnabled;
    } else if (channel === 'email') {
      showToast('এই সার্ভিসটি ডেভেলপমেন্ট পর্যায়ে রয়েছে, দ্রুতই এই সার্ভিস যুক্ত হবে।', 'warning');
      return;
    } else if (channel === 'local_sms') {
      nextLocalSms = !localSmsEnabled;
    } else if (channel === 'global_sms') {
      nextGlobalSms = !internationalSmsEnabled;
    }

    setWhatsappEnabled(nextWa);
    setEmailEnabled(nextEmail);
    setLocalSmsEnabled(nextLocalSms);
    setInternationalSmsEnabled(nextGlobalSms);

    // Auto-save instantly to database
    try {
      const { error: autoErr } = await supabase
        .from('whatsapp_gateway_settings')
        .upsert({
          brand_id: selectedBrandId,
          user_id: user?.id,
          whatsapp_enabled: nextWa,
          email_notification_enabled: nextEmail,
          fallback_to_email: fallbackToEmail,
          fallback_to_sms: nextLocalSms,
          international_sms_enabled: nextGlobalSms,
          international_provider: internationalProvider,
          sms_sender_mode: smsSenderMode,
          custom_sms_api_url: customSmsApiUrl || null,
          custom_sms_api_key: customSmsApiKey || null,
          sms_api_endpoint: customSmsApiUrl || null,
          sms_api_key: customSmsApiKey || null,
          sms_api_secret: customSmsApiSecret || null,
          routing_strategy: routingStrategy,
          send_all_channels: routingStrategy === 'send_all',
          updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id' });

      if (autoErr) {
        if (autoErr.code === '42501' || autoErr.message?.includes('permission denied')) {
          setPermissionDeniedDetected(true);
          showToast('Database permission required: Run fix_notification_permissions.sql in Supabase', 'error');
          return;
        }
      }
      showToast('Channel settings auto-saved!', 'success');
    } catch (e: any) {
      if (e?.code === '42501' || e?.message?.includes('permission denied')) {
        setPermissionDeniedDetected(true);
        showToast('Database permission required: Run fix_notification_permissions.sql in Supabase', 'error');
      } else {
        console.warn('Auto-save error:', e);
      }
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
          international_provider: internationalProvider,
          sms_sender_mode: smsSenderMode,
          custom_sms_api_url: customSmsApiUrl || null,
          custom_sms_api_key: customSmsApiKey || null,
          sms_api_endpoint: customSmsApiUrl || null,
          sms_api_key: customSmsApiKey || null,
          sms_api_secret: customSmsApiSecret || null,
          routing_strategy: routingStrategy,
          send_all_channels: routingStrategy === 'send_all',
          auto_courier_advance: autoCourierAdvance,
          auto_courier_cod: autoCourierCod,
          digital_product_sms_enabled: digitalProductSmsEnabled,
          selected_device_id: selectedDeviceId || null,
          selected_sim_number: selectedSimNumber || null,
          phone_number: phoneToPair || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'brand_id' });

      if (gwErr) {
        if (gwErr.code === '42501' || gwErr.message?.includes('permission denied')) {
          setPermissionDeniedDetected(true);
          throw new Error('Database permission denied for table whatsapp_gateway_settings. Please execute fix_notification_permissions.sql in your Supabase SQL Editor.');
        }
        throw gwErr;
      }

      // Save Templates
      const { error: tmplErr } = await supabase.from('notification_templates').upsert([
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

      if (tmplErr) {
        if (tmplErr.code === '42501' || tmplErr.message?.includes('permission denied')) {
          setPermissionDeniedDetected(true);
          throw new Error('Database permission denied for table notification_templates. Please execute fix_notification_permissions.sql in your Supabase SQL Editor.');
        }
        throw tmplErr;
      }

      setPermissionDeniedDetected(false);
      showToast('All WhatsApp, Email & SMS Gateway Settings Saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
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
      </div>

      {/* Brand Selector & SQL Fix Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(SUPABASE_PERMISSION_SQL);
            setSqlCopied(true);
            setTimeout(() => setSqlCopied(false), 3000);
            showToast('SQL Permission Fix copied to clipboard!', 'success');
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all shadow-sm"
        >
          {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-amber-400" />}
          {sqlCopied ? 'SQL Copied!' : 'Copy Supabase SQL Fix'}
        </button>
      </div>

      {/* Permission Denied Alert Banner */}
      {permissionDeniedDetected && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-amber-200 space-y-3 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Supabase Database Permission Required</h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Table <code>whatsapp_gateway_settings</code> & <code>notification_templates</code> need GRANT permissions in Supabase.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_PERMISSION_SQL);
                setSqlCopied(true);
                setTimeout(() => setSqlCopied(false), 3000);
                showToast('SQL Fix Script Copied!', 'success');
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {sqlCopied ? 'Copied to Clipboard!' : 'Copy SQL Fix Script'}
            </button>
          </div>
          <div className="text-[11px] text-amber-300/70 border-t border-amber-500/20 pt-2 flex items-center gap-2">
            <span>👉 How to run: Open <strong>Supabase Dashboard</strong> ➔ <strong>SQL Editor</strong> ➔ Paste this script ➔ Click <strong>RUN</strong>.</span>
          </div>
        </div>
      )}

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
                    onChange={() => handleToggleChannel('whatsapp')}
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

            {/* Channel 2: Brand Email Invoice (Locked - Coming Soon) */}
            <div
              onClick={() => showToast('ইমেইল সেন্ডিং ফিচারটি বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে, দ্রুতই এটি যুক্ত হবে।', 'warning')}
              className="p-4 rounded-2xl border transition-all bg-slate-950/40 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 opacity-80 cursor-pointer relative group select-none shadow-sm"
              title="ইমেইল সেন্ডিং সার্ভিস দ্রুতই আসছে (বিস্তারিত জানতে ক্লিক করুন)"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="p-1 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 group-hover:bg-amber-500/25 transition-all shadow-sm">
                  <Lock className="w-3 h-3 text-amber-400" /> Locked
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">2. Brand Email</h4>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-500/20">
                  Coming Soon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Professional HTML invoice & tracking sent to customer inbox.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  🔒 দ্রুতই আসছে (লক করা)
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
                    onChange={() => handleToggleChannel('local_sms')}
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
                    onChange={() => handleToggleChannel('global_sms')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <h4 className="text-sm font-bold text-white">4. Global SMS</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Dispatches to all global numbers via your 3-Field SMS API or Twilio.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Route:</span>
                <span className="font-semibold text-cyan-400">
                  {internationalProvider.toUpperCase()} / 3-Field API
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Active Combination Helper Text */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">
                সক্রিয় চ্যানেলসমূহ: <strong className="text-white">
                  {[
                    whatsappEnabled && '1. WhatsApp',
                    emailEnabled && '2. Brand Email',
                    localSmsEnabled && '3. Domestic SMS',
                    internationalSmsEnabled && `4. Global SMS (${internationalProvider.toUpperCase()})`
                  ].filter(Boolean).join(' + ') || 'কোনো চ্যানেল অন নেই'}
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-emerald-400/90 font-medium">
              (কাস্টমারের ফোন বা ইমেইল ডাটা অনুযায়ী স্বয়ংক্রিয় ডিসপ্যাচ ও ফলব্যাক)
            </span>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1.1: DOMESTIC SMS (SHOP ANDROID PHONE SIM ONLY)  */}
          {/* ======================================================== */}
          {localSmsEnabled && (
            <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  3. Domestic SMS Engine (Bangladesh Local Phone SIM)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sends automated SMS to Bangladeshi numbers (+880) via your shop's connected Android phone SIM card (Free local bundle SMS).
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Select Outgoing SIM Number / Connected Phone:</span>
                  <select
                    value={selectedSimNumber}
                    onChange={(e) => {
                      const num = e.target.value;
                      setSelectedSimNumber(num);
                      const cleanSelected = normalizePhone(num);
                      const matched = paymentNumbers.find(p => normalizePhone(p.number) === cleanSelected || p.number === num);
                      const extractedDev = getDeviceFromRecord(matched);
                      if (extractedDev) {
                        setSelectedDeviceId(extractedDev);
                      } else if (realDevices.length > 0 && !selectedDeviceId) {
                        setSelectedDeviceId(realDevices[0].device_id);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select phone / device</option>
                    {/* Direct connected real devices */}
                    {realDevices.map(d => (
                      <option key={d.id} value={d.phone_number || d.device_id}>
                        📱 Phone Device: {d.device_id} ({d.connected ? 'Online' : 'Offline'}) {d.phone_number ? `- ${d.phone_number}` : ''}
                      </option>
                    ))}
                    {/* Payment numbers */}
                    {paymentNumbers.map(p => {
                      const devName = getDeviceFromRecord(p) || (realDevices.length > 0 ? realDevices[0].device_id : '');
                      return (
                        <option key={p.id} value={p.number}>
                          {p.provider ? p.provider.toUpperCase() : 'SIM'}: {p.number} (Device: {devName ? devName : 'Primary App'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Target Android Device ID:</span>
                    {realDevices.length > 0 && (
                      <span className="text-[10px] text-purple-400">Available: {realDevices.map(d => d.device_id).filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      placeholder="e.g. tzy25"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                    {realDevices.length > 0 && (
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-2 rounded-xl focus:outline-none"
                        title="Quick pick device"
                      >
                        <option value="">Pick Device</option>
                        {realDevices.map(d => (
                          <option key={d.id} value={d.device_id}>
                            {d.device_id} ({d.connected ? 'Online' : 'Offline'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1.2: GLOBAL SMS (3-FIELD UNIVERSAL CLOUD API)    */}
          {/* ======================================================== */}
          {internationalSmsEnabled && (
            <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    4. Global SMS Gateway (Multi-Platform Cloud API)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sends international SMS to global customers (+1, +44, +971 etc.) via your chosen SMS platform.
                  </p>
                </div>

                {/* International Platform Selector (Single Choice) */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 self-start sm:self-auto">
                  <span className="text-xs text-slate-400 font-medium">Select Platform:</span>
                  <select
                    value={internationalProvider}
                    onChange={(e) => {
                      const prov = e.target.value as any;
                      setInternationalProvider(prov);
                      if (prov === 'twilio' && !customSmsApiUrl) {
                        setCustomSmsApiUrl('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json');
                      } else if (prov === 'infobip' && !customSmsApiUrl) {
                        setCustomSmsApiUrl('https://api.infobip.com/sms/2/text/advanced');
                      } else if (prov === 'vonage' && !customSmsApiUrl) {
                        setCustomSmsApiUrl('https://rest.nexmo.com/sms/json');
                      } else if (prov === 'messagebird' && !customSmsApiUrl) {
                        setCustomSmsApiUrl('https://rest.messagebird.com/messages');
                      }
                    }}
                    className="bg-transparent text-xs text-cyan-400 font-bold outline-none cursor-pointer"
                  >
                    <option value="twilio" className="bg-slate-900 text-white">Twilio SMS</option>
                    <option value="infobip" className="bg-slate-900 text-white">Infobip Global</option>
                    <option value="vonage" className="bg-slate-900 text-white">Vonage / Nexmo</option>
                    <option value="messagebird" className="bg-slate-900 text-white">MessageBird</option>
                    <option value="custom" className="bg-slate-900 text-white">Universal 3-Field API</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">1. Global SMS Endpoint URL:</span>
                  <input
                    type="text"
                    value={customSmsApiUrl}
                    onChange={(e) => setCustomSmsApiUrl(e.target.value)}
                    placeholder="https://api.twilio.com/2010-04-01/Accounts/.../Messages.json"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">2. API Key / Account SID:</span>
                  <input
                    type="text"
                    value={customSmsApiKey}
                    onChange={(e) => setCustomSmsApiKey(e.target.value)}
                    placeholder="API Key / Account SID"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">3. API Secret / Auth Token / Sender ID:</span>
                  <input
                    type="password"
                    value={customSmsApiSecret}
                    onChange={(e) => setCustomSmsApiSecret(e.target.value)}
                    placeholder="Auth Token or Sender Phone"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Smart Delivery Routing with Email Option */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Channel Dispatch Logic & Fallback
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
                  <span className="text-xs font-bold block text-white">1. Fallback Only (Primary 1st Channel)</span>
                  <span className="text-[11px] text-slate-400">
                    কেবোল ১ম চ্যানেলে (যেমন WhatsApp) পাঠাবে। কেবল ১ম চ্যানেল না থাকলে বা ফেইল হলে ২য় চ্যানেলে ফলব্যাক করবে।
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
                  <span className="text-xs font-bold block text-white">2. All Active Channels (One by One)</span>
                  <span className="text-[11px] text-slate-400">
                    উভয় চ্যানেলেই (WhatsApp + SMS/Email) একে একে চেষ্টা করবে, যাতে কাস্টমার ১০০% নিশ্চিত নোটিফিকেশন পায়।
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Auto-Notification for Physical (100% Full Paid) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  Physical (100% Paid)
                </span>
                <p className="text-xs text-slate-400">
                  Global/USA orders with 100% upfront card/bank payment. Auto-books courier & sends dispatch receipt.
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

            {/* Auto-Notification for Advance Pay */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  Advance + COD Receipt
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
                <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    WhatsApp Phone Number (with Country Code)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="8801973891388"
                      value={phoneToPair}
                      onChange={(e) => setPhoneToPair(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors min-w-0"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleGeneratePairingCode(false)}
                        disabled={isGeneratingPair}
                        className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5 shrink-0 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isGeneratingPair ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Get Code</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsGeneratingPair(true);
                          try {
                            const res = await supabase.functions.invoke('send-notification', {
                              body: {
                                action: 'check_status',
                                brand_id: selectedBrandId
                              }
                            });
                            if (res.data?.connected) {
                              setGatewayStatus({ connected: true, phone: res.data.phone || phoneToPair });
                              setPairingCode(null);
                              await supabase.from('whatsapp_gateway_settings').upsert({
                                brand_id: selectedBrandId,
                                user_id: user?.id,
                                is_connected: true,
                                phone_number: res.data.phone || phoneToPair,
                                pairing_code: null,
                                updated_at: new Date().toISOString()
                              }, { onConflict: 'brand_id' });
                              showToast('Server WhatsApp session is Active & Synced to Database!', 'success');
                            } else {
                              showToast(res.data?.message || 'Server reports WhatsApp session not connected yet.', 'error');
                            }
                          } catch (e: any) {
                            showToast('Status check error: ' + (e.message || 'Server unreachable'), 'error');
                          } finally {
                            setIsGeneratingPair(false);
                          }
                        }}
                        disabled={isGeneratingPair}
                        className="px-3.5 py-3 bg-slate-900 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 whitespace-nowrap"
                        title="Query server Edge Function and sync connection status to Database Table"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPair ? 'animate-spin' : ''}`} />
                        <span>Sync Status</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGeneratePairingCode(true)}
                        disabled={isGeneratingPair}
                        className="px-3.5 py-3 bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 whitespace-nowrap"
                        title="Clear previous session lock and generate fresh pairing code"
                      >
                        <span>Reset</span>
                      </button>
                    </div>
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

              {/* Code Box & Connection Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl min-h-[190px]">
                {gatewayStatus.connected ? (
                  <div className="text-center space-y-3 w-full py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block">
                        WhatsApp Linked &amp; Active
                      </span>
                      <p className="text-sm font-mono font-bold text-white mt-1">
                        +{gatewayStatus.phone || phoneToPair}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ready to send zero-cost receipts to customers.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleGeneratePairingCode(true)}
                        disabled={isGeneratingPair}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isGeneratingPair ? 'animate-spin' : ''}`} />
                        <span>Disconnect / Re-link</span>
                      </button>
                    </div>
                  </div>
                ) : pairingCode ? (
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
