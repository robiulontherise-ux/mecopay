import React, { useState, useEffect } from 'react';
import { Activity, Save, CheckCircle2, RefreshCw, Zap, ShieldCheck, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface ServerSideTrackingSettingsProps {
  user: any;
  brands?: any[];
}

export default function ServerSideTrackingSettings({ user, brands = [] }: ServerSideTrackingSettingsProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [activeDomain, setActiveDomain] = useState<string>('');
  
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaTestCode, setMetaTestCode] = useState('');
  
  const [ga4MeasurementId, setGa4MeasurementId] = useState('');
  const [ga4ApiSecret, setGa4ApiSecret] = useState('');

  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [tiktokAccessToken, setTiktokAccessToken] = useState('');

  const [trackPageView, setTrackPageView] = useState(true);
  const [trackInitiateCheckout, setTrackInitiateCheckout] = useState(true);
  const [trackPurchase, setTrackPurchase] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize selected brand
  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands]);

  // Load tracking data from Supabase server_side_tracking table
  useEffect(() => {
    if (!user) return;
    loadTrackingConfig();
  }, [user, selectedBrandId]);

  const loadTrackingConfig = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch domain from site_settings for the selected brand
      let domainName = '';
      if (selectedBrandId) {
        const { data: siteData } = await supabase
          .from('site_settings')
          .select('domain, subdomain')
          .or(`id.eq.${selectedBrandId},brand_id.eq.${selectedBrandId}`)
          .maybeSingle();

        if (siteData) {
          domainName = siteData.domain || (siteData.subdomain ? `${siteData.subdomain}.mecopay.space` : '');
        }
      }
      setActiveDomain(domainName);

      // 2. Fetch tracking config from server_side_tracking table
      let query = supabase.from('server_side_tracking').select('*').eq('client_id', user.id);
      if (selectedBrandId) {
        query = query.eq('brand_id', selectedBrandId);
      }
      
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        setMetaPixelId(data.meta_pixel_id || '');
        setMetaAccessToken(data.meta_access_token || '');
        setMetaTestCode(data.meta_test_code || '');
        setGa4MeasurementId(data.ga4_measurement_id || '');
        setGa4ApiSecret(data.ga4_api_secret || '');
        setTiktokPixelId(data.tiktok_pixel_id || '');
        setTiktokAccessToken(data.tiktok_access_token || '');
        if (data.track_page_view !== undefined) setTrackPageView(data.track_page_view);
        if (data.track_checkout !== undefined) setTrackInitiateCheckout(data.track_checkout);
        if (data.track_purchase !== undefined) setTrackPurchase(data.track_purchase);
      } else {
        // Fallback to local storage or empty
        const fallback = localStorage.getItem(`mecopay_tracking_config_${user?.id}`);
        if (fallback) {
          try {
            const p = JSON.parse(fallback);
            setMetaPixelId(p.metaPixelId || '');
            setMetaAccessToken(p.metaAccessToken || '');
            setMetaTestCode(p.metaTestCode || '');
            setGa4MeasurementId(p.ga4MeasurementId || '');
            setGa4ApiSecret(p.ga4ApiSecret || '');
            setTiktokPixelId(p.tiktokPixelId || '');
            setTiktokAccessToken(p.tiktokAccessToken || '');
          } catch (e) {}
        } else {
          setMetaPixelId('');
          setMetaAccessToken('');
          setMetaTestCode('');
          setGa4MeasurementId('');
          setGa4ApiSecret('');
          setTiktokPixelId('');
          setTiktokAccessToken('');
        }
      }
    } catch (err) {
      console.error('Failed to load tracking settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = {
      client_id: user.id,
      brand_id: selectedBrandId || null,
      domain: activeDomain || 'default',
      meta_enabled: Boolean(metaPixelId && metaAccessToken),
      meta_pixel_id: metaPixelId.trim(),
      meta_access_token: metaAccessToken.trim(),
      meta_test_code: metaTestCode.trim(),
      ga4_enabled: Boolean(ga4MeasurementId),
      ga4_measurement_id: ga4MeasurementId.trim(),
      ga4_api_secret: ga4ApiSecret.trim(),
      tiktok_enabled: Boolean(tiktokPixelId && tiktokAccessToken),
      tiktok_pixel_id: tiktokPixelId.trim(),
      tiktok_access_token: tiktokAccessToken.trim(),
      track_page_view: trackPageView,
      track_time_spent: true,
      track_checkout: trackInitiateCheckout,
      track_purchase: trackPurchase,
      updated_at: new Date().toISOString()
    };

    try {
      // 1. Save to Supabase server_side_tracking table
      const { error } = await supabase
        .from('server_side_tracking')
        .upsert(payload, { onConflict: 'brand_id, domain' });

      if (error) {
        console.warn('Upsert onConflict error, retrying without constraint:', error);
        // Fallback insert/update if unique constraint difference
        await supabase
          .from('server_side_tracking')
          .delete()
          .match({ client_id: user.id, brand_id: selectedBrandId });
        await supabase.from('server_side_tracking').insert(payload);
      }

      // 2. Also keep localStorage as client cache backup
      localStorage.setItem(`mecopay_tracking_config_${user?.id}`, JSON.stringify(payload));

      // 3. Immediately trigger Edge Worker KV Cache Sync with Auth Token
      if (activeDomain) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const authToken = sessionData?.session?.access_token || '';

          await fetch('/api/internal/sync-cache', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              hostname: activeDomain,
              client_id: user.id,
              brand_id: selectedBrandId,
              tracking: payload
            })
          });
        } catch (syncErr) {
          // Silent catch in dev or if worker handles in bg
        }
      }

      showToast('Server-Side Tracking settings saved & edge synced!', 'success');
    } catch (err: any) {
      console.error('Error saving tracking settings:', err);
      showToast(err.message || 'Saved locally, but database sync had an issue.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Server-Side Tracking (CAPI & Analytics)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Bypass browser ad-blockers and iOS privacy restrictions with Cloudflare Edge Server-Side Tracking.
          </p>
        </div>

        {/* Brand Selector */}
        {brands && brands.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name || 'Default Brand'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeDomain && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Connected Domain: <strong className="text-white underline">{activeDomain}</strong>. Events will be tracked via Cloudflare Edge CAPI.
          </span>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          Loading tracking credentials...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Meta CAPI */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Meta (Facebook) Conversion API (CAPI)
              </h3>
              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meta Pixel ID</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Event Code (Optional)</label>
                <input
                  type="text"
                  value={metaTestCode}
                  onChange={(e) => setMetaTestCode(e.target.value)}
                  placeholder="e.g. TEST12345"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Conversions API Access Token</label>
                <input
                  type="password"
                  value={metaAccessToken}
                  onChange={(e) => setMetaAccessToken(e.target.value)}
                  placeholder="EAAB..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Google Analytics 4 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Google Analytics 4 (Measurement Protocol)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Measurement ID</label>
                <input
                  type="text"
                  value={ga4MeasurementId}
                  onChange={(e) => setGa4MeasurementId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Secret</label>
                <input
                  type="password"
                  value={ga4ApiSecret}
                  onChange={(e) => setGa4ApiSecret(e.target.value)}
                  placeholder="Enter GA4 API secret key"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TikTok Events API */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              TikTok Events API
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  placeholder="e.g. CXXXXXXXXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Long-Lived Access Token</label>
                <input
                  type="password"
                  value={tiktokAccessToken}
                  onChange={(e) => setTiktokAccessToken(e.target.value)}
                  placeholder="Enter TikTok API token"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Server Tracking Events */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Events Dispatched Server-Side
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">PageView / ViewContent</p>
                  <p className="text-xs text-slate-400">Track whenever a customer lands on your store product or checkout page.</p>
                </div>
                <input
                  type="checkbox"
                  checked={trackPageView}
                  onChange={(e) => setTrackPageView(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">InitiateCheckout</p>
                  <p className="text-xs text-slate-400">Triggered when customer opens the payment page and selects a gateway.</p>
                </div>
                <input
                  type="checkbox"
                  checked={trackInitiateCheckout}
                  onChange={(e) => setTrackInitiateCheckout(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">Purchase / Payment Success</p>
                  <p className="text-xs text-slate-400">Fired automatically on successful payment verification with exact revenue value.</p>
                </div>
                <input
                  type="checkbox"
                  checked={trackPurchase}
                  onChange={(e) => setTrackPurchase(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Tracking Configuration
          </button>
        </form>
      )}
    </div>
  );
}
