
import { showToast } from '../../lib/toast';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, X, Loader2, Lock, Copy, Clock, RefreshCw, AlertCircle, CheckCircle2, Flag, QrCode, ShoppingCart, AlertTriangle } from 'lucide-react';
import LocaleSwitcher from '../LocaleSwitcher';
import { useLocale } from '../../lib/LocaleContext';
import { checkoutCopy } from '../../lib/checkoutLocalization';

// Centralized Permanent Brand Logos (same source as GatewaySettings)
import { PAYMENT_LOGOS as LOGOS } from '../../lib/paymentLogos';

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
        headerBg: 'bg-gradient-to-b from-[#e51d25] to-[#c7171e]', headerText: 'text-white', 
        bodyBg: 'bg-gradient-to-b from-[#c7171e] to-[#910f13]', bodyText: 'text-white', inputColor: 'text-[#ED1C24]',
        btnPrimary: 'bg-white/40 text-[#910f13]', btnSecondary: 'bg-white text-[#c7171e]'
      };
    case 'rocket':
      return { 
        headerBg: 'bg-white', headerText: 'text-slate-800', 
        bodyBg: 'bg-[#8c3494]', bodyText: 'text-white', inputColor: 'text-[#8c3494]',
        btnPrimary: 'bg-white/20 text-white', btnSecondary: 'bg-white/20 text-white'
      };
    case 'tap':
      return {
        headerBg: 'bg-white', headerText: 'text-[#25302b]',
        bodyBg: 'bg-gradient-to-br from-[#e21c2b] via-[#d7192a] to-[#2fa34a]', bodyText: 'text-white', inputColor: 'text-[#c9182b]',
        btnPrimary: 'bg-white text-[#c9182b]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'mcash':
      return {
        headerBg: 'bg-white', headerText: 'text-[#155d43]',
        bodyBg: 'bg-gradient-to-br from-[#08784f] via-[#168a5a] to-[#e3362b]', bodyText: 'text-white', inputColor: 'text-[#08784f]',
        btnPrimary: 'bg-white text-[#08784f]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'cellfin':
      return {
        headerBg: 'bg-white', headerText: 'text-[#075b3f]',
        bodyBg: 'bg-gradient-to-br from-[#075b3f] via-[#0d8a5a] to-[#e4342b]', bodyText: 'text-white', inputColor: 'text-[#075b3f]',
        btnPrimary: 'bg-white text-[#075b3f]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'pathao_pay':
      return {
        headerBg: 'bg-white', headerText: 'text-[#243a4e]',
        bodyBg: 'bg-gradient-to-br from-[#1976d2] via-[#2d8de5] to-[#eef3f8]', bodyText: 'text-white', inputColor: 'text-[#1976d2]',
        btnPrimary: 'bg-white text-[#1976d2]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'ok_wallet':
      return {
        headerBg: 'bg-white', headerText: 'text-[#263238]',
        bodyBg: 'bg-gradient-to-br from-[#263238] via-[#455a64] to-[#00a86b]', bodyText: 'text-white', inputColor: 'text-[#263238]',
        btnPrimary: 'bg-white text-[#263238]', btnSecondary: 'bg-white/20 text-white'
      };
    case 'islamic_wallet':
      return {
        headerBg: 'bg-white', headerText: 'text-[#155f4a]',
        bodyBg: 'bg-gradient-to-br from-[#075e4a] via-[#0d8b69] to-[#d6b24c]', bodyText: 'text-white', inputColor: 'text-[#075e4a]',
        btnPrimary: 'bg-white text-[#075e4a]', btnSecondary: 'bg-white/20 text-white'
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
  // Local Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error', id: number} | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = Date.now();
      setToast({ ...customEvent.detail, id });
      setTimeout(() => {
        setToast(prev => prev?.id === id ? null : prev);
      }, 3000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => {
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);
  const { slug } = useParams();
  const { language } = useLocale();
  const navigate = useNavigate();
  
  const [linkData, setLinkData] = useState<any>(null);
  const [brandData, setBrandData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [clientHomeUrl, setClientHomeUrl] = useState<string>('/');
  
  const [step, setStep] = useState(1);
  const [invoiceId, setInvoiceId] = useState('');
  const [checkoutSignature, setCheckoutSignature] = useState('');
  const [checkoutTimestamp, setCheckoutTimestamp] = useState('');

  const [copied, setCopied] = useState<string | false>(false);

  const fallbackCopyTextToClipboard = (text: string, id: string = 'number') => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(id);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy error', err);
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = (text: string, id: string = 'number') => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text, id);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      fallbackCopyTextToClipboard(text, id);
    });
  };

  
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyMethod, setVerifyMethod] = useState<'live' | 'trxid' | 'offline' | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  
  // Report Modal
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportProof, setReportProof] = useState<File | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  
  useEffect(() => {
    if (!invoiceId) return;

    const channel = supabase
      .channel(`realtime-updates-${invoiceId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'invoices',
        filter: `id=eq.${invoiceId}`
      }, (payload) => {
        if (payload.new.status === 'Completed') {
          // Success! Redirect to the secure access page
          window.location.href = '/access/' + invoiceId;
        }
      })
      // Listening ONLY to invoices table. Webhook or manual checks will update it.
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoiceId, linkData, step, verifyMethod, senderNumber, selectedGateway]);

  // Separate effect for Countdown Timer
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

  // Separate effect for Live SMS Event Subscription (No Polling)
  useEffect(() => {
    if (step !== 5 || verifyMethod !== 'live' || !invoiceId || !senderNumber || !linkData || !selectedGateway) return;

    let isVerifyingRequest = false;

    const channel = supabase
      .channel(`sms_events_${invoiceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sms_events',
        filter: `user_id=eq.${linkData.user_id}`
      }, async (payload) => {
        // When a new SMS is inserted for this merchant, check if it matches the customer's number
        const cleanNumber = senderNumber.replace('+88', '');
        const message = (payload.new.message || '').toLowerCase();
        
        if (cleanNumber.length >= 10 && message.includes(cleanNumber) && !isVerifyingRequest) {
           isVerifyingRequest = true;
           try {
             const res = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId,
                  senderNumber,
                  verifyMethod: 'live',
                  provider: selectedGateway.provider,
                  userId: linkData.user_id
                })
             });
             if (res.ok) {
                const data = await res.json();
                if (data.success) { window.location.href = data.success_url || data.delivery?.url || data.redirect_link || '/access/' + invoiceId; }
             }
           } catch (err) {
             console.error("Verification error:", err);
           } finally {
             isVerifyingRequest = false;
           }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [step, verifyMethod, invoiceId, senderNumber, linkData, selectedGateway]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchData();
  }, [slug]);


  // Device Presence Check (Realtime)
  const [onlineDevices, setOnlineDevices] = useState<any[]>([]);

  useEffect(() => {
    if (!linkData?.user_id) return;
    
    const channel = supabase.channel('all_devices');
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      let isOnline = false;
      const devices: any[] = [];
      
      for (const id in state) {
        for (const presence of state[id] as any[]) {
          if (presence.client_id === linkData.user_id || presence.user_id === linkData.user_id) {
            isOnline = true;
            devices.push(presence);
          }
        }
      }
      setIsDeviceOnline(isOnline);
      setOnlineDevices(devices);
    });
    
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkData]);

  const resolveClientHome = async (brandId?: string, userId?: string) => {
    try {
      let site: { domain?: string | null; subdomain?: string | null } | null = null;

      // 1. Direct query by brandId
      if (brandId) {
        const { data } = await supabase
          .from('site_settings')
          .select('domain, subdomain')
          .or(`id.eq.${brandId},brand_id.eq.${brandId}`)
          .maybeSingle();
        if (data) site = data;
      }

      // 2. Direct query by userId
      if (!site && userId) {
        const { data } = await supabase
          .from('site_settings')
          .select('domain, subdomain')
          .eq('client_id', userId)
          .maybeSingle();
        if (data) site = data;
      }

      // 3. Query params: ?brand=, ?brand_id=, ?domain=, ?subdomain=, ?ref=
      if (!site && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qb = params.get('brand') || params.get('brand_id');
        const qd = params.get('domain');
        const qs = params.get('subdomain');
        if (qb) {
          const { data } = await supabase
            .from('site_settings')
            .select('domain, subdomain')
            .or(`id.eq.${qb},brand_id.eq.${qb}`)
            .maybeSingle();
          if (data) site = data;
        } else if (qd) {
          const { data } = await supabase
            .from('site_settings')
            .select('domain, subdomain')
            .eq('domain', qd)
            .maybeSingle();
          if (data) site = data;
        } else if (qs) {
          const { data } = await supabase
            .from('site_settings')
            .select('domain, subdomain')
            .eq('subdomain', qs)
            .maybeSingle();
          if (data) site = data;
        }
      }

      // 4. Check document.referrer (where the customer was redirected from)
      let refOrigin = '';
      if (!site && typeof document !== 'undefined' && document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          const refHost = refUrl.hostname.toLowerCase();
          refOrigin = `${refUrl.protocol}//${refUrl.host}`;

          if (refHost && !refHost.includes('localhost') && refHost !== 'mecopay.space' && refHost !== 'www.mecopay.space') {
            const rawSub = refHost.endsWith('.mecopay.space') ? refHost.replace('.mecopay.space', '') : refHost;
            const { data } = await supabase
              .from('site_settings')
              .select('domain, subdomain')
              .or(`domain.ilike.%${refHost}%,subdomain.ilike.%${rawSub}%,subdomain.ilike.%${refHost}%`)
              .maybeSingle();
            if (data) site = data;
          }
        } catch (e) {
          console.warn('Error reading referrer:', e);
        }
      }

      // 5. Evaluate domain & subdomain based on client rules:
      // "Jodi domain subdomain 2 tai thake kabol domain er setar link oi homepage a anbe ok ar only subdomain thakle ba only domain thakle setar link oi hone page button e thakbe ok site_setrings table theke check kore nibe ok"
      if (site) {
        const dom = site.domain?.trim();
        const sub = site.subdomain?.trim();

        let finalUrl = '';
        if (dom && dom.length > 0) {
          // Both or only domain -> strictly use domain
          finalUrl = dom;
        } else if (sub && sub.length > 0) {
          // Only subdomain
          finalUrl = sub;
          if (!finalUrl.includes('.') && !finalUrl.includes('mecopay.space')) {
            finalUrl = `${finalUrl}.mecopay.space`;
          }
        }

        if (finalUrl) {
          if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = `https://${finalUrl}`;
          }
          setClientHomeUrl(finalUrl);
          return;
        }
      }

      // 6. External referrer fallback
      if (refOrigin && !refOrigin.includes('localhost') && !refOrigin.includes('mecopay.space')) {
        setClientHomeUrl(refOrigin);
        return;
      }
    } catch (err) {
      console.error('Error resolving client home link:', err);
    }
  };

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    try {
      setLoading(true);
      setError('');

      // 0. Check for Dynamic Stateless Session Token from API / Worker
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('session');
      if (sessionToken) {
        try {
          const raw = decodeURIComponent(escape(atob(sessionToken)));
          const sessionObj = JSON.parse(raw);

          // Fetch real brand from Supabase
          let brand = null;
          if (sessionObj.brand_id) {
            const { data: b } = await supabase
              .from('brands')
              .select('*')
              .eq('id', sessionObj.brand_id)
              .maybeSingle();
            brand = b;
          }

          const dynamicLink = {
            id: sessionObj.order_id || 'api_session',
            brand_id: sessionObj.brand_id,
            user_id: brand?.user_id || sessionObj.user_id,
            product_id: sessionObj.product_id || null,
            title: sessionObj.product_name || (brand?.name ? `Payment to ${brand.name}` : 'Checkout Item'),
            price: sessionObj.payable_amount ?? sessionObj.amount ?? 0,
            total_amount: sessionObj.total_amount,
            courier_charge: sessionObj.courier_charge,
            cod_due: sessionObj.cod_due,
            product_type: sessionObj.product_type,
            product_name: sessionObj.product_name || (brand?.name ? `Payment to ${brand.name}` : 'Order Payment'),
            redirect_link: sessionObj.success_url || (sessionObj.product_type === 'digital' ? (sessionObj.telegram_link || sessionObj.facebook_group_link || sessionObj.google_drive_link) : null),
            telegram_link: sessionObj.product_type === 'digital' ? sessionObj.telegram_link : null,
            facebook_group_link: sessionObj.product_type === 'digital' ? sessionObj.facebook_group_link : null,
            facebook_access_code: sessionObj.product_type === 'digital' ? sessionObj.facebook_access_code : null,
            google_drive_link: sessionObj.product_type === 'digital' ? sessionObj.google_drive_link : null,
            success_url: sessionObj.success_url,
            cancel_url: sessionObj.cancel_url,
            is_dynamic_session: true,
            invoice_number: sessionObj.invoice_number,
            currency: sessionObj.currency ? String(sessionObj.currency).trim() : null
          };

          setLinkData(dynamicLink);
          if (brand) {
            setBrandData(brand);
          } else {
            setBrandData({
              id: sessionObj.brand_id,
              name: sessionObj.brand_name || 'MecoPay Checkout',
              logo_url: sessionObj.brand_logo || null
            });
          }

          if (sessionObj.customer_name || sessionObj.customer_phone || sessionObj.customer_email || sessionObj.customer_address) {
            setFormData({
              'Name': sessionObj.customer_name || '',
              'Phone': sessionObj.customer_phone || '',
              'Email': sessionObj.customer_email || '',
              'Address': sessionObj.customer_address || ''
            });
          }

          if (sessionObj.brand_id) {
            const { data: gws } = await supabase
              .from('payment_numbers')
              .select('*')
              .eq('brand_id', sessionObj.brand_id)
              .order('created_at', { ascending: true });
            setGateways(gws || []);
          }

          setLoading(false);
          return;
        } catch (decodeErr) {
          console.error("Session decode error:", decodeErr);
        }
      }

      // Check for Invoice ID in query params (?inv=... or ?invoice_id=...)
      const invoiceParam = urlParams.get('inv') || urlParams.get('invoice') || urlParams.get('invoice_id');
      setCheckoutSignature(urlParams.get('sig') || '');
      setCheckoutTimestamp(urlParams.get('ts') || '');
      if (invoiceParam) {
        try {
          const { data: inv } = await supabase
            .from('invoices')
            .select('*, brands(*)')
            .eq('id', invoiceParam)
            .maybeSingle();

          if (inv) {
            setInvoiceId(inv.id);
            const brand = inv.brands;
            const invoiceCurrency = inv.metadata?.currency || inv.currency || null;
            const dynamicLink = {
              id: inv.id,
              brand_id: inv.brand_id,
              user_id: inv.user_id,
              title: inv.product_name || (brand?.name ? `Payment to ${brand.name}` : 'Checkout Item'),
              price: inv.amount || 0,
              product_name: inv.product_name || (brand?.name ? `Payment to ${brand.name}` : 'Order Payment'),
              redirect_link: inv.success_url || '',
              invoice_number: inv.invoice_number,
              is_dynamic_session: true,
              currency: invoiceCurrency ? String(invoiceCurrency).trim() : null
            };
            setLinkData(dynamicLink);
            if (brand) setBrandData(brand);
            if (inv.customer_name || inv.customer_phone) {
              setFormData({
                'Name': inv.customer_name || '',
                'Phone': inv.customer_phone || '',
                'Email': inv.customer_email || '',
                'Address': inv.customer_address || ''
              });
            }
            if (inv.brand_id) {
              const { data: gws } = await supabase
                .from('payment_numbers')
                .select('*')
                .eq('brand_id', inv.brand_id)
                .order('created_at', { ascending: true });
              setGateways(gws || []);
            }
            setLoading(false);
            return;
          }
        } catch (invErr) {
          console.error("Invoice fetch error:", invErr);
        }
      }

      if (!slug) {
        setError('Payment link not found or invalid.');
        setLoading(false);
        await resolveClientHome();
        return;
      }
      
      const targetSlug = slug ? decodeURIComponent(slug) : '';
      
      let { data: link, error: linkErr } = await supabase
        .from('payment_links')
        .select('*')
        .eq('slug', targetSlug)
        .maybeSingle();

      if (!link && slug && slug !== targetSlug) {
        const { data: fallbackLink } = await supabase
          .from('payment_links')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (fallbackLink) {
          link = fallbackLink;
          linkErr = null;
        }
      }
        
      if (linkErr) {
        console.error("Link fetch error:", linkErr);
      }
      if (!link) {
        setError('Payment link not found or invalid.');
        await resolveClientHome();
        return;
      }
      
      setLinkData(link);
      
      const { data: brand, error: brandErr } = await supabase
        .from('brands')
        .select('*')
        .eq('id', link.brand_id)
        .maybeSingle();
        
      if (brandErr) {
        console.error("Brand fetch error:", brandErr);
      }
      if (!brand) {
        setError('Payment link brand not found.');
        await resolveClientHome(link.brand_id, link.user_id);
        return;
      }
      setBrandData(brand);
      
      const { data: gws, error: gwErr } = await supabase
        .from('payment_numbers')
        .select('*')
        .eq('brand_id', link.brand_id)
        .order('created_at', { ascending: true });
        
      if (gwErr) throw gwErr;
      setGateways(gws || []);

      // Online status is now handled by Realtime Presence in a separate useEffect
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load checkout');
      await resolveClientHome();
    } finally {
      setLoading(false);
    }
  };


  const checkoutAmounts = useMemo(() => {
    if (!linkData || !brandData) return { subtotal: 0, fee: 0, total: 0 };
    const subtotal = Number(linkData.price) || 0;
    let fee = 0;
    if (brandData.transaction_fee && Number(brandData.transaction_fee) > 0) {
      if (brandData.transaction_fee_type === 'percentage') {
        fee = subtotal * (Number(brandData.transaction_fee) / 100);
      } else {
        fee = Number(brandData.transaction_fee);
      }
    }
    let total = subtotal + fee;
    if (brandData.amount_format === 'round_up') {
      total = Math.ceil(total);
    } else {
      total = Number(total.toFixed(2));
    }
    return { subtotal, fee: Number(fee.toFixed(2)), total };
  }, [linkData, brandData]);

  // Dynamic currency code & display formatter (supports BDT, USD, EUR, USDT, BTC, symbols and Bangla text)
  const currencyCode = useMemo(() => {
    let raw = linkData?.currency;
    if (!raw && selectedGateway) {
      if (selectedGateway.currency) {
        raw = selectedGateway.currency;
      } else {
        const gwName = String(selectedGateway.provider || selectedGateway.method || selectedGateway.channel || '').toLowerCase();
        if (gwName.includes('bkash') || gwName.includes('nagad') || gwName.includes('rocket') || gwName.includes('upay')) {
          raw = 'BDT';
        }
      }
    }
    if (!raw && brandData?.currency) {
      raw = brandData.currency;
    }
    if (!raw) {
      raw = 'USD';
    }
    const trimmed = String(raw).trim();
    return /^[a-zA-Z]{2,6}$/.test(trimmed) ? trimmed.toUpperCase() : trimmed;
  }, [linkData, selectedGateway, brandData]);

  const formatCurrency = (amt: number | string, forceCode: boolean = false) => {
    const num = typeof amt === 'number' ? amt : (Number(amt) || 0);
    if (forceCode) {
      return `${currencyCode} ${num}`;
    }
    switch (currencyCode) {
      case 'BDT':
      case '৳':
      case 'টাকা':
        return `৳ ${num}`;
      case 'USD':
      case '$':
      case 'ডলার':
        return `$${num}`;
      case 'EUR':
      case '€':
      case 'ইউরো':
        return `€${num}`;
      case 'GBP':
      case '£':
      case 'পাউন্ড':
        return `£${num}`;
      case 'INR':
      case '₹':
      case 'রুপি':
        return `₹${num}`;
      case 'CAD':
        return `CA$${num}`;
      case 'AUD':
        return `AU$${num}`;
      default:
        return `${currencyCode} ${num}`;
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
        payment_link_id: linkData.is_dynamic_session ? null : linkData.id,
        amount: checkoutAmounts.total,
        status: 'Pending',
        customer_name: primaryName,
        customer_phone: primaryPhone,
        customer_email: primaryEmail,
        product_name: linkData.product_name,
        invoice_number: linkData.invoice_number || undefined,
        redirect_link: linkData.redirect_link,
        metadata: {
          order_id: linkData.id || null,
          product_name: linkData.product_name || null,
          product_id: linkData.product_id || null,
          product_type: linkData.product_type || null,
          currency: linkData.currency || null,
          total_amount: linkData.total_amount ?? checkoutAmounts.total,
          amount: linkData.price ?? checkoutAmounts.total,
          courier_charge: linkData.courier_charge ?? 0,
          telegram_link: linkData.product_type === 'digital' ? (linkData.telegram_link || null) : null,
          facebook_group_link: linkData.product_type === 'digital' ? (linkData.facebook_group_link || null) : null,
          facebook_access_code: linkData.product_type === 'digital' ? (linkData.facebook_access_code || null) : null,
          google_drive_link: linkData.product_type === 'digital' ? (linkData.google_drive_link || null) : null,
          success_url: linkData.success_url || null,
          cancel_url: linkData.cancel_url || null
        }
      };

      payload.customer_data = formData;

      const { data, error } = await supabase
        .from('invoices')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.message.includes('customer_data') || error.message.includes('product_name') || error.message.includes('schema cache')) {
           delete payload.customer_data;
           delete payload.product_name;
           delete payload.redirect_link;
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
      showToast("Failed to continue: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGateway = (gw: any) => {
    let activeNumber = gw.number;
    let fallbackUsed = false;

    const getGwDevice = (type: 'primary' | 'secondary') => {
      if (type === 'primary' && gw.device_name) return gw.device_name;
      if (type === 'secondary' && gw.device_name_2) return gw.device_name_2;
      if (Array.isArray(gw.additional_numbers)) {
        const meta = gw.additional_numbers.find((x: any) => x && x._meta_type === type);
        if (meta && meta.device_name) return meta.device_name;
      }
      return null;
    };

    let activeDeviceName = getGwDevice('primary');
    
    // Limits based on our analysis
    const limits = {
      bkash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      nagad: { dailyCount: 50, dailyAmt: 50000, monthlyCount: 100, monthlyAmt: 300000 },
      upay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 1000, monthlyAmt: 300000 },
      rocket: { dailyCount: 100000, dailyAmt: 50000, monthlyCount: 1000000, monthlyAmt: 300000 },
      tap: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      mcash: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      cellfin: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      pathao_pay: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      ok_wallet: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 },
      islamic_wallet: { dailyCount: 100, dailyAmt: 50000, monthlyCount: 250, monthlyAmt: 300000 }
    };
    
    const limit = limits[gw.provider as keyof typeof limits];
    
    // Check if primary number crossed any limit
    if (limit && (gw.number_2 || (gw.additional_numbers && gw.additional_numbers.length > 0))) {
      const dailyCount = gw.daily_count || 0;
      const dailyAmt = gw.daily_amount || 0;
      const monthlyCount = gw.monthly_count || 0;
      const monthlyAmt = gw.monthly_volume || 0;
      
      const isCrossed = (
        dailyCount >= limit.dailyCount || 
        dailyAmt >= limit.dailyAmt || 
        monthlyCount >= limit.monthlyCount || 
        monthlyAmt >= limit.monthlyAmt
      );

      if (isCrossed) {
        if (gw.number_2) {
          activeNumber = gw.number_2;
          activeDeviceName = getGwDevice('secondary');
          fallbackUsed = true;
        }
        const realBackups = Array.isArray(gw.additional_numbers)
          ? gw.additional_numbers.filter((x: any) => x && !x._meta_type)
          : [];
        if (realBackups.length > 0) {
          // If secondary is also full, fallback to next available backup number
          const firstAdd = realBackups[0];
          if (typeof firstAdd === 'object' && firstAdd !== null) {
            if (firstAdd.number) activeNumber = firstAdd.number;
            if (firstAdd.device_name) activeDeviceName = firstAdd.device_name;
          } else if (typeof firstAdd === 'string') {
            activeNumber = firstAdd;
          }
          fallbackUsed = true;
        }
      }
    }

    // Set the selected gateway with the active number
    setSelectedGateway({ ...gw, activeNumber, isFallback: fallbackUsed });
    
    const vTrxId = brandData?.redirect_links?.verify_trx_id ?? true;
    const vPhone = brandData?.redirect_links?.verify_phone ?? false;

    // If gateway has a specific device_name, check if THAT device is online
    let isThisGatewayOnline = isDeviceOnline;
    if (activeDeviceName) {
      isThisGatewayOnline = onlineDevices.some(d => d.device_name === activeDeviceName);
    }

    if (!isThisGatewayOnline) {
      setVerifyMethod('offline');
      setStep(4);
    } else {
      if (vPhone && !vTrxId) {
        setVerifyMethod('live');
        setStep(4);
      } else if (vTrxId && !vPhone) {
        setVerifyMethod('trxid');
        setStep(4);
      } else if (!vTrxId && !vPhone) {
        // Fallback
        setVerifyMethod('trxid');
        setStep(4);
      } else {
        setStep(3);
      }
    }
  };

  const handleCancelPayment = async () => {
    // User explicitly clicked Cancel / Close on Gateway page
    if (invoiceId) {
      // Background update
      supabase.from('invoices').update({ status: 'Cancelled - Returned to Form' }).eq('id', invoiceId).then();
    }
    
    const vTrxId = brandData?.redirect_links?.verify_trx_id ?? true;
    const vPhone = brandData?.redirect_links?.verify_phone ?? false;
    const skippedStep3 = (vTrxId && !vPhone) || (!vTrxId && vPhone) || (!vTrxId && !vPhone);
    
    if (verifyMethod === 'offline' || skippedStep3) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    try {
      setIsVerifying(true);
      
      // 1. Check if invoice is older than 24 hours
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('created_at')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceData && invoiceData.created_at) {
        const invoiceTime = new Date(invoiceData.created_at).getTime();
        const now = new Date().getTime();
        const diffHours = (now - invoiceTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
          setVerifyError("Time expired! You can only verify within 24 hours of initiating the payment.");
          setIsVerifying(false);
          return;
        }
      }

      // 2. If Device is Offline, bypass Edge function and save for Manual Verification
      if (verifyMethod === 'offline') {
        const { error: updateErr } = await supabase
          .from('invoices')
          .update({ trx_id: trxId, status: 'Manual Verification Pending' })
          .eq('id', invoiceId);
          
        if (updateErr) throw updateErr;
        setStep(6);
        setIsVerifying(false);
        return;
      }

      // 3. Pre-verify for Online Devices: Check if TrxID exists in sms_events
      const { data: smsMatch, error: smsErr } = await supabase
        .from('sms_events')
        .select('id')
        .eq('user_id', linkData.user_id)
        .ilike('trx_id_extracted', `%${trxId}%`)
        .eq('status', 'pending')
        .limit(1);

      if (smsErr || !smsMatch || smsMatch.length === 0) {
        setVerifyError("TrxID not found or already used. Please wait a moment and try again.");
        setIsVerifying(false);
        return;
      }

      // 4. Securely verify via Edge Function (server.ts)
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          checkoutSignature,
          checkoutTimestamp,
          trxId,
          verifyMethod: 'trx_id',
          userId: linkData.user_id,
          provider: selectedGateway.provider
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
         window.location.href = data.success_url || data.delivery?.url || data.redirect_link || '/access/' + invoiceId;
      } else {
         setVerifyError(data.message || "Invalid TrxID or amount mismatch. Please try again.");
      }

    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed');
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
          gateway_number: selectedGateway.activeNumber || selectedGateway.activeNumber || selectedGateway.number,
          gateway_used: selectedGateway.provider,
          sender_number: senderNumber,
          status: 'Pending'
        })
        .eq('id', invoiceId);
      if (error) throw error;

      setStep(5);
      setTimeLeft(600);
    } finally {
      setIsVerifying(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let proofUrl = null;
      if (reportProof) {
        const fileExt = reportProof.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `fraud-proofs/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, reportProof);
          
        if (uploadData) {
          const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
          proofUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from('fraud_reports').insert({
        payment_link_id: linkData?.id,
        invoice_id: invoiceId || null,
        user_id: linkData?.user_id,
        reason: reportReason,
        proof_url: proofUrl,
        status: 'Open'
      });
      setReportSubmitted(true);
      setReportProof(null);
      setTimeout(() => setShowReport(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && step === 1 && !linkData) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error) {
    const isNotFound = error === 'not_found' || error.toLowerCase().includes('not found') || error.toLowerCase().includes('invalid') || error.toLowerCase().includes('coerce');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isNotFound ? 'Invalid Payment Link' : 'Unable to Load Payment'}
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {isNotFound
              ? 'This product or payment link does not exist, has expired, or the URL address is incorrect.'
              : error}
          </p>
          <a
            href={clientHomeUrl}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm w-full"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const customFields = linkData?.custom_fields || [
    { name: 'Name', type: 'text', required: true },
    { name: 'Phone', type: 'tel', required: true }
  ];

  const providerKey = selectedGateway?.provider?.toLowerCase() || '';
  const gConfig = getGatewayConfig(providerKey);
  const logoUrl = LOGOS[providerKey as keyof typeof LOGOS] || '';
  const personalMfsProviderIds = new Set(['bkash', 'nagad', 'rocket', 'upay', 'tap', 'mcash', 'cellfin', 'pathao_pay', 'ok_wallet', 'islamic_wallet']);
  const isPersonalMfsCheckout = gateways.length > 0 && gateways.every(gw => personalMfsProviderIds.has(String(gw.provider || '').toLowerCase()));
  const gatewayGridColumns = isPersonalMfsCheckout && gateways.length > 4 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <LocaleSwitcher compact className="w-full max-w-none mx-auto px-4 pt-3 justify-center" />
      <div className="max-w-md w-full mx-auto p-4 pt-8 pb-20 relative">
        
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
            <h2 className="text-xl font-bold text-[#00E5FF]">{brandData?.name || 'MecoPay Checkout'}</h2>
          </div>
        )}

        {/* Main Card */}
        <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative ${step >= 4 ? ' flex flex-col' : ''}`}>
          
          {/* Default Header for steps 1-3 */}
          {step < 4 && (
            <div className="bg-[#0066FF] p-6 text-white flex items-center gap-4">
              <img src={linkData?.product_image || "https://i.postimg.cc/qqKpCcqV/BCO-3cfd8d70-7be6-4f9d-bcbe-c113f06c17da.png"} alt={linkData?.product_name || 'Product'} className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight mb-1 truncate" title={linkData?.product_name || linkData?.title || 'Payment'}>{linkData?.product_name || linkData?.title || 'Payment'}</h3>
                <div className="text-white font-bold text-xl flex flex-col items-start">
                  <div>{formatCurrency(checkoutAmounts.total)}</div>
                  {checkoutAmounts.fee > 0 && (
                    <div className="text-[10px] text-white/90 font-normal">
                      Includes {formatCurrency(checkoutAmounts.fee)} fee
                    </div>
                  )}
                </div>
                <div className="text-sm mt-1 text-white truncate">Pay to <span className="text-[#00E5FF] font-bold">{brandData?.name}</span></div>
              </div>
            </div>
          )}

          {/* Gateway Specific Header for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <>
  
            <div className={`${gConfig.headerBg} ${gConfig.headerText} p-6 border-b border-black/5`}>
              
              
              <div className="flex flex-col items-center mb-6">
                 
                 {providerKey === 'nagad' ? (
                   <div className="mb-4 mt-2">
                     <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="mb-2">
                       {/* Floating squares */}
                       <rect x="22" y="60" width="3" height="3" fill="#C4C4C4" transform="rotate(15 22 60)"/>
                       <rect x="28" y="70" width="2.5" height="2.5" fill="#C4C4C4" transform="rotate(45 28 70)"/>
                       <rect x="25" y="80" width="3.5" height="3.5" stroke="#C4C4C4" strokeWidth="1" transform="rotate(30 25 80)"/>
                       <rect x="18" y="68" width="2" height="2" fill="#C4C4C4" transform="rotate(20 18 68)"/>
                       
                       <rect x="80" y="55" width="3" height="3" stroke="#C4C4C4" strokeWidth="1" transform="rotate(15 80 55)"/>
                       <rect x="85" y="65" width="2.5" height="2.5" fill="#C4C4C4" transform="rotate(40 85 65)"/>
                       <rect x="75" y="72" width="4" height="4" stroke="#C4C4C4" strokeWidth="1" transform="rotate(10 75 72)"/>

                       {/* Left Bag */}
                       <path d="M42 35 L58 35 L55 65 L39 65 Z" fill="#C4C4C4" />
                       <path d="M46 35 C46 28 54 28 54 35" stroke="#C4C4C4" strokeWidth="2" fill="none" />
                       
                       {/* Right Bag (tilted) */}
                       <path d="M52 38 L72 42 L65 70 L45 66 Z" fill="#D1D1D1" />
                       <path d="M58 39 C62 30 72 32 68 41" stroke="#D1D1D1" strokeWidth="2" fill="none" />

                       {/* Cart frame */}
                       <path d="M28 28 L38 28 L42 45 L35 75 L75 75 L85 45" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                       
                       {/* Cart horizontal bars */}
                       <path d="M41 48 L84 48 M39 57 L81 57 M37 66 L78 66" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
                       
                       {/* Wheels */}
                       <circle cx="42" cy="85" r="4" stroke="#E5E5E5" strokeWidth="2" fill="none" />
                       <circle cx="68" cy="85" r="4" stroke="#E5E5E5" strokeWidth="2" fill="none" />
                     </svg>
                   </div>
                 ) : providerKey === 'upay' ? (
                   <div className="relative w-full flex justify-center mb-6 pt-6 pb-2 overflow-visible">
                     <div className="relative flex items-center justify-center w-[90px] h-[90px] bg-white rounded-full shadow-sm">
                       <img src={logoUrl} alt={selectedGateway.provider} className="relative z-10 w-[75px] h-[75px] object-contain p-1" />
                     </div>
                   </div>
                 ) : (
                   <img src={logoUrl} alt={selectedGateway.provider} className={`h-12 object-contain mb-4 ${providerKey === 'mcash' || providerKey === 'cellfin' || providerKey === 'islamic_wallet' ? 'rounded-lg' : ''}`} />
                 )}
                 <div className="w-full px-4 overflow-hidden">
                   <h2 className="text-lg font-bold text-center tracking-wide truncate" title={linkData?.product_name || brandData?.name}>{linkData?.product_name || brandData?.name}</h2>
                 </div>
                 {providerKey === 'bkash' && (
                   <p className="text-xs opacity-60 flex items-center gap-2 mt-1">Inv No: {invoiceId || 'b51bfea0...'} 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-slate-800 transition-colors flex items-center justify-center p-1">
                        {copied === 'invoice' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div> : <Copy className="w-4 h-4" />}
                      </button>
                    </p>
                 )}
                 {providerKey === 'nagad' && (
                   <p className="text-xs opacity-80 flex items-center gap-2 mt-1 font-mono">Invoice No: {invoiceId.substring(0, 15)}... 
                      <button onClick={() => copyToClipboard(invoiceId, 'invoice')} className="hover:text-white transition-colors flex items-center justify-center p-1">
                        {copied === 'invoice' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div> : <Copy className="w-4 h-4" />}
                      </button>
                    </p>
                 )}
              </div>

              {providerKey === 'nagad' && (
                <div className="border border-white/30 rounded-lg p-4 flex justify-between items-center mb-2">
                  <div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Amount:</div>
                    <div className="text-2xl font-bold">{currencyCode} {checkoutAmounts.total}</div>
                  </div>
                  <button onClick={() => copyToClipboard(checkoutAmounts.total?.toString() || '', 'amount')} className="bg-white text-[#ED1C24] p-2.5 rounded-full transition-transform hover:scale-105">
                    {copied === 'amount' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}
              {providerKey === 'nagad' && (
                <div className="text-sm font-bold opacity-90">Charge: <span className="font-normal">{currencyCode} 0</span></div>
              )}
              
              {providerKey !== 'nagad' && (
                 <div className={`${providerKey === 'upay' ? 'bg-white text-slate-800 rounded-2xl py-4 px-6 text-center shadow-sm' : 'flex justify-between items-center border-t border-black/10 pt-4'}`}>
                    {providerKey === 'upay' ? (
                       <div className="text-lg font-bold flex items-center justify-center gap-2">Amount: <span className="font-black">{currencyCode} {checkoutAmounts.total}</span>
    <button onClick={() => copyToClipboard(checkoutAmounts.total?.toString() || '', 'amount')} className="text-slate-500 hover:text-[#0033A0] transition-colors">
      {copied === 'amount' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}
    </button>
  </div>
                    ) : (
                       <div className="text-xl font-bold flex items-center gap-2">{formatCurrency(checkoutAmounts.total)}
    <button onClick={() => copyToClipboard(checkoutAmounts.total?.toString() || '', 'amount')} className="text-slate-500 hover:text-slate-800 transition-colors">
      {copied === 'amount' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}
    </button>
  </div>
                    )}
                 </div>
              )}
            </div>
            </>
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
                        placeholder={`Enter ${field.name}`} 
                      />
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
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
                    <button onClick={() => {
                      if (invoiceId) supabase.from('invoices').update({ status: 'Returned to Form (from Gateway)' }).eq('id', invoiceId).then();
                      setStep(1);
                    }} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                  </div>
                  
                  {gateways.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
                      This brand has not configured any payment methods yet.
                    </div>
                  ) : (
                    <div className={`grid ${gatewayGridColumns} gap-3`}>
                      {gateways.map(gw => {
                        let gwLogo = LOGOS[gw.provider.toLowerCase() as keyof typeof LOGOS] || '';
                        return (
                          <button 
                            key={gw.id} 
                            onClick={() => handleSelectGateway(gw)}
                            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md flex flex-col items-center justify-center gap-2 transition-all h-24 group"
                          >
                            {gwLogo ? (
                              <img src={gwLogo} alt={gw.provider} className={`h-12 object-contain group-hover:scale-105 transition-transform ${gw.provider.toLowerCase() === 'mcash' || gw.provider.toLowerCase() === 'cellfin' || gw.provider.toLowerCase() === 'islamic_wallet' ? 'rounded-lg' : ''}`} />
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
                    <button type="button" onClick={() => {
                      if (invoiceId) supabase.from('invoices').update({ status: 'Returned to Gateway (from Verification)' }).eq('id', invoiceId).then();
                      setStep(2);
                    }} className="text-sm font-medium text-slate-500 hover:text-slate-700">Back</button>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-inner">
                    {(brandData?.redirect_links?.verify_phone ?? false) && (
                      <button 
                        onClick={() => { setVerifyMethod('live'); setStep(4); }}
                        className="w-full text-left bg-white hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl p-5 transition-all relative overflow-hidden group shadow-sm mb-2"
                      >
                        <div className="absolute top-0 right-0 bg-[#00E5FF] text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">RECOMMENDED</div>
                        <div className="flex items-center gap-4 mb-2 mt-1">
                          <div className="bg-blue-600 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-md shrink-0">
                            <RefreshCw className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800 text-xl tracking-tight">Live Auto-Verification</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mt-3">
                          {language === 'en'
                             ? 'Select this method, enter your sender number on the next page and confirm. A 10-min live session will start, send money within this time to auto-verify.' 
                             : checkoutCopy(language, 'liveInstruction')}
                        </p>
                      </button>
                    )}

                    {(brandData?.redirect_links?.verify_phone ?? false) && (brandData?.redirect_links?.verify_trx_id ?? true) && (
                      <div className="h-px bg-slate-200 mx-4 my-1"></div>
                    )}

                    {(brandData?.redirect_links?.verify_trx_id ?? true) && (
                      <button 
                        onClick={() => { setVerifyMethod('trxid'); setStep(4); }}
                        className="w-full text-left bg-white hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-xl p-5 transition-all shadow-sm group mt-2"
                      >
                        <div className="flex items-center gap-4 mb-2">
                          <div className="bg-slate-700 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-md shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800 text-xl tracking-tight">TrxID Auto-Verification</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mt-3">
                          {language === 'en'
                             ? 'Cash In from a shop or ask someone else to Send Money. Then auto-verify using the Transaction ID (TrxID).' 
                             : checkoutCopy(language, 'trxInstruction')}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gateway Specific Body for Steps 4 & 5 */}
          {step >= 4 && step < 6 && (
            <div className={`flex-1 ${gConfig.bodyBg} ${gConfig.bodyText} flex flex-col relative`}>
              
              

              {/* STEP 4: Live Input OR TrxID Input */}
              {step === 4 && selectedGateway && (
                <div className={`p-6 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 ${gConfig.bodyBg} ${gConfig.bodyText}`}>
                  {verifyMethod === 'live' ? (
                    // LIVE - ENTER SENDER NUMBER
                    <div className="text-center w-full max-w-xs mx-auto">
                      <h4 className="font-bold text-lg mb-6">
                        {providerKey === 'upay' ? 'Enter Your upay Account Number' : `Your ${selectedGateway.provider} Account Number`}
                      </h4>
                      <input 
                        type="tel" 
                        value={senderNumber}
                        onChange={e => setSenderNumber(e.target.value)}
                        className={`w-full bg-white rounded-lg px-4 py-3.5 font-bold text-center text-lg ${gConfig.inputColor} outline-none border-2 border-transparent focus:border-black/20 shadow-inner mb-6`}
                        placeholder="e.g 01XXXXXXXXX"
                      />
                      <p className="text-sm font-medium opacity-90 mb-8 px-2 leading-relaxed">
                        {language === 'en'
                          ? `Enter your number and click '${providerKey === 'nagad' ? 'Proceed' : 'Confirm'}'.`
                          : checkoutCopy(language, 'enterNumberInstruction', { action: providerKey === 'nagad' ? 'Proceed' : 'Confirm' })}
                      </p>
                    </div>
                  ) : (
                    // TRXID - INSTRUCTIONS & ENTER TRXID
                    <div className="w-full">
                      {verifyMethod === 'offline' && (
                         <div className="bg-black/20 border border-white/20 rounded-xl p-4 mb-6 text-center animate-in fade-in">
                           <div className="inline-flex items-center justify-center gap-2 text-yellow-300 font-bold mb-1">
                             <AlertTriangle className="w-5 h-5" /> 
                             {language === 'en' ? 'Merchant Device Offline' : checkoutCopy(language, 'offlineTitle')}
                           </div>
                           <p className="text-white/90 text-sm font-medium">
                             {language === 'en' ? 'Auto-verification is temporarily unavailable.' : checkoutCopy(language, 'offlineDescription')}
                           </p>
                         </div>
                      )}
                      
                      {providerKey === 'upay' ? (
                         <div className="bg-black/10 rounded-xl p-4 mb-6 flex justify-between items-center border border-black/10">
                            <div>
                              <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Personal Number</div>
                              <div className="text-2xl font-bold">{selectedGateway.activeNumber || selectedGateway.number}</div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => copyToClipboard(selectedGateway.activeNumber || selectedGateway.number, 'number')} className="bg-white p-2.5 rounded-full shadow-sm text-[#0033A0] transition-transform hover:scale-105">{copied === 'number' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}</button>
                               <button className="bg-white/50 p-2.5 rounded-full hover:bg-white text-[#0033A0] transition-colors"><QrCode className="w-4 h-4" /></button>
                            </div>
                         </div>
                      ) : (
                         <div className="border border-white/30 rounded-xl p-4 mb-6 flex justify-between items-center bg-black/5">
                            <div>
                              <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Personal Number</div>
                              <div className="text-2xl font-bold tracking-wider">{selectedGateway.activeNumber || selectedGateway.number}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => copyToClipboard(selectedGateway.activeNumber || selectedGateway.number, 'number')} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                                {copied === 'number' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}
                              </button>
                            </div>
                         </div>
                      )}

                      <div className="space-y-3 text-sm mb-8 font-medium">
                        {verifyMethod === 'offline' ? (
                          language === 'en' ? (
                            <>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">1</span> Copy the Personal Account number above.</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">2</span> Please Send Money, Cash In, or ask someone else to send money to this number.</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">3</span> Enter the TrxID below. When the merchant comes online, you will be notified via email to verify, or you can contact the merchant directly.</p>
                            </>
                          ) : (
                            <>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">1</span> {checkoutCopy(language, 'copyPersonal')}</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">2</span> {checkoutCopy(language, 'sendMoneyOffline')}</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">3</span> {checkoutCopy(language, 'trxOffline')}</p>
                            </>
                          )
                        ) : (
                          language === 'en' ? (
                            <>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">1</span> Copy the Personal Account number above.</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">2</span> {providerKey === 'nagad' ? 'Cash In is not allowed in Nagad, so please Send Money from another account.' : 'Before Cash In, ask the shopkeeper if they will provide the TrxID. Otherwise, ask someone to Send Money.'}</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">3</span> Wait 10-15 seconds after payment, then enter TrxID below to verify. You can close this page and return to this payment page anytime within 24 hours to auto-verify using your TrxID.</p>
                            </>
                          ) : (
                            <>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">1</span> {checkoutCopy(language, 'copyPersonal')}</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">2</span> {checkoutCopy(language, providerKey === 'nagad' ? 'cashinNagad' : 'cashinOther')}</p>
                              <p className="flex gap-2"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 border border-white/50 shadow-sm">3</span> {checkoutCopy(language, 'waitTrx')}</p>
                            </>
                          )
                        )}
                      </div>
                      <div className="text-center font-bold mb-4 text-lg mt-8 text-inherit">Enter Transaction ID</div>
                      <input 
                        required 
                        type="text" 
                        value={trxId} 
                        onChange={e => {
                          setTrxId(e.target.value);
                          if (verifyError) setVerifyError('');
                        }} 
                        className={`w-full bg-white px-4 py-3.5 font-bold text-center text-lg ${gConfig.inputColor} outline-none uppercase rounded-lg shadow-inner ${verifyError ? 'mb-1 border-2 border-red-500' : 'mb-2'}`} 
                        placeholder="e.g 9FX4K..." 
                      />
                      {verifyError && (
                        <div className="bg-red-50 text-red-600 font-bold text-center text-sm p-3 rounded-lg mb-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                          {verifyError}
                        </div>
                      )}
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
                          <div className="text-2xl font-bold">{selectedGateway.activeNumber || selectedGateway.number}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => copyToClipboard(selectedGateway.activeNumber || selectedGateway.number, 'number')} className="bg-white p-2.5 rounded-full shadow-sm text-[#0033A0] transition-transform hover:scale-105">{copied === 'number' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}</button>
                           <button className="bg-[#0033A0] p-2.5 rounded-full shadow-sm text-white transition-transform hover:scale-105"><QrCode className="w-4 h-4" /></button>
                        </div>
                     </div>
                  ) : (
                     <div className="border border-white/30 rounded-xl p-4 mb-6 flex justify-between items-center bg-black/5">
                        <div>
                          <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Personal Number</div>
                          <div className="text-2xl font-bold tracking-wider">{selectedGateway.activeNumber || selectedGateway.number}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => copyToClipboard(selectedGateway.activeNumber || selectedGateway.number, 'number')} className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                             {copied === 'number' ? <div className="bg-[#00FF00] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div> : <Copy className="w-5 h-5" />}
                           </button>
                           <button className="bg-white/20 p-2.5 rounded-full hover:bg-white/30 transition-colors">
                             <QrCode className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  )}

                  <div className="space-y-3 text-sm mb-8 font-medium">
                     {language === 'en' ? (
    <>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">1</span> <span>Copy the Personal Account number above.</span></p>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">2</span> <span>Go to {selectedGateway.provider} app or dial {providerKey === 'bkash' ? '*247#' : providerKey === 'nagad' ? '*167#' : providerKey === 'rocket' ? '*322#' : '*268#'} and select 'Send Money'.</span></p>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">3</span> <span>Enter the copied number, amount, and confirm with your PIN to auto-verify.</span></p>
    </>
  ) : (
    <>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">1</span> <span>{checkoutCopy(language, 'copyPersonal')}</span></p>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">2</span> <span>{checkoutCopy(language, 'goApp', { provider: selectedGateway.provider, dialCode: providerKey === 'bkash' ? '*247#' : providerKey === 'nagad' ? '*167#' : providerKey === 'rocket' ? '*322#' : '*268#' })}</span></p>
      <p className="flex gap-2 items-start"><span className="bg-white/20 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0 mt-0.5 border border-white/50 shadow-sm">3</span> <span>{checkoutCopy(language, 'confirmAuto')}</span></p>
    </>
  )}
                     <div className="mx-6 my-4 border-2 border-white/20 rounded-xl overflow-hidden bg-white flex justify-center items-center py-4 relative shadow-inner">
                        {/* Arrow SVG pointing to Send Money */}
                        <div className={`absolute top-1.5 left-[15%] w-14 h-14 z-10 pointer-events-none animate-bounce`}>
                           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                             <path d="M80 10 C 60 10, 30 30, 20 60" stroke={providerKey === 'nagad' ? '#ef4123' : providerKey === 'upay' ? '#0033A0' : providerKey === 'rocket' ? '#8C3494' : '#E2136E'} strokeWidth="6" strokeLinecap="round" fill="none" />
                             <path d="M10 50 L 20 65 L 35 55" stroke={providerKey === 'nagad' ? '#ef4123' : providerKey === 'upay' ? '#0033A0' : providerKey === 'rocket' ? '#8C3494' : '#E2136E'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                           </svg>
                        </div>
                           
                        <div className="flex justify-center w-full relative z-0">
                          {providerKey === 'bkash' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1Tw9dfxPctZwX9LOuFg5yExUqViag8F1Ph7QATUh7OVDemgQACfCcSgXsvLGyYaD3aDycv5bT3yWdpS5aZCo8fDdeh-aNMyHrqG7TU1-rpttKI_WbvTtJ_UJrYn7BY-u8ElhiRYc2fdfv6vVZpouNh8UMJcoCmqMKlUtr9EQoPqnK3z-3aQDnXXr2jK9h/s572/shapeshifter-rounded-Bkash.png" alt="bKash Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'nagad' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUwbf9HFJVC2zmZUWg4OkhkUHgfXepJougWsb2dtJ4h4HkrT7MUTNw3v-OqKDS9lc3FlhS5dGY0_hKMwPMnfQSXz548WsG4TmokqNQc-dqtufGxtNshrQhyLyVQjP7WmA9OArl3w3vlyqiXPb2g7UhjPdq4FUEpjCTUN7BCEyG714wZSOE5BaDAtSxi8TG/s515/shapeshifter-rounded-Nagad.png" alt="Nagad Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'upay' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGvC7gqmh8fZC-AksD6OfmPVcODE8xNB4-tKsBQrV-dUuVt8g0A4bhmGtlWSr4gkqbnxhm0tWFHY06jt4qJbiC1JxhMly97t60riM9mzyzjHAF9DuFHjqY5KCv82RDGWppwtFoK4PjMi47J-xtcVU7EinturN3AQgl8hFS0_yxQU-0h0F8c_j7HkKRumPd/s528/shapeshifter-rounded-Upay.png" alt="Upay Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                          {providerKey === 'rocket' && <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8M0ggnW_3Z62G5tW8MSN12VhY4d4nqDkiQn9VHFTaA2fQD61oUcE05P9AniTyt0M0NGu69emxqFDYTDhUBuutxemodtdobgHATs8O3WwcU12unz5ddlWa2Exef-8k1BATADHwQImR2z4nvh7cfrwZ7MEhxGebCS3htoCH5HoGuNTgOO37yDhY1d5URFY1/s523/shapeshifter-rounded-Rocket.png" alt="Rocket Instructions" className="w-full max-w-[280px] h-auto object-contain" referrerPolicy="no-referrer" />}
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-2 font-bold text-lg">
                       <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                       Waiting for payment...
                    </div>
                    <div className="text-sm font-bold opacity-90 mb-4">Session expires in {formatTime(timeLeft)}</div>
                    <div className="inline-flex items-center gap-3 bg-white/20 px-4 py-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-white/20 mb-4 animate-in fade-in zoom-in duration-500 text-left">
                      <div className="bg-white/20 p-1.5 rounded-full">
                         <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs text-white leading-tight">
                        <span className="block font-extrabold text-[13px] mb-0.5">{checkoutCopy(language, 'dontClose')}</span>
                        <span className="opacity-90">{checkoutCopy(language, 'autoVerify')}</span>
                      </div>
                    </div>
                    
                    
                  </div>
                </div>
              )}

              {/* Gateway Footer Actions (Step 4 & 5) */}
              <div className={`mt-auto p-4 flex gap-4 ${providerKey === 'upay' ? 'border-t border-black/10' : ''} ${providerKey === 'nagad' ? 'flex-row-reverse' : ''}`}>
                 {step === 4 ? (
                    verifyMethod === 'live' ? (
                      <>
                        <button onClick={handleCancelPayment} className={`flex-1 py-3.5 rounded-lg font-bold ${gConfig.btnSecondary}`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleLiveSubmit} disabled={isVerifying || senderNumber.length < 11} className={`flex-1 py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 ${gConfig.btnPrimary} ${senderNumber.length < 11 ? 'opacity-50' : ''}`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (providerKey === 'nagad' ? 'Proceed' : 'Confirm')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleCancelPayment} className={`flex-1 py-3.5 rounded-lg font-bold ${gConfig.btnSecondary} opacity-80`}>
                           {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                        </button>
                        <button onClick={handleManualVerify} disabled={isVerifying || trxId.length < 5} className={`flex-[2] py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 ${gConfig.btnPrimary} ${trxId.length < 5 ? 'opacity-50' : ''}`}>
                           {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'VERIFY TRANSACTION'}
                        </button>
                      </>
                    )
                 ) : step === 5 ? (
                    <>
                      <button onClick={() => {
                        if (invoiceId) supabase.from('invoices').update({ status: 'Cancelled - Returned to Gateway' }).eq('id', invoiceId).then();
                        setStep(4);
                      }} className={`flex-1 py-3.5 rounded-lg font-bold ${gConfig.btnSecondary}`}>
                         {providerKey === 'nagad' ? 'Close' : 'Cancel'}
                      </button>
                      <button disabled className={`flex-1 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 ${gConfig.btnPrimary} opacity-50`}>
                         <RefreshCw className="w-5 h-5 animate-spin" /> 
                         {providerKey === 'upay' ? "I've Paid - Check" : 'Auto verifying...'}
                      </button>
                    </>
                 ) : null}
              </div>
              
              {/* Cut Invoice Link - Bottom Center */}
              <div className="py-4 flex justify-center border-t border-black/5 bg-black/5">
                <button 
                  onClick={async () => {
                     if (invoiceId) {
                       await supabase.from('invoices').update({ status: 'Cut Invoice' }).eq('id', invoiceId);
                     }
                     setStep(1);
                     window.location.reload();
                  }}
                  className="w-fit px-6 py-2.5 rounded-full flex justify-center items-center bg-sky-400 hover:bg-sky-500 border-sky-500 transition-all shadow-md group"
                >
                  <div className="text-sm font-bold text-red-700 flex items-center gap-2 group-hover:scale-105 transition-transform">
                    <AlertTriangle className="w-4 h-4 text-red-700" /> 
                    {language === 'en' ? "Cut Invoice" : "Cut Invoice"}
                  </div>
                </button>
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
                   <img src={logoUrl} alt="Nagad" className="h-8 brightness-0 invert opacity-90" />
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 6 && (
            <div className="text-center py-12 px-6 animate-in zoom-in-95 duration-500 flex-1 flex flex-col justify-center">
              <div className="w-24 h-24 bg-[#00FF00]/20 text-[#00B300] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Submitted!</h2>
              {verifyMethod === 'offline' ? (
                <p className="text-slate-500 mb-10 text-lg">
                  {language === 'en'
                    ? <><span className="font-medium text-slate-800">{formData.Name || formData.name || 'Customer'}</span>, your transaction has been recorded. The merchant is currently offline. You will be notified via email once they come back online and verify your payment.</>
                    : <span>{checkoutCopy(language, 'successOffline', { name: formData.Name || formData.name || 'Customer' })}</span>}
                </p>
              ) : (
                <p className="text-slate-500 mb-10 text-lg">
                  {language === 'en'
                    ? <>Thank you, <span className="font-medium text-slate-800">{formData.Name || formData.name || 'Customer'}</span>. Your payment of {formatCurrency(linkData.price)} via {selectedGateway?.provider} has been received and is being verified.</>
                    : <span>{checkoutCopy(language, 'successOnline', { name: formData.Name || formData.name || 'Customer', amount: formatCurrency(linkData.price), provider: selectedGateway?.provider || '' })}</span>}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {linkData?.success_url ? (
                  <a 
                    href={linkData.success_url}
                    className="bg-[#00FF00] hover:bg-[#00E600] text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-center flex-1"
                  >
                    {language === 'en' ? 'Return to Store →' : 'স্টোরে ফিরে যান →'}
                  </a>
                ) : null}
                <Link 
                  to={`/access/${invoiceId}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-center flex-1"
                >
                  {language === 'en' ? 'View Invoice & Status' : 'ইনভয়েস ও স্ট্যাটাস দেখুন'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Features (Secured & Report) */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-in fade-in">
          <Link to="/anti-fraud" target="_blank" className="flex items-center justify-center text-[#00B300] gap-2 text-sm font-bold bg-emerald-50 hover:bg-emerald-100 transition-colors px-5 py-2.5 rounded-full border border-emerald-200 shadow-sm cursor-pointer">
            <ShieldCheck className="w-5 h-5" /> Secured by <span className="font-black tracking-wide text-[#00B300]">MecoPay</span></Link>
          <button onClick={() => setShowReport(true)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full border border-red-200 shadow-sm">
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
                <div className="w-16 h-16 bg-[#00FF00]/20 text-[#00B300] rounded-full flex items-center justify-center mx-auto mb-4">
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
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none resize-none h-32 mb-4 font-medium text-slate-800 transition-all"
                  placeholder="Explain what happened..."
                />
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Attach Screenshot (Proof)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReportProof(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center relative z-0">
                      {reportProof ? (
                        <>
                           <div className="w-10 h-10 bg-[#00FF00]/20 rounded-full flex items-center justify-center text-[#00B300] mb-2">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <span className="text-sm font-bold text-[#00B300]">{reportProof.name}</span>
                           <span className="text-xs text-slate-500 mt-1">Tap to change file</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          </div>
                          <span className="text-sm font-medium text-slate-600">Click to upload screenshot</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-md shadow-red-500/20 transition-colors">Submit Report</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <p className="font-medium text-sm">{toast.msg}</p>
        </div>
      )}
</div>
  );
}
