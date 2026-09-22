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
  ExternalLink,
  Database,
  Puzzle,
  Zap,
  Download
} from 'lucide-react';
import { showToast } from '../lib/toast';
import { WORDPRESS_PLUGIN_PHP_CODE, downloadWordPressPluginZip } from '../lib/wordpressPluginSource';

export default function DeveloperDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'three-products' | 'laravel' | 'wordpress' | 'webhook' | 'sql'>('three-products');
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
          <Layers className="w-4 h-4" /> ১. ৩ ধরনের প্রোডাক্ট ও JSON
        </button>

        <button
          onClick={() => setActiveTab('laravel')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'laravel'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-4 h-4" /> ২. Laravel ও Custom Backend
        </button>

        <button
          onClick={() => setActiveTab('wordpress')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'wordpress'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Puzzle className="w-4 h-4 text-emerald-400" /> ৩. WooCommerce Plugin
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'webhook'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4" /> ৪. Webhook & রিয়েল-টাইম সিঙ্ক
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'sql'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" /> ৫. Database SQL Migration
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ৬. API Credentials & Base URL
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
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-300">Webhook POST Payload Samples (ক্যাটাগরি অনুযায়ী আলাদা পে-লোড):</span>
              
              {/* Product 1: Digital Webhook */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400">১. ডিজিটাল প্রোডাক্টের Webhook Payload (কোর্স / ইবুক):</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono">product_type: digital</span>
                </div>
                <pre className="text-xs font-mono text-blue-200 overflow-x-auto">
{`{
  "event": "payment.completed",
  "order_id": "ORD-9812",
  "invoice_number": "INV-2026-9812",
  "product_name": "Fullstack AI Mastery Course",
  "product_type": "digital",
  "amount_paid": 1500,
  "total_amount": 1500,
  "transaction_id": "9H72KA89P1",
  "customer_phone": "01712345678",
  "status": "Completed",
  "fb_passcode": "MC-8921",
  "signature": "sha256_hash_security_token"
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  * ডিজিটাল প্রোডাক্টের ক্ষেত্রে কুরিয়ার ট্র্যাকিং থাকবে না, কারণ এটি ডিজিটাল এক্সেস। এখানে শুধুমাত্র <code>fb_passcode</code>, <code>order_id</code> ও ১০০% পেইড অ্যামাউন্ট থাকবে।
                </p>
              </div>

              {/* Product 2: Physical Advance Webhook */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400">২. ফিজিক্যাল প্রোডাক্ট (Advance + COD) Webhook Payload:</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono">product_type: physical_advance</span>
                </div>
                <pre className="text-xs font-mono text-amber-200 overflow-x-auto">
{`{
  "event": "payment.completed",
  "order_id": "ORD-7734",
  "invoice_number": "INV-2026-7734",
  "product_name": "Wireless Noise Cancelling Headphones",
  "product_type": "physical_advance",
  "amount_paid": 150,
  "total_amount": 1250,
  "cod_due": 1100,
  "transaction_id": "8M41XA99L2",
  "customer_phone": "01812345678",
  "status": "Completed",
  "courier_tracking_code": "STDF-981245",
  "signature": "sha256_hash_security_token"
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  * ফিজিক্যাল প্রোডাক্টে অগ্রিম ফি পরিশোধের পর কুরিয়ার ট্র্যাকিং আইডি ও বাকি COD অ্যামাউন্ট সহ পে-লোড যাবে। এতে কোনো <code>fb_passcode</code> থাকবে না।
                </p>
              </div>

              {/* Product 3: Physical 100% COD Webhook */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400">৩. ফিজিক্যাল প্রোডাক্ট (১০০% Full COD / Just Form) Webhook Payload:</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-mono">product_type: physical_cod</span>
                </div>
                <pre className="text-xs font-mono text-emerald-200 overflow-x-auto">
{`{
  "event": "order.courier_booked",
  "order_id": "ORD-5519",
  "invoice_number": "INV-2026-5519",
  "product_name": "Leather Executive Wallet",
  "product_type": "physical_cod",
  "amount_paid": 0,
  "total_amount": 1200,
  "cod_due": 1200,
  "transaction_id": "COD-ORDER",
  "customer_name": "Mohammad Ali",
  "customer_phone": "01912345678",
  "customer_address": "Chawkbazar, Chittagong",
  "status": "cod_confirmed",
  "courier": {
    "provider": "steadfast",
    "tracking_code": "STDF-883109",
    "tracking_url": "https://steadfast.com.bd/tracking/STDF-883109"
  },
  "signature": "sha256_hash_security_token"
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  * ১০০% Full COD অর্ডারের ক্ষেত্রে গ্রাহকের দেওয়া তথ্য দিয়ে কুরিয়ার বুকিং নিশ্চিত হওয়ার পর কুরিয়ার ট্র্যাকিং কোড এবং গ্রাহক থেকে কুরিয়ার ডেলিভারিতে মোট কত টাকা (<code>cod_due: 1200</code>) আদায় করবে তা সহ পে-লোড পাঠানো হয়।
                </p>
              </div>

              {/* Event 4: Brand Settings Real-time Sync Webhook */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400">৪. ব্র্যান্ড সেটিংস ও সার্ভিস অন/অফ রিয়েল-টাইম সিঙ্ক Webhook:</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-mono">event: brand.settings_updated</span>
                </div>
                <pre className="text-xs font-mono text-purple-200 overflow-x-auto">
{`{
  "event": "brand.settings_updated",
  "brand_id": "your-brand-uuid",
  "payment_gateways_active": true,
  "auto_courier_on_full_cod": false,
  "courier_provider": "steadfast",
  "status": "active",
  "timestamp": 1774239876,
  "signature": "sha256_hash_security_token"
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  * মার্চেন্ট MecoPay ড্যাশবোর্ডে যখনই কুরিয়ার অটোমেশন বা পেমেন্ট সার্ভিস অন/অফ করবে, সাথে সাথে এই Webhook মার্চেন্টের ওয়েবসাইটে চলে যাবে। এর ফলে মার্চেন্টের Laravel/প্লাগইন লোকাল ক্যাশ আপডেট করে রাখবে এবং অপ্রয়োজনীয় API রিকোয়েস্ট আটকে দিয়ে <strong>০% ইনভোকেশন অপচয়</strong> নিশ্চিত করবে।
                </p>
              </div>
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

      {/* TAB 3: WOOCOMMERCE WORDPRESS PLUGIN */}
      {activeTab === 'wordpress' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <Puzzle className="w-3.5 h-3.5" /> Official WordPress Plugin (mecopay-gateway.php)
                </div>
                <h3 className="text-lg font-bold text-white">MecoPay Smart Dual-Gateway WooCommerce Plugin</h3>
                <p className="text-xs text-slate-300">
                  ডিজিটাল প্রোডাক্টে ফুল পেমেন্ট, ফিজিক্যাল প্রোডাক্টে অ্যাডভান্স চার্জ এবং ১০০% Full COD-তে জিরো-ইনভোকেশন ফিল্টারিং সম্পন্ন করে।
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => downloadWordPressPluginZip()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Plugin (.zip)
                </button>
                <button
                  onClick={() => handleCopy(WORDPRESS_PLUGIN_PHP_CODE, 8)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {copiedIndex === 8 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy PHP Code
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Zap className="w-4 h-4" /> Zero-Waste Full COD Guard
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  যদি ড্যাশবোর্ডে কুরিয়ার সার্ভিস বন্ধ থাকে, প্লাগইন কোনো API কল পাঠাবে না। অর্ডার সরাসরি লোকাল WooCommerce-এ সেভ হবে।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Layers className="w-4 h-4" /> Auto Cart Scanning
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  কার্টে থাকা প্রোডাক্ট ডিজিটাল নাকি ফিজিক্যাল তা স্বয়ংক্রিয়ভাবে ডিটেক্ট করে সঠিক পে-লোড এবং অ্যাডভান্স পেমেন্ট প্রসেস করে।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <Webhook className="w-4 h-4" /> Instant Transient Cache
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  MecoPay Webhook থেকে <code>brand.settings_updated</code> ইভেন্ট এলে ইনস্ট্যান্ট WordPress <code>set_transient</code> আপডেট হয়।
                </p>
              </div>
            </div>

            {/* Plugin Installation Steps */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300">ইন্সটলেশন ও সেটআপ নির্দেশিকা:</span>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>আপনার WordPress-এর <code>wp-content/plugins/</code> ফোল্ডারে <code>mecopay-gateway</code> নামে একটি ফোল্ডার বানান।</li>
                <li>তার ভেতর <code>mecopay-gateway.php</code> ফাইল তৈরি করে নিচের পুরো কোডটি পেস্ট করুন।</li>
                <li>WordPress Admin &gt; Plugins থেকে <strong>MecoPay Gateway</strong> সক্রিয় করুন।</li>
                <li>WooCommerce &gt; Settings &gt; Payments &gt; <strong>MecoPay Gateway</strong>-তে গিয়ে আপনার MecoPay <strong>API Key</strong> দিন।</li>
              </ol>
            </div>

            {/* Full Plugin Code Box */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">mecopay-gateway.php Source Code:</span>
                <button
                  onClick={() => handleCopy(WORDPRESS_PLUGIN_PHP_CODE, 8)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 8 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy PHP Code
                </button>
              </div>
              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
{WORDPRESS_PLUGIN_PHP_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE SQL MIGRATION */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <Database className="w-3.5 h-3.5" /> Supabase / PostgreSQL SQL Migration
                </div>
                <h3 className="text-lg font-bold text-white">MecoPay Brands Table SQL Schema Update</h3>
                <p className="text-xs text-slate-300">
                  <code>brands</code> টেবিলে রিয়েল-টাইম কুরিয়ার ও পেমেন্ট অন/অফ সিঙ্ক করার জন্য নিচের কলামগুলো যোগ করুন।
                </p>
              </div>

              <button
                onClick={() => handleCopy(sqlMigrationCode, 9)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
              >
                {copiedIndex === 9 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy SQL Migration
              </button>
            </div>

            {/* SQL Explanation */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300">নতুন কলামসমূহের বিবরণ:</span>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li>
                  <code className="text-emerald-400 font-mono">auto_courier_on_full_cod (BOOLEAN DEFAULT FALSE)</code>: 
                  ১০০% Full COD অর্ডারে অটো কুরিয়ার বুকিং ইনভোকেশন যাবে কিনা তা নিয়ন্ত্রণ করে।
                </li>
                <li>
                  <code className="text-emerald-400 font-mono">payment_gateways_active (BOOLEAN DEFAULT TRUE)</code>: 
                  ব্র্যান্ডের সার্বিক পেমেন্ট গেটওয়ে সক্রিয় আছে কিনা। বন্ধ থাকলে কন্ট্রোলার ও প্লাগইন API কল ব্লক করবে।
                </li>
                <li>
                  <code className="text-emerald-400 font-mono">courier_credentials (JSONB DEFAULT '{}')</code>: 
                  Steadfast ও Pathao API Keys এনক্রিপ্টেড আকারে সংরক্ষণ।
                </li>
                <li>
                  <code className="text-emerald-400 font-mono">checkout_url (TEXT)</code>: 
                  কাস্টম ডোমেইন বা ডিফল্ট চেকআউট গেটওয়ে URL (<code>https://checkout.mecopay.space/pay</code>)।
                </li>
              </ul>
            </div>

            {/* SQL Code Box */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Execute in Supabase SQL Editor:</span>
                <button
                  onClick={() => handleCopy(sqlMigrationCode, 9)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 9 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy SQL
                </button>
              </div>
              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{sqlMigrationCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: API CREDENTIALS & BASE URL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Authentication & Production Base URL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              MecoPay REST API ব্যবহার করতে হলে প্রতিটি রিকোয়েস্টের হেডারে আপনার ব্র্যান্ডের <strong>API Key</strong> (<code>Authorization: Bearer &lt;API_KEY&gt;</code>) পাঠাতে হবে। ক্লাউডফ্লেয়ার ওয়ার্কার স্বয়ংক্রিয়ভাবে API Key থেকে সংশ্লিষ্ট ব্র্যান্ড শনাক্ত করে নেবে।
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Production Base URL (Custom Domain via Cloudflare Worker)</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">mecopay.space</span>
              </div>
              <div className="font-mono text-xs text-emerald-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800 select-all">
                https://api.mecopay.space/v1
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * ডেভেলপাররা <code>https://api.mecopay.space/v1/create-checkout</code> এন্ডপয়েন্টে POST রিকোয়েস্ট পাঠিয়ে চেকআউট সেশন তৈরি করবেন।
              </p>
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
  "order_id": "ORD-9812",
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
  "order_id": "ORD-7734",
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
  "order_id": "ORD-5519",
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
use Illuminate\\Support\\Facades\\Cache;

class PaymentController extends Controller
{
    /**
     * MecoPay চেকআউট সেশন ইনিশিয়ালাইজ করুন
     */
    public function initiatePayment(Request $request)
    {
        $productType = $request->input('product_type', 'digital'); // 'digital' | 'physical_advance' | 'physical_cod'
        $orderId = $request->input('order_id', 'ORD-' . time());

        // =====================================================================
        // ০. লোকাল ক্যাশ চেক (Zero-Waste Invocation Guard)
        // Webhook থেকে সিঙ্ক হওয়া স্ট্যাটাস দেখে অপ্রয়োজনীয় API কল আগেই ব্লক করুন
        // =====================================================================
        
        // কেস A: Full COD কিন্তু MecoPay ড্যাশবোর্ডে কুরিয়ার বন্ধ থাকলে API কল ব্লক করুন
        if ($productType === 'physical_cod') {
            $isAutoCourierEnabled = Cache::get('mecopay_auto_courier', false);
            if (!$isAutoCourierEnabled) {
                // সরাসরি আপনার লোকাল ওয়েবসাইটে অর্ডার সংরক্ষণ করে Thank You পেজে রিডাইরেক্ট করুন
                return redirect()->route('order.success')->with('success', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে (লোকাল হ্যান্ডলিং)।');
            }
        }

        // কেস B: ব্র্যান্ডের পেমেন্ট গেটওয়ে সার্ভিস বন্ধ থাকলে (Personal ও Merchant উভয়ই অফ)
        $isGatewaysActive = Cache::get('mecopay_gateways_active', true);
        if (!$isGatewaysActive && $productType !== 'physical_cod') {
            return back()->with('error', 'বর্তমানে অনলাইন পেমেন্ট সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে ক্যাশ অন ডেলিভারি বেছে নিন।');
        }

        // ১. সাধারণ পে-লোড প্রস্তুত করুন (brand_id প্রয়োজন নেই, API Key দিয়েই স্বয়ংক্রিয়ভাবে অথেন্টিকেশন হবে)
        $payload = [
            'order_id'        => $orderId,
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

        // ৩. MecoPay API-তে রিকোয়েস্ট পাঠান (Authorization হেডারে শুধু API Key পাঠালেই হবে)
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('MECOPAY_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.mecopay.space/v1/create-checkout', $payload);

        // ৪. রেসপন্স পেলে কাস্টমারকে চেকআউট পেজে রিডাইরেক্ট করুন
        if ($response->successful()) {
            $data = $response->json();
            // ডিজিটাল বা অ্যাডভান্স হলে ফ্রন্টএন্ড পেমেন্ট পেজে রিডাইরেক্ট হবে
            if (!empty($data['checkout_url'])) {
                return redirect()->away($data['checkout_url']);
            }
            // ১০০% Full COD হলে সরাসরি লোকাল Thank You পেজে দেখাবে
            if (!empty($data['requires_payment']) === false) {
                return redirect()->route('order.success')->with('success', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!');
            }
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
    const { orderId, productType, productName, price, customerName, customerPhone, customerAddress } = req.body;

    const payload = {
      order_id: orderId || \`ORD-\${Date.now()}\`,
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
      'https://api.mecopay.space/v1/create-checkout',
      payload,
      {
        headers: {
          Authorization: \`Bearer \${process.env.MECOPAY_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );

    // ডিজিটাল/অ্যাডভান্স হলে পেমেন্ট URL-এ রিডাইরেক্ট হবে
    if (response.data.checkout_url) {
      return res.redirect(response.data.checkout_url);
    }

    // Full COD হলে লোকাল সাকসেস মেসেজ
    return res.json({ success: true, message: 'Order placed via COD', data: response.data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};`;

const curlSampleCode = `curl -X POST https://api.mecopay.space/v1/create-checkout \\
  -H "Authorization: Bearer YOUR_BRAND_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "ORD-7734",
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
use Illuminate\\Support\\Facades\\Cache;
use App\\Models\\Order;

class MecoPayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $event = $request->input('event');

        // =====================================================================
        // কেস ০: ব্র্যান্ড সেটিংস রিয়েল-টাইম সিঙ্ক (পেমেন্ট বা কুরিয়ার অন/অফ হলে)
        // =====================================================================
        if ($event === 'brand.settings_updated') {
            $autoCourier = $request->input('auto_courier_on_full_cod', false);
            $gatewaysActive = $request->input('payment_gateways_active', true);

            // লোকাল ক্যাশে সেভ রাখুন (যাতে অপ্রয়োজনীয় API কল কন্ট্রোলারে আটকে দেওয়া যায়)
            Cache::forever('mecopay_auto_courier', $autoCourier);
            Cache::forever('mecopay_gateways_active', $gatewaysActive);

            return response()->json(['status' => 'settings_synced'], 200);
        }

        $orderId = $request->input('order_id'); // ক্লায়েন্ট ওয়েবসাইটের নিজস্ব Order ID
        $invoiceNumber = $request->input('invoice_number');
        $productName = $request->input('product_name');
        $productType = $request->input('product_type');
        $status = $request->input('status');

        // আপনার ডাটাবেসে order_id অথবা invoice_number দিয়ে অর্ডার খুঁজুন
        $order = Order::where('id', $orderId)
                      ->orWhere('invoice_number', $invoiceNumber)
                      ->first();

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // =====================================================================
        // কেস ১: ডিজিটাল বা অ্যাডভান্স পেমেন্ট সফল হওয়া
        // =====================================================================
        if ($event === 'payment.completed' && $status === 'Completed') {
            $trxId = $request->input('transaction_id');
            $fbPasscode = $request->input('fb_passcode'); // ডিজিটাল প্রোডাক্ট হলে
            $trackingCode = $request->input('courier_tracking_code'); // ফিজিক্যাল অ্যাডভান্স হলে

            $order->update([
                'payment_status'   => 'paid',
                'transaction_id'   => $trxId,
                'fb_passcode'      => $fbPasscode,
                'courier_tracking' => $trackingCode,
            ]);
        }

        // =====================================================================
        // কেস ২: ১০০% Full COD অর্ডারে কুরিয়ার বুকিং নিশ্চিত হওয়া
        // =====================================================================
        if ($event === 'order.courier_booked') {
            $courierData = $request->input('courier');
            $order->update([
                'status'           => 'processing',
                'courier_provider' => $courierData['provider'] ?? 'steadfast',
                'courier_tracking' => $courierData['tracking_code'] ?? null,
                'tracking_url'     => $courierData['tracking_url'] ?? null,
            ]);
        }

        return response()->json(['status' => 'success'], 200);
    }
}`;

const sqlMigrationCode = `-- =========================================================================
-- MecoPay Supabase SQL Migration: Brands Table Update for Zero-Waste Sync
-- =========================================================================

-- ১. auto_courier_on_full_cod: ১০০% Full COD অর্ডারে অটো কুরিয়ার বুকিং সক্রিয় কিনা
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS auto_courier_on_full_cod BOOLEAN DEFAULT FALSE;

-- ২. payment_gateways_active: ব্র্যান্ডের গেটওয়ে অন/অফ স্ট্যাটাস
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS payment_gateways_active BOOLEAN DEFAULT TRUE;

-- ৩. courier_credentials: কুরিয়ার API ক্রেডেনশিয়ালস
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS courier_credentials JSONB DEFAULT '{}'::jsonb;

-- ৪. checkout_url: কাস্টম বা ডিফল্ট চেকআউট গেটওয়ে URL
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS checkout_url TEXT DEFAULT 'https://checkout.mecopay.space/pay';

-- ৫. পারফরম্যান্স ও ফাস্ট লুকআপের জন্য api_key ও user_id ইনডেক্স নিশ্চিত করুন
CREATE INDEX IF NOT EXISTS idx_brands_api_key ON public.brands(api_key);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);

-- ৬. রিয়েল-টাইম সাবস্ক্রিপশন সক্ষম করুন (Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;`;
