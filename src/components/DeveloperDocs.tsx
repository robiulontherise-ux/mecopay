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
  AlertCircle
} from 'lucide-react';
import { showToast } from '../lib/toast';

export default function DeveloperDocs() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'three-products' | 'laravel' | 'webhook' | 'worker-code' | 'overview'>('three-products');
  const [productSubTab, setProductSubTab] = useState<'digital' | 'physical_advance' | 'physical_cod'>('digital');
  const [frameworkTab, setFrameworkTab] = useState<'laravel' | 'nodejs'>('laravel');

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
            <Sparkles className="w-3.5 h-3.5" /> Official API Release v2.5 • Zero-Waste Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            MecoPay Multi-Product & Developer Docs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Laravel, Node.js বা কাস্টম ওয়েবসাইটের জন্য Digital, Physical Advance + Courier Charge ও 100% Full COD ইন্টিগ্রেশন এবং Cloudflare Worker স্পেসিফিকেশন।
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
          <FileCode2 className="w-4 h-4" /> ২. Laravel ও Custom Backend
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
                      <th className="p-3">বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    <tr>
                      <td className="p-3 font-mono text-blue-300">order_id বা product_name</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">বাধ্যতামূলক (Must)</span></td>
                      <td className="p-3 text-slate-300">যেকোনো একটি অবশ্যই পাঠাতে হবে (দুটোই পাঠালে আরও ভালো)।</td>
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
                      <td className="p-3 text-slate-300">পেমেন্ট সফল হলে আপনার ওয়েবসাইটের যে পেজে কাস্টমার ফিরে যাবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">telegram_link / facebook_group_link / google_drive_link</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">১টি, ২টি, ৩টি লিংক পাঠাতে পারেন অথবা কোনো লিংক না পাঠালেও চলবে।</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-blue-300">customer_name / customer_phone / customer_email</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">না পাঠালে কাস্টমার চেকআউট পেজে পূরণ করবে।</td>
                    </tr>
                  </tbody>
                </table>
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
                      <th className="p-3">বিবরণ ও হিসাব</th>
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
                      <td className="p-3 font-mono text-amber-300">callback_url / customer_address</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ঐচ্ছিক (Optional)</span></td>
                      <td className="p-3 text-slate-300">না পাঠালে ডিফল্ট রিটার্ন ও চেকআউট পেজে ঠিকানা ইনপুট নেওয়া হবে।</td>
                    </tr>
                  </tbody>
                </table>
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
                      <th className="p-3">বিবরণ ও হিসাব</th>
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
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LARAVEL & CUSTOM BACKEND */}
      {activeTab === 'laravel' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" /> Laravel ও কাস্টম ওয়েবসাইটে কোড কীভাবে ও কোথায় বসাবেন?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Courier Charge এবং ৩ ধরনের প্রোডাক্ট ভ্যালিডেশন সহ সম্পূর্ণ কন্ট্রোলার ইমপ্লিমেন্টেশন:
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
            </div>

            {/* STEP 1: .env */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">1</span>
                ধাপ ১: আপনার <code>.env</code> ফাইলে API Credentials যোগ করুন
              </h4>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300">
{`MECOPAY_API_KEY=your_brand_api_key_here
MECOPAY_BASE_URL=https://api.mecopay.space/v1`}
              </pre>
              <p className="text-[11px] text-slate-400">
                * অবস্থান: আপনার প্রোজেক্টের মূল রুটের <code>.env</code> ফাইলে এই ২টা লাইন পেস্ট করুন। কোনো Brand ID আলাদা পাস করার দরকার নেই—API Key থেকেই স্বয়ংক্রিয়ভাবে ব্র্যান্ড ডিটেক্ট হবে।
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
                  onClick={() => handleCopy(frameworkTab === 'laravel' ? laravelFullController : nodeJsFullController, 4)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedIndex === 4 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Code
                </button>
              </div>

              <pre className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
{frameworkTab === 'laravel' ? laravelFullController : nodeJsFullController}
              </pre>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <h5 className="font-bold text-white">কোডটি কীভাবে কাজ করে?</h5>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>কাস্টমার যখন চেকআউট বাটনে চাপ দেয়, কন্ট্রোলার রিকোয়েস্টটি ধরে।</li>
                  <li><code>order_id</code> বা <code>product_name</code> এবং <code>courier_charge</code> হিসাব করে পে-লোড বানায়।</li>
                  <li>MecoPay Worker-এর <code>https://api.mecopay.space/v1/create-checkout</code> এ পাঠায়।</li>
                  <li>MecoPay সাথে সাথে একটি সিকিউর <code>checkout_url</code> রিটার্ন করে এবং কাস্টমার রিডাইরেক্ট হয়।</li>
                </ol>
              </div>
            </div>

            {/* STEP 3: routes/web.php */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
                ধাপ ৩: <code>routes/web.php</code>-তে রাউট বসিয়ে দিন (Laravel-এর জন্য)
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Authentication & Production Base URL
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              MecoPay REST API ব্যবহার করতে হলে প্রতিটি রিকোয়েস্টের হেডারে আপনার ব্র্যান্ডের <strong>API Key</strong> (<code>Authorization: Bearer &lt;API_KEY&gt;</code>) পাঠাতে হবে। ক্লাউডফ্লেয়ার ওয়ার্কার স্বয়ংক্রিয়ভাবে API Key থেকে সংশ্লিষ্ট ব্র্যান্ড শনাক্ত করে নেবে। আলাদা কোনো Brand ID পাঠানোর প্রয়োজন নেই।
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
  "product_name": "Fullstack AI Mastery Course",
  "product_type": "digital",
  "amount": 1500,
  "callback_url": "https://yourwebsite.com/payment/callback",
  "cancel_url": "https://yourwebsite.com/payment/cancel",
  "gateway_routing": "both",
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
  "gateway_routing": "both",
  "customer_name": "Tanvir Hasan",
  "customer_phone": "01812345678",
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
  "customer_address": "Chawkbazar, Chittagong"
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
        $orderId = $request->input('order_id');
        $productName = $request->input('product_name');

        // =====================================================================
        // ০. প্রাথমিক ভ্যালিডেশন (Order ID অথবা Product Name যেকোনো একটি আবশ্যক)
        // =====================================================================
        if (empty($orderId) && empty($productName)) {
            return back()->with('error', 'অর্ডার আইডি অথবা প্রোডাক্টের নাম যেকোনো একটি পাঠানো আবশ্যক।');
        }

        // =====================================================================
        // ১. লোকাল ক্যাশ চেক (Zero-Waste Invocation Guard)
        // =====================================================================
        if ($productType === 'physical_cod') {
            $isAutoCourierEnabled = Cache::get('mecopay_auto_courier', false);
            if (!$isAutoCourierEnabled) {
                return redirect()->route('order.success')->with('success', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে (লোকাল হ্যান্ডলিং)।');
            }
        }

        $isGatewaysActive = Cache::get('mecopay_gateways_active', true);
        if (!$isGatewaysActive && $productType !== 'physical_cod') {
            return back()->with('error', 'বর্তমানে অনলাইন পেমেন্ট সাময়িকভাবে বন্ধ আছে।');
        }

        // ২. সাধারণ পে-লোড প্রস্তুত করুন
        $payload = [
            'order_id'         => $orderId ?: ('ORD-' . time()),
            'product_name'     => $productName ?: 'General Item',
            'product_type'     => $productType,
            'customer_name'    => $request->input('customer_name'),
            'customer_phone'   => $request->input('customer_phone'),
            'customer_address' => $request->input('customer_address'),
            'callback_url'     => route('payment.callback'),
            'cancel_url'       => route('payment.cancel'),
        ];

        // ৩. প্রোডাক্ট টাইপ অনুযায়ী স্পেসিফিক ফিল্ড ও কুরিয়ার চার্জ হিসাব
        $price = (float) $request->input('price', 0);
        $courierCharge = (float) $request->input('courier_charge', 120); // ডিফল্ট কুরিয়ার চার্জ ১২০ ৳

        if ($productType === 'digital') {
            $payload['amount'] = $price; // ১০০% পেমেন্ট
            $payload['telegram_link'] = "https://t.me/+joinchat_secret";
            $payload['facebook_group_link'] = "https://facebook.com/groups/vip";
            $payload['google_drive_link'] = "https://drive.google.com/drive/folders/materials";
        } 
        elseif ($productType === 'physical_advance') {
            $advanceAmount = (float) $request->input('advance_amount', 150); // অগ্রিম গেটওয়ে চার্জ
            $payload['total_amount']   = $price;
            $payload['courier_charge'] = $courierCharge;
            $payload['amount']         = min($advanceAmount, $price);
            $payload['cod_due']        = max(0, ($price + $courierCharge) - $payload['amount']);
            $payload['fulfillment_type'] = 'dropship';
        } 
        elseif ($productType === 'physical_cod') {
            $payload['total_amount']   = $price;
            $payload['courier_charge'] = $courierCharge;
            $payload['amount']         = 0; // গেটওয়েতে ০ ৳
            $payload['cod_due']        = $price + $courierCharge;
        }

        // ৪. MecoPay Worker API-তে রিকোয়েস্ট পাঠান
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('MECOPAY_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.mecopay.space/v1/create-checkout', $payload);

        // ৫. রেসপন্স হ্যান্ডলিং
        if ($response->successful()) {
            $data = $response->json();
            if (!empty($data['checkout_url'])) {
                return redirect()->away($data['checkout_url']);
            }
            if (!empty($data['requires_payment']) === false) {
                return redirect()->route('order.success')->with('success', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!');
            }
        }

        return back()->with('error', 'MecoPay Checkout Failed: ' . ($response['error'] ?? 'Unknown Error'));
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
    const { 
      orderId, 
      productName, 
      productType, 
      price, 
      courierCharge = 120, 
      advanceAmount = 150,
      customerName, 
      customerPhone, 
      customerAddress 
    } = req.body;

    // ১. অর্ডার আইডেন্টিফায়ার চেক (order_id অথবা product_name আবশ্যক)
    if (!orderId && !productName) {
      return res.status(400).json({ error: 'order_id or product_name is required' });
    }

    const payload = {
      order_id: orderId || \`ORD-\${Date.now()}\`,
      product_name: productName || 'Standard Item',
      product_type: productType,
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
      payload.courier_charge = courierCharge;
      payload.amount = advanceAmount;
      payload.cod_due = (price + courierCharge) - advanceAmount;
    } else {
      payload.total_amount = price;
      payload.courier_charge = courierCharge;
      payload.amount = 0; // 100% COD
      payload.cod_due = price + courierCharge;
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

    if (response.data.checkout_url) {
      return res.redirect(response.data.checkout_url);
    }

    return res.json({ success: true, message: 'Order placed via COD', data: response.data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};`;

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

const cloudflareWorkerCode = `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// =========================================================================
// ব্যাকগ্রাউন্ড কুরিয়ার বুকিং প্রসেসর (Non-blocking Background Task)
// =========================================================================
async function processBackgroundCourierBooking(supabase: any, brand: any, invoice: any) {
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

    // ইনভয়েস মেটাডাটাতে কুরিয়ার ট্র্যাকিং সংরক্ষণ
    await supabase.from('invoices').update({
      metadata: {
        ...invoice.metadata,
        courier: courierInfo
      }
    }).eq('id', invoice.id);

    // মার্চেন্টের সাইটে Webhook পাঠানো
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('*')
      .eq('brand_id', brand.id)
      .maybeSingle();

    if (webhook?.payload_url) {
      fetch(webhook.payload_url, {
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
// মেইন সার্ভার হ্যান্ডলার (POST /v1/create-checkout)
// =========================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_) {
      throw new Error('Invalid JSON payload');
    }

    // ১. ব্র্যান্ড অথেন্টিকেশন
    const authHeader = req.headers.get('Authorization');
    const apiKey = authHeader ? authHeader.replace(/Bearer\\s+/i, '').trim() : payload.api_key;

    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Brand API Key in Authorization header.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: brand, error: brandError } = await supabaseClient
      .from('brands')
      .select('*')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid Brand API Key.' }), {
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
      const { data: codInvoice, error: codErr } = await supabaseClient
        .from('invoices')
        .insert({
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
        .select()
        .single();

      if (codErr) throw codErr;

      // কাস্টমারকে কোনো ল্যাগ ছাড়াই ০ms তাৎক্ষণিক রেসপন্স দেওয়া
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
      // @ts-ignore
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(processBackgroundCourierBooking(supabaseClient, brand, codInvoice));
      } else {
        processBackgroundCourierBooking(supabaseClient, brand, codInvoice).catch(() => {});
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

    // স্টেটলেস সিকিউর সেশন পে-লোড (ডাটাবেসে ফেক বা আবর্জনা ইনভয়েস জমার অপচয় রোধে)
    const sessionData = {
      brand_id: brand.id,
      brand_name: brand.name,
      brand_logo: brand.logo_url,
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
    const appOrigin = Deno.env.get('APP_URL') || 'https://checkout.mecopay.space';
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

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});`;
