import React, { useState } from 'react';
import { 
  Book, 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Truck, 
  Package, 
  FileCode2, 
  CheckCheck, 
  Sparkles, 
  Webhook, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { showToast } from '../lib/toast';

export default function DeveloperDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'three-products' | 'laravel' | 'webhook'>('three-products');
  const [productSubTab, setProductSubTab] = useState<'digital' | 'physical_advance' | 'physical_cod'>('digital');
  const [frameworkTab, setFrameworkTab] = useState<'laravel' | 'nodejs' | 'curl'>('laravel');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Official API Release v2.5
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            MecoPay Multi-Product & Developer Docs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Laravel, Node.js বা যেকোনো কাস্টম ওয়েবসাইটের জন্য Digital (Telegram/FB/Drive), Physical Advance+COD এবং 100% COD ইন্টিগ্রেশন ও REST API গাইড।
          </p>
        </div>
      </div>

      {/* Top Prominent Notice: Cart Policies for Laravel & All Custom Websites */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>বাধ্যতামূলক কার্ট নিয়মাবলী (Laravel ও যেকোনো Custom Website):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> ১. অনুমোদিত কার্ট নিয়ম (Allowed)
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed pl-1">
              <li>• <strong className="text-white">ফিজিক্যাল প্রোডাক্ট:</strong> কার্টে একসাথে একাধিক (Multiple) ফিজিক্যাল পণ্য নিতে পারবে (যেমন: ২টি টি-শার্ট + ১টি ঘড়ি)।</li>
              <li>• <strong className="text-white">ডিজিটাল প্রোডাক্ট (কোর্স):</strong> পাসকোড এবং প্রাইভেট চ্যানেল/গ্রুপ সুরক্ষার জন্য ডিজিটাল কোর্স <strong className="text-emerald-400">একবারে ১টি (Single)</strong> কেনা যাবে।</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-2">
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-400" /> ২. সম্পূর্ণ নিষিদ্ধ (Forbidden)
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed pl-1">
              <li>• <strong className="text-white">মিক্সড কার্ট (Physical + Digital):</strong> ১টি ফিজিক্যাল এবং ১টি ডিজিটাল প্রোডাক্ট একসাথে কার্টে রাখা <strong className="text-rose-400">সম্পূর্ণ নিষিদ্ধ</strong>।</li>
              <li>• কাস্টমার চেকআউট করতে গেলে ওয়েবসাইট বা কন্ট্রোলার অর্ডার আটকে দিয়ে নোটিশ দেখাবে: <em className="text-amber-200">"দুঃখিত! ফিজিক্যাল এবং ডিজিটাল পণ্য একসাথে অর্ডার করা সম্ভব নয়। আলাদা আলাদা অর্ডার করুন।"</em></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('three-products')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'three-products'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> ১. ৩ ধরনের প্রোডাক্ট ও JSON পে-লোড
        </button>

        <button
          onClick={() => setActiveTab('laravel')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'laravel'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-4 h-4" /> ২. Laravel ও কাস্টম ওয়েবসাইট সেটআপ
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'webhook'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4" /> ৩. Webhook & অর্ডার অটো-আপডেট
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ৪. API Credentials & Base URL
        </button>
      </div>

      {/* TAB 1: THREE PRODUCT TYPES & JSON */}
      {activeTab === 'three-products' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setProductSubTab('digital')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                productSubTab === 'digital'
                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-blue-400 mb-1">
                <Send className="w-4 h-4" /> ১. Digital Product (100% Pay)
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                ১০০% পেমেন্ট + Telegram, FB Group Passcode ও Drive লিংক সহ তাৎক্ষণিক ডেলিভারি।
              </div>
            </button>

            <button
              onClick={() => setProductSubTab('physical_advance')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                productSubTab === 'physical_advance'
                  ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-1">
                <Truck className="w-4 h-4" /> ২. Physical (Advance + COD)
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                মোট মূল্য ১২৫০৳ হলেও গেটওয়েতে শুধু ১৫০৳ অগ্রিম চার্জ হবে, বাকি ১১০০৳ কুরিয়ার কালেকশন।
              </div>
            </button>

            <button
              onClick={() => setProductSubTab('physical_cod')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                productSubTab === 'physical_cod'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1">
                <Package className="w-4 h-4" /> ৩. Physical (100% COD)
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                "Just Form" মোড — কোনো পেমেন্ট গেটওয়ে শো করবে না, সরাসরি নাম ও ঠিকানা দিয়ে অর্ডার সেভ হবে।
              </div>
            </button>
          </div>

          {/* Sub Tab Content: DIGITAL */}
          {productSubTab === 'digital' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    Instant 3-Platform Delivery
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">ডিজিটাল প্রোডাক্টের JSON পে-লোড ও রিকোয়েস্ট ফরম্যাট</h3>
                </div>
                <button
                  onClick={() => handleCopy(digitalJsonPayload, 1)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-blue-200 overflow-x-auto leading-relaxed">
{digitalJsonPayload}
              </pre>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> লাইন বাই লাইন বাংলায় ব্যাখ্যা:
                </h4>
                <ul className="space-y-2 text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong className="text-white font-mono">"product_type": "digital"</strong> &rarr; সিস্টেমকে নির্দেশ করে যে এটি কোর্স, ইবুক বা সফটওয়্যার। ফলে চেকআউটে কোনো হোম ডেলিভারি ঠিকানা ফিল্ড চাইবে না।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"amount": 1500</strong> &rarr; কাস্টমারের থেকে ১০০% ফুল পেমেন্ট নেওয়া হবে (বিকাশ/নগদ পার্সোনাল TrxID বা অফিসিয়াল মার্চেন্ট গেটওয়ে দিয়ে)।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"telegram_link"</strong> &rarr; পেমেন্ট সফল হওয়ার পর স্ক্রিনে সরাসরি <em>"Join Private Telegram Channel"</em> বাটন ফুটে উঠবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"facebook_group_link"</strong> &rarr; কাস্টমারকে ফেসবুক গ্রুপের লিংক দেখাবে এবং সাথে সিস্টেম স্বয়ংক্রিয়ভাবে একটি ইউনিক সিক্রেট পাসকোড (যেমন: <code>MC-8921</code>) জেনারেট করে দেবে, যা দিয়ে কাস্টমার ফেসবুক গ্রুপে জয়েন রিকোয়েস্টে উত্তর দেবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"google_drive_link"</strong> &rarr; সফটওয়্যার বা ড্রাইভ ফাইল ডাউনলোডের এক্সেস লিংক।
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Sub Tab Content: PHYSICAL ADVANCE */}
          {productSubTab === 'physical_advance' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                    Partial Advance Delivery Charge
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">ফিজিক্যাল প্রোডাক্ট (অগ্রিম ডেলিভারি চার্জ + ক্যাশ অন ডেলিভারি)</h3>
                </div>
                <button
                  onClick={() => handleCopy(advanceJsonPayload, 2)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
{advanceJsonPayload}
              </pre>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> লাইন বাই লাইন বাংলায় ব্যাখ্যা:
                </h4>
                <ul className="space-y-2 text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong className="text-white font-mono">"total_amount": 1250</strong> &rarr; পণ্যের আসল পূর্ণ মূল্য।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"amount": 150</strong> &rarr; <span className="text-amber-400 font-bold">ম্যাজিক ফিল্ড:</span> কাস্টমার চেকআউট স্ক্রিনে ১২৫০ টাকা দেখলেও গেটওয়ে শুধুমাত্র এই ১৫০ টাকা চার্জ করবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"cod_due": 1100</strong> &rarr; বাকি ১১০০ টাকা কুরিয়ারে ক্যাশ অন ডেলিভারি হিসেবে বকেয়া থাকবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"fulfillment_type": "dropship" | "own_inventory"</strong> &rarr; ড্রপশিপিং হলে ৭ বা ১০ দিন পর অটো-সেটেল হবে, নিজস্ব ইনভেন্টরি হলে কুরিয়ার API ডেলিভারি স্টেটাস পাওয়ার পর সেটেল হবে।
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Sub Tab Content: PHYSICAL 100% COD */}
          {productSubTab === 'physical_cod' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    "Just Form" (No Payment Gateway)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">ফিজিক্যাল প্রোডাক্ট (১০০% ক্যাশ অন ডেলিভারি / জাস্ট ফর্ম)</h3>
                </div>
                <button
                  onClick={() => handleCopy(codJsonPayload, 3)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto leading-relaxed">
{codJsonPayload}
              </pre>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> লাইন বাই লাইন বাংলায় ব্যাখ্যা:
                </h4>
                <ul className="space-y-2 text-slate-300 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong className="text-white font-mono">"product_type": "physical_cod"</strong> &rarr; চেকআউট পেজে কোনো পেমেন্ট গেটওয়ে (বিকাশ/নগদ/TrxID) আসবেই না। কাস্টমার শুধু নাম, ফোন ও ঠিকানা দিয়ে ফর্ম সাবমিট করবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"amount": 0</strong> &rarr; অনলাইনে কোনো টাকা চার্জ করা হবে না।
                  </li>
                  <li>
                    <strong className="text-white font-mono">"cod_due": 1200</strong> &rarr; সম্পূর্ণ ১২০০ টাকাই কুরিয়ার ডেলিভারি ম্যান কাস্টমার থেকে ক্যাশ আদায় করবে।
                  </li>
                  <li>
                    <strong className="text-white font-mono">ড্যাশবোর্ড সিঙ্ক:</strong> অর্ডারটি সাথে সাথে আপনার MecoPay-র <strong>Invoices</strong> এবং <strong>Courier Service</strong>-এ সেভ হবে, যেখান থেকে আপনি ১-ক্লিকে Steadfast বা Pathao-তে বুক করতে পারবেন।
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LARAVEL & CUSTOM WEBSITE INTEGRATION */}
      {activeTab === 'laravel' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" /> Laravel ও কাস্টম ওয়েবসাইটে কোড কীভাবে ও কোথায় বসাবেন?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                নিচের স্টেপগুলো ফলো করে মাত্র ৩ মিনিটে আপনার Laravel বা কাস্টম ওয়েবসাইটে পেমেন্ট যুক্ত করুন:
              </p>
            </div>

            {/* Framework Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setFrameworkTab('laravel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  frameworkTab === 'laravel'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Laravel (PHP)
              </button>
              <button
                onClick={() => setFrameworkTab('nodejs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  frameworkTab === 'nodejs'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Node.js (Express)
              </button>
              <button
                onClick={() => setFrameworkTab('curl')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  frameworkTab === 'curl'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                cURL (Direct Terminal)
              </button>
            </div>

            {/* STEP 1: .env */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">1</span>
                ধাপ ১: আপনার <code>.env</code> ফাইলে API Credentials যোগ করুন
              </h4>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300">
{`MECOPAY_API_KEY=your_brand_api_key_here
MECOPAY_BRAND_ID=your_brand_uuid_here
MECOPAY_BASE_URL=https://fwonuakvherzofqximno.supabase.co/functions/v1`}
              </pre>
              <p className="text-[11px] text-slate-400">
                * অবস্থান: আপনার প্রোজেক্টের মূল রুটের <code>.env</code> ফাইলের নিচে এই ৩টি লাইন পেস্ট করুন।
              </p>
            </div>

            {/* STEP 2: Controller */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">2</span>
                  ধাপ ২: <code>app/Http/Controllers/PaymentController.php</code> তৈরি করুন
                </h4>
                <button
                  onClick={() => handleCopy(frameworkTab === 'laravel' ? laravelFullController : frameworkTab === 'nodejs' ? nodeJsFullController : curlSampleCode, 4)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 4 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Code
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
{frameworkTab === 'laravel' ? laravelFullController : frameworkTab === 'nodejs' ? nodeJsFullController : curlSampleCode}
              </pre>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <h5 className="font-bold text-white">কোডটি কীভাবে কাজ করে?</h5>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>কাস্টমার যখন চেকআউট বাটনে চাপ দেয়, কন্ট্রোলার রিকোয়েস্টটি ধরে।</li>
                  <li>প্রোডাক্টের টাইপ অনুযায়ী ডাইনামিক পে-লোড বানিয়ে MecoPay-র <code>/create-checkout</code> এ পাঠায়।</li>
                  <li>MecoPay সাথে সাথে একটি সিকিউর <code>checkout_url</code> রিটার্ন করে।</li>
                  <li>Laravel কাস্টমারকে স্বয়ংক্রিয়ভাবে সেই লিংকে রিডাইরেক্ট করে দেয়।</li>
                </ol>
              </div>
            </div>

            {/* STEP 3: routes/web.php */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
                ধাপ ৩: <code>routes/web.php</code>-তে রাউট বসিয়ে দিন
              </h4>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300">
{`use App\\Http\\Controllers\\PaymentController;

// পেমেন্ট ইনিশিয়ালাইজ করার রাউট
Route::post('/checkout/pay', [PaymentController::class, 'initiatePayment'])->name('checkout.pay');

// পেমেন্ট সফল বা বাতিল হলে কাস্টমারকে ফিরিয়ে আনার রাউট
Route::get('/payment/callback', [PaymentController::class, 'paymentCallback'])->name('payment.callback');
Route::get('/payment/cancel', [PaymentController::class, 'paymentCancel'])->name('payment.cancel');`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOKS & AUTO-SYNC */}
      {activeTab === 'webhook' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Webhook className="w-5 h-5 text-emerald-400" /> Webhook Handling & Automatic Order Update
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                পেমেন্ট সফল হলে বা কুরিয়ার পার্সেল ডেলিভারি কনফার্ম করলে MecoPay স্বয়ংক্রিয়ভাবে আপনার ব্যাকএন্ডে একটি সিকিউর POST Webhook পাঠাবে।
              </p>
            </div>

            {/* Webhook JSON Payload */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Webhook POST Payload Sample:</span>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "event": "payment.completed",
  "invoice_number": "INV-2026-9812",
  "product_type": "physical_advance",
  "amount_paid": 150,
  "total_amount": 1250,
  "cod_due": 1100,
  "transaction_id": "9H72KA89P1",
  "customer_phone": "01712345678",
  "status": "Completed",
  "fb_passcode": "MC-8921",
  "courier_tracking_code": "STDF-981245",
  "signature": "sha256_hash_security_token"
}`}
              </pre>
            </div>

            {/* Laravel Webhook Code */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Laravel Webhook Controller Implementation:</span>
                <button
                  onClick={() => handleCopy(laravelWebhookCode, 5)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 5 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Webhook Code
                </button>
              </div>
              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
{laravelWebhookCode}
              </pre>
              <p className="text-[11px] text-slate-400">
                * মনে রাখবেন: Laravel-এর <code>app/Http/Middleware/VerifyCsrfToken.php</code>-তে গিয়ে <code>/api/mecopay/webhook</code> রাউটটি <code>$except</code> অ্যারেতে এক্সক্লুড করে রাখবেন, যাতে CSRF টোকেন মিসম্যাচ না হয়।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API CREDENTIALS & BASE URL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Authentication & Production Base URL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              MecoPay REST API ব্যবহার করতে হলে প্রতিটি রিকোয়েস্টে আপনার ব্র্যান্ডের <strong>API Key</strong> এবং <strong>Brand ID</strong> পাঠাতে হবে।
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Production Base URL</span>
              <div className="font-mono text-xs text-emerald-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800 select-all">
                https://fwonuakvherzofqximno.supabase.co/functions/v1
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Required Headers</span>
              <pre className="font-mono text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 overflow-x-auto">
{`Content-Type: application/json
Authorization: Bearer <YOUR_BRAND_API_KEY>`}
              </pre>
              <p className="text-[11px] text-slate-400">
                * আপনার ব্র্যান্ডের API Key পেতে ড্যাশবোর্ডের বাম পাশের মেনু থেকে <strong>Brand</strong> সেকশনে যান।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= CODE PAYLOADS =================

const digitalJsonPayload = `{
  "brand_id": "your-brand-uuid",
  "product_type": "digital",
  "product_name": "Fullstack AI Mastery Course",
  "amount": 1500,
  "gateway_routing": "both",
  "customer_name": "Rahim Ahmed",
  "customer_phone": "01712345678",
  "customer_email": "rahim@example.com",
  "telegram_link": "https://t.me/+joinchat_secretinvite",
  "facebook_group_link": "https://facebook.com/groups/aimasteryvip",
  "google_drive_link": "https://drive.google.com/drive/folders/sample_materials",
  "callback_url": "https://yourwebsite.com/payment/callback",
  "cancel_url": "https://yourwebsite.com/payment/cancel"
}`;

const advanceJsonPayload = `{
  "brand_id": "your-brand-uuid",
  "product_type": "physical_advance",
  "product_name": "Wireless Noise Cancelling Headphones",
  "total_amount": 1250,
  "amount": 150,
  "cod_due": 1100,
  "gateway_routing": "both",
  "customer_name": "Tanvir Hasan",
  "customer_phone": "01812345678",
  "customer_address": "House 12, Road 4, Sector 7, Uttara, Dhaka",
  "fulfillment_type": "dropship",
  "callback_url": "https://yourwebsite.com/payment/callback",
  "cancel_url": "https://yourwebsite.com/payment/cancel"
}`;

const codJsonPayload = `{
  "brand_id": "your-brand-uuid",
  "product_type": "physical_cod",
  "product_name": "Leather Executive Wallet",
  "total_amount": 1200,
  "amount": 0,
  "cod_due": 1200,
  "customer_name": "Mohammad Ali",
  "customer_phone": "01912345678",
  "customer_address": "Chawkbazar, Chittagong",
  "fulfillment_type": "own_inventory",
  "callback_url": "https://yourwebsite.com/order/success",
  "cancel_url": "https://yourwebsite.com/checkout"
}`;

const laravelFullController = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;

class PaymentController extends Controller
{
    /**
     * MecoPay চেকআউট সেশন ইনিশিয়ালাইজ করুন
     */
    public function initiatePayment(Request $request)
    {
        $productType = $request->input('product_type', 'digital'); // 'digital' | 'physical_advance' | 'physical_cod'

        // ১. সাধারণ পে-লোড প্রস্তুত করুন
        $payload = [
            'brand_id'        => env('MECOPAY_BRAND_ID'),
            'product_type'    => $productType,
            'product_name'    => $request->input('product_name'),
            'customer_name'   => $request->input('customer_name'),
            'customer_phone'  => $request->input('customer_phone'),
            'customer_address'=> $request->input('customer_address'),
            'callback_url'    => route('payment.callback'),
            'cancel_url'      => route('payment.cancel'),
        ];

        // ২. প্রোডাক্ট টাইপ অনুযায়ী স্পেসিফিক ফিল্ড যুক্ত করুন
        if ($productType === 'digital') {
            $payload['amount'] = $request->input('price'); // ১০০% পেমেন্ট
            $payload['telegram_link'] = "https://t.me/+joinchat_secret";
            $payload['facebook_group_link'] = "https://facebook.com/groups/vip";
            $payload['google_drive_link'] = "https://drive.google.com/drive/folders/materials";
        } 
        elseif ($productType === 'physical_advance') {
            $payload['total_amount'] = $request->input('price'); // ১২৫০ ৳
            $payload['amount'] = 150; // গেটওয়েতে চার্জ হবে ১৫০ ৳ অগ্রিম ডেলিভারি ফি
            $payload['cod_due'] = $request->input('price') - 150; // কুরিয়ারে ১১০০ ৳
            $payload['fulfillment_type'] = 'dropship'; // অথবা 'own_inventory'
        } 
        elseif ($productType === 'physical_cod') {
            $payload['total_amount'] = $request->input('price');
            $payload['amount'] = 0; // কোনো গেটওয়ে লোড হবে না (Just Form)
            $payload['cod_due'] = $request->input('price');
        }

        // ৩. MecoPay API-তে রিকোয়েস্ট পাঠান
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('MECOPAY_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post(env('MECOPAY_BASE_URL') . '/create-checkout', $payload);

        // ৪. রেসপন্স পেলে কাস্টমারকে চেকআউট পেজে রিডাইরেক্ট করুন
        if ($response->successful() && isset($response['checkout_url'])) {
            return redirect()->away($response['checkout_url']);
        }

        return back()->with('error', 'MecoPay Checkout Connection Failed: ' . ($response['error'] ?? 'Unknown Error'));
    }

    public function paymentCallback(Request $request)
    {
        $invoiceId = $request->get('invoice_number');
        return view('payment-success', compact('invoiceId'));
    }

    public function paymentCancel(Request $request)
    {
        return redirect()->route('checkout')->with('warning', 'আপনি পেমেন্ট বাতিল করেছেন।');
    }
}`;

const nodeJsFullController = `const axios = require('axios');

exports.createCheckout = async (req, res) => {
  try {
    const { productType, productName, price, customerName, customerPhone, customerAddress } = req.body;

    const payload = {
      brand_id: process.env.MECOPAY_BRAND_ID,
      product_type: productType,
      product_name: productName,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      callback_url: 'https://yourshop.com/payment/callback',
      cancel_url: 'https://yourshop.com/checkout'
    };

    if (productType === 'digital') {
      payload.amount = price;
      payload.telegram_link = 'https://t.me/+joinchat_secret';
      payload.facebook_group_link = 'https://facebook.com/groups/vip';
      payload.google_drive_link = 'https://drive.google.com/drive/folders/sample';
    } else if (productType === 'physical_advance') {
      payload.total_amount = price;
      payload.amount = 150; // Advance charge
      payload.cod_due = price - 150;
    } else {
      payload.total_amount = price;
      payload.amount = 0; // 100% COD
      payload.cod_due = price;
    }

    const response = await axios.post(
      \`\${process.env.MECOPAY_BASE_URL}/create-checkout\`,
      payload,
      {
        headers: {
          Authorization: \`Bearer \${process.env.MECOPAY_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.redirect(response.data.checkout_url);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};`;

const curlSampleCode = `curl -X POST https://fwonuakvherzofqximno.supabase.co/functions/v1/create-checkout \\
  -H "Authorization: Bearer YOUR_BRAND_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand_id": "YOUR_BRAND_UUID",
    "product_type": "physical_advance",
    "product_name": "Premium T-Shirt",
    "total_amount": 1200,
    "amount": 150,
    "cod_due": 1050,
    "customer_name": "Tanvir Hasan",
    "customer_phone": "01700000000",
    "customer_address": "Dhanmondi 32, Dhaka",
    "callback_url": "https://yourshop.com/callback",
    "cancel_url": "https://yourshop.com/cancel"
  }'`;

const laravelWebhookCode = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\Order;

class MecoPayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $event = $request->input('event');
        $invoiceNumber = $request->input('invoice_number');
        $status = $request->input('status');
        $trxId = $request->input('transaction_id');
        $fbPasscode = $request->input('fb_passcode'); // ডিজিটাল প্রোডাক্ট হলে
        $trackingCode = $request->input('courier_tracking_code'); // ফিজিক্যাল হলে

        if ($event === 'payment.completed' && $status === 'Completed') {
            // আপনার ডাটাবেসে অর্ডার পেইড হিসেবে মার্ক করুন
            $order = Order::where('invoice_number', $invoiceNumber)->first();
            if ($order) {
                $order->update([
                    'status' => 'paid',
                    'transaction_id' => $trxId,
                    'fb_passcode' => $fbPasscode,
                    'courier_tracking' => $trackingCode
                ]);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}`;
