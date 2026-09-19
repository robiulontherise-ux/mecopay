import React, { useState, useEffect } from 'react';
import { Activity, Save, CheckCircle2, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { showToast } from '../../lib/toast';

interface ServerSideTrackingSettingsProps {
  user: any;
  brands?: any[];
}

export default function ServerSideTrackingSettings({ user, brands = [] }: ServerSideTrackingSettingsProps) {
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`mecopay_tracking_config_${user?.id}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.metaPixelId) setMetaPixelId(p.metaPixelId);
        if (p.metaAccessToken) setMetaAccessToken(p.metaAccessToken);
        if (p.metaTestCode) setMetaTestCode(p.metaTestCode);
        if (p.ga4MeasurementId) setGa4MeasurementId(p.ga4MeasurementId);
        if (p.ga4ApiSecret) setGa4ApiSecret(p.ga4ApiSecret);
        if (p.tiktokPixelId) setTiktokPixelId(p.tiktokPixelId);
        if (p.tiktokAccessToken) setTiktokAccessToken(p.tiktokAccessToken);
        if (p.trackPageView !== undefined) setTrackPageView(p.trackPageView);
        if (p.trackInitiateCheckout !== undefined) setTrackInitiateCheckout(p.trackInitiateCheckout);
        if (p.trackPurchase !== undefined) setTrackPurchase(p.trackPurchase);
      } catch (e) {}
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        `mecopay_tracking_config_${user?.id}`,
        JSON.stringify({
          metaPixelId,
          metaAccessToken,
          metaTestCode,
          ga4MeasurementId,
          ga4ApiSecret,
          tiktokPixelId,
          tiktokAccessToken,
          trackPageView,
          trackInitiateCheckout,
          trackPurchase
        })
      );
      setSaving(false);
      showToast('Server-Side Tracking settings saved successfully!', 'success');
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" />
          Server-Side Tracking (CAPI & Analytics)
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Bypass browser ad-blockers and iOS privacy restrictions with Cloudflare Edge Server-Side Tracking.
        </p>
      </div>

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
    </div>
  );
}
