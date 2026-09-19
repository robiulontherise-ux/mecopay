import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle2, Copy, RefreshCw, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface CustomDomainSettingsProps {
  user: any;
  brands?: any[];
}

export default function CustomDomainSettings({ user, brands = [] }: CustomDomainSettingsProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [currentSubdomain, setCurrentSubdomain] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | false>(false);

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

      // Check if site_settings exists
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
      showToast('Custom domain saved successfully!', 'success');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            Custom Domain Settings
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Connect your own branded domain or subdomain to your MecoPay Storefront.
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

      {/* Free Subdomain Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Default Subdomain</span>
            <p className="text-lg font-bold text-white mt-1">
              {currentSubdomain ? (
                currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.mecopay.space`
              ) : (
                'store.mecopay.space'
              )}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active & SSL Protected
          </span>
        </div>
      </div>

      {/* Custom Domain Form */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Connect Your Custom Domain</h3>
        <p className="text-sm text-slate-400 mb-6">
          Enter your domain name (e.g. <span className="text-slate-300">yourbrand.com</span> or <span className="text-slate-300">shop.yourbrand.com</span>).
        </p>

        <form onSubmit={handleSaveDomain} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. shop.yourdomain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save Domain
            </button>
          </div>
        </form>
      </div>

      {/* DNS Setup Guide */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-400" />
          DNS Configuration Instructions
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Log into your domain registrar (e.g. Cloudflare, Namecheap, GoDaddy) and add the following DNS record:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Name / Host</th>
                <th className="pb-3 font-semibold">Target / Value</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-3 font-mono text-emerald-400 font-bold">CNAME</td>
                <td className="py-3 font-mono">@ (or shop)</td>
                <td className="py-3 font-mono text-white">cname.mecopay.space</td>
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
      </div>
    </div>
  );
}
