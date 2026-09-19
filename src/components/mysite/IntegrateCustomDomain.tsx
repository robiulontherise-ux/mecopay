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
  Code2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface IntegrateCustomDomainProps {
  user: any;
  brands?: any[];
}

export default function IntegrateCustomDomain({ user, brands = [] }: IntegrateCustomDomainProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [currentSubdomain, setCurrentSubdomain] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | false>(false);
  const [activeTab, setActiveTab] = useState<'wordpress' | 'laravel' | 'nocode'>('wordpress');

  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands]);

  useEffect(() => {
    fetchDomainSettings();
  }, [user, selectedBrandId]);

  const fetchDomainSettings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase.from('site_settings').select('*');
      if (selectedBrandId) {
        query = query.or(`id.eq.${selectedBrandId},brand_id.eq.${selectedBrandId}`);
      } else {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        setCurrentSubdomain(data.subdomain || '');
        setCustomDomain(data.domain || '');
      } else {
        setCustomDomain('');
        setCurrentSubdomain('');
      }
    } catch (err) {
      console.error('Error fetching domain settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');

      let query = supabase.from('site_settings').select('id');
      if (selectedBrandId) {
        query = query.or(`id.eq.${selectedBrandId},brand_id.eq.${selectedBrandId}`);
      } else {
        query = query.eq('client_id', user.id);
      }
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ domain: cleanDomain || null })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            id: selectedBrandId || user.id,
            brand_id: selectedBrandId || null,
            client_id: user.id,
            domain: cleanDomain || null,
            subdomain: `${user.id.slice(0, 8)}.mecopay.space`
          });
        if (error) throw error;
      }

      setCustomDomain(cleanDomain);
      showToast('Custom domain integrated and saved successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save domain', 'error');
    } finally {
      setSaving(false);
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
        {brands && brands.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Brand:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
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
            Global Cloudflare edge caching serves your store at lightning speed with 99.99% uptime.
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

      {/* Free Subdomain Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Default Active Subdomain</span>
            <p className="text-lg font-bold text-white mt-1 font-mono">
              {currentSubdomain ? (
                currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.mecopay.space`
              ) : (
                'store.mecopay.space'
              )}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & SSL Secured
          </span>
        </div>
      </div>

      {/* Connect Custom Domain Form */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Connect Your Branded Custom Domain</h3>
        <p className="text-sm text-slate-400 mb-6">
          Enter your custom domain or subdomain (e.g. <span className="text-slate-300">yourbrand.com</span> or <span className="text-slate-300">shop.yourbrand.com</span>).
        </p>

        <form onSubmit={handleSaveDomain} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. shop.yourdomain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save & Connect Domain
            </button>
          </div>
        </form>
      </div>

      {/* CNAME DNS Configuration Guide */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          DNS Records Configuration (Point to MecoPay)
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Log in to your DNS provider (Cloudflare, Namecheap, GoDaddy, cPanel) and add this CNAME record. All SSL certificates and bot protection will be provisioned automatically within minutes:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Record Type</th>
                <th className="pb-3 font-semibold">Host / Name</th>
                <th className="pb-3 font-semibold">Value / Target</th>
                <th className="pb-3 font-semibold">Proxy Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-3 font-mono text-emerald-400 font-bold">CNAME</td>
                <td className="py-3 font-mono">@ (or subdomain like "shop")</td>
                <td className="py-3 font-mono text-white">cname.mecopay.space</td>
                <td className="py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    DNS Only or Proxied
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => copyToClipboard('cname.mecopay.space', 'cname')}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied === 'cname' ? 'Copied' : 'Copy'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
                <strong>WordPress / WooCommerce:</strong> You do not need to purchase separate SSL or WAF plugins. Once your domain CNAME points to MecoPay, your site benefits from Cloudflare DDoS bot protection and fast static caching automatically. Install the MecoPay WooCommerce plugin from Payments Hub to enable Dual Gateway checkout.
              </p>
            )}
            {activeTab === 'laravel' && (
              <p>
                <strong>Laravel / Custom Backend:</strong> Send checkout requests via REST API with your brand domain. Our edge servers protect your checkout URLs and routes from bot attacks, so your server never experiences traffic overload during flash sales.
              </p>
            )}
            {activeTab === 'nocode' && (
              <p>
                <strong>MecoPay No-Code Store:</strong> Your store is hosted directly on Cloudflare Edge with zero hosting fees. Connecting this custom domain will instantly display your store with full SSL protection and 100% COD or Advance payment forms.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
