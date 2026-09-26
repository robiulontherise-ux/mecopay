import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Building2, 
  Globe, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Inbox,
  Layers,
  Settings,
  Copy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';
import MecoPayWebmailInbox from './MecoPayWebmailInbox';

interface EmailServiceSettingsProps {
  user: any;
  brands?: any[];
}

export default function EmailServiceSettings({ user, brands = [] }: EmailServiceSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [verifiedBrands, setVerifiedBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [activeDomain, setActiveDomain] = useState<string>('');
  const [activeServiceTab, setActiveServiceTab] = useState<'inbox' | 'accounts' | 'delivery'>('inbox');

  // Business Email Creator State
  const [emailPrefix, setEmailPrefix] = useState('');
  const [createdEmails, setCreatedEmails] = useState<string[]>([]);
  const [creatingEmail, setCreatingEmail] = useState(false);

  // SMTP / Outgoing settings
  const [provider, setProvider] = useState('mecopay_engine');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [sendCustomerReceipt, setSendCustomerReceipt] = useState(true);
  const [sendAdminAlert, setSendAdminAlert] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Brands and Validate Custom Domains from site_settings
  useEffect(() => {
    const fetchBrandsAndDomains = async () => {
      try {
        setLoading(true);
        let currentBrands = brands;

        if (!currentBrands || currentBrands.length === 0) {
          if (user?.id) {
            const { data: bData } = await supabase
              .from('brands')
              .select('id, name, website_url')
              .eq('user_id', user.id)
              .order('created_at', { ascending: true });
            if (bData) currentBrands = bData;
          }
        }

        setBrandList(currentBrands || []);

        if (user?.id) {
          // Fetch site_settings where custom domain is configured
          const { data: settingsData } = await supabase
            .from('site_settings')
            .select('id, brand_id, domain, subdomain, client_id, ssl_status, domain_status')
            .eq('client_id', user.id);

          if (settingsData && settingsData.length > 0) {
            // Find only brands that have an actual connected custom domain
            const valid = (currentBrands || []).filter((b) => {
              const s = settingsData.find((st) => st.brand_id === b.id || st.id === b.id);
              return s && s.domain && s.domain.trim() !== '';
            }).map((b) => {
              const s = settingsData.find((st) => st.brand_id === b.id || st.id === b.id);
              return {
                ...b,
                connected_domain: s?.domain?.trim() || '',
                ssl_status: s?.ssl_status || 'pending',
                domain_status: s?.domain_status || 'active'
              };
            });

            setVerifiedBrands(valid);

            if (valid.length > 0) {
              const initial = valid[0];
              setSelectedBrandId(initial.id);
              setActiveDomain(initial.connected_domain);
              loadBrandEmails(initial.id, initial.connected_domain);
            }
          } else {
            setVerifiedBrands([]);
          }
        }
      } catch (err) {
        console.error('Error validating brand domains:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandsAndDomains();
  }, [brands, user?.id]);

  // Load configured business emails for brand from Supabase brand_mailboxes table
  const loadBrandEmails = async (brandId: string, domain: string) => {
    try {
      if (user?.id) {
        let query = supabase
          .from('brand_mailboxes')
          .select('email_address')
          .eq('client_id', user.id);

        if (domain) {
          query = query.eq('domain', domain);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const list = data.map((d: any) => d.email_address);
          setCreatedEmails(list);
          return;
        }
      }
    } catch (err) {
      console.warn('DB mailboxes fetch notice:', err);
    }

    const key = `mecopay_biz_emails_${user?.id}_${brandId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean up old auto-injected defaults if present
          const isOldDummySet = parsed.length === 2 && 
            parsed.includes(`support@${domain}`) && 
            parsed.includes(`info@${domain}`);
          if (isOldDummySet) {
            localStorage.removeItem(key);
            setCreatedEmails([]);
            return;
          }
          setCreatedEmails(parsed);
          return;
        }
      } catch (e) {}
    }
    // No mailboxes by default until user creates one
    setCreatedEmails([]);
  };

  // Handle Brand Change
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    const found = verifiedBrands.find((b) => b.id === brandId);
    if (found) {
      setActiveDomain(found.connected_domain);
      loadBrandEmails(brandId, found.connected_domain);
    }
  };

  // Load SMTP config from localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`mecopay_email_config_${user.id}_${selectedBrandId || 'default'}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.provider) setProvider(p.provider);
          if (p.host) setHost(p.host);
          if (p.port) setPort(p.port);
          if (p.username) setUsername(p.username);
          if (p.password) setPassword(p.password);
          if (p.fromEmail) setFromEmail(p.fromEmail);
          if (p.fromName) setFromName(p.fromName);
          if (p.sendCustomerReceipt !== undefined) setSendCustomerReceipt(p.sendCustomerReceipt);
          if (p.sendAdminAlert !== undefined) setSendAdminAlert(p.sendAdminAlert);
        } catch (e) {}
      }
    }
  }, [user, selectedBrandId]);

  // Create Business Email handler with Cloudflare Edge Function automation & brand_mailboxes table sync
  const handleCreateBusinessEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = emailPrefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanPrefix) {
      showToast('অনুগ্রহ করে সঠিক ইমেইল প্রিফিক্স দিন (e.g. support, info)', 'error');
      return;
    }
    if (!activeDomain) {
      showToast('কোনো কানেক্টেড কাস্টম ডোমেইন পাওয়া যায়নি', 'error');
      return;
    }

    const newFullEmail = `${cleanPrefix}@${activeDomain}`;
    if (createdEmails.includes(newFullEmail)) {
      showToast(`'${newFullEmail}' ইমেইলটি ইতিমধ্যে তালিকায় বিদ্যমান!`, 'error');
      return;
    }

    setCreatingEmail(true);
    try {
      // 0. Ensure we have the actual authenticated user ID directly from supabase auth
      const { data: authUserData } = await supabase.auth.getUser();
      const currentUserId = authUserData?.user?.id || user?.id;

      if (!currentUserId) {
        showToast('ব্যবহারকারী সেশন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।', 'error');
        setCreatingEmail(false);
        return;
      }

      // 1. First persist to brand_mailboxes table directly
      const insertPayload: any = {
        client_id: currentUserId,
        domain: activeDomain,
        email_address: newFullEmail,
        status: 'active'
      };
      
      if (selectedBrandId) {
        insertPayload.brand_id = selectedBrandId;
      }

      let saveSuccess = false;
      const { data: dbSaved, error: insertErr } = await supabase
        .from('brand_mailboxes')
        .upsert(insertPayload, { onConflict: 'email_address' })
        .select();

      if (insertErr) {
        console.error('Mailbox DB initial insert error:', insertErr);
        // If foreign key failed on brand_id, retry without brand_id
        if (insertErr.message?.includes('foreign key') || insertErr.code === '23503') {
          delete insertPayload.brand_id;
          const { data: retrySaved, error: retryErr } = await supabase
            .from('brand_mailboxes')
            .upsert(insertPayload, { onConflict: 'email_address' })
            .select();
          if (retryErr) {
            console.error('Mailbox DB retry insert error:', retryErr);
            showToast(`ডাটাবেস সংরক্ষণ ব্যর্থ: ${retryErr.message}`, 'error');
            setCreatingEmail(false);
            return;
          } else {
            saveSuccess = true;
          }
        } else {
          showToast(`ডাটাবেস টেবিল ত্রুটি: ${insertErr.message}`, 'error');
          setCreatingEmail(false);
          return;
        }
      } else {
        saveSuccess = true;
      }

      if (!saveSuccess) {
        showToast('ডাটাবেসে ইমেইল সংরক্ষণ করা যায়নি', 'error');
        setCreatingEmail(false);
        return;
      }

      // 2. Invoke Supabase Edge Function to configure specific literal rule on Cloudflare
      const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke('cloudflare-email-routing', {
        body: {
          action: 'create',
          email_address: newFullEmail,
          domain: activeDomain,
          brand_id: selectedBrandId
        }
      });

      if (edgeErr) {
        console.warn('Edge function notice:', edgeErr);
      } else if (edgeRes?.rule_id && user?.id) {
        // Update cloudflare_rule_id in database
        try {
          await supabase
            .from('brand_mailboxes')
            .update({ cloudflare_rule_id: edgeRes.rule_id })
            .eq('email_address', newFullEmail);
        } catch (e) {}
      }

      const updated = [...createdEmails, newFullEmail];
      setCreatedEmails(updated);
      localStorage.setItem(`mecopay_biz_emails_${user?.id}_${selectedBrandId}`, JSON.stringify(updated));
      setEmailPrefix('');
      
      const successNote = edgeRes?.message || `⚡ ${newFullEmail} বিজনেজ ইমেইল তৈরি হয়েছে এবং ডাটাবেসে সেভ হয়েছে!`;
      showToast(successNote, 'success');
    } catch (err: any) {
      console.error('Error in handleCreateBusinessEmail:', err);
      showToast(err.message || 'ইমেইল তৈরিতে সমস্যা হয়েছে।', 'error');
    } finally {
      setCreatingEmail(false);
    }
  };

  const handleDeleteEmail = async (emailToRemove: string) => {
    try {
      await supabase.functions.invoke('cloudflare-email-routing', {
        body: {
          action: 'delete',
          email_address: emailToRemove,
          domain: activeDomain,
          brand_id: selectedBrandId
        }
      });
    } catch (e) {
      console.warn('Delete routing notice:', e);
    }

    // Remove from brand_mailboxes table
    if (user?.id) {
      try {
        await supabase
          .from('brand_mailboxes')
          .delete()
          .eq('client_id', user.id)
          .eq('email_address', emailToRemove);
      } catch (dbErr) {
        console.warn('Mailbox DB delete notice:', dbErr);
      }
    }

    const updated = createdEmails.filter((e) => e !== emailToRemove);
    setCreatedEmails(updated);
    localStorage.setItem(`mecopay_biz_emails_${user?.id}_${selectedBrandId}`, JSON.stringify(updated));
    showToast(`${emailToRemove} সরানো হয়েছে`, 'success');
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        `mecopay_email_config_${user?.id}_${selectedBrandId || 'default'}`,
        JSON.stringify({
          provider,
          host,
          port,
          username,
          password,
          fromEmail,
          fromName,
          sendCustomerReceipt,
          sendAdminAlert
        })
      );
      setSaving(false);
      showToast('Email Service & Delivery configuration saved successfully!', 'success');
    }, 400);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 flex items-center justify-center gap-3 text-slate-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
        <span>ভেরিফাইড কাস্টম ডোমেইন ও ব্র্যান্ড ভ্যালিডেট করা হচ্ছে...</span>
      </div>
    );
  }

  // If NO brand has a custom domain connected
  if (verifiedBrands.length === 0) {
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-400" />
            Business Email &amp; SMTP Service
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Create professional business emails with your own branded domain (e.g. support@yourbrand.com).
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Globe className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Custom Domain Required</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              বিজনেস ইমেইল সার্ভিস (যেমন: <span className="font-mono text-emerald-400 font-semibold">support@yourdomain.com</span>) ব্যবহার করার জন্য ব্র্যান্ডের নিজস্ব কাস্টম ডোমেইন কানেক্ট থাকা বাধ্যতামূলক।
            </p>
            <p className="text-xs text-slate-400 mt-2">
              আপনার তৈরি করা ব্র্যান্ডগুলোতে এখনো কোনো সক্রিয় কাস্টম ডোমেইন যোগ করা হয়নি।
            </p>
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              প্রথমে "Integrate Custom Domain" ট্যাবে গিয়ে আপনার ডোমেইনটি যুক্ত করুন
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedBrand = verifiedBrands.find((b) => b.id === selectedBrandId) || verifiedBrands[0];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-emerald-400" />
          MecoPay Business Webmail &amp; Delivery Engine
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Professional branded mailboxes, live Gmail-style webmail inbox, and high-speed transactional receipt delivery.
        </p>
      </div>

      {/* Brand & Connected Custom Domain Validation Selector */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Brand &amp; Domain Routing</h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Custom Domain
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              শুধুমাত্র কাস্টম ডোমেইন যুক্ত থাকা ব্র্যান্ডগুলোই বিজনেস ইমেইল ব্যবহারের যোগ্য
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Active Brand:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-emerald-500/30 text-white font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-400 transition-all shadow-inner cursor-pointer"
            >
              {verifiedBrands.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name || 'Brand'} ({b.connected_domain})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Domain:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[170px]">
              {activeDomain}
            </span>
          </div>
        </div>
      </div>

      {/* Modern 3-Tab Navigation Bar */}
      <div className="flex items-center border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveServiceTab('inbox')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeServiceTab === 'inbox'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Webmail Inbox</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveServiceTab('accounts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeServiceTab === 'accounts'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Business Mailboxes</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {createdEmails.length}
          </span>
        </button>

        <button
          onClick={() => setActiveServiceTab('delivery')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeServiceTab === 'delivery'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Outgoing Delivery</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            SMTP / Gateway
          </span>
        </button>
      </div>

      {/* TAB 1: Live MecoPay Webmail Inbox */}
      {activeServiceTab === 'inbox' && (
        <MecoPayWebmailInbox
          activeDomain={activeDomain}
          brandName={selectedBrand?.name}
          createdEmails={createdEmails}
        />
      )}

      {/* TAB 2: Automated Business Email Accounts Creator */}
      {activeServiceTab === 'accounts' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Create Custom Business Email
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                আপনার কানেক্টেড কাস্টম ডোমেইনে স্পেসিফিক বিজনেস মেইলবক্স তৈরি করুন
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              MecoPay Secure Engine
            </span>
          </div>

          {/* Input Form: Prefix + @domain */}
          <form onSubmit={handleCreateBusinessEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Enter Email Prefix (ইউজারনেম দিন)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 flex items-center bg-slate-950 border border-slate-800 focus-within:border-emerald-500 rounded-xl overflow-hidden transition-all shadow-inner">
                  <input
                    type="text"
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value.toLowerCase().trim())}
                    placeholder="support, info, contact, billing"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none font-mono font-medium"
                  />
                  <span className="px-3.5 py-2.5 bg-slate-900 text-emerald-400 font-mono text-xs font-bold border-l border-slate-800 select-none">
                    @{activeDomain}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={creatingEmail || !emailPrefix.trim()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {creatingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Email Account
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                উদাহরণ: <span className="font-mono text-slate-400">support</span> দিলে তৈরি হবে <strong className="font-mono text-emerald-400">support@{activeDomain}</strong>
              </p>
            </div>
          </form>

          {/* Active Created Business Mailboxes List */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Inbox className="w-3.5 h-3.5 text-emerald-400" />
              Active Brand Mailboxes ({createdEmails.length})
            </h4>

            {createdEmails.length === 0 ? (
              <div className="p-6 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400 text-center">
                এই ব্র্যান্ডের জন্য এখনো কোনো বিজনেস ইমেইল তৈরি করা হয়নি। উপরের বক্সে নাম লিখে তৈরি করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {createdEmails.map((email) => (
                  <div
                    key={email}
                    className="p-3.5 bg-slate-950 border border-slate-800/90 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-white truncate">{email}</p>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active on MecoPay Webmail
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEmail(email)}
                      className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                      title="Remove Mailbox"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step-by-Step DNS Setup Guide for Custom Domains & Namecheap */}
          <div className="mt-6 p-5 sm:p-6 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                ডোমেইন DNS সেটআপ গাইড (ইমেইল সক্রিয় করার নিয়ম)
              </h4>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ১ বার সেট করলেই আজীবন কার্যকর
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার কাস্টম ডোমেইন (<span className="font-mono text-emerald-400 font-semibold">{activeDomain}</span>)-এ আনলিমিটেড ফ্রি বিজনেস ইমেইল রিসিভ করতে এবং পরবর্তীতে ড্যাশবোর্ড থেকেই মেইল সেন্ড করতে আপনার ডোমেইন কন্ট্রোল প্যানেলে এই ২টি রেকর্ড যুক্ত করুন:
            </p>

            {/* DNS Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800/80 rounded-xl overflow-hidden">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Host / Name</th>
                    <th className="p-3 font-semibold">Value / Mail Server</th>
                    <th className="p-3 font-semibold">Priority</th>
                    <th className="p-3 font-semibold">TTL</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 bg-slate-950 text-slate-300">
                  <tr>
                    <td className="p-3 font-mono text-emerald-400 font-bold">MX</td>
                    <td className="p-3 font-mono">@</td>
                    <td className="p-3 font-mono text-white font-semibold">mx1.mecopay.space</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">10</td>
                    <td className="p-3 font-mono text-slate-400">Automatic</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('mx1.mecopay.space');
                          showToast('mx1.mecopay.space কপি হয়েছে', 'success');
                        }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-emerald-400 font-bold">TXT</td>
                    <td className="p-3 font-mono">@</td>
                    <td className="p-3 font-mono text-slate-300">v=spf1 include:relay.mecopay.space ~all</td>
                    <td className="p-3 font-mono text-slate-500">-</td>
                    <td className="p-3 font-mono text-slate-400">Automatic</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('v=spf1 include:relay.mecopay.space ~all');
                          showToast('SPF রেকর্ড কপি হয়েছে', 'success');
                        }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Provider Specific Step-by-Step Instructions */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                📌 Namecheap ব্যবহারকারীদের জন্য সহজ ধাপ:
              </span>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Namecheap অ্যাকাউন্টে গিয়ে আপনার ডোমেইনের <strong className="text-white">"Advanced DNS"</strong> ট্যাবে যান।
                </li>
                <li>
                  পৃষ্ঠাটি স্ক্রোল করে একটু নিচে নামলে <strong className="text-white">"MAIL SETTINGS"</strong> সেকশন পাবেন। ড্রপডাউন থেকে <strong className="text-emerald-400">"Custom MX"</strong> সিলেক্ট করুন (যদি ড্রপডাউনে সাধারণ Host Records-এ MX না পান)।
                </li>
                <li>
                  সেখানে Host ঘরে <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">@</code>, Mail Server ঘরে <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">mx1.mecopay.space</code> এবং Priority ঘরে <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">10</code> লিখে <strong className="text-white">Save Changes</strong> দিন।
                </li>
                <li>
                  এবার উপরের <strong className="text-white">"Host Records"</strong> সেকশনে <strong className="text-emerald-400">"Add New Record"</strong> ক্লিক করে Type-এ <strong className="text-white">TXT Record</strong>, Host-এ <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">@</code> এবং Value-তে <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">v=spf1 include:relay.mecopay.space ~all</code> বসিয়ে সেভ করুন।
                </li>
              </ol>
              <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/60 mt-2">
                💡 <strong className="text-slate-300">GoDaddy / cPanel / অন্যান্য ডোমেইন:</strong> DNS ম্যানেজমেন্টে গিয়ে সরাসরি <strong className="text-white">"Add Record"</strong> থেকে MX ও TXT নির্বাচন করে উপরের মানগুলো বসিয়ে দিলেই সাথে সাথে চালু হয়ে যাবে।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Outgoing SMTP & Transactional Delivery */}
      {activeServiceTab === 'delivery' && (
        <form onSubmit={handleSaveSmtp} className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  MecoPay Transactional Delivery Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  অর্ডার রসিদ, ডিজিটাল ডাউনলোড লিংক এবং পেমেন্ট ইনভয়েস ডেলিভারি কনফিগারেশন
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Brand Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Delivery Service</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none cursor-pointer font-medium"
                >
                  <option value="mecopay_engine">MecoPay High-Speed Delivery Engine (Recommended)</option>
                  <option value="smtp">Standard Custom SMTP Server</option>
                  <option value="resend">Resend API Delivery</option>
                  <option value="ses">Amazon SES Gateway</option>
                  <option value="sendgrid">SendGrid Delivery Engine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Host / Server</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. mail.yourdomain.com or smtp.provider.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Port</label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="587 or 465"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username / Access Key</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SMTP username or access key"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password / Send Token</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter SMTP password or API token"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sender Email Address</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder={`billing@${activeDomain}`}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sender Display Name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder={selectedBrand?.name || 'My Store'}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Triggers */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Customer Delivery Triggers
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">Send Customer Payment Receipt</p>
                  <p className="text-xs text-slate-400">ইনভয়েস এবং ডিজিটাল প্রোডাক্ট ডাউনলোড লিংক কাস্টমারের ইমেইলে অটোমেটিক চলে যাবে।</p>
                </div>
                <input
                  type="checkbox"
                  checked={sendCustomerReceipt}
                  onChange={(e) => setSendCustomerReceipt(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">Send Admin Order Alert</p>
                  <p className="text-xs text-slate-400">কাস্টমার অগ্রিম পেমেন্ট বা নতুন অর্ডার করলে অ্যাডমিন সাথে সাথে ইমেইল নোটিফিকেশন পাবে।</p>
                </div>
                <input
                  type="checkbox"
                  checked={sendAdminAlert}
                  onChange={(e) => setSendAdminAlert(e.target.checked)}
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
            Save Delivery Configuration
          </button>
        </form>
      )}
    </div>
  );
}
