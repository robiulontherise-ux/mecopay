import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  Copy,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Zap,
  Lock,
  Flame,
  Layers,
  Server,
  Code2,
  ExternalLink,
  Check,
  AlertTriangle,
  Mail,
  HelpCircle,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface IntegrateCustomDomainProps {
  user: any;
  brands?: any[];
}

export default function IntegrateCustomDomain({ user, brands = [] }: IntegrateCustomDomainProps) {
  const [brandList, setBrandList] = useState<any[]>(brands);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [currentSubdomain, setCurrentSubdomain] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [originUrl, setOriginUrl] = useState<string>('');
  const [showOriginDetails, setShowOriginDetails] = useState<boolean>(false);
  const [domainStatus, setDomainStatus] = useState<'none' | 'pending_validation' | 'active'>('none');
  const [hostnameId, setHostnameId] = useState<string>('');
  const [sslStatus, setSslStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [purging, setPurging] = useState(false);
  const [copied, setCopied] = useState<string | false>(false);
  const [activeTab, setActiveTab] = useState<'wordpress' | 'laravel' | 'nocode'>('wordpress');

  // URL normalizer helper: strips protocol, www, trailing slashes, path, and port
  const normalizeDomain = (url: string): string => {
    if (!url) return '';
    return url
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '')
      .split('/')[0]
      .split(':')[0]
      .trim();
  };

  // Sync / fetch brands
  useEffect(() => {
    if (brands && brands.length > 0) {
      setBrandList(brands);
      if (!selectedBrandId) {
        setSelectedBrandId(brands[0].id);
      }
    } else if (user?.id) {
      fetchBrands();
    }
  }, [brands, user]);

  const fetchBrands = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        setBrandList(data);
        if (!selectedBrandId) {
          setSelectedBrandId(data[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching brands for custom domain:', e);
    }
  };

  useEffect(() => {
    if (selectedBrandId) {
      fetchDomainSettings();
    }
  }, [user, selectedBrandId]);

  const fetchDomainSettings = async () => {
    if (!user || !selectedBrandId) return;
    try {
      setLoading(true);
      // Look up site_settings for this specific brand (id = brand_id or brand_id = selectedBrandId)
      let query = supabase
        .from('site_settings')
        .select('*')
        .or(`id.eq.${selectedBrandId},brand_id.eq.${selectedBrandId}`);

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        setCurrentSubdomain(data.subdomain || '');
        setCustomDomain(data.domain || '');
        setOriginUrl(data.origin_url || '');
        setDomainStatus(data.domain_status || (data.domain ? 'pending_validation' : 'none'));
        setHostnameId(data.custom_hostname_id || '');
        if (data.app_type) {
          setActiveTab(data.app_type === 'no_code' ? 'nocode' : (data.app_type as any));
        }
      } else {
        // Fallback: check by client_id if brand row not created yet
        const { data: fallbackData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('client_id', user.id)
          .maybeSingle();

        if (fallbackData) {
          setCurrentSubdomain(fallbackData.subdomain || '');
          setCustomDomain(fallbackData.domain || '');
          setOriginUrl(fallbackData.origin_url || '');
          setDomainStatus(fallbackData.domain_status || (fallbackData.domain ? 'pending_validation' : 'none'));
          setHostnameId(fallbackData.custom_hostname_id || '');
          if (fallbackData.app_type) {
            setActiveTab(fallbackData.app_type === 'no_code' ? 'nocode' : (fallbackData.app_type as any));
          }
        } else {
          setCustomDomain('');
          setOriginUrl('');
          setCurrentSubdomain('');
          setDomainStatus('none');
          setHostnameId('');
        }
      }
    } catch (err) {
      console.error('Error fetching domain settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected brand
  const selectedBrand = brandList.find((b) => b.id === selectedBrandId) || brandList[0];
  const brandPrimaryWebsite = selectedBrand?.website_url || '';
  const cleanBrandWebsite = normalizeDomain(brandPrimaryWebsite);
  const cleanInputDomain = normalizeDomain(customDomain);

  // Exact matching status
  const hasBrandWebsite = Boolean(cleanBrandWebsite);
  const isDomainMatching = hasBrandWebsite && cleanInputDomain === cleanBrandWebsite;

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedBrand) {
      showToast('Please select a Brand first!', 'error');
      return;
    }

    // 100% Matching Rule with Brand's Primary Website
    if (!hasBrandWebsite) {
      showToast(
        `Brand "${selectedBrand.name}" has no Primary Website set! Please configure it first in Your MecoPay > Brands.`,
        'error'
      );
      return;
    }

    if (!cleanInputDomain) {
      showToast('Please enter your custom domain name!', 'error');
      return;
    }

    if (cleanInputDomain !== cleanBrandWebsite) {
      showToast(
        `Domain mismatch! The domain must 100% match the registered Primary Website (${cleanBrandWebsite}) of brand "${selectedBrand.name}"!`,
        'error'
      );
      return;
    }

    try {
      setSaving(true);

      // Check existing row in site_settings for this brand
      let { data: existing } = await supabase
        .from('site_settings')
        .select('*')
        .or(`id.eq.${selectedBrandId},brand_id.eq.${selectedBrandId}`)
        .maybeSingle();

      if (!existing) {
        // Also check by client_id
        const { data: clientExisting } = await supabase
          .from('site_settings')
          .select('*')
          .eq('client_id', user.id)
          .maybeSingle();
        existing = clientExisting;
      }

      const cleanOrigin = originUrl.trim();

      if (existing) {
        // UPDATE THAT EXACT ROW in site_settings:
        // Keeps the existing subdomain in its column and updates domain & origin_url!
        const { error } = await supabase
          .from('site_settings')
          .update({
            domain: cleanInputDomain,
            origin_url: cleanOrigin || null,
            brand_id: selectedBrandId || existing.brand_id,
            app_type: activeTab === 'nocode' ? 'no_code' : activeTab
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // INSERT new row tied to this brand
        const autoSub = `${(selectedBrand.name || user.id)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 10)}.mecopay.space`;

        const { error } = await supabase.from('site_settings').insert({
          id: selectedBrandId || user.id,
          brand_id: selectedBrandId || null,
          client_id: user.id,
          site_name: selectedBrand.name || 'My Store',
          domain: cleanInputDomain,
          origin_url: cleanOrigin || null,
          subdomain: autoSub,
          app_type: activeTab === 'nocode' ? 'no_code' : activeTab
        });

        if (error) throw error;
      }

      setCustomDomain(cleanInputDomain);
      setOriginUrl(cleanOrigin);

      // Automated Cloudflare for SaaS Custom Hostname provisioning
      try {
        const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke('cloudflare-custom-hostname', {
          body: {
            action: 'create',
            domain: cleanInputDomain,
            origin_url: cleanOrigin || null,
            brand_id: selectedBrandId
          }
        });

        if (!edgeErr && edgeRes?.ok) {
          if (edgeRes.hostname_id) setHostnameId(edgeRes.hostname_id);
          if (edgeRes.status === 'active' && edgeRes.ssl_status === 'active') {
            setDomainStatus('active');
            setSslStatus('active');
          } else {
            setDomainStatus('pending_validation');
            setSslStatus(edgeRes.ssl_status || 'pending_validation');
          }
        }
      } catch (cfErr) {
        console.warn('Cloudflare SaaS auto-provisioning note:', cfErr);
      }

      // KV সিঙ্ক নিশ্চিত করা (গেটওয়ে ওয়ার্কার ও এজ সিঙ্ক)
      try {
        await supabase.functions.invoke('cloudflare-custom-hostname', {
          body: {
            action: 'sync_brand',
            brand_id: selectedBrandId
          }
        });
      } catch (syncErr) {
        console.warn('Cloudflare KV sync note:', syncErr);
      }

      showToast(`Custom domain (${cleanInputDomain}) and origin settings saved successfully!`, 'success');
      fetchDomainSettings();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save domain', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) {
      showToast('Please save your custom domain first!', 'error');
      return;
    }

    try {
      setVerifying(true);
      const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke('cloudflare-custom-hostname', {
        body: {
          action: 'verify',
          domain: customDomain,
          brand_id: selectedBrandId,
          hostname_id: hostnameId
        }
      });

      if (edgeErr) {
        throw new Error(edgeErr.message || 'Verification check failed');
      }

      if (edgeRes?.is_active || (edgeRes?.status === 'active' && edgeRes?.ssl_status === 'active')) {
        setDomainStatus('active');
        setSslStatus('active');
        showToast(`🎉 Domain & SSL Active! Your store is securely live on ${customDomain}`, 'success');

        // KV সিঙ্ক নিশ্চিত করা
        try {
          await supabase.functions.invoke('cloudflare-custom-hostname', {
            body: {
              action: 'sync_brand',
              brand_id: selectedBrandId
            }
          });
        } catch (e) {
          console.warn('KV sync error on verify:', e);
        }

        fetchDomainSettings();
      } else {
        setDomainStatus('pending_validation');
        setSslStatus(edgeRes?.ssl_status || 'pending_validation');
        showToast(
          `CNAME record detected! SSL certificate is provisioning (Status: ${edgeRes?.ssl_status || 'pending'}). Please allow 1-2 minutes and re-verify.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to verify DNS / SSL', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handlePurgeCache = async () => {
    if (!customDomain) {
      showToast('No active custom domain to purge cache for!', 'error');
      return;
    }

    try {
      setPurging(true);
      const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke('cloudflare-purge-cache', {
        body: {
          domain: customDomain,
          brand_id: selectedBrandId
        }
      });

      if (edgeErr) {
        throw new Error(edgeErr.message || 'Failed to purge cache');
      }

      showToast(`⚡ গ্লোবাল CDN ক্যাশ সফলভাবে ক্লিয়ার হয়েছে! ${customDomain}-এর পরিবর্তন এখন সারা বিশ্বে লাইভ।`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to purge cache', 'error');
    } finally {
      setPurging(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            Integrate Custom Domain
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Connect your branded domain with automatic SSL, high-speed edge caching, and enterprise bot protection.
          </p>
        </div>

        {/* Brand Dropdown (Always visible and synced to brands table) */}
        <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brand:</span>
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="bg-transparent text-sm text-white font-bold focus:outline-none cursor-pointer"
          >
            {brandList.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-950 text-white font-medium">
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brand Primary Website Banner & Status */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Brand Primary Website (Your MecoPay):
              </span>
              <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
                {selectedBrand?.name || 'Selected Brand'}
              </span>
            </div>
            <p className="text-sm font-mono text-emerald-400 font-semibold mt-0.5">
              {brandPrimaryWebsite ? (
                brandPrimaryWebsite
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-sans text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Not configured in Your MecoPay &gt; Brands. Please enter Primary Website URL first!
                </span>
              )}
            </p>
          </div>
        </div>

        {hasBrandWebsite && (
          <button
            type="button"
            onClick={() => setCustomDomain(cleanBrandWebsite)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            Auto-fill Brand Website
          </button>
        )}
      </div>

      {/* Enterprise Security & Speed Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Free Lifetime SSL</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated 256-bit TLS 1.3 certificate with instant auto-renewal. No paid SSL needed.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Website Fast CDN</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Global MecoPay High-Speed edge caching serves your store at lightning speed with 99.99% uptime.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Free Bot Protection</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built-in WAF & Bot Fight Mode blocks spam orders, fake checkouts, and malicious scrapers.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Full DNS Security</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            No extra DNS security subscription required. Enterprise Anycast DNS & DNSSEC are included free.
          </p>
        </div>
      </div>

      {/* Active Subdomain in the same site_settings row */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              No-Code Active Subdomain (Same Brand Row)
            </span>
            <p className="text-lg font-bold text-white mt-1 font-mono">
              {currentSubdomain ? (
                currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.mecopay.space`
              ) : (
                <span className="text-slate-500 text-sm">Will be linked automatically</span>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Custom Domain যুক্ত হলেও এই সাবডোমেনটি আপনার ডাটাবেস রো-তে সুরক্ষিত থাকবে।
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & SSL Secured
          </span>
        </div>
      </div>

      {/* Connect Custom Domain Form */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-white">Connect Your Branded Custom Domain</h3>
          {cleanInputDomain && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {isDomainMatching ? (
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Matches Brand Website
                </span>
              ) : (
                <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Must match: {cleanBrandWebsite || 'Brand Primary URL'}
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Enter your website domain (e.g. <span className="text-slate-300 font-mono">yourbrand.com</span>). MecoPay
          নিরাপত্তা নিশ্চিত করতে এটি অবশ্যই{' '}
          <strong className="text-white">Your MecoPay &gt; Brands</strong>-এর প্রাইমারি ওয়েবসাইটের সাথে ১০০% একই হতে হবে।
        </p>

        <form onSubmit={handleSaveDomain} className="space-y-4">
          {/* Side-by-Side: Custom Domain (Left) + Origin URL (Right - 1 Line) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
            {/* 1. Custom Domain Input (Left side) */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom Domain <span className="text-emerald-400">*</span></span>
                </label>
                {cleanBrandWebsite && (
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={cleanBrandWebsite}>
                    {cleanBrandWebsite}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder={cleanBrandWebsite ? `e.g. ${cleanBrandWebsite}` : 'e.g. yourstore.com'}
                className={`w-full bg-slate-950 border ${
                  cleanInputDomain && !isDomainMatching
                    ? 'border-rose-500 focus:border-rose-400'
                    : cleanInputDomain && isDomainMatching
                    ? 'border-emerald-500 focus:border-emerald-400'
                    : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-sm font-mono`}
              />
            </div>

            {/* 2. Origin URL Input (Right side - Soja 1 Line) */}
            <div className="md:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <label className="text-xs font-semibold text-slate-300">Origin URL (সার্ভার/হোস্টিং)</label>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    ঐচ্ছিক / Optional
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOriginDetails(!showOriginDetails)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors hover:underline cursor-pointer"
                  title="Origin URL কী এবং কাদের প্রয়োজন বিস্তারিত জানুন"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showOriginDetails ? 'Hide Details' : 'Details (বিস্তারিত)'}</span>
                </button>
              </div>

              {/* Textarea for Origin URL so long links easily wrap into 2nd/3rd line with full visibility */}
              <div className="relative">
                <textarea
                  rows={2}
                  value={originUrl}
                  onChange={(e) => setOriginUrl(e.target.value)}
                  placeholder="e.g. https://cpanel.yourhosting.com বা হোস্টিং আইপি (No-Code ওয়েবসাইট হলে খালি রাখুন)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-xs font-mono break-all resize-none leading-relaxed"
                />
                {originUrl && (
                  <button
                    type="button"
                    onClick={() => setOriginUrl('')}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 transition-colors"
                    title="Clear Origin URL"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details / Explanation Box */}
          {showOriginDetails && (
            <div className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl text-xs space-y-3 text-slate-300 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                  <Info className="w-4 h-4" />
                  <span>Origin URL কী এবং আপনার ব্র্যান্ডে কখন ব্যবহার করবেন?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOriginDetails(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-slate-800"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    No-Code ওয়েবসাইট (MecoPay হোস্টেড):
                  </div>
                  <p className="text-slate-400">
                    কোনো Origin URL দেওয়ার প্রয়োজন নেই (<strong>সম্পূর্ণ খালি রাখুন</strong>)। MecoPay-এর নিজস্ব হাই-স্পিড ইনফ্রাস্ট্রাকচার থেকেই সরাসরি আপনার ব্র্যান্ডের ওয়েবসাইট লাইভ পরিচালিত হয়।
                  </p>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5 mb-1.5">
                    <Server className="w-3.5 h-3.5" />
                    কাস্টম সাইট (WordPress, WooCommerce, Custom Site):
                  </div>
                  <p className="text-slate-400">
                    ক্রেতা বা ভিজিটররা যখন আপনার ব্র্যান্ডের ডোমেইনে (<strong className="text-white">{selectedBrand?.name || 'আপনার ব্র্যান্ড'}</strong>) প্রবেশ করবে, MecoPay সিস্টেম সেই ট্রাফিক আপনার মূল হোস্টিং সার্ভারে পাঠাতে এই <strong>Origin URL</strong> ব্যবহার করে (যেমন: আপনার cPanel হোস্টিং ডোমেইন বা সার্ভার লিংক)।
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>একত্রে অটো-সিঙ্ক:</strong> আপনি যখন নিচে <strong className="text-white">Save &amp; Connect Domain</strong>-এ ক্লিক করবেন অথবা ডোমেইন ভেরিফাই হবে, তখন ডোমেইনের সাথে এই Origin URL-ও একই সাথে আপনার ব্র্যান্ডের ডাটাবেজ (<code className="text-emerald-400 font-mono">site_settings</code>) এবং সিস্টেমে ফ্রেশভাবে সংরক্ষিত হয়ে যাবে।
                </span>
              </div>
            </div>
          )}

          {/* Form Action Row: Save & Connect Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-400">
              {originUrl ? (
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-xs md:max-w-md">Target: <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">{originUrl}</code></span>
                </span>
              ) : (
                <span className="text-slate-500">
                  Origin URL খালি থাকলে নো-কোড MecoPay ইন্টারনাল রাউটিং সক্রিয় থাকবে।
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !isDomainMatching}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save &amp; Connect Domain
            </button>
          </div>

          {/* Validation Notice Box */}
          {cleanInputDomain && !isDomainMatching && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <strong>ভুল ডোমেইন প্রবেশ করানো হয়েছে:</strong> আপনি দিয়েছেন{' '}
                <code className="font-mono text-white bg-rose-950/80 px-1.5 py-0.5 rounded">
                  {cleanInputDomain}
                </code>
                , কিন্তু <span className="font-bold">{selectedBrand?.name}</span> ব্র্যান্ডের প্রাইমারি ওয়েবসাইট হলো{' '}
                <code className="font-mono text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">
                  {cleanBrandWebsite || 'খালি (Not Set)'}
                </code>
                । দুটি ১০০% এক না হলে সেভ করা সম্ভব নয়।
              </div>
            </div>
          )}

          {/* Live Domain Status & Actions Card */}
          {customDomain && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    domainStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {domainStatus === 'active' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      MecoPay Edge &amp; SSL Status:
                    </span>
                    {domainStatus === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active &amp; TLS 1.3 SSL Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-3.5 h-3.5" />
                        DNS / SSL Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {domainStatus === 'active'
                      ? `Your custom domain ${customDomain} is fully secured with TLS 1.3 and routed via MecoPay Enterprise Edge Engine.`
                      : `Add the CNAME record below, then click Verify to activate your free automated SSL certificate.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
                {domainStatus === 'active' ? (
                  <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 select-none shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified &amp; Live</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                    {verifying ? 'Checking DNS...' : 'Verify DNS & SSL'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePurgeCache}
                  disabled={purging || domainStatus !== 'active'}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="150ms-এ সারা বিশ্বের ক্লাউডফ্লেয়ার এজ থেকে এই ডোমেনের ক্যাশ রিফ্রেশ করুন"
                >
                  {purging ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                  {purging ? 'Purging CDN...' : '⚡ Instant Purge CDN Cache'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* CNAME DNS Configuration Guide */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          DNS Records Configuration (Point to MecoPay)
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Log in to your Domain provider (Namecheap, GoDaddy etc.) and add this CNAME record. All SSL
          certificates and bot protection will be provisioned automatically within minutes:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Record Type</th>
                <th className="pb-3 font-semibold">Host / Name</th>
                <th className="pb-3 font-semibold">Value / Target</th>
                <th className="pb-3 font-semibold">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-3 font-mono text-emerald-400 font-bold">CNAME</td>
                <td className="py-3 font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    @
                    <button
                      type="button"
                      onClick={() => copyToClipboard('@', 'cname_host')}
                      className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                      title="Copy Host"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">(or subdomain)</span>
                </td>
                <td className="py-3 font-mono text-white">
                  <span className="inline-flex items-center gap-1.5">
                    cname.mecopay.space
                    <button
                      type="button"
                      onClick={() => copyToClipboard('cname.mecopay.space', 'cname_val')}
                      className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                      title="Copy Target"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </td>
                <td className="py-3 font-mono text-slate-400">Automatic</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MecoPay Business Email DNS Records */}
        <div className="border-t border-slate-800/80 pt-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Email Records (Required for Business Email)
            </h4>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Required for Email
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            ইমেইল গ্রহণ (Receive) ও পাঠাতে (Send) আপনার ডোমেইনে এই রেকর্ডগুলো যুক্ত করুন:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Host / Name</th>
                  <th className="pb-2 font-semibold">Mail Server / Value</th>
                  <th className="pb-2 font-semibold">Priority</th>
                  <th className="pb-2 font-semibold">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400 font-bold">MX</td>
                  <td className="py-2.5 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      @
                      <button
                        type="button"
                        onClick={() => copyToClipboard('@', 'mx_host')}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Copy Host"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-white font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      mx1.mecopay.space
                      <button
                        type="button"
                        onClick={() => copyToClipboard('mx1.mecopay.space', 'mx_val')}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Copy Target"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-emerald-400 font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      10
                      <button
                        type="button"
                        onClick={() => copyToClipboard('10', 'mx_prio')}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Copy Priority"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">Automatic</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-mono text-emerald-400 font-bold">TXT</td>
                  <td className="py-2.5 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      @
                      <button
                        type="button"
                        onClick={() => copyToClipboard('@', 'txt_host')}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Copy Host"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      v=spf1 include:relay.mecopay.space ~all
                      <button
                        type="button"
                        onClick={() => copyToClipboard('v=spf1 include:relay.mecopay.space ~all', 'txt_val')}
                        className="text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Copy Value"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-500">-</td>
                  <td className="py-2.5 font-mono text-slate-400">Automatic</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Location Note */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5">
            <div>
              📌 <strong className="text-white">MX Record:</strong> Namecheap-এর ক্ষেত্রে পেজের নিচে <strong className="text-emerald-400">"Mail Settings"</strong> সেকশনে গিয়ে <strong className="text-white">Custom MX</strong> নির্বাচন করে বসান।
            </div>
            <div>
              📌 <strong className="text-white">CNAME &amp; TXT Record:</strong> সাধারণ <strong className="text-emerald-400">"Host Records"</strong> সেকশনে "Add New Record" ক্লিক করে বসান।
            </div>
          </div>
        </div>

        {/* Platform Specific Integration Tabs */}
        <div className="border-t border-slate-800/80 pt-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Supported Website Frameworks:
          </span>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('wordpress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'wordpress'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              WordPress / WooCommerce
            </button>
            <button
              onClick={() => setActiveTab('laravel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'laravel'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Laravel / PHP / Custom Stack
            </button>
            <button
              onClick={() => setActiveTab('nocode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'nocode'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              MecoPay No-Code Website
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed">
            {activeTab === 'wordpress' && (
              <p>
                <strong>WordPress / WooCommerce:</strong> You do not need to purchase separate SSL or WAF plugins. Once
                your domain CNAME points to MecoPay, your site benefits from MecoPay Shield DDoS bot protection and fast
                static caching automatically. Install the MecoPay WooCommerce plugin from Payments Hub to enable Dual
                Gateway checkout.
              </p>
            )}
            {activeTab === 'laravel' && (
              <p>
                <strong>Laravel / Custom Backend:</strong> Send checkout requests via REST API with your brand domain. Our
                edge servers protect your checkout URLs and routes from bot attacks, so your server never experiences
                traffic overload during flash sales.
              </p>
            )}
            {activeTab === 'nocode' && (
              <p>
                <strong>MecoPay No-Code Website:</strong> Hosted directly on our global edge network. Subdomain এবং
                Custom Domain উভয়ই আপনার একই ব্র্যান্ড রো-তে সিঙ্ক হয়ে থাকে। কাস্টম ডোমেইন পয়েন্ট করার সাথে সাথে এটি
                অটোমেটিক এসএসএল সার্টিফিকেটসহ লাইভ হয়ে যাবে।
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
