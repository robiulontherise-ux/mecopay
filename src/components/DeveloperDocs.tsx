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
  const [activeTab, setActiveTab] = useState<'three-products' | 'laravel' | 'webhook' | 'overview'>('three-products');
  const [productSubTab, setProductSubTab] = useState<'digital' | 'physical_advance' | 'physical_cod'>('digital');
  const [frameworkTab, setFrameworkTab] = useState<'laravel' | 'php' | 'nodejs' | 'javascript' | 'python'>('laravel');
  const [webhookFrameworkTab, setWebhookFrameworkTab] = useState<'laravel' | 'php' | 'nodejs' | 'python'>('laravel');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getWebhookCode = () => {
    switch (webhookFrameworkTab) {
      case 'laravel':
        return laravelWebhookCode;
      case 'php':
        return rawPhpWebhookCode;
      case 'nodejs':
        return nodeJsWebhookCode;
      case 'python':
        return pythonWebhookCode;
      default:
        return laravelWebhookCode;
    }
  };

  const getWebhookFileName = () => {
    switch (webhookFrameworkTab) {
      case 'laravel':
        return 'app/Http/Controllers/MecoPayWebhookController.php';
      case 'php':
        return 'webhook.php (Core PHP)';
      case 'nodejs':
        return 'controllers/webhookController.js (Express)';
      case 'python':
        return 'views_webhook.py (Django / Flask)';
      default:
        return 'MecoPayWebhookController.php';
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">১</span>
              একই অর্ডারে সর্বোচ্চ ১টি ডিজিটাল প্রোডাক্ট
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              স্বয়ংক্রিয় পাসকোড, টেলিগ্রাম ইনভাইট ও ড্রাইভ লিংকের পূর্ণ নিরাপত্তা নিশ্চিত করতে গ্রাহক একবারে সর্বোচ্চ ১টি ডিজিটাল প্রোডাক্ট কিনতে পারবেন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">২</span>
              একাধিক ফিজিক্যাল প্রোডাক্ট কার্ট অনুমোদন (Allowed)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              গ্রাহক চাইলে কার্টে যত ইচ্ছা একাধিক ফিজিক্যাল প্রোডাক্ট একসাথে যুক্ত করে অর্ডার করতে পারবেন। কার্টের মোট পণ্যের মূল্য ও কুরিয়ার ফি একত্রিত করে অ্যাডভান্স বা COD প্রসেস হবে।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/20 space-y-2">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">৩</span>
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
                      <td className="p-3 font-mono text-blue-300">order_id</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ক্লায়েন্টের unique order ID; এটি বাধ্যতামূলক।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"digital"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">currency</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মুদ্রার কোড (যেমন: <code>"USD"</code>, <code>"BDT"</code>, <code>"EUR"</code>, <code>"GBP"</code>, <code>"USDT"</code>)। <strong>বাধ্যতামূলক:</strong> যেহেতু দেশ ও গেটওয়েভেদে একই সংখ্যার মূল্যের বিশাল পার্থক্য (যেমন ১০০ USD এবং ১০০ BDT এক নয়), তাই সঠিক কারেন্সি কোড পাঠানো বাধ্যতামূলক। পে-লোডে না পাঠালে সিস্টেম স্বয়ংক্রিয়ভাবে ব্র্যান্ড/গেটওয়ের ডিফল্ট কারেন্সি ফ্রন্টএন্ডে প্রদর্শন করবে।</td>
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
                      <td className="p-3 font-mono text-amber-300">order_id</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ক্লায়েন্টের unique order ID; এটি বাধ্যতামূলক।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"physical_advance"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-amber-300">currency</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মুদ্রার কোড (যেমন: <code>"USD"</code>, <code>"BDT"</code>, <code>"EUR"</code>, <code>"GBP"</code>)। <strong>বাধ্যতামূলক:</strong> বিভিন্ন দেশে ও গেটওয়েতে মুদ্রার মানের ভিন্নতার কারণে কারেন্সি উল্লেখ করা বাধ্যতামূলক। পে-লোডে না পেলে ব্র্যান্ড/গেটওয়ে কনফিগ থেকে ফ্রন্টএন্ডে কারেন্সি প্রদর্শিত হবে।</td>
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
                      <td className="p-3 font-mono text-emerald-300">order_id</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">ক্লায়েন্টের unique order ID; এটি বাধ্যতামূলক।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">product_type</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মান হতে হবে <code>"physical_cod"</code>।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-emerald-300">currency</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">মুদ্রার কোড (যেমন: <code>"USD"</code>, <code>"BDT"</code>, <code>"INR"</code>)। <strong>বাধ্যতামূলক:</strong> অর্ডার ভ্যালু ও কুরিয়ার অ্যামাউন্ট সঠিক রাখতে কারেন্সি পাঠানো আবশ্যক। পে-লোডে না পেলে ব্র্যান্ড/গেটওয়ে কনফিগ থেকে ফ্রন্টএন্ডে প্রদর্শিত হবে।</td>
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

            {/* End-to-End Product Lifecycle & Currency Flow Explainer */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Info className="w-4 h-4 shrink-0" />
                <span>ক্লায়েন্টের সাইটে প্রোডাক্ট কারেন্সি ও টাইপ কিভাবে কাজ করে? (Architecture Flow)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">১</span>
                    স্টোরের ডাটাবেজ
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    মার্চেন্টের সাইটে প্রোডাক্ট টেবিলে <code>product_type</code> (digital, physical_advance, physical_cod) এবং <code>currency</code> (BDT, USD, EUR) সেট থাকে।
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">২</span>
                    ফ্রন্টএন্ড ফর্ম / Buy Now
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    গ্রাহক যখন সাইটে কোনো প্রোডাক্টে "অর্ডার করুন" চাপেন, ফ্রন্টএন্ড থেকে শুধু <code>product_id</code> অথবা কার্ট ডেটা আপনার ব্যাকএন্ড কন্ট্রোলারে যায়।
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">৩</span>
                    ব্যাকএন্ড কন্ট্রোলার
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    কন্ট্রোলার প্রোডাক্টের ধরণ ও কারেন্সি রিড করে স্বয়ংক্রিয়ভাবে MecoPay API Worker এর <code>/v1/create-checkout</code> এ পে-লোড পাঠিয়ে <code>checkout_url</code> পায়।
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">৪</span>
                    MecoPay চেকআউট
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    পে-লোডে BDT থাকলে চেকআউটে <strong>৳</strong> ও বিকাশ/নগদ/কার্ড আসে; USD থাকলে <strong>$</strong> ও ইন্টারন্যাশনাল কার্ড আসে; আর কারেন্সি না দিলে গেটওয়ে সেটিং থেকে অটো শো হয়!
                  </p>
                </div>
              </div>
            </div>

            {/* 500+ Old Products & Mixed Catalog Auto-Detection Guide */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      ৫০+ বা ৫০০+ পুরোনো প্রোডাক্ট ও মিক্সড ক্যাটালগ অটো-ডিটেকশন গাইড
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">Zero-Edit Solution</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      আপনার সাইটে ১-২ বছর আগে তৈরি করা ৫০০টি পণ্য থাকলে এবং ডাটাবেজে কোনো <code>product_type</code> কলাম না থাকলেও কিভাবে প্লাগিন বা কন্ট্রোলার প্রতিটি পণ্য স্বয়ংক্রিয়ভাবে চিনে নেবে?
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Detection Strategies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Method 1: WooCommerce */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">১</span>
                      WooCommerce প্লাগিন (১০০% অটোমেটিক)
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">নো কোডিং</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    WooCommerce-এর নেটিভ মেথড <code>is_virtual()</code>, <code>is_downloadable()</code> ও <code>needs_shipping()</code> দেখে প্লাগিন নিজে থেকেই বুঝে ফেলে। ক্লায়েন্টকে ১টি পুরোনো প্রডাক্টেও হাত দিতে হবে না।
                  </p>
                </div>

                {/* Method 2: Custom Site Category */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-blue-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">২</span>
                      কাস্টম সাইট: ক্যাটাগরি আইডি দিয়ে অটো-ডিটেকশন
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">সুপারিশকৃত</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    কন্ট্রোলারে মাত্র ২ লাইনে ক্যাটাগরি আইডি দিয়ে ফিল্টার করুন:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto">
                    {'$isDigital = in_array($product->category_id, [3, 7]); // ৩=কোর্স, ৭=সফটওয়্যার\n$productType = $isDigital ? "digital" : (($adv > 0) ? "physical_advance" : "physical_cod");'}
                  </pre>
                </div>

                {/* Method 3: Feature & Download Link */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">৩</span>
                      কাস্টম সাইট: ডাউনলোড লিংক বা ফাইল ফিল্ড দেখে
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">বৈশিষ্ট্যভিত্তিক</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    ডিজিটাল পণ্যে কোনো ফাইল বা গুগল ড্রাইভ লিংক থাকে যা ফিজিক্যালে থাকে না:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-amber-300 overflow-x-auto">
                    {'$productType = !empty($product->download_link) ? "digital" : "physical_advance";'}
                  </pre>
                </div>

                {/* Method 4: 1-Second SQL Bulk Update */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-purple-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px]">৪</span>
                      ডাটাবেজে ১ সেকেন্ডের বাল্ক SQL কমান্ড
                    </span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">পার্মানেন্ট</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    ডাটাবেজে ১ সেকেন্ডে ৫০০ প্রোডাক্ট আপডেট করার কুয়েরি:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-purple-300 overflow-x-auto">
                    {'ALTER TABLE products ADD COLUMN product_type VARCHAR(20) DEFAULT "physical_advance";\nUPDATE products SET product_type = "digital" WHERE category_id IN (3, 7);'}
                  </pre>
                </div>
              </div>

              {/* 3 Important Architectural Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" /> ফ্রি ডেলিভারি (Free Shipping)
                  </div>
                  <p className="text-[10px] text-slate-400">
                    শিপিং ফি ০ টাকা হলে <code>courier_charge: 0</code> পাঠাবেন। সিস্টেমে <strong>"Free (৳0)"</strong> শো করবে, কোনো এরর হবে না।
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" /> ডাইনামিক কারেন্সি (Multi-Currency)
                  </div>
                  <p className="text-[10px] text-slate-400">
                    স্টোরের যেকোনো কারেন্সি (<code>BDT</code>, <code>USD</code>, <code>EUR</code>) পাঠাতে পারবেন। না পাঠালে গেটওয়ে থেকে অটো শো হবে।
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> মিক্সড কার্ট প্রটেকশন
                  </div>
                  <p className="text-[10px] text-slate-400">
                    একই অর্ডারে ডিজিটাল + ফিজিক্যাল প্রোডাক্ট অর্ডার করা ব্লক করা হয় ক্রেতার ফুল ডিজিটাল চুরি ঠেকাতে।
                  </p>
                </div>
              </div>
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
                * কোনো Brand ID আলাদা পাস করার দরকার নেই—API Key থেকেই MecoPay Server Engine সংশ্লিষ্ট ব্র্যান্ড শনাক্ত করে নেবে।
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
  "digital_access": {
    "telegram_link": "https://t.me/+join_onetime_secret",
    "facebook_group_link": "https://facebook.com/groups/aimasteryvip",
    "fb_passcode": "MCP-8921",
    "google_drive_link": "https://drive.google.com/drive/folders/sample_materials"
  },
  "telegram_link": "https://t.me/+join_onetime_secret",
  "facebook_group_link": "https://facebook.com/groups/aimasteryvip",
  "fb_passcode": "MCP-8921",
  "google_drive_link": "https://drive.google.com/drive/folders/sample_materials",
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
  "courier": {
    "provider": "steadfast",
    "tracking_code": "STDF-981245",
    "tracking_url": "https://steadfast.com.bd/tracking/STDF-981245"
  },
  "courier_tracking_code": "STDF-981245",
  "tracking_url": "https://steadfast.com.bd/tracking/STDF-981245",
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

            {/* Multi-language Webhook Controller Implementation */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                      ✓
                    </span>
                    ধাপ ২: <code>{getWebhookFileName()}</code> ফাইলে Webhook হ্যান্ডলার বসান
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    MecoPay Worker ও Edge Function থেকে আসা সিকিউর Webhook ভেরিফাই ও লোকাল ডাটাবেজে অর্ডার আপডেট কোড।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(getWebhookCode(), 5)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold shrink-0"
                >
                  {copiedIndex === 5 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Webhook Code
                </button>
              </div>

              {/* Language Switcher for Webhook */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setWebhookFrameworkTab('laravel')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    webhookFrameworkTab === 'laravel'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Laravel (Artisan)
                </button>
                <button
                  onClick={() => setWebhookFrameworkTab('php')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    webhookFrameworkTab === 'php'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Raw PHP (Core PDO)
                </button>
                <button
                  onClick={() => setWebhookFrameworkTab('nodejs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    webhookFrameworkTab === 'nodejs'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Node.js (Express)
                </button>
                <button
                  onClick={() => setWebhookFrameworkTab('python')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    webhookFrameworkTab === 'python'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Python (Django / Flask)
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
{getWebhookCode()}
              </pre>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <h5 className="font-bold text-white">Webhook কন্ট্রোলার যেভাবে কাজ করে:</h5>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>HMAC-SHA256 সিগনেচার ভেরিফিকেশন:</strong> <code>X-MecoPay-Signature</code> হেডারের মাধ্যমে প্রেরিত ডাটার নিরাপত্তা ও বৈধতা নিশ্চিত করে।</li>
                  <li><strong>অর্ডার ও ইনভয়েস ম্যাপিং:</strong> ক্লায়েন্টের মূল <code>order_id</code> এবং MecoPay-এর <code>invoice_number</code> দিয়ে লোকাল ডাটাবেজে অর্ডার খুঁজে বের করে।</li>
                  <li><strong>ইভেন্ট হ্যান্ডলিং:</strong> <code>payment.completed</code> হলে ডিজিটাল (পাসকোড প্রদান) বা ফিজিক্যাল (অ্যাডভান্স কনফার্ম ও শিপমেন্ট প্রস্তুত) আপডেট করে। <code>order.courier_booked</code> হলে কুরিয়ার ট্র্যাকিং কোড সংরক্ষণ করে।</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE WORKER CODE (FINAL) */}
      {/* TAB 4: API CREDENTIALS & BASE URL */}
      
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
                ডেভেলপারদের জন্য সিস্টেমে একটি মাত্র সেন্ট্রাল এন্ডপয়েন্ট রয়েছে। আপনার ব্যাকএন্ড/কন্ট্রোলার থেকে এই একক URL-এ POST রিকোয়েস্ট পাঠাবেন, MecoPay Server Engine বাকি সব প্রোডাক্ট টাইপ ও রাউটিং হ্যান্ডেল করবে।
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
                * ব্র্যান্ডের API Key পেতে ড্যাশবোর্ডের মেনু থেকে <strong>Brand</strong> সেকশনে যান। কোনো Brand ID আলাদা পাস করতে হবে না, API Key থেকে MecoPay Server Engine অটো ব্র্যান্ড ডিটেক্ট করবে।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------- CODE PAYLOADS -----------------

const digitalJsonPayload = `{
  "order_id": "ORD-9812",
  "product_name": "Fullstack AI Mastery Course",
  "product_type": "digital",
  "currency": "USD",
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
  "currency": "USD",
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
  "currency": "USD",
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
        // -------------------------------------------------------------------------
        // গার্ড ১: MecoPay গেটওয়ে সার্ভিস স্ট্যাটাস ক্যাশ চেক (Network Call রোধে)
        // -------------------------------------------------------------------------
        $isGatewayActive = Cache::get('mecopay_gateways_active', true);
        if (!$isGatewayActive) {
            return back()->with('error', 'MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে স্থগিত আছে।');
        }

        // -------------------------------------------------------------------------
        // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
        // -------------------------------------------------------------------------
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

        // -------------------------------------------------------------------------
        // গার্ড ৩: ৩ ধরনের প্রোডাক্টের স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
        // -------------------------------------------------------------------------
        // ৫০০+ পুরোনো প্রোডাক্টের ডাটাবেজ আপডেট ছাড়াই ক্যাটাগরি বা ফাইল দেখে অটো ডিটেকশন:
        // $isDigital = (!empty($product->download_link) || in_array($product->category_id, [1, 5]));
        // $detectedType = $isDigital ? 'digital' : (($advanceAmount > 0) ? 'physical_advance' : 'physical_cod');
        $productType = $request->input('product_type') ?: ($detectedType ?? 'digital'); // 'digital' | 'physical_advance' | 'physical_cod'
        $orderId = $request->input('order_id');
        $productName = $request->input('product_name');

        if (empty($orderId) && empty($productName)) {
            return back()->with('error', 'অর্ডার আইডি অথবা প্রোডাক্টের নাম যেকোনো একটি আবশ্যক।');
        }

        $price = (float) $request->input('price', 0);
        // কুরিয়ার চার্জ ডাইনামিকালি রিকোয়েস্ট বা প্রোডাক্ট থেকে নিন (ফ্রি ডেলিভারি হলে ০ থাকবে):
        $courierCharge = (float) $request->input('courier_charge', 0);
        // আপনার ডাটাবেজ বা রিকোয়েস্ট থেকে কারেন্সি নিন (যেমন: BDT, USD, EUR ইত্যাদি):
        $currency = strtoupper(trim($request->input('currency', 'BDT')));

        $payload = [
            'order_id'         => $orderId ?: ('ORD-' . time()),
            'product_name'     => $productName ?: 'General Item',
            'product_type'     => $productType,
            'currency'         => $currency,
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
            // ক্লায়েন্টের প্রোডাক্ট/স্টোর থেকে ডাইনামিক অগ্রিম ফি (০ হলে ১০০% ফুল ক্যাশ অন ডেলিভারি):
            $advanceAmount = (float) $request->input('advance_amount', 0);
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

// -------------------------------------------------------------------------
// গার্ড ১: গেটওয়ে সার্ভিস স্ট্যাটাস চেক (ক্যাশ বা সেশন থেকে)
// -------------------------------------------------------------------------
$isGatewayActive = $_SESSION['mecopay_gateways_active'] ?? true;
if (!$isGatewayActive) {
    die("MecoPay পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।");
}

// -------------------------------------------------------------------------
// গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
// -------------------------------------------------------------------------
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

// -------------------------------------------------------------------------
// গার্ড ৩: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
// -------------------------------------------------------------------------
// ৫০০+ পুরোনো প্রোডাক্টের ডাটাবেজ আপডেট ছাড়াই ক্যাটাগরি বা ফাইল দেখে অটো ডিটেকশন:
// $isDigital = (!empty($product['download_link']) || in_array($product['category_id'] ?? 0, [3, 7]));
// $detectedType = $isDigital ? 'digital' : (($advance > 0) ? 'physical_advance' : 'physical_cod');
$productType = $_POST['product_type'] ?? ($detectedType ?? 'digital');
$orderId = $_POST['order_id'] ?? ("ORD-" . time());
$productName = $_POST['product_name'] ?? "E-Commerce Product";

// ডাইনামিক কারেন্সি (BDT, USD, EUR ইত্যাদি):
$currency = strtoupper(trim($_POST['currency'] ?? $order['currency'] ?? 'BDT'));

// প্রোডাক্টের আসল মূল্য ও কুরিয়ার চার্জ ফর্ম বা ডাটাবেজ থেকে ডাইনামিকালি নিন (ফ্রি ডেলিভারি হলে ০):
$price = (float) ($_POST['price'] ?? 0);
$courierCharge = (float) ($_POST['courier_charge'] ?? 0);

$payload = [
    "order_id"         => $orderId,
    "product_name"     => $productName,
    "product_type"     => $productType,
    "currency"         => $currency,
    "customer_name"    => $_POST['customer_name'] ?? "Customer Name",
    "customer_phone"   => $_POST['customer_phone'] ?? "",
    "customer_address" => $_POST['customer_address'] ?? "",
    // সাইটের নিজস্ব ডোমেন ও ডাইনামিক রিটার্ন পাথ:
    "callback_url"     => ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://") . $_SERVER['HTTP_HOST'] . "/payment_success.php",
    "cancel_url"       => ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://") . $_SERVER['HTTP_HOST'] . "/cart.php"
];

if ($productType === 'digital') {
    if ($price <= 0) die("ডিজিটাল পণ্যের মূল্য আবশ্যক।");
    $payload['amount'] = $price;
    $payload['telegram_link'] = "https://t.me/+join_chat";
} elseif ($productType === 'physical_advance') {
    $advance = (float) ($_POST['advance_amount'] ?? 0); // ০ হলে ১০০% ফুল COD
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
    header("Location: " . $result['checkout_url']);
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
    // -------------------------------------------------------------------------
    // গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
    // -------------------------------------------------------------------------
    if (!isMecoPayActive) {
      return res.status(503).json({ error: 'MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।' });
    }

    const { 
      order_id, 
      product_name, 
      product_type = 'digital', 
      price = 0, 
      courier_charge = 0, // ফ্রি ডেলিভারি হলে ০ 
      advance_amount = 0, // ০ হলে ১০০% ফুল COD
      cart_items = [],
      customer_name, 
      customer_phone, 
      customer_address 
    } = req.body;

    // -------------------------------------------------------------------------
    // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // গার্ড ৩: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
    // -------------------------------------------------------------------------
    // ৫০০+ পুরোনো পণ্যের ডাটাবেজ আপডেট ছাড়াই ক্যাটাগরি বা ফাইল দেখে অটো ডিটেকশন:
    // const isDigital = Boolean(product?.download_link || [3, 7].includes(product?.category_id));
    // const detectedType = isDigital ? 'digital' : (advance_amount > 0 ? 'physical_advance' : 'physical_cod');
    const finalProductType = product_type || (typeof detectedType !== 'undefined' ? detectedType : 'digital');
    const finalCurrency = (req.body.currency || 'BDT').toUpperCase();

    if (!order_id && !product_name) {
      return res.status(400).json({ error: 'order_id অথবা product_name যেকোনো একটি ফিল্ড আবশ্যক।' });
    }

    const payload = {
      order_id: order_id || ('ORD-' + Date.now()),
      product_name: product_name || 'Item',
      product_type: finalProductType,
      currency: finalCurrency,
      customer_name: customer_name || 'Guest Customer',
      customer_phone: customer_phone || '',
      customer_address: customer_address || '',
      // ডাইনামিক সাইট ডোমেন ও পাথ:
      callback_url: (req.protocol + '://' + req.get('host') + '/payment/success'),
      cancel_url: (req.protocol + '://' + req.get('host') + '/cart')
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

  // -------------------------------------------------------------------------
  // গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
  // -------------------------------------------------------------------------
  const isGatewayActive = localStorage.getItem('mecopay_gateways_active') !== 'false';
  if (!isGatewayActive) {
    alert("MecoPay পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।");
    return;
  }

  // -------------------------------------------------------------------------
  // গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // গার্ড ৩: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
  // -------------------------------------------------------------------------
  // ৫০০+ পুরোনো পণ্যের ক্যাটাগরি বা ফাইল দেখে অটো ডিটেকশন ফলব্যাক:
  // const isDigital = Boolean(item.download_link || [3, 7].includes(item.category_id));
  // const detectedType = isDigital ? 'digital' : (Number(item.advance_amount) > 0 ? 'physical_advance' : 'physical_cod');
  const finalProductType = orderData.product_type || (typeof detectedType !== 'undefined' ? detectedType : 'digital');
  const price = Number(orderData.price || 0);
  const courierCharge = Number(orderData.courier_charge || 0); // ফ্রি ডেলিভারি হলে ০ থাকবে

  const payload = {
    order_id: orderData.order_id || ("ORD-" + Date.now()),
    product_name: orderData.product_name || "Order Item",
    product_type: finalProductType,
    currency: (orderData.currency || "BDT").toUpperCase(),
    customer_name: orderData.customer_name || "Customer Name",
    customer_phone: orderData.customer_phone || "",
    customer_address: orderData.customer_address || "",
    // ব্রাউজারের ডাইনামিক অরিজিন URL:
    callback_url: window.location.origin + "/order-success",
    cancel_url: window.location.origin + "/cart"
  };

  if (finalProductType === 'digital') {
    payload.amount = price;
    payload.telegram_link = orderData.telegram_link || "https://t.me/+vip_invite";
  } else if (finalProductType === 'physical_advance') {
    const advance = Number(orderData.advance_amount || 0); // ০ হলে ১০০% ফুল COD
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
    # -------------------------------------------------------------------------
    # গার্ড ১: গেটওয়ে স্ট্যাটাস ক্যাশ চেক
    # -------------------------------------------------------------------------
    if not is_mecopay_active:
        return {"error": "MecoPay অনলাইন পেমেন্ট সার্ভিস এই মুহূর্তে সাময়িকভাবে বন্ধ আছে।"}

    # -------------------------------------------------------------------------
    # গার্ড ২: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
    # -------------------------------------------------------------------------
    cart_items = request_data.get('cart_items', [])
    if cart_items:
        digital_count = sum(1 for item in cart_items if item.get('type') == 'digital')
        physical_count = sum(1 for item in cart_items if item.get('type') != 'digital')

        if digital_count > 0 and physical_count > 0:
            return {"error": "কার্ট পলিসি এরর: একই সাথে ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট কেনা নিষিদ্ধ।"}
        if digital_count > 1:
            return {"error": "কার্ট পলিসি এরর: ডিজিটাল প্রোডাক্ট এক অর্ডারে সর্বোচ্চ ১টি নেওয়া যাবে।"}

    # -------------------------------------------------------------------------
    # গার্ড ৩: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
    # -------------------------------------------------------------------------
    # ৫০০+ পুরোনো পণ্যের ক্যাটাগরি বা ফাইল দেখে অটো ডিটেকশন:
    # is_digital = bool(product.get("download_link") or product.get("category_id") in [3, 7])
    # detected_type = "digital" if is_digital else ("physical_advance" if advance_amount > 0 else "physical_cod")
    product_type = request_data.get('product_type') or locals().get('detected_type', 'digital')
    price = float(request_data.get('price') or request_data.get('amount') or 0)
    courier_charge = float(request_data.get('courier_charge') or 0) # ফ্রি ডেলিভারি হলে ০ থাকবে

    payload = {
        "order_id": request_data.get('order_id', f"ORD-{int(time.time())}"),
        "product_name": request_data.get('product_name', "Digital E-Book"),
        "product_type": product_type,
        "currency": (request_data.get('currency') or "BDT").upper(),
        "customer_name": request_data.get('customer_name', "Guest"),
        "customer_phone": request_data.get('customer_phone', ""),
        "customer_address": request_data.get('customer_address', "Dhaka"),
        # সাইটের ডাইনামিক ডোমেন বা রিকোয়েস্ট URL:
        "callback_url": request_data.get('callback_url') or "/payment/callback",
        "cancel_url": request_data.get('cancel_url') or "/cart"
    }

    if product_type == 'digital':
        if price <= 0:
            return {"error": "ডিজিটাল প্রোডাক্টের জন্য price ফিল্ড আবশ্যক।"}
        payload["amount"] = price
        payload["telegram_link"] = "https://t.me/+vip_invite"
    elif product_type == 'physical_advance':
        advance = float(request_data.get('advance_amount') or 0)
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
use App\\Models\\Order;

class MecoPayWebhookController extends Controller
{
    /**
     * MecoPay Webhook Listener & Order Fulfillment
     * Synchronized with Cloudflare API Worker & Supabase Edge Functions
     */
    public function handle(Request $request)
    {
        $rawPayload = $request->getContent();
        $receivedSignature = $request->header('X-MecoPay-Signature');
        $webhookSecret = env('MECOPAY_WEBHOOK_SECRET', 'your_webhook_secret_here');

        // -------------------------------------------------------------------------
        // ১. সিকিউরিটি গার্ড: HMAC-SHA256 সিগনেচার ভেরিফিকেশন
        // -------------------------------------------------------------------------
        if (!empty($webhookSecret) && $webhookSecret !== 'your_webhook_secret_here') {
            $expectedSignature = hash_hmac('sha256', $rawPayload, $webhookSecret);
            if (!hash_equals($expectedSignature, (string)$receivedSignature)) {
                return response()->json(['error' => 'Invalid webhook signature.'], 401);
            }
        }

        $payload = $request->all();
        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? $payload;

        // -------------------------------------------------------------------------
        // ২. ক্লায়েন্ট অর্ডার আইডি ও ইনভয়েস নাম্বার অনুসন্ধান
        // -------------------------------------------------------------------------
        $orderId = $data['order_id'] ?? $payload['order_id'] ?? null;
        $invoiceNumber = $data['invoice_number'] ?? $payload['invoice_number'] ?? null;

        if (!$orderId && !$invoiceNumber) {
            return response()->json(['error' => 'Missing order_id or invoice_number in webhook.'], 400);
        }

        // ক্লায়েন্টের নিজস্ব ডাটাবেজে অর্ডার কুয়েরি (Order ID অথবা Invoice Number দিয়ে)
        $order = Order::when($orderId, fn($q) => $q->where('id', $orderId)->orWhere('order_id', $orderId))
                      ->when($invoiceNumber, fn($q) => $q->orWhere('invoice_number', $invoiceNumber))
                      ->first();

        if (!$order) {
            return response()->json(['error' => 'Order not found in merchant database.'], 404);
        }

        // -------------------------------------------------------------------------
        // ৩. ইভেন্ট ১: ডিজিটাল বা ফিজিক্যাল অ্যাডভান্স পেমেন্ট সফল হওয়া
        // -------------------------------------------------------------------------
        if ($event === 'payment.completed') {
            $productType = $data['order_type'] ?? $data['product_type'] ?? $order->product_type ?? 'digital';
            $trxId = $data['trx_id'] ?? $data['transaction_id'] ?? null;
            $paidAmount = $data['amount'] ?? $data['amount_paid'] ?? 0;

            if ($productType === 'digital') {
                // ডিজিটাল প্রোডাক্ট: ১০০% পেমেন্ট সফল, অ্যাক্সেস ও ডেলিভারি লিংক সংরক্ষণ
                $digitalPasscode = $data['digital_access']['passcode'] ?? $data['digital_access']['fb_passcode'] ?? $data['fb_passcode'] ?? null;
                $telegramLink    = $data['digital_access']['telegram_link'] ?? $data['telegram_link'] ?? null;
                $fbGroupLink     = $data['digital_access']['facebook_group_link'] ?? $data['facebook_group_link'] ?? null;
                $driveLink       = $data['digital_access']['google_drive_link'] ?? $data['google_drive_link'] ?? null;

                $order->update([
                    'payment_status' => 'paid',
                    'order_status'   => 'completed',
                    'invoice_number' => $invoiceNumber,
                    'transaction_id' => $trxId,
                    'amount_paid'    => $paidAmount,
                    'access_passcode'=> $digitalPasscode,
                    'telegram_link'  => $telegramLink,
                    'facebook_group' => $fbGroupLink,
                    'google_drive'   => $driveLink,
                ]);
            } else {
                // ফিজিক্যাল প্রোডাক্ট (অ্যাডভান্স পেইড): অগ্রিম কনফার্ম, বাকি টাকা কুরিয়ারে ডিউ ও ট্র্যাকিং
                $trackingCode = $data['courier']['tracking_code'] ?? $data['courier_tracking_code'] ?? null;
                $trackingUrl  = $data['courier']['tracking_url'] ?? $data['tracking_url'] ?? null;
                $provider     = $data['courier']['provider'] ?? $data['courier_provider'] ?? 'steadfast';

                $order->update([
                    'payment_status'   => 'advance_paid',
                    'order_status'     => 'ready_for_dispatch',
                    'invoice_number'   => $invoiceNumber,
                    'transaction_id'   => $trxId,
                    'advance_amount'   => $paidAmount,
                    'courier_due'      => $data['cod_due'] ?? $order->cod_due,
                    'courier_provider' => $provider,
                    'courier_tracking' => $trackingCode,
                    'tracking_url'     => $trackingUrl,
                ]);
            }

            if ($productType === 'digital') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Digital payment processed and access links granted.',
                    'order_id' => $orderId,
                    'invoice_number' => $invoiceNumber,
                    'product_type' => 'digital',
                    'passcode' => $digitalPasscode,
                    'telegram_link' => $telegramLink,
                    'facebook_group_link' => $fbGroupLink,
                    'google_drive_link' => $driveLink,
                    'digital_access' => [
                        'passcode' => $digitalPasscode,
                        'telegram_link' => $telegramLink,
                        'facebook_group_link' => $fbGroupLink,
                        'google_drive_link' => $driveLink,
                    ]
                ], 200);
            } else {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Advance payment recorded and courier tracking initialized.',
                    'order_id' => $orderId,
                    'invoice_number' => $invoiceNumber,
                    'product_type' => 'physical_advance',
                    'advance_amount' => $paidAmount,
                    'courier_due' => $data['cod_due'] ?? $order->cod_due,
                    'courier_provider' => $provider,
                    'tracking_code' => $trackingCode,
                    'tracking_url' => $trackingUrl,
                    'courier' => [
                        'provider' => $provider,
                        'tracking_code' => $trackingCode,
                        'tracking_url' => $trackingUrl,
                    ]
                ], 200);
            }
        }

        // -------------------------------------------------------------------------
        // ৪. ইভেন্ট ২: ১০০% Full COD অর্ডারে কুরিয়ার বুকিং নিশ্চিত হওয়া
        // -------------------------------------------------------------------------
        if ($event === 'order.courier_booked') {
            $courier = $data['courier'] ?? [];
            $trackingCode = $courier['tracking_code'] ?? ($data['courier_tracking_code'] ?? null);
            $provider = $courier['provider'] ?? 'steadfast';
            $trackingUrl = $courier['tracking_url'] ?? null;

            $order->update([
                'order_status'     => 'shipped',
                'invoice_number'   => $invoiceNumber,
                'courier_provider' => $provider,
                'courier_tracking' => $trackingCode,
                'tracking_url'     => $trackingUrl,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Courier booking recorded with parcel tracking URL.',
                'order_id' => $orderId,
                'invoice_number' => $invoiceNumber,
                'courier_provider' => $provider,
                'tracking_code' => $trackingCode,
                'tracking_url' => $trackingUrl,
                'courier' => [
                    'provider' => $provider,
                    'tracking_code' => $trackingCode,
                    'tracking_url' => $trackingUrl,
                ]
            ], 200);
        }

        return response()->json(['status' => 'ignored', 'message' => 'Event not handled.'], 200);
    }
}
`;

const rawPhpWebhookCode = `<?php
/**
 * MecoPay Webhook Listener & Order Fulfillment (Core PHP / PDO)
 * Synchronized with Cloudflare API Worker & Supabase Edge Functions
 */

header('Content-Type: application/json');

$webhookSecret = getenv('MECOPAY_WEBHOOK_SECRET') ?: 'your_webhook_secret_here';
$rawPayload = file_get_contents('php://input');
$receivedSignature = $_SERVER['HTTP_X_MECOPAY_SIGNATURE'] ?? '';

// -------------------------------------------------------------------------
// ১. সিকিউরিটি গার্ড: HMAC-SHA256 সিগনেচার ভেরিফিকেশন
// -------------------------------------------------------------------------
if (!empty($webhookSecret) && $webhookSecret !== 'your_webhook_secret_here') {
    $expectedSignature = hash_hmac('sha256', $rawPayload, $webhookSecret);
    if (!hash_equals($expectedSignature, (string)$receivedSignature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid webhook signature.']);
        exit;
    }
}

$payload = json_decode($rawPayload, true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload.']);
    exit;
}

$event = $payload['event'] ?? '';
$data = $payload['data'] ?? $payload;

// -------------------------------------------------------------------------
// ২. ক্লায়েন্ট অর্ডার আইডি ও ইনভয়েস নাম্বার
// -------------------------------------------------------------------------
$orderId = $data['order_id'] ?? $payload['order_id'] ?? null;
$invoiceNumber = $data['invoice_number'] ?? $payload['invoice_number'] ?? null;

if (!$orderId && !$invoiceNumber) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing order_id or invoice_number in webhook.']);
    exit;
}

// আপনার ডাটাবেজ কানেকশন (MySQL / MariaDB via PDO)
/*
$pdo = new PDO("mysql:host=localhost;dbname=your_store_db;charset=utf8mb4", "db_user", "db_password", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
*/

// -------------------------------------------------------------------------
// ৩. ইভেন্ট ১: ডিজিটাল বা ফিজিক্যাল অ্যাডভান্স পেমেন্ট সফল হওয়া
// -------------------------------------------------------------------------
if ($event === 'payment.completed') {
    $productType = $data['order_type'] ?? $data['product_type'] ?? 'digital';
    $trxId = $data['trx_id'] ?? $data['transaction_id'] ?? '';
    $paidAmount = (float)($data['amount'] ?? $data['amount_paid'] ?? 0);
    $passcode = $data['digital_access']['passcode'] ?? $data['digital_access']['fb_passcode'] ?? $data['fb_passcode'] ?? '';
    $telegramLink = $data['digital_access']['telegram_link'] ?? $data['telegram_link'] ?? '';
    $fbGroupLink = $data['digital_access']['facebook_group_link'] ?? $data['facebook_group_link'] ?? '';
    $driveLink = $data['digital_access']['google_drive_link'] ?? $data['google_drive_link'] ?? '';
    $codDue = $data['cod_due'] ?? null;
    $trackingCode = $data['courier']['tracking_code'] ?? $data['courier_tracking_code'] ?? '';
    $trackingUrl = $data['courier']['tracking_url'] ?? $data['tracking_url'] ?? '';
    $provider = $data['courier']['provider'] ?? $data['courier_provider'] ?? 'steadfast';

    if ($productType === 'digital') {
        // ডিজিটাল: ১০০% ফুল পেমেন্ট সফল, পাসকোড ও এক্সেস লিংক কনফার্ম
        // $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', status = 'completed', trx_id = ?, invoice_number = ?, passcode = ?, telegram_link = ?, fb_group = ?, drive_link = ? WHERE id = ?");
        // $stmt->execute([$trxId, $invoiceNumber, $passcode, $telegramLink, $fbGroupLink, $driveLink, $orderId]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Digital payment processed and access links granted.',
            'order_id' => $orderId,
            'invoice_number' => $invoiceNumber,
            'product_type' => 'digital',
            'passcode' => $passcode,
            'telegram_link' => $telegramLink,
            'facebook_group_link' => $fbGroupLink,
            'google_drive_link' => $driveLink,
            'digital_access' => [
                'passcode' => $passcode,
                'telegram_link' => $telegramLink,
                'facebook_group_link' => $fbGroupLink,
                'google_drive_link' => $driveLink,
            ]
        ]);
        exit;
    } else {
        // ফিজিক্যাল অ্যাডভান্স: অগ্রিম পেমেন্ট কনফার্ম, পার্সেল শিপমেন্ট ও ট্র্যাকিং প্রস্তুত
        // $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'advance_paid', status = 'ready_to_ship', trx_id = ?, invoice_number = ?, advance_amount = ?, courier_due = ?, courier_tracking = ?, tracking_url = ? WHERE id = ?");
        // $stmt->execute([$trxId, $invoiceNumber, $paidAmount, $codDue, $trackingCode, $trackingUrl, $orderId]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Advance payment recorded and courier tracking initialized.',
            'order_id' => $orderId,
            'invoice_number' => $invoiceNumber,
            'product_type' => 'physical_advance',
            'advance_amount' => $paidAmount,
            'cod_due' => $codDue,
            'courier_provider' => $provider,
            'tracking_code' => $trackingCode,
            'tracking_url' => $trackingUrl,
            'courier' => [
                'provider' => $provider,
                'tracking_code' => $trackingCode,
                'tracking_url' => $trackingUrl,
            ]
        ]);
        exit;
    }
}

// -------------------------------------------------------------------------
// ৪. ইভেন্ট ২: ১০০% Full COD অর্ডারে কুরিয়ার বুকিং নিশ্চিত হওয়া
// -------------------------------------------------------------------------
if ($event === 'order.courier_booked') {
    $trackingCode = $data['courier']['tracking_code'] ?? $data['courier_tracking_code'] ?? '';
    $provider = $data['courier']['provider'] ?? 'steadfast';
    $trackingUrl = $data['courier']['tracking_url'] ?? '';

    // $stmt = $pdo->prepare("UPDATE orders SET status = 'shipped', courier_provider = ?, tracking_code = ?, tracking_url = ?, invoice_number = ? WHERE id = ?");
    // $stmt->execute([$provider, $trackingCode, $trackingUrl, $invoiceNumber, $orderId]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Courier tracking updated successfully with parcel tracking URL.',
        'order_id' => $orderId,
        'invoice_number' => $invoiceNumber,
        'courier_provider' => $provider,
        'tracking_code' => $trackingCode,
        'tracking_url' => $trackingUrl,
        'courier' => [
            'provider' => $provider,
            'tracking_code' => $trackingCode,
            'tracking_url' => $trackingUrl,
        ]
    ]);
    exit;
}

echo json_encode(['status' => 'ignored']);
?>`;

const nodeJsWebhookCode = `const express = require('express');
const crypto = require('crypto');
const app = express();

// গুরুত্বপূর্ণ: সিগনেচার ভেরিফিকেশনের জন্য হুবহু raw body প্রয়োজন
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

const WEBHOOK_SECRET = process.env.MECOPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';

app.post('/api/mecopay/webhook', async (req, res) => {
  try {
    const receivedSignature = req.headers['x-mecopay-signature'];

    // -------------------------------------------------------------------------
    // ১. সিকিউরিটি গার্ড: HMAC-SHA256 সিগনেচার ভেরিফিকেশন
    // -------------------------------------------------------------------------
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'your_webhook_secret_here') {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature.' });
      }
    }

    const { event, data } = req.body;
    const eventData = data || req.body;

    // -------------------------------------------------------------------------
    // ২. ক্লায়েন্ট অর্ডার আইডি ও ইনভয়েস নাম্বার
    // -------------------------------------------------------------------------
    const orderId = eventData.order_id || req.body.order_id;
    const invoiceNumber = eventData.invoice_number || req.body.invoice_number;

    if (!orderId && !invoiceNumber) {
      return res.status(400).json({ error: 'Missing order_id or invoice_number in webhook.' });
    }

    // -------------------------------------------------------------------------
    // ৩. ইভেন্ট ১: ডিজিটাল বা ফিজিক্যাল অ্যাডভান্স পেমেন্ট সফল হওয়া
    // -------------------------------------------------------------------------
    if (event === 'payment.completed') {
      const productType = eventData.order_type || eventData.product_type || 'digital';
      const trxId = eventData.trx_id || eventData.transaction_id;
      const paidAmount = eventData.amount || eventData.amount_paid;

      if (productType === 'digital') {
        // ডিজিটাল: ১০০% পেমেন্ট সফল, পাসকোড ও এক্সেস লিংক প্রদান
        const passcode = eventData.digital_access?.passcode || eventData.digital_access?.fb_passcode || eventData.fb_passcode;
        const telegramLink = eventData.digital_access?.telegram_link || eventData.telegram_link;
        const fbGroupLink = eventData.digital_access?.facebook_group_link || eventData.facebook_group_link;
        const driveLink = eventData.digital_access?.google_drive_link || eventData.google_drive_link;
        // await db.order.update({ where: { id: orderId }, data: { paymentStatus: 'paid', status: 'completed', trxId, invoiceNumber, passcode, telegramLink, fbGroupLink, driveLink } });

        return res.status(200).json({
          status: 'success',
          message: 'Digital payment processed and access links granted.',
          order_id: orderId,
          invoice_number: invoiceNumber,
          product_type: 'digital',
          passcode,
          telegram_link: telegramLink,
          facebook_group_link: fbGroupLink,
          google_drive_link: driveLink,
          digital_access: {
            passcode,
            telegram_link: telegramLink,
            facebook_group_link: fbGroupLink,
            google_drive_link: driveLink
          }
        });
      } else {
        // ফিজিক্যাল অ্যাডভান্স: অগ্রিম পেমেন্ট কনফার্ম, বাকি টাকা ও কুরিয়ার ট্র্যাকিং
        const codDue = eventData.cod_due;
        const trackingCode = eventData.courier?.tracking_code || eventData.courier_tracking_code;
        const trackingUrl = eventData.courier?.tracking_url || eventData.tracking_url;
        const provider = eventData.courier?.provider || eventData.courier_provider || 'steadfast';
        // await db.order.update({ where: { id: orderId }, data: { paymentStatus: 'advance_paid', status: 'ready_to_ship', trxId, invoiceNumber, advanceAmount: paidAmount, courierDue: codDue, courierTracking: trackingCode, trackingUrl } });

        return res.status(200).json({
          status: 'success',
          message: 'Advance payment recorded and courier tracking initialized.',
          order_id: orderId,
          invoice_number: invoiceNumber,
          product_type: 'physical_advance',
          advance_amount: paidAmount,
          cod_due: codDue,
          courier_provider: provider,
          tracking_code: trackingCode,
          tracking_url: trackingUrl,
          courier: {
            provider,
            tracking_code: trackingCode,
            tracking_url: trackingUrl
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // ৪. ইভেন্ট ২: ১০০% Full COD অর্ডারে কুরিয়ার বুকিং নিশ্চিত হওয়া
    // -------------------------------------------------------------------------
    if (event === 'order.courier_booked') {
      const trackingCode = eventData.courier?.tracking_code || eventData.courier_tracking_code;
      const provider = eventData.courier?.provider || eventData.courier_provider || 'steadfast';
      const trackingUrl = eventData.courier?.tracking_url || eventData.tracking_url;

      // await db.order.update({ where: { id: orderId }, data: { status: 'shipped', courierProvider: provider, trackingCode, trackingUrl, invoiceNumber } });

      return res.status(200).json({
        status: 'success',
        message: 'Courier booking saved with parcel tracking URL.',
        order_id: orderId,
        invoice_number: invoiceNumber,
        courier_provider: provider,
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        courier: {
          provider,
          tracking_code: trackingCode,
          tracking_url: trackingUrl
        }
      });
    }

    return res.status(200).json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
});
`;

const pythonWebhookCode = `import hmac
import hashlib
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

WEBHOOK_SECRET = os.getenv("MECOPAY_WEBHOOK_SECRET", "your_webhook_secret_here")

@csrf_exempt
def mecopay_webhook_view(request):
    """
    MecoPay Webhook Listener & Order Fulfillment (Django / Flask)
    Synchronized with Cloudflare API Worker & Supabase Edge Functions
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)

    raw_body = request.body.decode('utf-8')
    received_signature = request.headers.get("X-MecoPay-Signature", "")

    # -------------------------------------------------------------------------
    # ১. সিকিউরিটি গার্ড: HMAC-SHA256 সিগনেচার ভেরিফিকেশন
    # -------------------------------------------------------------------------
    if WEBHOOK_SECRET and WEBHOOK_SECRET != "your_webhook_secret_here":
        expected_signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            raw_body.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, received_signature):
            return JsonResponse({"error": "Invalid webhook signature."}, status=401)

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    event = payload.get("event")
    data = payload.get("data") or payload

    # -------------------------------------------------------------------------
    # ২. ক্লায়েন্ট অর্ডার আইডি ও ইনভয়েস নাম্বার
    # -------------------------------------------------------------------------
    order_id = data.get("order_id") or payload.get("order_id")
    invoice_number = data.get("invoice_number") or payload.get("invoice_number")

    if not order_id and not invoice_number:
        return JsonResponse({"error": "Missing order_id or invoice_number in webhook."}, status=400)

    # -------------------------------------------------------------------------
    # ৩. ইভেন্ট ১: ডিজিটাল বা ফিজিক্যাল অ্যাডভান্স পেমেন্ট সফল হওয়া
    # -------------------------------------------------------------------------
    if event == "payment.completed":
        product_type = data.get("order_type") or data.get("product_type") or "digital"
        trx_id = data.get("trx_id") or data.get("transaction_id")
        paid_amount = data.get("amount") or data.get("amount_paid")

        if product_type == "digital":
            # ডিজিটাল প্রোডাক্ট: ১০০% পেমেন্ট সফল, পাসকোড ও এক্সেস লিংক ডেলিভারি
            digital_access = data.get("digital_access") or {}
            passcode = digital_access.get("passcode") or digital_access.get("fb_passcode") or data.get("fb_passcode")
            telegram_link = digital_access.get("telegram_link") or data.get("telegram_link")
            fb_group_link = digital_access.get("facebook_group_link") or data.get("facebook_group_link")
            drive_link = digital_access.get("google_drive_link") or data.get("google_drive_link")
            # Order.objects.filter(id=order_id).update(payment_status="paid", status="completed", trx_id=trx_id, invoice_number=invoice_number, passcode=passcode, telegram_link=telegram_link, fb_group=fb_group_link, drive_link=drive_link)

            return JsonResponse({
                "status": "success",
                "message": "Digital payment processed and access links granted.",
                "order_id": order_id,
                "invoice_number": invoice_number,
                "product_type": "digital",
                "passcode": passcode,
                "telegram_link": telegram_link,
                "facebook_group_link": fb_group_link,
                "google_drive_link": drive_link,
                "digital_access": {
                    "passcode": passcode,
                    "telegram_link": telegram_link,
                    "facebook_group_link": fb_group_link,
                    "google_drive_link": drive_link,
                }
            })
        else:
            # ফিজিক্যাল অ্যাডভান্স: অগ্রিম পেমেন্ট নিশ্চিত, বাকি টাকা COD ও কুরিয়ার ট্র্যাকিং
            cod_due = data.get("cod_due")
            courier = data.get("courier") or {}
            tracking_code = courier.get("tracking_code") or data.get("courier_tracking_code")
            tracking_url = courier.get("tracking_url") or data.get("tracking_url")
            provider = courier.get("provider") or data.get("courier_provider") or "steadfast"
            # Order.objects.filter(id=order_id).update(payment_status="advance_paid", status="ready_to_ship", trx_id=trx_id, invoice_number=invoice_number, advance_amount=paid_amount, courier_due=cod_due, courier_tracking=tracking_code, tracking_url=tracking_url)

            return JsonResponse({
                "status": "success",
                "message": "Advance payment recorded and courier tracking initialized.",
                "order_id": order_id,
                "invoice_number": invoice_number,
                "product_type": "physical_advance",
                "advance_amount": paid_amount,
                "cod_due": cod_due,
                "courier_provider": provider,
                "tracking_code": tracking_code,
                "tracking_url": tracking_url,
                "courier": {
                    "provider": provider,
                    "tracking_code": tracking_code,
                    "tracking_url": tracking_url,
                }
            })

    # -------------------------------------------------------------------------
    # ৪. ইভেন্ট ২: ১০০% Full COD অর্ডারে কুরিয়ার বুকিং নিশ্চিত হওয়া
    # -------------------------------------------------------------------------
    elif event == "order.courier_booked":
        courier = data.get("courier") or {}
        tracking_code = courier.get("tracking_code") or data.get("courier_tracking_code")
        provider = courier.get("provider", "steadfast")
        tracking_url = courier.get("tracking_url") or data.get("tracking_url")
        # Order.objects.filter(id=order_id).update(status="shipped", courier_provider=provider, courier_tracking=tracking_code, tracking_url=tracking_url, invoice_number=invoice_number)

        return JsonResponse({
            "status": "success",
            "message": "Courier booked successfully with parcel tracking URL.",
            "order_id": order_id,
            "invoice_number": invoice_number,
            "courier_provider": provider,
            "tracking_code": tracking_code,
            "tracking_url": tracking_url,
            "courier": {
                "provider": provider,
                "tracking_code": tracking_code,
                "tracking_url": tracking_url,
            }
        })

    return JsonResponse({"status": "ignored"})
`;
