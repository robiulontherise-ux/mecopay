import React, { useState } from 'react';
import { ShoppingCart, Search, CheckCircle2, ShieldCheck, Zap, Globe, Sparkles, ExternalLink, ArrowRight, AlertCircle, X, Mail } from 'lucide-react';
import { showToast } from '../../lib/toast';

interface CustomDomainBuyProps {
  user: any;
  brands?: any[];
}

export default function CustomDomainBuy({ user, brands = [] }: CustomDomainBuyProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTld, setSelectedTld] = useState('.com');
  const [showBuyNotice, setShowBuyNotice] = useState(false);
  const [targetDomain, setTargetDomain] = useState('');

  const domainExtensions = [
    { tld: '.com', price: '৳1,250/yr', popular: true, desc: 'Global Commercial Standard' },
    { tld: '.xyz', price: '৳290/yr', popular: false, desc: 'Budget & Modern Tech' },
    { tld: '.shop', price: '৳650/yr', popular: true, desc: 'Best for E-commerce Stores' },
    { tld: '.store', price: '৳720/yr', popular: false, desc: 'Direct Online Retail' },
    { tld: '.net', price: '৳1,450/yr', popular: false, desc: 'Network & Tech Platforms' },
    { tld: '.com.bd', price: '৳1,850/2yr', popular: true, desc: 'Official Bangladesh Local Trust' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      showToast('Please enter a domain name to search', 'error');
      return;
    }
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setSearched(true);
    }, 600);
  };

  const cleanName = searchTerm.trim().toLowerCase().replace(/\.[a-z.]+$/, '').replace(/[^a-z0-9-]/g, '');

  const triggerBuyWarning = (domainStr: string) => {
    setTargetDomain(domainStr);
    setShowBuyNotice(true);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          Custom Domain Buy
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Search, register, and automatically link premium custom domains directly to your MecoPay store.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-bold text-amber-200 text-sm">
            প্রিয় মার্চেন্ট, দ্রুতই আমাদের ইন-হাউস অটোমেটেড ডোমেইন রেজিস্ট্রেশন সার্ভিস যুক্ত হতে যাচ্ছে!
          </p>
          <p className="text-slate-300">
            আপাতত আপনি যেকোনো ডোমেইন প্রোভাইডার (যেমন: Namecheap, GoDaddy, Porkbun) থেকে ডোমেইন কিনে সহজে CNAME দিয়ে কানেক্ট করতে পারেন।
          </p>
          <p className="text-slate-300">
            আপনার যদি ডুয়াল কারেন্সি কার্ড না থাকে বা ডোমেইন কিনতে সমস্যা হয়, তবে সরাসরি আমাদের সাথে যোগাযোগ করুন: <a href="mailto:support@mecopay.space" className="text-amber-300 underline font-semibold">support@mecopay.space</a> — আমাদের টিম আপনার নামে ডোমেইন কিনে সেটআপ করে দেবে।
          </p>
        </div>
      </div>

      {/* Domain Search Box */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearched(false);
                }}
                placeholder="Type your brand name (e.g. rorshop, fashionbd)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-4 pr-12 py-3.5 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-base font-medium"
              />
              <Search className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {searching ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Search Domain
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searched && cleanName && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-mono">{cleanName}.com</h4>
                  <p className="text-xs text-emerald-400 font-medium">Domain available for instant registration!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-base font-bold text-white">৳1,250</span>
                  <span className="text-xs text-slate-400 block">/ 1 Year</span>
                </div>
                <button
                  onClick={() => triggerBuyWarning(`${cleanName}.com`)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Buy Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alternative TLDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {['.shop', '.store', '.xyz', '.net'].map((tld) => (
                <div key={tld} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-white font-mono">{cleanName}{tld}</span>
                    <span className="text-xs text-slate-400 block">Available</span>
                  </div>
                  <button
                    onClick={() => triggerBuyWarning(`${cleanName}${tld}`)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Popular Domain Extensions & Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {domainExtensions.map((item) => (
            <div
              key={item.tld}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors relative"
            >
              {item.popular && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              <div className="text-2xl font-bold font-mono text-white mb-1">{item.tld}</div>
              <p className="text-xs text-slate-400 mb-3">{item.desc}</p>
              <div className="text-lg font-bold text-emerald-400">{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Included Free Features Banner */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Every Domain Purchased Includes:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Free Lifetime SSL / HTTPS Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Automated 1-Click DNS Connection to MecoPay</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>WHOIS Privacy Protection (Keep personal data hidden)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>DDoS & Bot Mitigation by MecoPay Shield</span>
          </div>
        </div>
      </div>

      {/* Domain Buy Notice Modal */}
      {showBuyNotice && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowBuyNotice(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                ডোমেইন রেজিস্ট্রেশন নোটিশ {targetDomain ? `(${targetDomain})` : ''}
              </h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                MecoPay Automated Domain Service
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-slate-200 text-sm leading-relaxed space-y-2">
              <p className="font-semibold text-amber-300">
                প্রিয় মার্চেন্ট,
              </p>
              <p>
                দ্রুতই আমাদের ইন-হাউস অটোমেটেড ডোমেইন রেজিস্ট্রেশন সার্ভিস যুক্ত হতে যাচ্ছে।
              </p>
              <p className="text-xs text-slate-300">
                আপাতত আপনি যেকোনো ডোমেইন প্রোভাইডার (যেমন: Namecheap, GoDaddy, Porkbun) থেকে ডোমেইন কিনে সহজে CNAME দিয়ে কানেক্ট করতে পারেন।
              </p>
              <p className="text-xs text-slate-300">
                আপনার যদি ডুয়াল কারেন্সি কার্ড না থাকে বা ডোমেইন কিনতে সমস্যা হয়, তবে সরাসরি আমাদের সাথে যোগাযোগ করুন:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  support@mecopay.space
                </span>
                <a
                  href="mailto:support@mecopay.space?subject=Need help purchasing custom domain"
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-all"
                >
                  ইমেইল করুন
                </a>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * আমাদের টিম আপনার নামে যেকোনো ডোমেইন কিনে সম্পূর্ণ সেটআপ করে দেবে।
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBuyNotice(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
