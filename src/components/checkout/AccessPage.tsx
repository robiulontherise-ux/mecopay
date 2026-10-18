import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, ShieldCheck, ExternalLink, Loader2, Info, Send, Copy, Check, Lock, Package, Truck, MapPin, Phone, Mail, FileText, ArrowRight, Printer } from 'lucide-react';
import LocaleSwitcher from '../LocaleSwitcher';

export default function AccessPage() {
  const { invoiceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delivery Data State
  const [brandInfo, setBrandInfo] = useState<{ name: string; logo_url: string | null }>({
    name: 'Verified Merchant',
    logo_url: null
  });
  const [deliveryType, setDeliveryType] = useState<'telegram' | 'tally' | 'general' | 'physical'>('general');
  const [telegramInviteLink, setTelegramInviteLink] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [productTitle, setProductTitle] = useState('Digital Access');
  const [customerName, setCustomerName] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    async function processAccess() {
      if (!invoiceId) {
        setError('Invalid access link.');
        setLoading(false);
        return;
      }

      try {
        // Fetch invoice details along with brand and payment_link
        const { data: invoice, error: invError } = await supabase
          .from('invoices')
          .select(`
            *,
            payment_links(product_name, redirect_link, brand_id, product_type)
          `)
          .eq('id', invoiceId)
          .single();

        if (invError || !invoice) {
          throw new Error('Transaction not found or invalid.');
        }

        if (invoice.status === 'Cancelled' || invoice.status === 'Failed') {
          throw new Error('This order or transaction has been cancelled.');
        }

        if (invoice.customer_name) {
          setCustomerName(invoice.customer_name);
        }

        // Fetch brand details for logo and brand name
        const brandId = invoice.brand_id || (Array.isArray(invoice.payment_links) ? invoice.payment_links[0]?.brand_id : (invoice.payment_links as any)?.brand_id);
        if (brandId) {
          const { data: brand } = await supabase
            .from('brands')
            .select('name, logo_url')
            .eq('id', brandId)
            .single();

          if (brand) {
            setBrandInfo({
              name: brand.name || 'Verified Merchant',
              logo_url: brand.logo_url || null
            });
          }
        }

        // Determine destination link
        const targetLink = invoice.redirect_link || (Array.isArray(invoice.payment_links) ? invoice.payment_links[0]?.redirect_link : (invoice.payment_links as any)?.redirect_link);

        const pName = (Array.isArray(invoice.payment_links) ? invoice.payment_links[0]?.product_name : (invoice.payment_links as any)?.product_name) || invoice.product_name || 'Order Package';
        setProductTitle(pName);

        if (!targetLink) {
          // Physical Order / COD / Advance or no digital download link -> Show Order Confirmation & Parcel Tracking Hub
          setDeliveryType('physical');
          setOrderData(invoice);
          setSuccess(true);
        } else {
          let cleanLink = targetLink.trim();
          if (!cleanLink.startsWith('http')) {
            cleanLink = 'https://' + cleanLink;
          }

          // Detect platform type: Telegram or Tally
          const isTelegram = cleanLink.includes('t.me/') || cleanLink.toLowerCase().includes('telegram');
          const isTally = cleanLink.includes('tally.so/');

          if (isTelegram) {
            setDeliveryType('telegram');
            let dynamicInvite = cleanLink;
            try {
              const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke('telegram-tally-delivery', {
                body: { action: 'get_secure_delivery', invoice_id: invoiceId }
              });

              if (!edgeErr && edgeRes?.delivery?.one_time_invite_link) {
                dynamicInvite = edgeRes.delivery.one_time_invite_link;
              }
            } catch (e) {
              console.warn('Direct edge invite generation not configured, using direct channel invite link:', e);
            }

            setTelegramInviteLink(dynamicInvite);
            setSuccess(true);
          } else if (isTally) {
            setDeliveryType('tally');
            const separator = cleanLink.includes('?') ? '&' : '?';
            const maskedIframeUrl = `${cleanLink}${separator}name=${encodeURIComponent(invoice.customer_name || '')}&phone=${encodeURIComponent(invoice.customer_phone || '')}&invoice=${encodeURIComponent(invoice.invoice_number || '')}&transparentBackground=1`;

            setContentUrl(maskedIframeUrl);
            setSuccess(true);
          } else {
            setDeliveryType('general');
            setContentUrl(cleanLink);
            setSuccess(true);
          }
        }

        // Mark as accessed in background
        await supabase
          .from('invoices')
          .update({ is_accessed: true })
          .eq('id', invoiceId);

      } catch (err: any) {
        setError(err.message || 'An error occurred while preparing your access.');
      } finally {
        setLoading(false);
      }
    }

    processAccess();
  }, [invoiceId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // CASE 1: TELEGRAM DELIVERY (VIP Card with One-Time Invite)
  // ==========================================
  if (success && deliveryType === 'telegram') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 text-white selection:bg-blue-500 selection:text-white">
        <LocaleSwitcher className="w-full max-w-xl justify-end" />
        {/* Brand Header */}
        <header className="w-full max-w-xl flex items-center justify-between py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {brandInfo.logo_url ? (
              <img 
                src={brandInfo.logo_url} 
                alt={brandInfo.name} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                {brandInfo.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">{brandInfo.name}</h1>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Access Channel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>MecoPay Protected</span>
          </div>
        </header>

        {/* Telegram Access Box */}
        <main className="w-full max-w-xl my-auto py-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/20 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5 shadow-inner">
                <Send className="w-8 h-8 text-sky-400 translate-x-[-1px] translate-y-[1px]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Payment Verified
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Join Private Telegram Community
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                {customerName ? `Hi ${customerName}, your` : 'Your'} access for <span className="text-slate-200 font-medium">{productTitle}</span> is ready. Click below to join via your single-use link.
              </p>

              {/* Action Button */}
              <a
                href={telegramInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] transition-all text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 text-sm sm:text-base cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Join Telegram Channel Now
              </a>

              {/* Copy Fallback */}
              <div className="mt-5 w-full pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <span className="truncate max-w-full">Single-use invite (1 member limit)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(telegramInviteLink)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-xl py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
          Powered by MecoPay Dual-Gateway Infrastructure
        </footer>
      </div>
    );
  }

  // ==========================================
  // CASE 2: TALLY DELIVERY (Masked In-Page Iframe with Brand Header)
  // ==========================================
  if (success && deliveryType === 'tally' && contentUrl) {
    return (
      <div className="w-full h-screen flex flex-col bg-slate-950 overflow-hidden">
        <LocaleSwitcher className="absolute top-2 right-4 z-20" />
        {/* Top Brand Header Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-10 shadow-md">
          <div className="flex items-center gap-3">
            {brandInfo.logo_url ? (
              <img 
                src={brandInfo.logo_url} 
                alt={brandInfo.name} 
                className="w-9 h-9 rounded-lg object-cover border border-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                {brandInfo.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-white leading-tight">{brandInfo.name}</div>
              <div className="text-[11px] text-slate-400 font-medium">Customer Onboarding & Requirement Form</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Session</span>
            </div>
            <a 
              href={contentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <span>Expand Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Secure Masked Iframe Container */}
        <div className="flex-1 w-full bg-slate-900 relative">
          <iframe 
            src={contentUrl} 
            className="absolute inset-0 w-full h-full border-0" 
            title="Secure Tally Onboarding"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 3: GENERAL FALLBACK IFRAME / LOADING / ERROR
  // ==========================================
  if (success && contentUrl) {
    return (
      <div className="w-full h-screen flex flex-col bg-slate-950 overflow-hidden">
        <LocaleSwitcher className="absolute top-2 right-4 z-20" />
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-1.5 rounded-md">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{brandInfo.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">Secure Delivery Session</div>
            </div>
          </div>
          
          <a 
            href={contentUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 transition-colors text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5"
          >
            <span>Open in Browser</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        
        <div className="flex-1 w-full bg-slate-100 relative">
          <iframe 
            src={contentUrl} 
            className="absolute inset-0 w-full h-full border-0" 
            title="Secure Content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 4: PHYSICAL ORDER CONFIRMATION & LIVE COURIER TRACKING PORTAL
  // ==========================================
  if (success && deliveryType === 'physical' && orderData) {
    const cartItems = Array.isArray(orderData.customer_data?.cart_items) 
      ? orderData.customer_data.cart_items 
      : Array.isArray(orderData.cart_items) 
        ? orderData.cart_items 
        : [];

    const isConfirmed = orderData.status === 'Completed' || orderData.status === 'Confirmed' || orderData.status === 'Paid';
    const trackingCode = orderData.consignment_id || orderData.courier_tracking_id;
    const courierName = (orderData.courier_name || 'Steadfast').toUpperCase();

    let liveTrackingUrl = orderData.tracking_url || '';
    if (!liveTrackingUrl && trackingCode) {
      if (courierName.includes('STEADFAST')) {
        liveTrackingUrl = `https://steadfast.com.bd/t/${encodeURIComponent(trackingCode)}`;
      } else if (courierName.includes('PATHAO')) {
        liveTrackingUrl = 'https://pathao.com/courier/';
      } else {
        liveTrackingUrl = `https://steadfast.com.bd/t/${encodeURIComponent(trackingCode)}`;
      }
    }

    const totalAmt = Number(orderData.total_amount || orderData.amount || 0);
    const advanceAmt = Number(orderData.advance_amount || (orderData.total_amount ? orderData.amount : 0) || 0);
    const codDue = Math.max(0, totalAmt - advanceAmt);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 relative">
        <LocaleSwitcher className="absolute top-4 right-4 z-20" />
        
        {/* Main Card */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

          {/* Top Brand & Status */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {brandInfo.logo_url ? (
                <img src={brandInfo.logo_url} alt={brandInfo.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-lg">
                  {brandInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">{brandInfo.name}</h1>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified MecoPay Checkout</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isConfirmed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isConfirmed ? '✓ Order Confirmed' : '⏳ Verification Pending'}
              </span>
            </div>
          </div>

          {/* Invoice & Order ID Header */}
          <div className="mt-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Invoice Number</span>
              <strong className="text-white font-mono text-base">{orderData.invoice_number || orderData.id?.slice(0, 8)}</strong>
            </div>
            {orderData.trx_id && (
              <div>
                <span className="text-slate-400 text-xs block">Transaction ID (TrxID)</span>
                <strong className="text-emerald-400 font-mono">{orderData.trx_id}</strong>
              </div>
            )}
            <div>
              <span className="text-slate-400 text-xs block">Payment Channel</span>
              <span className="text-slate-200 font-medium">{orderData.payment_method || 'MFS / Online'}</span>
            </div>
          </div>

          {/* Courier Live Tracking Card */}
          <div className="mt-6 bg-gradient-to-br from-slate-800/80 to-slate-800/30 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {courierName} Delivery Tracking
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {trackingCode ? `Consignment / Tracking: ${trackingCode}` : 'Courier booking in progress'}
                  </p>
                </div>
              </div>

              {liveTrackingUrl ? (
                <a 
                  href={liveTrackingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <span>Track Parcel Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700">
                  Tracking Code Pending
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {trackingCode 
                  ? 'আপনার পার্সেল কুরিয়ারে সফলভাবে বুক করা হয়েছে। উপরে ক্লিক করে লাইভ লোকেশন দেখুন।'
                  : 'অর্ডারটি মার্চেন্টের কাছে সংরক্ষিত হয়েছে। কুরিয়ারে হস্তান্তর হওয়া মাত্রই ট্র্যাকিং কোড আপডেট হবে।'}
              </span>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ordered Items / কার্ট সামগ্রী</h4>
            <div className="bg-slate-800/30 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
              {cartItems.length > 0 ? (
                cartItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-white">{item.product_name || item.name || 'Product Item'}</div>
                      <div className="text-xs text-slate-400">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="font-semibold text-slate-200">
                      ৳{Number(item.total || item.price || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 flex items-center justify-between text-sm">
                  <div className="font-medium text-white">{productTitle}</div>
                  <div className="font-semibold text-slate-200">
                    ৳{totalAmt.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="mt-6 bg-slate-800/20 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Total Product Value</span>
              <span className="text-white font-medium">৳{totalAmt.toLocaleString()}</span>
            </div>
            {advanceAmt > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Advance Paid Online (MecoPay)</span>
                <span className="font-bold">✓ ৳{advanceAmt.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-bold text-white">
              <span>Cash on Delivery Due (কুরিয়ারে বকেয়া)</span>
              <span className="text-amber-400">৳{codDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address & Customer Details */}
          <div className="mt-6 bg-slate-800/30 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>ডেলিভারি ঠিকানা ও গ্রাহক তথ্য</span>
            </div>
            <div className="pl-6 space-y-1">
              <div><strong className="text-slate-400">Name:</strong> {orderData.customer_name || customerName || 'Customer'}</div>
              {orderData.customer_phone && <div><strong className="text-slate-400">Phone:</strong> {orderData.customer_phone}</div>}
              {(orderData.customer_address || orderData.customer_data?.shipping_address) && (
                <div><strong className="text-slate-400">Address:</strong> {orderData.customer_address || orderData.customer_data?.shipping_address}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Receipt</span>
            </button>
            {orderData.redirect_link && (
              <a 
                href={orderData.redirect_link}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm text-center shadow-lg shadow-emerald-900/30"
              >
                <span>Return to Store</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Footer Badge */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secured & Verified by MecoPay Smart Gateway</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <LocaleSwitcher className="absolute top-4 right-4" />
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Secure Access...</h2>
            <p className="text-slate-400 text-sm">Please do not refresh this page.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Access Notice</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {error}
            </p>
            <div className="text-xs text-slate-500 bg-slate-800/50 p-4 rounded-xl border border-slate-800/50 w-full text-left">
              <strong>Secure Link Policy:</strong><br />
              Digital delivery links are tied to verified invoices. If your payment was completed, you can access your product or community directly.
            </div>
          </div>
        ) : null}

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4" />
          Secured by MecoPay
        </div>
      </div>
    </div>
  );
}
