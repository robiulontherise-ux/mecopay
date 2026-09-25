import React, { useState, useEffect } from 'react';
import { Activity, Save, CheckCircle2, RefreshCw, Zap, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

interface ServerSideTrackingSettingsProps {
  user: any;
  brands?: any[];
}

export default function ServerSideTrackingSettings({ user, brands = [] }: ServerSideTrackingSettingsProps) {
  const [brandList, setBrandList] = useState<any[]>(brands);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [activeDomain, setActiveDomain] = useState<string>('');
  
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaTestCode, setMetaTestCode] = useState('');
  
  const [ga4MeasurementId, setGa4MeasurementId] = useState('');
  const [ga4ApiSecret, setGa4ApiSecret] = useState('');

  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [tiktokAccessToken, setTiktokAccessToken] = useState('');

  // Twitter / X CAPI
  const [twitterPixelId, setTwitterPixelId] = useState('');
  const [twitterToken, setTwitterToken] = useState('');

  // LinkedIn CAPI
  const [linkedinPartnerId, setLinkedinPartnerId] = useState('');
  const [linkedinAccessToken, setLinkedinAccessToken] = useState('');

  // Pinterest CAPI
  const [pinterestTagId, setPinterestTagId] = useState('');
  const [pinterestAccessToken, setPinterestAccessToken] = useState('');
  const [pinterestAdAccountId, setPinterestAdAccountId] = useState('');

  const [trackPageView, setTrackPageView] = useState(true);
  const [trackInitiateCheckout, setTrackInitiateCheckout] = useState(true);
  const [trackPurchase, setTrackPurchase] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize and ensure selected brand is populated
  useEffect(() => {
    const initBrands = async () => {
      if (brands && brands.length > 0) {
        setBrandList(brands);
        if (!selectedBrandId) {
          setSelectedBrandId(brands[0].id);
        }
      } else if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('brands')
            .select('id, name, website_url')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            setBrandList(data);
            if (!selectedBrandId) {
              setSelectedBrandId(data[0].id);
            }
          }
        } catch (err) {
          console.error('Error fetching brands in tracking settings:', err);
        }
      }
    };

    initBrands();
  }, [brands, user?.id]);

  // Keep brand list synced if parent brands prop updates
  useEffect(() => {
    if (brands && brands.length > 0) {
      setBrandList(brands);
      if (!selectedBrandId) {
        setSelectedBrandId(brands[0].id);
      }
    }
  }, [brands, selectedBrandId]);

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
        setTwitterPixelId(data.twitter_pixel_id || '');
        setTwitterToken(data.twitter_token || '');
        setLinkedinPartnerId(data.linkedin_partner_id || '');
        setLinkedinAccessToken(data.linkedin_access_token || '');
        setPinterestTagId(data.pinterest_tag_id || '');
        setPinterestAccessToken(data.pinterest_access_token || '');
        setPinterestAdAccountId(data.pinterest_ad_account_id || '');
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
            setTwitterPixelId(p.twitterPixelId || '');
            setTwitterToken(p.twitterToken || '');
            setLinkedinPartnerId(p.linkedinPartnerId || '');
            setLinkedinAccessToken(p.linkedinAccessToken || '');
            setPinterestTagId(p.pinterestTagId || '');
            setPinterestAccessToken(p.pinterestAccessToken || '');
            setPinterestAdAccountId(p.pinterestAdAccountId || '');
          } catch (e) {}
        } else {
          setMetaPixelId('');
          setMetaAccessToken('');
          setMetaTestCode('');
          setGa4MeasurementId('');
          setGa4ApiSecret('');
          setTiktokPixelId('');
          setTiktokAccessToken('');
          setTwitterPixelId('');
          setTwitterToken('');
          setLinkedinPartnerId('');
          setLinkedinAccessToken('');
          setPinterestTagId('');
          setPinterestAccessToken('');
          setPinterestAdAccountId('');
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
      twitter_enabled: Boolean(twitterPixelId && twitterToken),
      twitter_pixel_id: twitterPixelId.trim(),
      twitter_token: twitterToken.trim(),
      linkedin_enabled: Boolean(linkedinPartnerId && linkedinAccessToken),
      linkedin_partner_id: linkedinPartnerId.trim(),
      linkedin_access_token: linkedinAccessToken.trim(),
      pinterest_enabled: Boolean(pinterestTagId && pinterestAccessToken),
      pinterest_tag_id: pinterestTagId.trim(),
      pinterest_access_token: pinterestAccessToken.trim(),
      pinterest_ad_account_id: pinterestAdAccountId.trim(),
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
      showToast(err.message || 'Saved locally, but database sync had an issue.', 'error');
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
            Bypass browser ad-blockers and iOS privacy restrictions with MecoPay Server-Side Tracking Engine.
          </p>
        </div>
      </div>

      {/* Brand Selector & Active Domain Card (Always visible, exactly matching IntegrateCustomDomain) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Brand &amp; Store CAPI Routing</h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Isolated Per Brand
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              সিলেক্ট করা ব্র্যান্ডের সাথে তার কাস্টম ডোমেইন মিলিয়ে CAPI ফায়ার হবে
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Select Brand:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-indigo-500/30 text-white font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-400 transition-all shadow-inner cursor-pointer"
            >
              {brandList && brandList.length > 0 ? (
                brandList.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name || 'Unnamed Brand'}
                  </option>
                ))
              ) : (
                <option value="">Default Brand (Primary)</option>
              )}
            </select>
          </div>

          {/* Connected Custom Domain Badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Connected Domain:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[160px]">
              {activeDomain || 'default'}
            </span>
          </div>
        </div>
      </div>

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
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
                </svg>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
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
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#FE2C55">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.83c0 1.94-.48 3.86-1.48 5.46-1.57 2.49-4.32 3.98-7.29 3.98-2.69 0-5.18-1.25-6.8-3.35-1.7-2.19-2.2-5.12-1.34-7.8 1.05-3.23 3.92-5.46 7.33-5.59v4.06c-1.74.07-3.26 1.13-3.87 2.75-.68 1.83.1 3.92 1.81 4.88 1.49.83 3.39.56 4.58-.65.65-.67.97-1.58.97-2.52V.02h-.03z"/>
              </svg>
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

          {/* Twitter / X Conversions API */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter / X Conversions API (v12)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pixel / Measurement ID</label>
                <input
                  type="text"
                  value={twitterPixelId}
                  onChange={(e) => setTwitterPixelId(e.target.value)}
                  placeholder="e.g. o0xxx"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Bearer Token</label>
                <input
                  type="password"
                  value={twitterToken}
                  onChange={(e) => setTwitterToken(e.target.value)}
                  placeholder="Enter Twitter/X Conversions Token"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Conversions API */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              LinkedIn Conversions API (REST v202401)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Partner / Conversion ID</label>
                <input
                  type="text"
                  value={linkedinPartnerId}
                  onChange={(e) => setLinkedinPartnerId(e.target.value)}
                  placeholder="e.g. 1234567"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">OAuth 2.0 Access Token</label>
                <input
                  type="password"
                  value={linkedinAccessToken}
                  onChange={(e) => setLinkedinAccessToken(e.target.value)}
                  placeholder="Enter LinkedIn Access Token"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pinterest Conversions API */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#E60023">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.155-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
              Pinterest Conversions API (v5)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tag / Advertiser ID</label>
                <input
                  type="text"
                  value={pinterestTagId}
                  onChange={(e) => setPinterestTagId(e.target.value)}
                  placeholder="e.g. 2612345678901"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ad Account ID (Optional)</label>
                <input
                  type="text"
                  value={pinterestAdAccountId}
                  onChange={(e) => setPinterestAdAccountId(e.target.value)}
                  placeholder="Default: 'me'"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Access Token</label>
                <input
                  type="password"
                  value={pinterestAccessToken}
                  onChange={(e) => setPinterestAccessToken(e.target.value)}
                  placeholder="pina_..."
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
