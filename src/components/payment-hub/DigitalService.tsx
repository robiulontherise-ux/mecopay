import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  Globe,
  Search,
  Check,
  ChevronDown,
  Info,
  Lock,
  Zap,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Bot,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface DigitalServiceProps {
  brands?: any[];
  user?: any;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  region: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'AE', name: 'United Arab Emirates (UAE)', flag: '🇦🇪', region: 'Middle East' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: 'GLOBAL', name: 'Global / Multi-Region Proxy', flag: '🌍', region: 'Worldwide' },
];

export default function DigitalService({ brands = [], user }: DigitalServiceProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Digital Services State
  const [telegramActive, setTelegramActive] = useState<boolean>(false);
  const [telegramExpiresAt, setTelegramExpiresAt] = useState<string | null>(null);

  const [facebookActive, setFacebookActive] = useState<boolean>(false);
  const [facebookExpiresAt, setFacebookExpiresAt] = useState<string | null>(null);
  const [fbBotCountry, setFbBotCountry] = useState<string>('BD');

  const [driveActive, setDriveActive] = useState<boolean>(false);
  const [driveExpiresAt, setDriveExpiresAt] = useState<string | null>(null);

  // Country Search Dropdown State
  const [countryDropdownOpen, setCountryDropdownOpen] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>('');

  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId]);

  useEffect(() => {
    if (!selectedBrandId) return;
    loadDigitalServiceSettings();
  }, [selectedBrandId]);

  const currentBrand = useMemo(() => {
    return brands.find(b => b.id === selectedBrandId) || brands[0] || null;
  }, [brands, selectedBrandId]);

  // Format clean date without timestamp or hours
  const formatCleanDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return true;
    try {
      return new Date(dateStr).getTime() < Date.now();
    } catch {
      return true;
    }
  };

  const loadDigitalServiceSettings = async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    try {
      // 1. Try querying via backend proxy first
      let loadedData: any = null;
      try {
        const res = await fetch(`/api/digital-services/${selectedBrandId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) loadedData = json.data;
        }
      } catch (_) {}

      // 2. Fallback to Supabase client
      if (!loadedData) {
        const { data, error } = await supabase
          .from('digital_services')
          .select('*')
          .eq('brand_id', selectedBrandId)
          .maybeSingle();
        if (!error && data) loadedData = data;
      }

      if (loadedData) {
        setTelegramActive(Boolean(loadedData.telegram_active));
        setTelegramExpiresAt(loadedData.telegram_expires_at || null);
        setFacebookActive(Boolean(loadedData.facebook_active));
        setFacebookExpiresAt(loadedData.facebook_expires_at || null);
        setFbBotCountry(loadedData.fb_bot_country || 'BD');
        setDriveActive(Boolean(loadedData.drive_active));
        setDriveExpiresAt(loadedData.drive_expires_at || null);
      } else {
        await autoInitializeRow();
      }
    } catch (err: any) {
      console.error('Error loading digital services:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoInitializeRow = async () => {
    if (!selectedBrandId || !currentBrand) return;
    try {
      const targetUserId = currentBrand.user_id || user?.id;
      if (!targetUserId) return;

      const initPayload = {
        client_id: targetUserId,
        telegram_active: false,
        facebook_active: false,
        drive_active: false,
        fb_bot_country: 'BD'
      };

      try {
        const res = await fetch(`/api/digital-services/${selectedBrandId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initPayload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setTelegramActive(Boolean(json.data.telegram_active));
            setTelegramExpiresAt(json.data.telegram_expires_at || null);
            setFacebookActive(Boolean(json.data.facebook_active));
            setFacebookExpiresAt(json.data.facebook_expires_at || null);
            setFbBotCountry(json.data.fb_bot_country || 'BD');
            setDriveActive(Boolean(json.data.drive_active));
            setDriveExpiresAt(json.data.drive_expires_at || null);
            return;
          }
        }
      } catch (_) {}

      const { data } = await supabase
        .from('digital_services')
        .upsert({ brand_id: selectedBrandId, ...initPayload, updated_at: new Date().toISOString() }, { onConflict: 'brand_id' })
        .select()
        .maybeSingle();

      if (data) {
        setTelegramActive(Boolean(data.telegram_active));
        setTelegramExpiresAt(data.telegram_expires_at || null);
        setFacebookActive(Boolean(data.facebook_active));
        setFacebookExpiresAt(data.facebook_expires_at || null);
        setFbBotCountry(data.fb_bot_country || 'BD');
        setDriveActive(Boolean(data.drive_active));
        setDriveExpiresAt(data.drive_expires_at || null);
      }
    } catch (e) {
      console.warn('Auto initialize row skipped:', e);
    }
  };

  const handleToggle = async (service: 'telegram' | 'facebook' | 'drive', currentVal: boolean) => {
    if (!selectedBrandId) return;
    const newVal = !currentVal;

    // Check expiry
    let expiryDate: string | null = null;
    let serviceLabel = '';
    if (service === 'telegram') {
      expiryDate = telegramExpiresAt;
      serviceLabel = 'Telegram Service';
    } else if (service === 'facebook') {
      expiryDate = facebookExpiresAt;
      serviceLabel = 'Facebook Service';
    } else if (service === 'drive') {
      expiryDate = driveExpiresAt;
      serviceLabel = 'Google Drive Service';
    }

    if (newVal && isExpired(expiryDate)) {
      showToast(`${serviceLabel}-এর মেয়াদের তারিখ অতিক্রম হয়েছে বা কেনা হয়নি। দয়া করে Service & Billing থেকে সাবস্ক্রিপশন নিন।`, 'error');
      return;
    }

    // Optimistic UI update
    if (service === 'telegram') setTelegramActive(newVal);
    if (service === 'facebook') setFacebookActive(newVal);
    if (service === 'drive') setDriveActive(newVal);

    setSaving(true);
    try {
      const targetUserId = currentBrand?.user_id || user?.id;
      const colName = `${service}_active`;
      const updatePayload = {
        client_id: targetUserId,
        [colName]: newVal
      };

      let success = false;
      try {
        const res = await fetch(`/api/digital-services/${selectedBrandId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        if (res.ok) success = true;
      } catch (_) {}

      if (!success) {
        const { error } = await supabase
          .from('digital_services')
          .upsert(
            {
              brand_id: selectedBrandId,
              ...updatePayload,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'brand_id' }
          );

        if (error) {
          if (service === 'telegram') setTelegramActive(!newVal);
          if (service === 'facebook') setFacebookActive(!newVal);
          if (service === 'drive') setDriveActive(!newVal);
          throw error;
        }
      }

      showToast(`${serviceLabel} সফলভাবে ${newVal ? 'চালু (ON)' : 'বন্ধ (OFF)'} করা হয়েছে!`, 'success');
    } catch (err: any) {
      console.error('Error updating digital service:', err);
      showToast(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে!', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCountry = async (countryCode: string) => {
    setFbBotCountry(countryCode);
    setCountryDropdownOpen(false);
    setCountrySearch('');

    if (!selectedBrandId) return;
    try {
      const targetUserId = currentBrand?.user_id || user?.id;
      const updatePayload = {
        client_id: targetUserId,
        fb_bot_country: countryCode
      };

      let success = false;
      try {
        const res = await fetch(`/api/digital-services/${selectedBrandId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        if (res.ok) success = true;
      } catch (_) {}

      if (!success) {
        await supabase
          .from('digital_services')
          .upsert(
            {
              brand_id: selectedBrandId,
              ...updatePayload,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'brand_id' }
          );
      }

      const countryObj = COUNTRIES.find(c => c.code === countryCode);
      showToast(`Facebook Bot Location: ${countryObj ? `${countryObj.flag} ${countryObj.name}` : countryCode} সেভ হয়েছে!`, 'success');
    } catch (err: any) {
      console.error('Error saving country:', err);
      showToast('কান্ট্রি আপডেট ব্যর্থ হয়েছে', 'error');
    }
  };

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const selectedCountryObj = useMemo(() => {
    return COUNTRIES.find(c => c.code === fbBotCountry) || COUNTRIES[0];
  }, [fbBotCountry]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Product Delivery Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Digital Service & Member Automation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              অনলাইন কোর্স ও ডিজিটাল পণ্যের পেমেন্ট সফল হওয়ার পর স্বয়ংক্রিয় Telegram ওয়ান-টাইম ইনভাইট লিংক, 
              Facebook গ্রুপ মেম্বার অটো-অ্যাপ্রুভাল ও Google Drive কনটেন্ট সিকিউরিটি এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>

          {/* Brand Switcher */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 sm:p-4 min-w-[260px] space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              নির্বাচিত ব্র্যান্ড
            </label>
            <div className="relative">
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-8"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name || 'Unnamed Brand'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {currentBrand && (
              <div className="text-[10px] text-slate-500 truncate">
                Brand ID: <span className="font-mono text-slate-400">{currentBrand.id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 3 Service Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* =================================================================== */}
        {/* CARD 1: TELEGRAM ONE-TIME LINK AUTOMATION */}
        {/* =================================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 transition-all relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/5">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">Telegram One-Time Link Automation</h3>
                  {/* Clean Expiry Date Badge (No Timestamps) */}
                  {formatCleanDate(telegramExpiresAt) ? (
                    <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expire Date: {formatCleanDate(telegramExpiresAt)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Subscription Inactive (Service & Billing)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  পেমেন্ট সফল হওয়ামাত্র বট স্বয়ংক্রিয়ভাবে ১ জন ব্যবহারযোগ্য (Member Limit = 1) ইনভাইট লিংক তৈরি করবে।
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`text-xs font-bold ${telegramActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {telegramActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramActive}
                  onChange={() => handleToggle('telegram', telegramActive)}
                  disabled={loading || saving}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Guide Section for Telegram */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>টেলিগ্রাম সার্ভিস যেভাবে কাজ করবে (Setup Guide):</span>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                আপনার প্রিমিয়াম বা ভিআইপি টেলিগ্রাম গ্রুপের <strong className="text-white">Settings ➔ Administrators ➔ Add Administrator</strong>-এ যান।
              </li>
              <li>
                সার্চ করুন <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-300 border border-slate-800 font-mono">@Mecopay_bot</code> এবং তাকে গ্রুপে অ্যাডমিন হিসেবে যোগ করুন।
              </li>
              <li>
                বটের পারমিশন তালিকায় <strong className="text-emerald-400">"Invite Users via Link"</strong> অপশনটি টিক দিয়ে সেভ করুন।
              </li>
              <li>
                <span className="text-amber-300 font-semibold">কোনো গ্রুপ লিংক এখানে সেট করার দরকার নেই:</span> ক্লায়েন্টের ওয়েবসাইট থেকে যখন Checkout API রিকোয়েস্ট পাঠানো হবে, পে-লোডে থাকা নির্দিষ্ট প্রোডাক্টের <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono">telegram_link</code> থেকে বট স্বয়ংক্রিয়ভাবে ওয়ান-টাইম ইনভাইট লিংক তৈরি করে কাস্টমারকে সরবরাহ করবে।
              </li>
            </ol>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 2: FACEBOOK VIP GROUP AUTO-APPROVAL */}
        {/* =================================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 transition-all relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/5">
                <FacebookIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">Facebook Group Auto-Approval (Bot + IP Proxy)</h3>
                  {/* Clean Expiry Date Badge (No Timestamps) */}
                  {formatCleanDate(facebookExpiresAt) ? (
                    <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expire Date: {formatCleanDate(facebookExpiresAt)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Subscription Inactive (Service & Billing)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  পেমেন্ট সাকসেস কোড (<code className="text-indigo-300 font-mono">fb_code</code>) মিলিয়ে ফেসবুক বট নির্দিষ্ট দেশের রেসিডেন্সিয়াল আইপি দিয়ে মেম্বার অটো-অ্যাপ্রুভ করবে।
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`text-xs font-bold ${facebookActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {facebookActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={facebookActive}
                  onChange={() => handleToggle('facebook', facebookActive)}
                  disabled={loading || saving}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>

          {/* Country Selection for Facebook Bot (Proxy Anti-Block Shield) */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Bot Target Location (VPN / Residential IP Selection)
                </label>
                <p className="text-[11px] text-slate-400">
                  ফেসবুক যাতে ঘন ঘন লোকেশন পরিবর্তনের কারণে বট অ্যাকাউন্ট চেকপয়েন্ট বা ব্লকে না ফেলে, সেজন্য আপনার গ্রুপের ট্রাফিকের দেশ নির্বাচন করুন।
                </p>
              </div>

              {/* Searchable Dropdown Button */}
              <div className="relative min-w-[240px]">
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{selectedCountryObj.flag}</span>
                    <span className="truncate">{selectedCountryObj.name}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu with Search */}
                {countryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-1 max-h-48 pr-1">
                      {filteredCountries.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleSelectCountry(c.code)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${
                            fbBotCountry === c.code
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-sm">{c.flag}</span>
                            <span className="truncate">{c.name}</span>
                          </span>
                          {fbBotCountry === c.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="text-center py-3 text-xs text-slate-500">
                          কোনো দেশ পাওয়া যায়নি
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] text-indigo-300/80 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/10 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                ডাটাবেজ কলাম <code className="font-mono text-white">fb_bot_country = "{fbBotCountry}"</code> হিসেবে সেভ থাকবে। আমাদের বট এই দেশের নোড ব্যবহার করে নিরাপদ লগইন করবে।
              </span>
            </div>
          </div>

          {/* Guide Section for Facebook */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>ফেসবুক অটো-অ্যাপ্রুভাল যেভাবে কাজ করবে (Setup Guide):</span>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                আপনার প্রাইভেট ফেসবুক গ্রুপের মেম্বার সেটিংসে গিয়ে আমাদের নির্দিষ্ট MecoPay Bot অ্যাকাউন্টকে গ্রুপ <strong className="text-white">Admin</strong> বানান।
              </li>
              <li>
                গ্রুপের <strong className="text-white">"Membership Questions"</strong>-এ একটি প্রশ্ন রাখুন: <em className="text-slate-200">"Enter your MecoPay Payment Passcode"</em>।
              </li>
              <li>
                কাস্টমার পেমেন্ট করলেই ব্যাকএন্ড একটি ইউনিক <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 font-mono">fb_code</code> তৈরি করে কাস্টমারকে দেবে এবং ডাটাবেজে <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 font-mono">facebook_group_link</code> সহ সেভ রাখবে।
              </li>
              <li>
                কাস্টমার গ্রুপে জয়েন রিকোয়েস্টে ওই কোড লিখলে, বট নির্বাচিত দেশের আইপি দিয়ে লগইন করে প্রশ্নের উত্তর মিলিয়ে <strong className="text-emerald-400">"Approve"</strong> বাটনে ক্লিক করবে এবং ডাটাবেজে <code className="font-mono text-emerald-300">fb_approved = true</code> করে দেবে।
              </li>
            </ol>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 3: GOOGLE DRIVE SECURE VAULT */}
        {/* =================================================================== */}
        <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 transition-all relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/5">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">Google Drive Secure Vault (1-Device & Anti-Download)</h3>
                  {/* Clean Expiry Date Badge (No Timestamps) */}
                  {formatCleanDate(driveExpiresAt) ? (
                    <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expire Date: {formatCleanDate(driveExpiresAt)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Subscription Inactive (Service & Billing)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  আসল ড্রাইভ লিংক গোপন রেখে ডাউনলোড বন্ধ এবং একসঙ্গে মাত্র ১টি ডিভাইসে স্ট্রিমিং নিশ্চিত করবে।
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`text-xs font-bold ${driveActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {driveActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={driveActive}
                  onChange={() => handleToggle('drive', driveActive)}
                  disabled={loading || saving}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Guide Section for Google Drive */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>গুগল ড্রাইভ ভল্ট যেভাবে কাজ করবে (Setup Guide):</span>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                মার্চেন্টের সাইট থেকে Checkout API পে-লোডে থাকা <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">google_drive_link</code> সরাসরি গ্রহণ করা হবে।
              </li>
              <li>
                ক্রেতাকে কখনোই আসল Google Drive লিংক দেওয়া হবে না। ক্রেতা পাবে MecoPay-এর সিকিউর টোকেন লিংক: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 font-mono">https://www.mecopay.space/vault/:token</code>।
              </li>
              <li>
                <strong className="text-white">ডাউনলোড ও রাইট-ক্লিক ব্লক:</strong> কাস্টম ভিউয়ার প্লেয়ারে কনটেন্ট চলবে কিন্তু কেউ ভিডিও/ফাইল ডাউনলোড বা চুরি করতে পারবে না।
              </li>
              <li>
                <strong className="text-white">এক ডিভাইসে এককালীন সুরক্ষা (1-Device Limit):</strong> ক্রেতা যে ডিভাইসে লিংকটি প্রথমে খুলবে, সেশনটি সেই ডিভাইসের সাথে লক থাকবে। অন্য কোনো ফোন বা ল্যাপটপে লিংকটি ওপেন করলে আগের সেশনটি সাথে সাথে লগআউট হয়ে যাবে।
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
