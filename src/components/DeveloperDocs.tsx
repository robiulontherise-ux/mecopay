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
  const [webhookFrameworkTab, setWebhookFrameworkTab] = useState<'laravel' | 'php' | 'nodejs' | 'javascript' | 'python'>('laravel');

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

  const getWebhookCode = () => {
    switch (webhookFrameworkTab) {
      case 'laravel':
        return laravelWebhookCode;
      case 'php':
        return rawPhpWebhookCode;
      case 'nodejs':
        return nodeJsWebhookCode;
      case 'javascript':
        return javascriptWebhookNotice;
      case 'python':
        return pythonWebhookCode;
      default:
        return laravelWebhookCode;
    }
  };

  const getWebhookFileName = () => {
    switch (webhookFrameworkTab) {
      case 'laravel': return 'app/Http/Controllers/MecoPayWebhookController.php';
      case 'php': return 'mecopay-webhook.php (Core PHP)';
      case 'nodejs': return 'routes/mecopayWebhook.js (Express)';
      case 'javascript': return 'Not applicable in browser';
      case 'python': return 'webhooks.py (Django / Flask)';
      default: return 'MecoPayWebhookController.php';
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
                      <td className="p-3 font-mono text-blue-300">order_id, product_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">order_id বা product_id সহ product_name পাঠানো উচিত; অন্তত order_id অথবা product_name অবশ্যই পাঠাতে হবে (দুটোই পাঠালে ট্র্যাকিংয়ের জন্য সর্বোত্তম)।</td>
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
                      <td className="p-3 font-mono text-blue-300">facebook_access_code</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">MecoPay/server থেকে পাওয়া Facebook access value। Facebook group link-এর সঙ্গে পাঠাবেন; Webhook-এ <code>delivery.facebook_access_code</code> হিসেবে client success flow-তে পৌঁছাবে।</td>
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
                      <td className="p-3 font-mono text-amber-300">order_id, product_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">অর্ডার আইডেন্টিফায়ারের জন্য যেকোনো একটি পাঠানো আবশ্যক।</td>
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
                      <td className="p-3 font-mono text-emerald-300">order_id, product_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">যেকোনো একটি বা দুটিই পাঠানো আবশ্যক।</td>
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
                    কন্ট্রোলার নিজের সার্ভার-side database থেকে প্রোডাক্টের ধরণ ও কারেন্সি রিড করে MecoPay API Worker-এর <code>/v1/create-checkout</code> এ পে-লোড পাঠিয়ে <code>checkout_url</code> পায়।
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">৪</span>
                    MecoPay চেকআউট
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    পে-লোডে BDT থাকলে চেকআউটে <strong>৳</strong> ও বিকাশ/নগদ/কার্ড আসে; USD থাকলে <strong>$</strong> ও ইন্টারন্যাশনাল কার্ড আসে; আর কারেন্সি না দিলে MecoPay API-এর নির্ধারিত currency অনুযায়ী দেখায়!
                  </p>
                </div>
              </div>
            </div>

            {/* Product classification and migration guide */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      পুরোনো প্রোডাক্ট ও মিক্সড ক্যাটালগ classification guide
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold">Server-side required</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      WooCommerce plugin product metadata দেখে নিজে type নির্ধারণ করতে পারে। Custom website controller-এর ক্ষেত্রে browser-এর category/type কখনো trust করবেন না—নিজের database field, category rule বা migration দিয়ে server-side type resolve করে তারপর API payload তৈরি করবেন।
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
                      কাস্টম সাইট: database category rule
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">সুপারিশকৃত</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Server-side database থেকে category নিয়ে rule প্রয়োগ করুন; <code>category_id</code> browser request থেকে নেবেন না:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto">
                    {'$isDigital = in_array($product->category_id, [3, 7], true); // database value\n$productType = $isDigital ? "digital" : (($advanceAmount > 0) ? "physical_advance" : "physical_cod");'}
                  </pre>
                </div>

                {/* Method 3: Feature & Download Link */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">৩</span>
                      কাস্টম সাইট: database feature/download field
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">বৈশিষ্ট্যভিত্তিক</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Trusted database-এর download/file field দেখে type resolve করুন; না থাকলে physical product-এর configured advance rule প্রয়োগ করুন:
                  </p>
                  <pre className="bg-slate-950 p-2 rounded-lg text-[10px] font-mono text-amber-300 overflow-x-auto">
                    {'$isDigital = !empty($product->download_link); // database value\n$productType = $isDigital ? "digital" : (($advanceAmount > 0) ? "physical_advance" : "physical_cod");'}
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
                    স্টোরের যেকোনো কারেন্সি (<code>BDT</code>, <code>USD</code>, <code>EUR</code>) পাঠাতে পারবেন। না পাঠালে API-এর নির্ধারিত currency ব্যবহার হবে।
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

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-100 space-y-1.5">
              <div className="font-bold text-amber-300">গুরুত্বপূর্ণ backend rule</div>
              <p>এই controller samples backend/server-এ চালবে। Frontend শুধু <code>product_id</code> বা cart reference পাঠাবে; API key, price, product_type এবং courier/advance calculation আপনার server-side database থেকে নিতে হবে। Browser-এর পাঠানো price বা product_type সরাসরি MecoPay-তে forward করবেন না।</p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-cyan-50">
              <div className="font-bold text-cyan-300">Controller কোথায় বসাবেন এবং নিজের database data কীভাবে map করবেন</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <p className="font-semibold text-white">Backend file / route</p>
                  <p>Laravel: <code>app/Http/Controllers/PaymentController.php</code> এবং <code>POST /api/mecopay/checkout</code> route। Raw PHP: একটি server-only <code>process-payment.php</code> endpoint। Node: controller route যেমন <code>POST /api/checkout</code>। Python: Django view/URL বা Flask server route।</p>
                </div>
                <div>
                  <p className="font-semibold text-white">প্রথমে নিজের order load করুন</p>
                  <p>Frontend শুধু <code>product_id</code> বা order reference পাঠাবে। Controller নিজের database থেকে <code>product_id, product_name, product_type, price, currency, courier_charge, advance_amount</code> এবং customer/order record নেবে। Browser-এর price, type বা fee trust করবেন না।</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Product mapping</p>
                  <p><code>digital</code> হলে <code>amount</code> ও delivery links দিন। <code>physical_advance</code> হলে <code>total_amount, amount, courier_charge, cod_due</code> দিন। <code>physical_cod</code> হলে <code>amount: 0</code> এবং <code>cod_due: total_amount + courier_charge</code> দিন।</p>
                </div>
                <div>
                  <p className="font-semibold text-white">সরাসরি API call</p>
                  <p>Backend environment-এ <code>MECOPAY_API_KEY</code> রাখুন এবং server থেকে <code>https://api.mecopay.space/v1/create-checkout</code>-এ Bearer request পাঠান। Customer কখনো API key দেখবে না। Response-এর <code>invoice_number</code> নিজের order record-এ save করে <code>checkout_url</code>-এ redirect করুন।</p>
                </div>
              </div>
            </div>

            <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-fuchsia-50">
              <div className="font-bold text-fuchsia-300">Digital access button: Telegram / Facebook / Drive</div>
              <p className="text-slate-300">Controller-এ পাঠানো <code>telegram_link</code>, <code>facebook_group_link</code> এবং <code>google_drive_link</code> হলো delivery metadata। এগুলো নিজে থেকে Telegram bot approval বা Facebook Group membership তৈরি করে না। Payment success-এর পরে client backend নিজের order-এর paid entitlement দেখে button দেখাবে।</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                <div><p className="font-semibold text-white">Telegram</p><p>বর্তমান <code>/access/:invoiceId</code> AccessPage Telegram link শনাক্ত করে <code>telegram-tally-delivery</code> edge function invoke করার চেষ্টা করে; সফল হলে one-time invite URL নেয়, ব্যর্থ হলে raw link fallback করে। এই function-এর source/secure deployment contract এই repository-তে নেই—তাই production-এ bot approval চালু আছে ধরে নেবেন না। Bot token কখনো browser বা client page-এ রাখবেন না।</p></div>
                <div><p className="font-semibold text-white">Facebook</p><p>Facebook Graph API call কেবল server থেকে হবে। App token, Page/Group permission এবং access token client browser-এ যাবে না। এই repository-তে Facebook Group member-add/approval-এর production Graph API endpoint নেই। Client backend paid invoice যাচাই না করে raw group URL দিয়ে member add/approve করতে পারবে না; server-side access API এবং Meta permission contract আলাদাভাবে তৈরি করতে হবে।</p></div>
                <div><p className="font-semibold text-white">Google Drive</p><p>Drive link-ও webhook-এর পরে paid order-এর সঙ্গে associate করুন। Public link হলে সরাসরি button দেওয়া যায়; private file হলে client backend বা Drive access service থেকে entitlement অনুযায়ী restricted URL দিতে হবে।</p></div>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 text-slate-300 space-y-2"><span className="font-semibold text-white">Digital delivery JSON contract:</span><pre className="text-[11px] font-mono text-fuchsia-200 overflow-x-auto">{`{
  "telegram_link": "https://t.me/private-invite",
  "facebook_group_link": "https://facebook.com/groups/private-group",
  "facebook_access_code": "SERVER_GENERATED_CODE",
  "google_drive_link": "https://drive.google.com/drive/folders/..."
}`}</pre><p><code>facebook_access_code</code> হলো MecoPay server/API থেকে দেওয়া one-time access value। Controller শুধু নিজের trusted order record-এর value API-তে পাঠাবে; client browser-এ code তৈরি বা পরিবর্তন করবে না। Webhook একই field <code>delivery.facebook_access_code</code>-এ পাঠাবে।</p></div>
              <div className="bg-slate-950/70 rounded-xl p-3 text-slate-300 space-y-2"><span className="font-semibold text-white">Success-page button example:</span><pre className="text-[11px] font-mono text-fuchsia-200 overflow-x-auto">{`const delivery = webhook.data.delivery;
if (order.payment_status === 'paid') {
  showButton('Join Telegram', delivery.telegram_link);
  showButton('Join Facebook Group',
    delivery.facebook_group_link,
    { accessCode: delivery.facebook_access_code }
  );
  showButton('Open Drive', delivery.google_drive_link);
}`}</pre><p>Client developer নিজের success page-এর framework অনুযায়ী <code>showButton</code> implement করবেন। Facebook button click করলে group URL এবং server-provided <code>facebook_access_code</code> নিজের protected backend route-এ পাঠাবেন; code frontend-এ hard-code করবেন না।</p></div>
              <div className="bg-slate-950/70 rounded-xl p-3 text-slate-300"><span className="font-semibold text-white">Client implementation flow:</span> webhook-এ invoice ও paid status save → নিজের backend-এ <code>GET/POST /digital-access</code> ধরনের protected route → invoice/customer authorization check → server-side Telegram/Facebook/Drive access service call → frontend-এ button/access URL। <strong className="text-amber-300">Telegram-এর UI hook আছে, কিন্তু তার edge-function source/deployment contract নেই; Facebook Group access endpoint-ও নেই। তাই নির্দিষ্ট production URL বা token ধরে code লিখবেন না। Access API contract তৈরি ও deploy হলে তার exact request/response sample এই guide-এ যোগ করতে হবে।</strong></div>
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
                  <li>Frontend আপনার নিজের backend endpoint-এ order/cart reference পাঠায়; customer controller code দেখে না।</li>
                  <li>Backend database থেকে product_id, product_name, product_type, trusted price, currency এবং courier charge নিয়ে payload বানায়।</li>
                  <li>MecoPay Worker-এর <code>https://api.mecopay.space/v1/create-checkout</code> এ পাঠায়।</li>
                  <li>Controller সরাসরি API call করে; আলাদা KBCash বা gateway-availability check করার code লাগবে না—MecoPay API নিজেই service availability handle করে। MecoPay একটি সিকিউর <code>checkout_url</code> রিটার্ন করে এবং কাস্টমার রিডাইরেক্ট হয় (অথবা ফুল COD-তে অর্ডার কনফার্ম করে)।</li>
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
                পেমেন্ট সফল হলে বা কুরিয়ার পার্সেল ডেলিভারি কনফার্ম করলে MecoPay স্বয়ংক্রিয়ভাবে আপনার ব্যাকএন্ডে একটি সিকিউর POST Webhook পাঠাবে। Signature JSON-এর ভিতরে নয়; <code>X-MecoPay-Signature</code> header-এ থাকে এবং raw request body দিয়ে HMAC-SHA256 যাচাই করতে হবে। Client order correlation-এর primary key হলো unique <code>invoice_number</code>; <code>order_id</code> ও <code>product_name</code> descriptive matching-এর জন্য পাঠানো হয়। Transaction ID client-এর জন্য required নয়।
              </p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-emerald-50">
              <div className="font-bold text-emerald-300">Webhook কোথায় বসাবেন এবং Controller-এর সঙ্গে কীভাবে connect হবে</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div><p className="font-semibold text-white">নিজস্ব backend-এ public HTTPS route বানান</p><p>Laravel: <code>routes/api.php</code>-এ <code>POST /webhooks/mecopay</code> এবং controller method। Raw PHP: <code>mecopay-webhook.php</code>। Node: Express router। Python: Django URL/view বা Flask route। এটি frontend route নয়।</p></div>
                <div><p className="font-semibold text-white">Secret configure করুন</p><p>Server environment-এ <code>MECOPAY_WEBHOOK_SECRET</code> রাখুন। Raw request body দিয়ে <code>X-MecoPay-Signature</code> HMAC-SHA256 verify করুন। Secret source code, browser বা public repository-তে রাখবেন না।</p></div>
                <div><p className="font-semibold text-white">দুই endpoint-এর connection</p><p>Controller API call করে <code>invoice_number</code> পাবে এবং নিজের order row-তে save করবে। Payment বা COD event এলে webhook একই <code>invoice_number</code> দিয়ে সেই order খুঁজে status update করবে। তাই Controller ও Webhook-এর shared connection হলো নিজের database-এর order row।</p></div>
                <div><p className="font-semibold text-white">Receiver mapping</p><p><code>payment.completed</code>-এ paid order, আর <code>order.courier_booked</code>-এ physical COD processing update করুন। <code>product_id, product_name, product_type, amount, fees, delivery</code> নিজের order/delivery fields-এ save করুন এবং invoice number দিয়ে duplicate event আটকান। Digital access provision আলাদা server-side job/route-এ করুন; webhook request-এর ভিতর থেকে bot token বা Facebook token browser-এ পাঠাবেন না।</p></div>
              </div>
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
  "product_id": "COURSE-AI-001",
  "product_name": "Fullstack AI Mastery Course",
  "product_type": "digital",
  "amount": 1500,
  "total_amount": 1500,
  "customer_phone": "01712345678",
  "status": "paid",
  "fb_passcode": "MC-8921",
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
  "product_id": "HEADPHONE-001",
  "product_name": "Wireless Noise Cancelling Headphones",
  "product_type": "physical_advance",
  "amount": 150,
  "total_amount": 1250,
  "courier_charge": 120,
  "cod_due": 1220,
  "customer_phone": "01812345678",
  "status": "paid",
  "courier_tracking_code": "STDF-981245",
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
  "product_id": "WALLET-001",
  "product_name": "Leather Executive Wallet",
  "product_type": "physical_cod",
  "amount": 0,
  "total_amount": 1200,
  "courier_charge": 120,
  "cod_due": 1320,
  "customer_name": "Mohammad Ali",
  "customer_phone": "01912345678",
  "customer_address": "Chawkbazar, Chittagong",
  "status": "cod_confirmed",
  "courier": {
    "provider": "steadfast",
    "tracking_code": "STDF-883109",
    "tracking_url": "https://steadfast.com.bd/tracking/STDF-883109"
  },
}`}
                </pre>
              </div>

            </div>
            {/* Webhook receiver language tabs */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-300">Webhook confirmation receiver — backend language নির্বাচন করুন:</span>
                <p className="text-[11px] text-slate-500 mt-1">Controller checkout শুরু করে; এই আলাদা endpoint MecoPay-এর signed confirmation গ্রহণ করে। Browser JavaScript webhook receiver নয়।</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {([
                  ['laravel', 'Laravel'],
                  ['php', 'Raw PHP'],
                  ['nodejs', 'Node.js / Express'],
                  ['javascript', 'JavaScript (browser নয়)'],
                  ['python', 'Python / Django / Flask']
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setWebhookFrameworkTab(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${webhookFrameworkTab === key ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400"><code>{getWebhookFileName()}</code></span>
                <button
                  onClick={() => handleCopy(getWebhookCode(), 5)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 5 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Webhook Code
                </button>
              </div>
              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
{getWebhookCode()}
              </pre>
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

// ================= CODE PAYLOADS =================

const digitalJsonPayload = `{
  "order_id": "ORD-9812",
  "product_id": "COURSE-AI-001",
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
  "product_id": "HEADPHONE-001",
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
  "product_id": "WALLET-001",
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

// 1. Laravel Controller (PHP) — direct server-to-server API call
const laravelFullController = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use App\\Models\\Order;

class PaymentController extends Controller
{
    /**
     * MecoPay চেকআউট ইনিশিয়ালাইজ করুন
     */
    public function initiatePayment(Request $request)
    {
        // =========================================================================
        // গার্ড ১: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
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
        // গার্ড ২: ৩ ধরনের প্রোডাক্টের স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
        // =========================================================================
        // product_type অবশ্যই merchant database/service layer থেকে নিন; browser input trust করবেন না:
        // Determine product_type from your own product database before calling this controller.
        // Replace this line with your trusted Order/Product model field. Do not trust a browser-supplied type.
        $orderId = $request->input('order_id');
        $order = Order::find($orderId); // Load and authorize this order for the current customer.
        if (!$order) return back()->with('error', 'Order not found.');
        $productType = $order->product_type;
        if (!in_array($productType, ['digital', 'physical_advance', 'physical_cod'], true)) {
            return back()->with('error', 'A valid product_type is required.');
        }
        $productName = $order->product_name;
        $productId = $order->product_id;

        if (empty($orderId) && empty($productName)) {
            return back()->with('error', 'অর্ডার আইডি অথবা প্রোডাক্টের নাম যেকোনো একটি আবশ্যক।');
        }

        $price = (float) $order->total_amount;
        $courierCharge = (float) $order->courier_charge;
        $currency = strtoupper((string) $order->currency);

        $payload = [
            'order_id'         => $orderId ?: ('ORD-' . time()),
            'product_name'     => $productName ?: 'General Item',
            'product_id'       => $productId,
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
            $payload['telegram_link'] = $order->telegram_link ?? null;
            $payload['facebook_group_link'] = $order->facebook_group_link ?? null;
            $payload['facebook_access_code'] = $order->facebook_access_code ?? null;
            $payload['google_drive_link'] = $order->google_drive_link ?? null;
        } elseif ($productType === 'physical_advance') {
            // ফিজিক্যাল অ্যাডভান্স: টোটাল এমাউন্ট, কুরিয়ার চার্জ এবং অ্যাডভান্স ফি
            if ($price <= 0) {
                return back()->with('error', 'ফিজিক্যাল প্রোডাক্টের জন্য টোটাল মূল্য আবশ্যক।');
            }
            // ক্লায়েন্টের প্রোডাক্ট/স্টোর থেকে ডাইনামিক অগ্রিম ফি (০ হলে ১০০% ফুল ক্যাশ অন ডেলিভারি):
            $advanceAmount = max(0, (float) $order->advance_amount);
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
            if (!empty($data['invoice_number'])) {
                // Save MecoPay's invoice number on this order before redirecting.
                $order->update(['invoice_number' => $data['invoice_number'], 'payment_status' => 'pending']);
            }
            if (!empty($data['checkout_url'])) {
                return redirect()->away($data['checkout_url']);
            }
            if (isset($data['requires_payment']) && $data['requires_payment'] === false) {
                return redirect()->route('order.success')->with('success', 'ক্যাশ অন ডেলিভারি অর্ডার সফলভাবে কনফার্ম হয়েছে!');
            }
        }

        return back()->with('error', 'Checkout error: ' . ($response->json('error') ?? 'MecoPay সার্ভারের সাথে সংযোগে ব্যর্থ হয়েছে।'));
    }
}`;

// 2. Raw PHP (Core PHP) — direct server-to-server API call
const rawPhpController = `<?php
/**
 * Raw PHP Integration for MecoPay (Cart Rules & 3-Product Validation)
 */

session_start();

$apiKey = getenv('MECOPAY_API_KEY') ?: '';
if ($apiKey === '') die('MECOPAY_API_KEY is not configured.');
$endpoint = "https://api.mecopay.space/v1/create-checkout";

// =========================================================================
// গার্ড ১: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
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
// গার্ড ২: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
// =========================================================================
// product_type অবশ্যই merchant database/service layer থেকে নিন; browser input trust করবেন না:
// $isDigital = (!empty($product['download_link']) || in_array($product['category_id'] ?? 0, [3, 7]));
// $detectedType = $isDigital ? 'digital' : (($advance > 0) ? 'physical_advance' : 'physical_cod');
// Implement this lookup with your own DB layer. Do not use raw POST values for money or type.
$orderId = $_POST['order_id'] ?? '';
$order = load_authorized_order_from_database($orderId); // Merchant-specific repository function.
if (!$order) die('Order not found.');
$productType = $order['product_type'];
if (!in_array($productType, ['digital', 'physical_advance', 'physical_cod'], true)) {
    die('A valid product_type is required.');
}
$orderId = (string) $order['id'];
$productName = (string) $order['product_name'];
$productId = (string) ($order['product_id'] ?? '');

// ডাইনামিক কারেন্সি (BDT, USD, EUR ইত্যাদি):
$currency = strtoupper((string) $order['currency']);
$price = (float) $order['total_amount'];
$courierCharge = (float) $order['courier_charge'];

$payload = [
    "order_id"         => $orderId,
    "product_name"     => $productName,
    "product_id"       => $productId,
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
    $payload['telegram_link'] = $order['telegram_link'] ?? null;
    $payload['facebook_group_link'] = $order['facebook_group_link'] ?? null;
    $payload['facebook_access_code'] = $order['facebook_access_code'] ?? null;
    $payload['google_drive_link'] = $order['google_drive_link'] ?? null;
} elseif ($productType === 'physical_advance') {
    $advance = max(0, (float) $order['advance_amount']);
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
if ($httpCode === 200 && !empty($result['invoice_number'])) {
    // Implement this repository function for the merchant's order table.
    save_checkout_invoice($order['id'], $result['invoice_number']);
}

if ($httpCode === 200 && !empty($result['checkout_url'])) {
    header("Location: " . $result['checkout_url']);
    exit;
} elseif ($httpCode === 200 && isset($result['requires_payment']) && $result['requires_payment'] === false) {
    header("Location: /order-success.php?invoice=" . urlencode($result['invoice_number'] ?? ''));
    exit;
} else {
    echo "MecoPay Error: " . ($result['error'] ?? 'Connection Failed');
}
?>`;

// 3. Node.js (Express / Axios) — direct server-to-server API call
const nodeJsFullController = `const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MECOPAY_API_KEY = process.env.MECOPAY_API_KEY;
if (!MECOPAY_API_KEY) throw new Error('MECOPAY_API_KEY is not configured.');
const MECOPAY_ENDPOINT = 'https://api.mecopay.space/v1/create-checkout';

app.post('/api/checkout', async (req, res) => {
  try {
    const { order_id, customer_name, customer_phone, customer_address } = req.body;
    const order = await orderRepository.findAuthorized(order_id, req.user.id); // Merchant-specific DB/repository layer.
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const {
      product_id,
      product_name,
      product_type,
      price,
      courier_charge = 0,
      advance_amount = 0,
      cart_items = []
    } = order;

    // =========================================================================
    // গার্ড ১: কার্ট পলিসি ও মিক্সড প্রোডাক্ট গার্ড (Cart Integrity Rules)
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
    // গার্ড ২: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
    // =========================================================================
    // product_type অবশ্যই merchant database/service layer থেকে নিন; browser input trust করবেন না:
    // const isDigital = Boolean(product?.download_link || [3, 7].includes(product?.category_id));
    // const detectedType = isDigital ? 'digital' : (advance_amount > 0 ? 'physical_advance' : 'physical_cod');
    // In production resolve this from your order repository; do not trust req.body.product_type.
    const finalProductType = product_type;
    if (!['digital', 'physical_advance', 'physical_cod'].includes(finalProductType)) {
      return res.status(400).json({ error: 'product_type must be digital, physical_advance, or physical_cod.' });
    }
    const finalCurrency = (order.currency || 'BDT').toUpperCase();

    if (!order_id && !product_name) {
      return res.status(400).json({ error: 'order_id অথবা product_name যেকোনো একটি ফিল্ড আবশ্যক।' });
    }

    const payload = {
      order_id: order_id || ('ORD-' + Date.now()),
      product_id: product_id || null,
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

    if (finalProductType === 'digital') {
      if (!price || price <= 0) return res.status(400).json({ error: 'ডিজিটাল প্রোডাক্টের জন্য price ফিল্ড আবশ্যক।' });
      payload.amount = Number(price);
      payload.telegram_link = order.telegram_link || null;
      payload.facebook_group_link = order.facebook_group_link || null;
      payload.facebook_access_code = order.facebook_access_code || null;
      payload.google_drive_link = order.google_drive_link || null;
    } else if (finalProductType === 'physical_advance') {
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

    if (response.data.invoice_number) {
      await orderRepository.saveCheckoutInvoice(order.id, response.data.invoice_number);
    }
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
 * Browser-side helper. The MecoPay API key must stay on your server.
 * POST /api/mecopay/checkout is an endpoint implemented by your backend.
 */
async function initiateMecoPayCheckout(orderReference) {
  const response = await fetch('/api/mecopay/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ order_id: orderReference.order_id, cart_id: orderReference.cart_id })
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create checkout');
  }
  if (data.checkout_url) {
    window.location.assign(data.checkout_url);
    return data;
  }
  if (data.requires_payment === false) {
    window.location.assign('/order-success?invoice=' + encodeURIComponent(data.invoice_number || ''));
    return data;
  }
  throw new Error('Invalid checkout response');
}`;

// 5. Python (Django / Flask / Requests) — direct server-to-server API call
const pythonFullController = `import os
import requests
import time

MECOPAY_API_KEY = os.environ['MECOPAY_API_KEY']
MECOPAY_ENDPOINT = "https://api.mecopay.space/v1/create-checkout"

def create_checkout_session(request_data):
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
    # গার্ড ৩: ৩ ধরনের প্রোডাক্ট স্মার্ট অটো-ডিটেকশন ও পে-লোড প্রস্তুতি
    # =========================================================================
    # product_type অবশ্যই merchant database/service layer থেকে নিন; browser input trust করবেন না:
    # is_digital = bool(product.get("download_link") or product.get("category_id") in [3, 7])
    # detected_type = "digital" if is_digital else ("physical_advance" if advance_amount > 0 else "physical_cod")
    # In production resolve this from your order repository; do not trust request_data directly.
    order = load_authorized_order(request_data.get('order_id'))  # Merchant-specific DB/repository layer.
    if not order:
        return {'error': 'Order not found.'}
    product_id = order.get('product_id')
    product_type = order['product_type']
    if product_type not in {'digital', 'physical_advance', 'physical_cod'}:
        return {'error': 'A valid product_type is required.'}
    price = float(order['total_amount'])
    courier_charge = float(order.get('courier_charge', 0))

    payload = {
        "order_id": order['id'],
        "product_id": product_id,
        "product_name": order['product_name'],
        "product_type": product_type,
        "currency": str(order.get('currency') or 'BDT').upper(),
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
        payload["telegram_link"] = order.get("telegram_link")
        payload["facebook_group_link"] = order.get("facebook_group_link")
        payload["facebook_access_code"] = order.get("facebook_access_code")
        payload["google_drive_link"] = order.get("google_drive_link")
    elif product_type == 'physical_advance':
        advance = max(0, float(order.get('advance_amount', 0)))
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

    try:
        response = requests.post(MECOPAY_ENDPOINT, json=payload, headers=headers, timeout=30)
        result = response.json()
    except requests.RequestException as exc:
        return {'error': f'MecoPay request failed: {exc}'}
    except ValueError:
        return {'error': 'MecoPay returned an invalid JSON response.'}

    if response.status_code == 200:
        if result.get("invoice_number"):
            save_checkout_invoice(order["id"], result["invoice_number"])  # Merchant repository function.
        if result.get("checkout_url"):
            return {"redirect": result["checkout_url"]}
        return {"success": True, "invoice_number": result.get("invoice_number")}
    else:
        return {"error": result.get("error", "API request failed")}
`;

const laravelWebhookCode = `<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Order;

class MecoPayWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $rawBody = $request->getContent();
        $received = (string) $request->header('X-MecoPay-Signature', '');
        $secret = (string) config('services.mecopay.webhook_secret');
        $expected = hash_hmac('sha256', $rawBody, $secret);
        if ($secret === '' || $received === '' || !hash_equals($expected, $received)) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }
        $payload = json_decode($rawBody, true);
        if (!is_array($payload)) return response()->json(['error' => 'Invalid JSON'], 400);
        $data = is_array($payload['data'] ?? null) ? array_merge($payload, $payload['data']) : $payload;
        $event = (string) ($payload['event'] ?? '');
        if (!in_array($event, ['payment.completed', 'order.courier_booked'], true)) return response()->json(['status' => 'ignored']);
        $order = Order::where('id', $data['order_id'] ?? null)->orWhere('invoice_number', $data['invoice_number'] ?? null)->first();
        if (!$order) return response()->json(['error' => 'Order not found'], 404);
        $eventId = (string) ($data['invoice_number'] ?? $data['invoice_id'] ?? '');
        if ($eventId !== '' && $order->webhook_event_id === $eventId) return response()->json(['status' => 'already_processed']);
        if ($event === 'payment.completed') {
            $status = strtolower((string) ($data['status'] ?? ''));
            if (!in_array($status, ['paid', 'completed', 'success', 'succeeded'], true)) return response()->json(['error' => 'Payment is not successful'], 422);
            $order->update([
                'payment_status' => 'paid',
                'invoice_number' => $data['invoice_number'] ?? null,
                'product_type' => $data['product_type'] ?? null,
                'amount_paid' => $data['amount'] ?? null,
                'delivery_data' => $data['delivery'] ?? null,
                'telegram_link' => $data['telegram_link'] ?? null,
                'facebook_group_link' => $data['facebook_group_link'] ?? null,
                'facebook_access_code' => $data['facebook_access_code'] ?? null,
                'google_drive_link' => $data['google_drive_link'] ?? null,
            ]);
        } else {
            $courier = is_array($data['courier'] ?? null) ? $data['courier'] : [];
            $order->update(['status' => 'processing', 'courier_tracking' => $courier['tracking_code'] ?? null]);
        }
        if ($eventId !== '') $order->update(['webhook_event_id' => $eventId]);
        return response()->json(['status' => 'success']);
    }
}`;

const rawPhpWebhookCode = `<?php
$rawBody = file_get_contents('php://input');
$secret = getenv('MECOPAY_WEBHOOK_SECRET') ?: '';
$received = $_SERVER['HTTP_X_MECOPAY_SIGNATURE'] ?? '';
$expected = hash_hmac('sha256', $rawBody, $secret);
if ($secret === '' || $received === '' || !hash_equals($expected, $received)) { http_response_code(401); exit('Invalid webhook signature'); }
$payload = json_decode($rawBody, true);
if (!is_array($payload)) { http_response_code(400); exit('Invalid JSON'); }
$data = is_array($payload['data'] ?? null) ? array_merge($payload, $payload['data']) : $payload;
$event = $payload['event'] ?? '';
if (!in_array($event, ['payment.completed', 'order.courier_booked'], true)) { http_response_code(200); exit('Ignored'); }
$order = load_authorized_order($data['order_id'] ?? null, $data['invoice_number'] ?? null);
if (!$order) { http_response_code(404); exit('Order not found'); }
$eventId = (string)($data['invoice_number'] ?? $data['invoice_id'] ?? '');
if ($eventId !== '' && $order['webhook_event_id'] === $eventId) { http_response_code(200); exit('Already processed'); }
if ($event === 'payment.completed') {
    if (!in_array(strtolower((string)($data['status'] ?? '')), ['paid', 'completed', 'success', 'succeeded'], true)) { http_response_code(422); exit('Payment is not successful'); }
    mark_order_paid($order['id'], [
        'invoice_number' => $data['invoice_number'] ?? null,
        'product_id' => $data['product_id'] ?? null,
        'product_name' => $data['product_name'] ?? null,
        'product_type' => $data['product_type'] ?? null,
        'currency' => $data['currency'] ?? null,
        'amount' => $data['amount'] ?? null,
        'total_amount' => $data['total_amount'] ?? null,
        'courier_charge' => $data['courier_charge'] ?? null,
        'cod_due' => $data['cod_due'] ?? null,
        'delivery' => $data['delivery'] ?? null,
        'telegram_link' => $data['telegram_link'] ?? null,
        'facebook_group_link' => $data['facebook_group_link'] ?? null,
                'facebook_access_code' => $data['facebook_access_code'] ?? null,
        'google_drive_link' => $data['google_drive_link'] ?? null,
    ]);
} else {
    $courier = is_array($data['courier'] ?? null) ? $data['courier'] : [];
    mark_order_processing($order['id'], $courier['tracking_code'] ?? null);
}
if ($eventId !== '') save_webhook_event_id($order['id'], $eventId);
http_response_code(200); echo 'OK';`;

const nodeJsWebhookCode = `const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Register this route before express.json() or use express.raw() for this path.
router.post('/webhooks/mecopay', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body; // Buffer: exact bytes received
  const secret = process.env.MECOPAY_WEBHOOK_SECRET || '';
  const received = String(req.get('X-MecoPay-Signature') || '');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!secret || !received || received.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))) return res.status(401).json({ error: 'Invalid webhook signature' });
  let payload; try { payload = JSON.parse(rawBody.toString('utf8')); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  const data = payload.data && typeof payload.data === 'object' ? { ...payload, ...payload.data } : payload;
  if (!['payment.completed', 'order.courier_booked'].includes(payload.event)) return res.json({ status: 'ignored' });
  const order = await orderRepository.findByIdOrInvoice(data.order_id, data.invoice_number);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const eventId = String(data.invoice_number || data.invoice_id || '');
  if (eventId && order.webhook_event_id === eventId) return res.json({ status: 'already_processed' });
  if (payload.event === 'payment.completed') { if (!['paid', 'completed', 'success', 'succeeded'].includes(String(data.status || '').toLowerCase())) return res.status(422).json({ error: 'Payment is not successful' }); await orderRepository.markPaid(order.id, {
    invoice_number: data.invoice_number || null,
    product_id: data.product_id || null,
    product_name: data.product_name || null,
    product_type: data.product_type || null,
    currency: data.currency || null,
    amount: data.amount || null,
    total_amount: data.total_amount || null,
    courier_charge: data.courier_charge || null,
    cod_due: data.cod_due || null,
    delivery: data.delivery || null,
    telegram_link: data.telegram_link || null,
    facebook_group_link: data.facebook_group_link || null,
    facebook_access_code: data.facebook_access_code || null,
    google_drive_link: data.google_drive_link || null
  }); }
  else await orderRepository.markProcessing(order.id, data.courier?.tracking_code || null);
  if (eventId) await orderRepository.saveWebhookEventId(order.id, eventId);
  return res.json({ status: 'success' });
});
module.exports = router;`;

const javascriptWebhookNotice = `Browser JavaScript is not a webhook receiver.

Do not put MECOPAY_WEBHOOK_SECRET in frontend code. A webhook must be received by your server, verified against the raw request body, and used to update your database.

Use the Node.js / Express, Laravel, Raw PHP, or Python server sample instead.`;

const pythonWebhookCode = `import os, hmac, hashlib, json
from flask import request, jsonify  # Django: use request.body and JsonResponse


def mecopay_webhook():
    raw_body = request.get_data(cache=True)
    secret = os.environ.get('MECOPAY_WEBHOOK_SECRET', '').encode()
    received = request.headers.get('X-MecoPay-Signature', '')
    expected = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    if not secret or not received or not hmac.compare_digest(expected, received): return jsonify(error='Invalid webhook signature'), 401
    try: payload = json.loads(raw_body)
    except ValueError: return jsonify(error='Invalid JSON'), 400
    data = {**payload, **(payload.get('data') or {})}
    event = payload.get('event', '')
    if event not in {'payment.completed', 'order.courier_booked'}: return jsonify(status='ignored')
    order = load_authorized_order(data.get('order_id'), data.get('invoice_number'))
    if not order: return jsonify(error='Order not found'), 404
    event_id = str(data.get('invoice_number') or data.get('invoice_id') or '')
    if event_id and order['webhook_event_id'] == event_id: return jsonify(status='already_processed')
    if event == 'payment.completed':
        if str(data.get('status', '')).lower() not in {'paid', 'completed', 'success', 'succeeded'}: return jsonify(error='Payment is not successful'), 422
        mark_order_paid(order['id'], {
            'invoice_number': data.get('invoice_number'),
            'product_id': data.get('product_id'),
            'product_name': data.get('product_name'),
            'product_type': data.get('product_type'),
            'currency': data.get('currency'),
            'amount': data.get('amount'),
            'total_amount': data.get('total_amount'),
            'courier_charge': data.get('courier_charge'),
            'cod_due': data.get('cod_due'),
            'delivery': data.get('delivery'),
            'telegram_link': data.get('telegram_link'),
            'facebook_group_link': data.get('facebook_group_link'),
            'facebook_access_code': data.get('facebook_access_code'),
            'google_drive_link': data.get('google_drive_link'),
        })
    else: mark_order_processing(order['id'], (data.get('courier') or {}).get('tracking_code'))
    if event_id: save_webhook_event_id(order['id'], event_id)
    return jsonify(status='success'), 200`;
