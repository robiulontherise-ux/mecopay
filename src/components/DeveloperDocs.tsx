import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Send, 
  Truck, 
  Package, 
  FileCode2, 
  Sparkles, 
  Webhook, 
  ShieldCheck, 
  Layers,
  Cpu,
  AlertCircle,
  Info
} from 'lucide-react';
import { showToast } from '../lib/toast';

export default function DeveloperDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'three-products' | 'laravel' | 'webhook' | 'worker-code' | 'overview'>('three-products');
  const [productSubTab, setProductSubTab] = useState<'digital' | 'physical_advance' | 'physical_cod'>('digital');
  const [frameworkTab, setFrameworkTab] = useState<'laravel' | 'php' | 'nodejs' | 'javascript' | 'python'>('laravel');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getFrameworkCode = () => {
    switch (frameworkTab) {
      case 'laravel':
        return laravelFullController;
      case 'php':
        return rawPhpController;
      case 'nodejs':
        return nodeJsFullController;
      case 'javascript':
        return jsFetchController;
      case 'python':
        return pythonFullController;
      default:
        return laravelFullController;
    }
  };

  const getFrameworkFileName = () => {
    switch (frameworkTab) {
      case 'laravel':
        return 'app/Http/Controllers/PaymentController.php';
      case 'php':
        return 'process_payment.php (Core PHP)';
      case 'nodejs':
        return 'controllers/paymentController.js (Express)';
      case 'javascript':
        return 'checkout.js (Fetch API)';
      case 'python':
        return 'views.py / payment.py (Django / Flask)';
      default:
        return 'PaymentController.php';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Official API Release v2.5 • Zero-Waste Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            MecoPay Multi-Product & Developer Docs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Laravel, Raw PHP, Node.js, JavaScript, Python এবং কাস্টম ওয়েবসাইটের জন্য Digital, Physical Advance ও 100% Full COD ইন্টিগ্রেশন স্পেসিফিকেশন।
          </p>
        </div>
      </div>

      {/* Cart Integrity & Prohibited Mixed Cart Banner */}
      <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>প্রোডাক্ট অর্ডার ও কার্ট পলিসি (Cart Integrity & Prohibited Rules):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">১</span>
              একই অর্ডারে সর্বোচ্চ ১টি ডিজিটাল প্রোডাক্ট
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              স্বয়ংক্রিয় পাসকোড, টেলিগ্রাম ইনভাইট ও ড্রাইভ লিংকের পূর্ণ নিরাপত্তা নিশ্চিত করতে গ্রাহক একবারে সর্বোচ্চ ১টি ডিজিটাল প্রোডাক্ট কিনতে পারবে।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/20 space-y-2">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">২</span>
              মিক্সড কার্ট সম্পূর্ণ নিষিদ্ধ (Mixed Cart Prohibited)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ডিজিটাল এবং ফিজিক্যাল প্রোডাক্ট একই সাথে এক অর্ডারে কেনা যাবে না। কারণ ডিজিটাল পণ্যে তাৎক্ষণিক ১০০% পেমেন্ট লাগে, আর ফিজিক্যাল পণ্যে কুরিয়ার ও অ্যাডভান্স হ্যান্ডলিং প্রয়োজন।
            </p>
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
          <FileCode2 className="w-4 h-4" /> ২. Backend & Custom Code (PHP/JS/Python)
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'webhook'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4" /> ৩. Webhook & রিয়েল-টাইম সিঙ্ক
        </button>

        <button
          onClick={() => setActiveTab('worker-code')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'worker-code'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" /> ৪. Cloudflare Worker কোড (Final)
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ৫. API Credentials & Base URL
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
                ১০০% পেমেন্ট + সাকসেস URL আবশ্যক + Telegram/FB/Drive লিংক ও পাসকোড ডেলিভারি।
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
                <Truck className="w-4 h-4" /> ২. Physical (Advance + Courier Fee)
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                মোট মূল্য + কুরিয়ার চার্জ থেকে ১৫০৳ অগ্রিম চার্জ এবং বাকি টাকা কুরিয়ারে ডিউ কালেকশন।
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
                <Package className="w-4 h-4" /> ৩. Physical (100% COD + Courier Fee)
              </div>
              <div className="text-[11px] text-slate-300 leading-snug">
                গেটওয়েতে ০৳ চার্জ। পণ্যমূল্য + কুরিয়ার ফি সহ মোট টাকা ডেলিভারিতে আদায় ও কুরিয়ার বুকিং।
              </div>
            </button>
          </div>

          {/* Sub Tab Content 1: Digital */}
          {productSubTab === 'digital' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
                    <Send className="w-3.5 h-3.5" /> 100% Digital Payment Payload
                  </div>
                  <h3 className="text-lg font-bold text-white">Digital Product JSON Payload Specification</h3>
                  <p className="text-xs text-slate-400">
                    ফুল পেমেন্ট সফল হওয়ার সাথে সাথে গ্রাহককে <code>callback_url</code>-এ ফিরিয়ে আনা হয় এবং স্ক্রিনে পাসকোড দেওয়া হয়।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(digitalJsonPayload, 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0 self-start sm:self-auto"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
{digitalJsonPayload}
              </pre>

              {/* Mandatory vs Optional Table for Digital */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-800 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <th className="p-3">ফিল্ড নেম</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">বিবরণ ও সার্ভিস গাইডলাইন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    <tr>
                      <td className="p-3 font-mono text-blue-300">order_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">যেকোনো একটি অবশ্যই পাঠাতে হবে (দুটোই পাঠালে ট্র্যাকিংয়ের জন্য সর্বোত্তম)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"digital"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">amount</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ডিজিটাল পণ্যের ১০০% সম্পূর্ণ মূল্য।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">callback_url</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">পেমেন্ট সফল হলে আপনার ওয়েবসাইটের যে পেজে কাস্টমারকে রিডাইরেক্ট করা হবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">telegram_link / facebook_group_link / google_drive_link</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">১টি, ২টি, ৩টি লিংক পাঠাতে পারেন অথবা কোনো লিংক না পাঠালেও চলবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">customer_phone</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহকের মোবাইল নম্বর। আপনার ব্র্যান্ডে যদি <strong>SMS বা WhatsApp নোটিফিকেশন সার্ভিস অন</strong> থাকে, তবে অর্ডার সফল হওয়ার পর ফোনে নিশ্চিতকরণ মেসেজ ও পাসকোড পাঠাতে এই নম্বর পাঠানো <strong>আবশ্যক</strong> (অন্যথায় কোন নম্বরে সাকসেস মেসেজ যাবে?)। সার্ভিস সক্রিয় না থাকলে না পাঠালেও কোনো সমস্যা নেই।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">customer_email</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহকের ইমেইল। ব্র্যান্ডে যদি <strong>Email সার্ভিস অন</strong> থাকে, তবে ডিজিটাল এক্সেস লিঙ্ক ও ডিজিটাল ইনভয়েস গ্রাহকের ইনবক্সে পৌঁছাতে ইমেইল পাঠানো <strong>আবশ্যক</strong>। SMS ও Email উভয় সার্ভিস অন থাকলে দুটি ফিল্ডই পাঠাতে হবে। কোনো সার্ভিস চালু না থাকলে না পাঠালেও চলবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">customer_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (সুপারিশকৃত)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহকের নাম (ড্যাশবোর্ড ইনভয়েস ও মেসেজে ব্যক্তিগতকরণের জন্য সুপারিশকৃত)।</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Service Policy Notice Box for Digital */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>সার্ভিস ইন্টিগ্রেশন নোট (Digital Products):</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  ডিজিটাল পণ্যের ক্ষেত্রে ক্লায়েন্টের ওয়েবসাইটে গ্রাহক ইতিমধ্যে লগইন বা রেজিস্টার্ড অবস্থায় থাকতে পারেন। MecoPay কোর গেটওয়েতে নাম, ফোন বা ইমেইল পাঠানো বাধ্যতামূলক নয়। তবে আপনার ব্র্যান্ডে যদি <strong>SMS / WhatsApp / Email সার্ভিস</strong> সক্রিয় করা থাকে, তবে সেই সার্ভিসগুলোর মাধ্যমে সফল ডেলিভারি নিশ্চিত করতে সংশ্লিষ্ট ফিল্ডগুলো পাঠাতে হবে। কোনো সার্ভিস সক্রিয় না থাকলে এগুলো ছাড়া শুধু <code>order_id</code>, <code>amount</code> ও <code>callback_url</code> পাঠালেই চলবে।
                </p>
              </div>
            </div>
          )}

          {/* Sub Tab Content 2: Physical Advance */}
          {productSubTab === 'physical_advance' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
                    <Truck className="w-3.5 h-3.5" /> Advance Payment + Courier Delivery Charge
                  </div>
                  <h3 className="text-lg font-bold text-white">Physical Product (Advance + COD) JSON Payload</h3>
                  <p className="text-xs text-slate-400">
                    পণ্যের মূল্য + কুরিয়ার চার্জ থেকে অগ্রিম ফি চার্জ হবে এবং অবশিষ্ট টাকা কুরিয়ারে ডিউ থাকবে।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(advanceJsonPayload, 2)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0 self-start sm:self-auto"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
{advanceJsonPayload}
              </pre>

              {/* Mandatory vs Optional Table for Physical Advance */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-800 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <th className="p-3">ফিল্ড নেম</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">বিবরণ ও সার্ভিস গাইডলাইন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    <tr>
                      <td className="p-3 font-mono text-amber-300">order_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">অর্ডার আইডেন্টিফায়ারের জন্য যেকোনো একটি পাঠানো আবশ্যক।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"physical_advance"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">total_amount</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">পণ্যের মূল মূল্য (যেমন: ১২৫০ ৳)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">courier_charge</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ডেলিভারি ফি (যেমন: ১২০ ৳)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">amount</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">অনলাইন গেটওয়েতে কাস্টমার থেকে তাৎক্ষণিক চার্জ (যেমন: ১৫০ ৳)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">cod_due</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">কুরিয়ার ডেলিভারিতে কালেকশন = <code>(total_amount + courier_charge) - amount</code> = ১২২০ ৳।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">callback_url</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">পেমেন্ট সফল হলে আপনার ওয়েবসাইটের অর্ডার সাকসেস পেজে রিডাইরেক্ট করার URL।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">customer_address</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold">ঐচ্ছিক (কুরিয়ার সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহকের সম্পূর্ণ ডেলিভারি ঠিকানা। আপনি যদি MecoPay ড্যাশবোর্ডে <strong>অটো কুরিয়ার বুকিং (Auto Courier / 1-Click Booking)</strong> সার্ভিস অন রাখেন, তবে কুরিয়ার সিস্টেমে পার্সেল বুক করার জন্য গ্রাহকের সম্পূর্ণ ঠিকানা পাঠানো <strong>আবশ্যক</strong>। অটো কুরিয়ার সার্ভিস ব্যবহার না করলে এটি না পাঠালেও চলবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">customer_phone</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">কুরিয়ার ডেলিভারিম্যানের সাথে যোগাযোগ এবং SMS/WhatsApp নোটিফিকেশন সার্ভিস অন থাকলে মোবাইল নম্বর পাঠানো <strong>আবশ্যক</strong>। সার্ভিস চালু না থাকলে না পাঠালেও কোনো সমস্যা নেই।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">customer_email</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহককে ডিজিটাল ইনভয়েস ও ট্র্যাকিং রসিদ পাঠাতে ইমেইল সার্ভিস অন থাকলে গ্রাহকের ইমেইল পাঠানো <strong>আবশ্যক</strong>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">customer_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">পার্সেল রিসিভারের নাম (কুরিয়ার শিপমেন্ট লেবেল ও ইনভয়েসের জন্য)।</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Service Policy Notice Box for Physical Advance */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>সার্ভিস ইন্টিগ্রেশন নোট (Advance + COD):</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  ক্লায়েন্টের ওয়েবসাইটে চেকআউটের সময় কাস্টমার ইতোমধ্যে তার নাম, ফোন ও ঠিকানা পূরণ করে থাকেন। আপনার ব্র্যান্ডে যদি <strong>অটো কুরিয়ার বুকিং</strong> চালু থাকে, তবে কুরিয়ার বুকিং সফল করতে <code>customer_address</code> এবং <code>customer_phone</code> পাঠানো আবশ্যক। একইভাবে <strong>SMS বা Email নোটিফিকেশন</strong> চালু থাকলে স্বয়ংক্রিয় মেসেজ প্রেরণের জন্য ফোন বা ইমেইল পাঠাবেন। সার্ভিসগুলো বন্ধ থাকলে ফিল্ডগুলো না পাঠালেও সিস্টেম স্বাভাবিকভাবে কাজ করবে।
                </p>
              </div>
            </div>
          )}

          {/* Sub Tab Content 3: Physical COD */}
          {productSubTab === 'physical_cod' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-2">
                    <Package className="w-3.5 h-3.5" /> 100% Cash on Delivery (Just Form)
                  </div>
                  <h3 className="text-lg font-bold text-white">Physical (100% COD / Just Form) JSON Payload</h3>
                  <p className="text-xs text-slate-400">
                    গেটওয়েতে কোনো পেমেন্ট ছাড়া (amount = 0) পণ্যমূল্য ও কুরিয়ার চার্জ সহ পুরো টাকা কুরিয়ারে ডিউ হবে।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(codJsonPayload, 3)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0 self-start sm:self-auto"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy JSON
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{codJsonPayload}
              </pre>

              {/* Mandatory vs Optional Table for Full COD */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-800 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <th className="p-3">ফিল্ড নেম</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">বিবরণ ও সার্ভিস গাইডলাইন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">order_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">যেকোনো একটি বা দুটিই পাঠানো আবশ্যক।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"physical_cod"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">total_amount</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">পণ্যের মোট মূল্য (যেমন: ১২০০ ৳)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">courier_charge</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ডেলিভারি চার্জ (যেমন: ১২০ ৳)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">cod_due</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">কুরিয়ারের কাছে মোট পাওনা = <code>total_amount + courier_charge</code> = ১৩২০ ৳।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">amount</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হবে <code>0</code> (যেহেতু কোনো গেটওয়ে পেমেন্ট নেই)।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">customer_address</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold">ঐচ্ছিক (কুরিয়ার সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহকের পূর্ণ ডেলিভারি ঠিকানা। ক্লায়েন্ট যদি MecoPay ড্যাশবোর্ডে <strong>অটো কুরিয়ার বুকিং (Auto Courier / 1-Click Booking)</strong> সার্ভিস সক্রিয় রাখেন, তবে কুরিয়ার সিস্টেমে পার্সেল বুক করার জন্য গ্রাহকের সম্পূর্ণ ঠিকানা পাঠানো <strong>আবশ্যক</strong>। কুরিয়ার সার্ভিস ব্যবহার না করলে এটি না পাঠালেও চলবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">customer_phone</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">কুরিয়ার ডেলিভারিম্যানের সাথে যোগাযোগ এবং SMS/WhatsApp নোটিফিকেশন সার্ভিস অন থাকলে মোবাইল নম্বর পাঠানো <strong>আবশ্যক</strong>। সার্ভিস চালু না থাকলে না পাঠালেও সমস্যা নেই।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">customer_email</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold">ঐচ্ছিক (সার্ভিস নির্ভর)</span></td>
                      <td className="p-3 text-slate-300">গ্রাহককে ডিজিটাল অর্ডার ইনভয়েস ও রসিদ পাঠাতে ইমেইল সার্ভিস অন থাকলে গ্রাহকের ইমেইল পাঠানো <strong>আবশ্যক</strong>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">customer_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">পার্সেল রিসিভারের নাম (কুরিয়ার শিপমেন্ট পার্সেল ও ইনভয়েসের জন্য)।</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Service Policy Notice Box for Full COD */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>সার্ভিস ইন্টিগ্রেশন নোট (100% COD / Just Form):</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  ১০০% ক্যাশ অন ডেলিভারি (Just Form) অর্ডারের ক্ষেত্রে গ্রাহক ক্লায়েন্টের ওয়েবসাইটে ইতিমধ্যে নাম, ফোন ও ঠিকানা ইনপুট দিয়ে থাকেন। আপনি যদি MecoPay ড্যাশবোর্ডের মাধ্যমে <strong>অটো কুরিয়ার বুকিং</strong> করতে চান, তবে কুরিয়ার পার্সেল বুকিং নিশ্চিত করতে গ্রাহকের সম্পূর্ণ ঠিকানা ও মোবাইল নম্বর পাঠানো আবশ্যক। একইভাবে <strong>SMS, WhatsApp বা Email নোটিফিকেশন</strong> সক্রিয় থাকলে সংশ্লিষ্ট নম্বর ও ইমেইল পাঠাবেন। সার্ভিসগুলো বন্ধ থাকলে এগুলোর কোনোটিই বাধ্যতামূলক নয়।
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BACKEND INTEGRATION CODE (LARAVEL, PHP, NODE.JS, JS, PYTHON) */}
      {activeTab === 'laravel' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" /> যেকোনো কাস্টম ওয়েবসাইট ও ব্যাকএন্ড ইন্টিগ্রেশন কোড
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনার পছন্দের প্রোগ্রামিং ল্যাঙ্গুয়েজ বা ফ্রেমওয়ার্ক নির্বাচন করুন (Laravel, Raw PHP, Node.js, JavaScript, Python):
              </p>
            </div>

            {/* Language & Framework Switcher */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFrameworkTab('laravel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  frameworkTab === 'laravel'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Laravel (PHP)
              </button>
              <button
                onClick={() => setFrameworkTab('php')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  frameworkTab === 'php'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Raw PHP (cURL)
              </button>
              <button
                onClick={() => setFrameworkTab('nodejs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  frameworkTab === 'nodejs'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Node.js (Express / Axios)
              </button>
              <button
                onClick={() => setFrameworkTab('javascript')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  frameworkTab === 'javascript'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                JavaScript (Fetch API)
              </button>
              <button
                onClick={() => setFrameworkTab('python')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  frameworkTab === 'python'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Python (Django / Flask / Requests)
              </button>
            </div>

            {/* STEP 1: API Setup */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">1</span>
                ধাপ ১: API Endpoint ও Headers
              </h4>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300">
{`ENDPOINT: POST https://api.mecopay.space/v1/create-checkout
HEADERS:
  Authorization: Bearer <YOUR_BRAND_API_KEY>
  Content-Type: application/json`}
              </pre>
              <p className="text-[11px] text-slate-400">
                * কোনো Brand ID আলাদা পাস করার দরকার নেই—API Key থেকেই ক্লাউডফ্লেয়ার ওয়ার্কার সংশ্লিষ্ট ব্র্যান্ড শনাক্ত করে নেবে।
              </p>
            </div>

            {/* STEP 2: Code Implementation */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">2</span>
                  ধাপ ২: <code>{getFrameworkFileName()}</code> ফাইলে কোড বসান
                </h4>
                <button
                  onClick={() => handleCopy(getFrameworkCode(), 4)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 4 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Code
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
{getFrameworkCode()}
              </pre>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <h5 className="font-bold text-white">কোডটি কীভাবে কাজ করে?</h5>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>কাস্টমার যখন চেকআউট বাটনে চাপ দেয়, কোড রিকোয়েস্টটি ধরে।</li>
                  <li><code>order_id</code> বা <code>product_name</code> এবং <code>courier_charge</code> সহ পে-লোড বানায়।</li>
                  <li>MecoPay Worker-এর <code>https://api.mecopay.space/v1/create-checkout</code> এ পাঠায়।</li>
                  <li>MecoPay সাথে সাথে একটি সিকিউর <code>checkout_url</code> রিটার্ন করে এবং কাস্টমার রিডাইরেক্ট হয় (অথবা ফুল COD-তে অর্ডার কনফার্ম করে)।</li>
                </ol>
              </div>
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
  "courier_charge": 120,
  "cod_due": 1220,
  "transaction_id": "8M41XA99L2",
  "customer_phone": "01812345678",
  "status": "Completed",
  "courier_tracking_code": "STDF-981245",
  "signature": "sha256_hash_security_token"
}`}
                </pre>
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
  "courier_charge": 120,
  "cod_due": 1320,
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
  "payment_gateways_active": true,
  "auto_courier_on_full_cod": false,
  "courier_provider": "steadfast",
  "status": "active",
  "timestamp": 1774239876,
  "signature": "sha256_hash_security_token"
}`}
                </pre>
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
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE WORKER CODE (FINAL) */}
      {activeTab === 'worker-code' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-2">
                  <Cpu className="w-3.5 h-3.5" /> Production Ready Edge Worker
                </div>
                <h3 className="text-lg font-bold text-white">Cloudflare Worker: create-checkout Function</h3>
                <p className="text-xs text-slate-400">
                  সম্পূর্ণ ৩ ধরনের প্রোডাক্ট ভ্যালিডেশন, কুরিয়ার চার্জ হ্যান্ডলিং এবং সেশন তৈরির ফুল প্রডাকশন কোড।
                </p>
              </div>
              <button
                onClick={() => handleCopy(cloudflareWorkerCode, 6)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 shrink-0 self-start sm:self-auto"
              >
                {copiedIndex === 6 ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />} Copy Worker Code
              </button>
            </div>

            <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[500px]">
{cloudflareWorkerCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: API CREDENTIALS & BASE URL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Authentication & Single Central Base URL
              </div>
              <h3 className="text-lg font-bold text-white">
                MecoPay Production API Endpoint
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                ডেভেলপারদের জন্য সিস্টেমে একটি মাত্র সেন্ট্রাল এন্ডপয়েন্ট রয়েছে। আপনার ব্যাকএন্ড/কন্ট্রোলার থেকে এই একক URL-এ POST রিকোয়েস্ট পাঠাবেন, ক্লাউডফ্লেয়ার ওয়ার্কার বাকি সব প্রোডাক্ট টাইপ ও রাউটিং হ্যান্ডেল করবে।
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Production Base URL</span>
              <div className="font-mono text-sm sm:text-base font-bold text-emerald-400 bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 select-all flex items-center justify-between">
                <span>https://api.mecopay.space/v1/create-checkout</span>
                <button
                  onClick={() => handleCopy('https://api.mecopay.space/v1/create-checkout', 99)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 font-sans transition-all border border-slate-700"
                >
                  {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy URL
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Required Headers</span>
              <pre className="font-mono text-xs text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800 overflow-x-auto">
{`Content-Type: application/json
Authorization: Bearer <YOUR_BRAND_API_KEY>`}
              </pre>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                * ব্র্যান্ডের API Key পেতে ড্যাশবোর্ডের মেনু থেকে <strong>Brand</strong> সেকশনে যান। কোনো Brand ID আলাদা পাস করতে হবে না, API Key থেকে ওয়ার্কার অটো ব্র্যান্ড ডিটেক্ট করবে।
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
  "product_name": "Fullstack AI Mastery Course",
  "product_type": "digital",
  "amount": 1500,
  "callback_url": "https://yourwebsite.com/payment/callback",
  "cancel_url": "https://yourwebsite.com/payment/cancel",
  "customer_name": "Rahim Ahmed",
  "customer_phone": "01712345678",
  "customer_email": "rahim@example.com",
  "telegram_link": "https://t.me/+joinchat_secretinvite",
  "facebook_group_link": "https://facebook.com/groups/aimasteryvip",
  "google_drive_link": "https://drive.google.com/drive/folders/sample_materials"
}`;

const advanceJsonPayload = `{
  "order_id": "ORD-7734",
  "product_name": "Wireless Noise Cancelling Headphones",
  "product_type": "physical_advance",
  "total_amount": 1250,
  "courier_charge": 120,
  "amount": 150,
  "cod_due": 1220,
  "fulfillment_type": "dropship",
  "callback_url": "https://yourwebsite.com/payment/callback",
  "cancel_url": "https://yourwebsite.com/payment/cancel",
  "customer_name": "Tanvir Hasan",
  "customer_phone": "01812345678",
  "customer_email": "tanvir@example.com",
  "customer_address": "House 12, Road 4, Sector 7, Uttara, Dhaka"
}`;

const codJsonPayload = `{
  "order_id": "ORD-5519",
  "product_name": "Leather Executive Wallet",
  "product_type": "physical_cod",
  "total_amount": 1200,
  "courier_charge": 120,
  "amount": 0,
  "cod_due": 1320,
  "fulfillment_type": "own_inventory",
  "callback_url": "https://yourwebsite.com/order/success",
  "cancel_url": "https://yourwebsite.com/checkout",
  "customer_name": "Mohammad Ali",
  "customer_phone": "01912345678",
  "customer_email": "ali@example.com",
  "customer_address": "Chawkbazar, Chittagong"
}`;

// 1. Laravel Controller (PHP) with 3 Architecture Guards
const laravelFullController = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Cache;
use App\\Models\\Order;

class PaymentController extends Controller
{
    /**
     * MecoPay চেকআউট ইনিশিয়ালাইজ করুন (3-Level Guard Architecture সহ)
     */
    public function initiatePayment(Request $request)
    {
        // =========================================================================
        // গার্ড ১: MecoPay গেটওয়ে সার্ভিস স্ট্যাটাস ক্যাশ চেক (Network Call রোধে)
        // =========================================================================
        $isGatewayActive = Cache::get('mecopay_gateways_active', true);
        if (!$isGatewayActive) {
            return back()->with('error', 'MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে স্থগিত আছে।');
        }

        // =========================================================================
        // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
        // =========================================================================
        $cartItems = $request->input('cart_items', []); // e.g. [['id' => 1, 'type' => 'digital'], ...]
        if (!empty($cartItems)) {
            $digitalCount = 0;
            $physicalCount = 0;

            foreach ($cartItems as $item) {
                if (($item['type'] ?? '') === 'digital') {
                    $digitalCount++;
                } else {
                    $physicalCount++;
                }
            }

            // রুল ১: মিক্সড কার্ট সম্পূর্ণ নিষিদ্ধ (ডিজিটাল + ফিজিক্যাল একসাথে নয়)
            if ($digitalCount > 0 && $physicalCount > 0) {
                return back()->with('error', 'কার্ট পলিসি এরর: ডিজিটাল এবং ফিজিক্যাল প্রোডাক্ট একই সাথে এক কার্টে কেনা নিষিদ্ধ। অনুগ্রহ করে আলাদা অর্ডার করুন।');
            }

            // রুল ২: ডিজিটাল প্রোডাক্ট এক অর্ডারে সর্বোচ্চ ১টি নেওয়া যাবে
            if ($digitalCount > 1) {
                return back()->with('error', 'কার্ট পলিসি এরর: ডিজিটাল প্রোডাক্টের ক্ষেত্রে এক অর্ডারে সর্বোচ্চ ১টি প্রোডাক্ট নেওয়া যাবে।');
            }
        }

        // =========================================================================
        // গার্ড ৩: ৩ ধরনের প্রোডাক্টের আবশ্যিক ফিল্ড ভ্যালিডেশন ও পে-লোড প্রস্তুতি
        // =========================================================================
        $productType = $request->input('product_type', 'digital'); // 'digital' | 'physical_advance' | 'physical_cod'
        $orderId = $request->input('order_id');
        $productName = $request->input('product_name');

        if (empty($orderId) && empty($productName)) {
            return back()->with('error', 'অর্ডার আইডি অথবা প্রোডাক্টের নাম যেকোনো একটি আবশ্যক।');
        }

        $price = (float) $request->input('price', 0);
        $courierCharge = (float) $request->input('courier_charge', 120);

        $payload = [
            'order_id'         => $orderId ?: ('ORD-' . time()),
            'product_name'     => $productName ?: 'General Item',
            'product_type'     => $productType,
            'customer_name'    => $request->input('customer_name', 'Guest Customer'),
            'customer_phone'   => $request->input('customer_phone', ''),
            'customer_address' => $request->input('customer_address', ''),
            'callback_url'     => route('payment.callback'),
            'cancel_url'       => route('payment.cancel'),
        ];

        if ($productType === 'digital') {
            // ডিজিটাল: ১০০% পেমেন্ট ও রিটার্ন URL আবশ্যক
            if ($price <= 0) {
                return back()->with('error', 'ডিজিটাল প্রোডাক্টের জন্য মূল্য (price) আবশ্যক।');
            }
            $payload['amount'] = $price;
            $payload['telegram_link'] = $request->input('telegram_link', 'https://t.me/+secret_link');
            $payload['facebook_group_link'] = $request->input('facebook_group_link');
            $payload['google_drive_link'] = $request->input('google_drive_link');
        } elseif ($productType === 'physical_advance') {
            // ফিজিক্যাল অ্যাডভান্স: টোটাল এমাউন্ট, কুরিয়ার চার্জ এবং অ্যাডভান্স ফি
            if ($price <= 0) {
                return back()->with('error', 'ফিজিক্যাল প্রোডাক্টের জন্য টোটাল মূল্য আবশ্যক।');
            }
            $advanceAmount = (float) $request->input('advance_amount', 150);
            $payload['total_amount']   = $price;
            $payload['courier_charge'] = $courierCharge;
            $payload['amount']         = min($advanceAmount, $price);
            $payload['cod_due']        = max(0, ($price + $courierCharge) - $payload['amount']);
        } else { // physical_cod
            // ১০০% ক্যাশ অন ডেলিভারি: গেটওয়ে চার্জ ০ এবং বাকি টাকা কুরিয়ার ডিউ
            $payload['total_amount']   = $price;
            $payload['courier_charge'] = $courierCharge;
            $payload['amount']         = 0;
            $payload['cod_due']        = $price + $courierCharge;
        }

        // MecoPay Worker Endpoint এ একক সেন্ট্রাল POST Call
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('MECOPAY_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.mecopay.space/v1/create-checkout', $payload);

        if ($response->successful()) {
            $data = $response->json();
            if (!empty($data['checkout_url'])) {
                return redirect()->away($data['checkout_url']);
            }
            if (isset($data['requires_payment']) && $data['requires_payment'] === false) {
                return redirect()->route('order.success')->with('success', 'ক্যাশ অন ডেলিভারি অর্ডার সফলভাবে কনফার্ম হয়েছে!');
            }
        }

        return back()->with('error', 'Checkout error: ' . ($response['error'] ?? 'MecoPay সার্ভারের সাথে সংযোগে ব্যর্থ হয়েছে।'));
    }
}`;

// 2. Raw PHP (Core PHP) with 3 Architecture Guards
const rawPhpController = `<?php
/**
 * Raw PHP Integration for MecoPay (With 3 Guards: Gateway Status, Cart Rules & 3-Product Validation)
 */

session_start();

$apiKey = "YOUR_MECOPAY_API_KEY_HERE";
$endpoint = "https://api.mecopay.space/v1/create-checkout";

// =========================================================================
// গার্ড ১: গেটওয়ে সার্ভিস স্ট্যাটাস চেক (ক্যাশ বা সেশন থেকে)
// =========================================================================
$isGatewayActive = $_SESSION['mecopay_gateways_active'] ?? true;
if (!$isGatewayActive) {
    die("MecoPay পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।");
}

// =========================================================================
// গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
// =========================================================================
$cart = $_SESSION['cart'] ?? [];
if (!empty($cart)) {
    $digitalCount = 0;
    $physicalCount = 0;
    foreach ($cart as $item) {
        if (($item['type'] ?? '') === 'digital') {
            $digitalCount++;
        } else {
            $physicalCount++;
        }
    }
    // রুল ১: মিক্সড কার্ট সম্পূর্ণ নিষিদ্ধ
    if ($digitalCount > 0 && $physicalCount > 0) {
        die("কার্ট পলিসি এরর: একই সাথে ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট কেনা যাবে না।");
    }
    // রুল ২: ডিজিটাল সর্বোচ্চ ১টি
    if ($digitalCount > 1) {
        die("কার্ট পলিসি এরর: এক অর্ডারে সর্বোচ্চ ১টি ডিজিটাল প্রোডাক্ট নেওয়া যাবে।");
    }
}

// =========================================================================
// গার্ড ৩: ৩ ধরনের প্রোডাক্ট ফিল্ড ভ্যালিডেশন ও পে-লোড প্রস্তুতি
// =========================================================================
$productType = $_POST['product_type'] ?? 'digital'; // 'digital' | 'physical_advance' | 'physical_cod'
$orderId = $_POST['order_id'] ?? ("ORD-" . time());
$productName = $_POST['product_name'] ?? "E-Commerce Product";
$price = (float) ($_POST['price'] ?? 1500);
$courierCharge = (float) ($_POST['courier_charge'] ?? 120);

$payload = [
    "order_id"         => $orderId,
    "product_name"     => $productName,
    "product_type"     => $productType,
    "customer_name"    => $_POST['customer_name'] ?? "Customer Name",
    "customer_phone"   => $_POST['customer_phone'] ?? "01700000000",
    "customer_address" => $_POST['customer_address'] ?? "Dhaka, Bangladesh",
    "callback_url"     => "https://yourwebsite.com/payment_success.php",
    "cancel_url"       => "https://yourwebsite.com/checkout.php"
];

if ($productType === 'digital') {
    if ($price <= 0) die("ডিজিটাল পণ্যের মূল্য আবশ্যক।");
    $payload['amount'] = $price;
    $payload['telegram_link'] = "https://t.me/+join_chat";
} elseif ($productType === 'physical_advance') {
    $advance = (float) ($_POST['advance_amount'] ?? 150);
    $payload['total_amount']   = $price;
    $payload['courier_charge'] = $courierCharge;
    $payload['amount']         = $advance;
    $payload['cod_due']        = ($price + $courierCharge) - $advance;
} else { // physical_cod
    $payload['total_amount']   = $price;
    $payload['courier_charge'] = $courierCharge;
    $payload['amount']         = 0;
    $payload['cod_due']        = $price + $courierCharge;
}

// cURL রিকোয়েস্ট একক এন্ডপয়েন্টে
$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode === 200 && !empty($result['checkout_url'])) {
    header("Location: " . $result['checkout_url']);
    exit;
} elseif ($httpCode === 200 && empty($result['requires_payment'])) {
    header("Location: https://yourwebsite.com/order_success.php?inv=" . $result['invoice_number']);
    exit;
} else {
    echo "MecoPay Error: " . ($result['error'] ?? 'Connection Failed');
}
?>`;

// 3. Node.js (Express / Axios) with 3 Architecture Guards
const nodeJsFullController = `const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MECOPAY_API_KEY = process.env.MECOPAY_API_KEY || 'your_api_key_here';
const MECOPAY_ENDPOINT = 'https://api.mecopay.space/v1/create-checkout';

// মেমোরি ক্যাশ (Webhook দিয়ে রিয়েল-টাইমে সিঙ্ক হয়)
let isMecoPayActive = true;

app.post('/api/checkout', async (req, res) => {
  try {
    // =========================================================================
    // গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
    // =========================================================================
    if (!isMecoPayActive) {
      return res.status(503).json({ error: 'MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।' });
    }

    const { 
      order_id, 
      product_name, 
      product_type = 'digital', 
      price = 0, 
      courier_charge = 120, 
      advance_amount = 150,
      cart_items = [],
      customer_name, 
      customer_phone, 
      customer_address 
    } = req.body;

    // =========================================================================
    // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
    // =========================================================================
    if (cart_items.length > 0) {
      const digitalCount = cart_items.filter(i => i.type === 'digital').length;
      const physicalCount = cart_items.filter(i => i.type !== 'digital').length;

      if (digitalCount > 0 && physicalCount > 0) {
        return res.status(400).json({ error: 'কার্ট পলিসি এরর: ডিজিটাল ও ফিজিক্যাল পণ্য একসাথে এক অর্ডারে কেনা যাবে না।' });
      }
      if (digitalCount > 1) {
        return res.status(400).json({ error: 'কার্ট পলিসি এরর: ডিজিটাল প্রোডাক্ট এক অর্ডারে সর্বোচ্চ ১টি নেওয়া যাবে।' });
      }
    }

    // =========================================================================
    // গার্ড ৩: ৩ ধরনের প্রোডাক্ট ফিল্ড ভ্যালিডেশন ও পে-লোড প্রস্তুতি
    // =========================================================================
    if (!order_id && !product_name) {
      return res.status(400).json({ error: 'order_id অথবা product_name যেকোনো একটি ফিল্ড আবশ্যক।' });
    }

    const payload = {
      order_id: order_id || \`ORD-\${Date.now()}\`,
      product_name: product_name || 'Item',
      product_type,
      customer_name: customer_name || 'Guest Customer',
      customer_phone: customer_phone || '',
      customer_address: customer_address || '',
      callback_url: 'https://yourshop.com/payment/callback',
      cancel_url: 'https://yourshop.com/checkout'
    };

    if (product_type === 'digital') {
      if (!price || price <= 0) return res.status(400).json({ error: 'ডিজিটাল প্রোডাক্টের জন্য price ফিল্ড আবশ্যক।' });
      payload.amount = Number(price);
      payload.telegram_link = 'https://t.me/+join_group';
    } else if (product_type === 'physical_advance') {
      if (!price || price <= 0) return res.status(400).json({ error: 'ফিজিক্যাল প্রোডাক্টের জন্য price (total) ফিল্ড আবশ্যক।' });
      payload.total_amount = Number(price);
      payload.courier_charge = Number(courier_charge);
      payload.amount = Number(advance_amount);
      payload.cod_due = (Number(price) + Number(courier_charge)) - Number(advance_amount);
    } else { // physical_cod
      payload.total_amount = Number(price);
      payload.courier_charge = Number(courier_charge);
      payload.amount = 0;
      payload.cod_due = Number(price) + Number(courier_charge);
    }

    const response = await axios.post(MECOPAY_ENDPOINT, payload, {
      headers: {
        Authorization: \`Bearer \${MECOPAY_API_KEY}\`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.checkout_url) {
      return res.redirect(response.data.checkout_url);
    }

    return res.json({ success: true, message: 'COD Order booked', data: response.data });
  } catch (error) {
    return res.status(500).json({ error: error.response?.data?.error || error.message });
  }
});`;

// 4. JavaScript (Fetch API - Frontend / Vanilla) with 3 Architecture Guards
const jsFetchController = `/**
 * JavaScript (Fetch API) Implementation for MecoPay
 * With 3 Guards: Gateway Status, Cart Rules & 3-Product Validation
 */
async function initiateMecoPayCheckout(orderData) {
  const apiKey = "YOUR_MECOPAY_API_KEY_HERE";
  const endpoint = "https://api.mecopay.space/v1/create-checkout";

  // =========================================================================
  // গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
  // =========================================================================
  const isGatewayActive = localStorage.getItem('mecopay_gateways_active') !== 'false';
  if (!isGatewayActive) {
    alert("MecoPay পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।");
    return;
  }

  // =========================================================================
  // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
  // =========================================================================
  const cartItems = orderData.cart_items || [];
  if (cartItems.length > 0) {
    const digitalCount = cartItems.filter(i => i.type === 'digital').length;
    const physicalCount = cartItems.filter(i => i.type !== 'digital').length;

    if (digitalCount > 0 && physicalCount > 0) {
      alert("কার্ট এরর: একই সাথে ডিজিটাল এবং ফিজিক্যাল প্রোডাক্ট কেনা নিষিদ্ধ। আলাদা অর্ডার করুন।");
      return;
    }
    if (digitalCount > 1) {
      alert("কার্ট এরর: ডিজিটাল প্রোডাক্ট এক অর্ডারে সর্বোচ্চ ১টি নেওয়া যাবে।");
      return;
    }
  }

  // =========================================================================
  // গার্ড ৩: ৩ ধরনের প্রোডাক্ট ফিল্ড ভ্যালিডেশন ও পে-লোড প্রস্তুতি
  // =========================================================================
  const productType = orderData.product_type || 'digital';
  const price = Number(orderData.price || 0);
  const courierCharge = Number(orderData.courier_charge || 120);

  const payload = {
    order_id: orderData.order_id || ("ORD-" + Date.now()),
    product_name: orderData.product_name || "Premium Item",
    product_type: productType,
    customer_name: orderData.customer_name || "Customer Name",
    customer_phone: orderData.customer_phone || "01812345678",
    customer_address: orderData.customer_address || "Dhaka, Bangladesh",
    callback_url: "https://yourshop.com/order-success",
    cancel_url: "https://yourshop.com/cart"
  };

  if (productType === 'digital') {
    payload.amount = price;
    payload.telegram_link = orderData.telegram_link || "https://t.me/+vip_invite";
  } else if (productType === 'physical_advance') {
    const advance = Number(orderData.advance_amount || 150);
    payload.total_amount = price;
    payload.courier_charge = courierCharge;
    payload.amount = advance;
    payload.cod_due = (price + courierCharge) - advance;
  } else { // physical_cod
    payload.total_amount = price;
    payload.courier_charge = courierCharge;
    payload.amount = 0;
    payload.cod_due = price + courierCharge;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success && data.checkout_url) {
      // MecoPay চেকআউট পেজে রিডাইরেক্ট
      window.location.href = data.checkout_url;
    } else if (data.success && !data.requires_payment) {
      // ১০০% ক্যাশ অন ডেলিভারি (লোকাল সাকসেস)
      window.location.href = "/order-success?inv=" + data.invoice_number;
    } else {
      alert("Error: " + (data.error || "Failed to create checkout"));
    }
  } catch (error) {
    console.error("MecoPay Request Failed:", error);
  }
}`;

// 5. Python (Django / Flask / Requests) with 3 Architecture Guards
const pythonFullController = `import requests
import time

MECOPAY_API_KEY = "your_brand_api_key_here"
MECOPAY_ENDPOINT = "https://api.mecopay.space/v1/create-checkout"

# লোকাল ক্যাশ ফ্ল্যাগ (Webhook এর মাধ্যমে রিয়েল-টাইমে আপডেট হয়)
is_mecopay_active = True

def create_checkout_session(request_data):
    # =========================================================================
    # গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
    # =========================================================================
    if not is_mecopay_active:
        return {"error": "MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।"}

    # =========================================================================
    # গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
    # =========================================================================
    cart_items = request_data.get('cart_items', [])
    if cart_items:
        digital_count = sum(1 for item in cart_items if item.get('type') == 'digital')
        physical_count = sum(1 for item in cart_items if item.get('type') != 'digital')

        if digital_count > 0 and physical_count > 0:
            return {"error": "কার্ট পলিসি এরর: একই সাথে ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট কেনা নিষিদ্ধ।"}
        if digital_count > 1:
            return {"error": "কার্ট পলিসি এরর: ডিজিটাল প্রোডাক্ট এক অর্ডারে সর্বোচ্চ ১টি নেওয়া যাবে।"}

    # =========================================================================
    # গার্ড ৩: ৩ ধরনের প্রোডাক্ট ফিল্ড ভ্যালিডেশন ও পে-লোড প্রস্তুতি
    # =========================================================================
    product_type = request_data.get('product_type', 'digital') # 'digital' | 'physical_advance' | 'physical_cod'
    price = float(request_data.get('price', 1500))
    courier_charge = float(request_data.get('courier_charge', 120))

    payload = {
        "order_id": request_data.get('order_id', f"ORD-{int(time.time())}"),
        "product_name": request_data.get('product_name', "Digital E-Book"),
        "product_type": product_type,
        "customer_name": request_data.get('customer_name', "Guest"),
        "customer_phone": request_data.get('customer_phone', "01700000000"),
        "customer_address": request_data.get('customer_address', "Dhaka"),
        "callback_url": "https://yourwebsite.com/payment/callback",
        "cancel_url": "https://yourwebsite.com/checkout"
    }

    if product_type == 'digital':
        if price <= 0:
            return {"error": "ডিজিটাল প্রোডাক্টের জন্য price ফিল্ড আবশ্যক।"}
        payload["amount"] = price
        payload["telegram_link"] = "https://t.me/+vip_invite"
    elif product_type == 'physical_advance':
        advance = float(request_data.get('advance_amount', 150))
        payload["total_amount"] = price
        payload["courier_charge"] = courier_charge
        payload["amount"] = advance
        payload["cod_due"] = (price + courier_charge) - advance
    else: # physical_cod
        payload["total_amount"] = price
        payload["courier_charge"] = courier_charge
        payload["amount"] = 0
        payload["cod_due"] = price + courier_charge

    headers = {
        "Authorization": f"Bearer {MECOPAY_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(MECOPAY_ENDPOINT, json=payload, headers=headers)
    result = response.json()

    if response.status_code == 200:
        if result.get("checkout_url"):
            return {"redirect": result["checkout_url"]}
        return {"success": True, "invoice_number": result.get("invoice_number")}
    else:
        return {"error": result.get("error", "API request failed")}
`;

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

            Cache::forever('mecopay_auto_courier', $autoCourier);
            Cache::forever('mecopay_gateways_active', $gatewaysActive);

            return response()->json(['status' => 'settings_synced'], 200);
        }

        $orderId = $request->input('order_id');
        $invoiceNumber = $request->input('invoice_number');
        $status = $request->input('status');

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
            $order->update([
                'payment_status'   => 'paid',
                'transaction_id'   => $request->input('transaction_id'),
                'fb_passcode'      => $request->input('fb_passcode'),
                'courier_tracking' => $request->input('courier_tracking_code'),
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

const cloudflareWorkerCode = `// Cloudflare Worker (worker.js) - 100% Native & Zero-Dependency
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// =========================================================================
// ব্যাকগ্রাউন্ড কুরিয়ার বুকিং প্রসেসর (Cloudflare ctx.waitUntil Background Task)
// =========================================================================
async function processBackgroundCourierBooking(env, brand, invoice) {
  try {
    if (!brand.auto_courier_on_full_cod || !brand.courier_api_key) {
      console.log('Manual Mode: কুরিয়ার অটোমেশন বন্ধ থাকায় বুকিং পেন্ডিং রাখা হয়েছে।');
      return;
    }

    const courierProvider = brand.courier_provider || 'steadfast';
    let trackingCode = \`STDF-\${Date.now().toString().slice(-6)}\`;
    let trackingUrl = \`https://steadfast.com.bd/tracking/\${trackingCode}\`;

    // Steadfast API Integration
    if (courierProvider === 'steadfast' && brand.courier_api_key && brand.courier_secret_key) {
      const sfRes = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
        method: 'POST',
        headers: {
          'Api-Key': brand.courier_api_key,
          'Secret-Key': brand.courier_secret_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice: invoice.invoice_number,
          recipient_name: invoice.customer_name,
          recipient_phone: invoice.customer_phone,
          recipient_address: invoice.customer_address,
          cod_amount: invoice.amount
        })
      });
      const sfData = await sfRes.json();
      if (sfData?.consignment?.tracking_code) {
        trackingCode = sfData.consignment.tracking_code;
        trackingUrl = \`https://steadfast.com.bd/tracking/\${trackingCode}\`;
      }
    }

    const courierInfo = {
      provider: courierProvider,
      tracking_code: trackingCode,
      tracking_url: trackingUrl,
      booked_at: new Date().toISOString()
    };

    const supabaseUrl = env.SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    // ১. ইনভয়েস মেটাডাটাতে কুরিয়ার ট্র্যাকিং সংরক্ষণ
    await fetch(\`\${supabaseUrl}/rest/v1/invoices?id=eq.\${invoice.id}\`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': \`Bearer \${supabaseKey}\`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        metadata: {
          ...(invoice.metadata || {}),
          courier: courierInfo
        }
      })
    });

    // ২. মার্চেন্টের সাইটে Webhook পাঠানো
    const webhookRes = await fetch(\`\${supabaseUrl}/rest/v1/webhooks?brand_id=eq.\${brand.id}&select=*\`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': \`Bearer \${supabaseKey}\`
      }
    });
    const webhooks = await webhookRes.json();
    const webhook = Array.isArray(webhooks) && webhooks.length > 0 ? webhooks[0] : null;

    if (webhook?.payload_url) {
      await fetch(webhook.payload_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order.courier_booked',
          data: {
            order_id: invoice.metadata?.order_id,
            invoice_number: invoice.invoice_number,
            courier: courierInfo
          }
        })
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Background courier error:', err);
  }
}

// =========================================================================
// ক্লাউডফ্লেয়ার ওয়ার্কার মেইন হ্যান্ডলার (POST /v1/create-checkout)
// =========================================================================
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      let payload = {};
      try {
        payload = await request.json();
      } catch (_) {
        throw new Error('Invalid JSON payload');
      }

      // ১. ব্র্যান্ড অথেন্টিকেশন (Bearer Token)
      const authHeader = request.headers.get('Authorization');
      const apiKey = authHeader ? authHeader.replace(/Bearer\\s+/i, '').trim() : payload.api_key;

      if (!apiKey) {
        return new Response(JSON.stringify({ success: false, error: 'Missing Brand API Key in Authorization header.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://fwonuakvherzofqximno.supabase.co').replace(/\/+$/, '');
      const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_KEY || env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b251YWt2aGVyem9mcXhpbW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MzA5MDEsImV4cCI6MjEwMDQwNjkwMX0.29mIqf8zwUczPXIfIILw6ybJRKJ_l8HUttNU-6s-cL0';

      const brandRes = await fetch(\`\${supabaseUrl}/rest/v1/brands?api_key=eq.\${apiKey}&select=*\`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': \`Bearer \${supabaseKey}\`,
          'Content-Type': 'application/json'
        }
      });
      if (!brandRes.ok) {
        const errText = await brandRes.text();
        return new Response(JSON.stringify({ success: false, error: \`Supabase query failed (\${brandRes.status}): \${errText}\` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      const brands = await brandRes.json();
      const brand = Array.isArray(brands) && brands.length > 0 ? brands[0] : null;

      if (!brand) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid Brand API Key. No brand matched this key.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const {
        order_id,
        product_name,
        product_type = 'digital',
        amount = 0,
        total_amount = 0,
        courier_charge = 0,
        cod_due = 0,
        callback_url,
        cancel_url,
        customer_name = 'Guest Customer',
        customer_phone = '',
        customer_email = '',
        customer_address = '',
        telegram_link,
        facebook_group_link,
        google_drive_link,
        metadata = {}
      } = payload;

      // ২. সার্বজনীন ফিল্ড ভ্যালিডেশন
      if (!order_id && !product_name) {
        return new Response(JSON.stringify({ success: false, error: "Validation Error: At least one of 'order_id' or 'product_name' is mandatory." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const invoiceNumber = 'INV-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);

      // =========================================================================
      // CASE ১: ১০০% Full COD (সরাসরি DB ইনসার্ট + অটো কুরিয়ার বুকিং + নো চেকআউট লিঙ্ক)
      // =========================================================================
      if (product_type === 'physical_cod' || amount === 0) {
        const insertRes = await fetch(\`\${supabaseUrl}/rest/v1/invoices\`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': \`Bearer \${supabaseKey}\`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: brand.user_id,
            brand_id: brand.id,
            invoice_number: invoiceNumber,
            customer_name,
            customer_phone,
            customer_email,
            customer_address,
            amount: total_amount || amount || 0,
            status: 'cod_confirmed',
            product_type: 'physical_cod',
            metadata: {
              ...metadata,
              order_id: order_id || ('ORD-' + Date.now()),
              product_name: product_name || 'General COD Order',
              courier_charge: courier_charge || 120,
              cod_total: (total_amount || 0) + (courier_charge || 120)
            }
          })
        });

        const insertedInvoices = await insertRes.json();
        const codInvoice = Array.isArray(insertedInvoices) && insertedInvoices.length > 0 
          ? insertedInvoices[0] 
          : { id: 'temp', invoice_number: invoiceNumber };

        const response = new Response(JSON.stringify({
          success: true,
          product_type: 'physical_cod',
          status: 'cod_confirmed',
          invoice_id: codInvoice.id,
          invoice_number: codInvoice.invoice_number,
          requires_payment: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

        // ব্যাকগ্রাউন্ডে নন-ব্লকিং কুরিয়ার বুকিং রান করা
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(processBackgroundCourierBooking(env, brand, codInvoice));
        }

        return response;
      }

      // =========================================================================
      // CASE ২: Digital বা Advance COD (কোনো DB ইনসার্ট নেই - প্রি-পেমেন্ট সেশন URL রিটার্ন)
      // =========================================================================
      if (product_type === 'digital') {
        if (!amount || typeof amount !== 'number' || amount <= 0) {
          return new Response(JSON.stringify({ success: false, error: "Validation Error: 'amount' (100% price) is mandatory for digital products." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        if (!callback_url) {
          return new Response(JSON.stringify({ success: false, error: "Validation Error: 'callback_url' is mandatory for digital products." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
      } else if (product_type === 'physical_advance') {
        if (!total_amount || typeof total_amount !== 'number' || total_amount <= 0) {
          return new Response(JSON.stringify({ success: false, error: "Validation Error: 'total_amount' is mandatory for physical_advance." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        if (!amount || typeof amount !== 'number' || amount <= 0) {
          return new Response(JSON.stringify({ success: false, error: "Validation Error: 'amount' (advance fee) is mandatory for physical_advance." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
      }

      // স্টেটলেস সিকিউর সেশন পে-লোড (বেস৬৪ লোগো বাদ দিয়ে কমপ্যাক্ট URL তৈরি)
      const sessionData = {
        brand_id: brand.id,
        brand_name: brand.name,
        brand_logo: brand.logo_url?.startsWith('http') ? brand.logo_url : undefined,
        order_id: order_id || ('ORD-' + Date.now()),
        product_name: product_name || 'Item',
        product_type,
        payable_amount: amount,
        total_amount: total_amount || amount,
        courier_charge: courier_charge || 0,
        cod_due: cod_due || 0,
        callback_url: callback_url || null,
        cancel_url: cancel_url || null,
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        telegram_link: telegram_link || null,
        facebook_group_link: facebook_group_link || null,
        google_drive_link: google_drive_link || null,
        invoice_number: invoiceNumber,
        created_at: Date.now()
      };

      // সেশন টোকেন এনকোড
      const sessionToken = btoa(unescape(encodeURIComponent(JSON.stringify(sessionData))));
      const appOrigin = env.APP_URL || 'https://checkout.mecopay.space';
      const checkoutUrl = \`\${appOrigin}/pay?session=\${sessionToken}\`;

      return new Response(JSON.stringify({
        success: true,
        product_type,
        invoice_number: invoiceNumber,
        payable_amount: amount,
        checkout_url: checkoutUrl,
        requires_payment: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }
};`;

