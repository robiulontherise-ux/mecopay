import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Save,
  Code2,
  Copy,
  CheckCircle2,
  MessageSquare,
  Zap,
  Sliders,
  Send,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { showToast } from '../../lib/toast';
import { supabase } from '../../lib/supabase';
import type { SharedDashboardPageContext } from '../shared-dashboard/types';

interface WebCustomAgentProps {
  user: any;
  brands?: any[];
  sharedContext?: SharedDashboardPageContext;
}

export default function WebCustomAgent({ user, brands = [], sharedContext }: WebCustomAgentProps) {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [agentName, setAgentName] = useState('Maya - Sales Executive');
  const [welcomeMessage, setWelcomeMessage] = useState('স্বাগতম! আমি কীভাবে আপনাকে সাহায্য করতে পারি? যেকোনো প্রোডাক্ট বা অর্ডারের বিষয়ে জানতে মেসেজ করুন।');
  const [agentPrompt, setAgentPrompt] = useState('You are an intelligent, friendly e-commerce sales assistant for MecoPay storefront. Help customers find products, answer price inquiries, suggest popular items, and share instant checkout payment links. Always reply in the customer\'s preferred language (Bengali or English).');
  const [themeColor, setThemeColor] = useState('#10b981'); // emerald
  const [widgetPosition, setWidgetPosition] = useState<'right' | 'left'>('right');
  const [autoSendPaymentLink, setAutoSendPaymentLink] = useState(true);
  const [orderTrackingSupport, setOrderTrackingSupport] = useState(true);
  const [copiableCode, setCopiableCode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live Test Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; link?: string }>>([
    {
      sender: 'agent',
      text: 'স্বাগতম! আমি কীভাবে আপনাকে সাহায্য করতে পারি? যেকোনো প্রোডাক্ট বা অর্ডারের বিষয়ে জানতে মেসেজ করুন।'
    }
  ]);
  const [testInput, setTestInput] = useState('');

  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands]);

  useEffect(() => {
    const loadConfig = async () => {
      const brandId = selectedBrandId || sharedContext?.brandId;
      const ownerId = sharedContext?.clientId || user?.id;
      if (!ownerId || !brandId) return;
      try {
        if (sharedContext) {
          if (sharedContext.pageKey !== 'web_custom_agent' || sharedContext.brandId !== brandId || sharedContext.clientId !== ownerId) {
            throw new Error('The shared Web Custom Agent context is invalid.');
          }
          const { data: allowed, error: accessError } = await supabase.rpc('has_dashboard_page_access', {
            p_client_id: sharedContext.clientId,
            p_brand_id: sharedContext.brandId,
            p_page_key: 'web_custom_agent',
            p_action: 'view'
          });
          if (accessError) throw accessError;
          if (allowed !== true) throw new Error('Active shared access for Web Custom Agent was not verified.');
        }
        const { data, error } = await supabase
          .from('brand_agent_configs')
          .select('config')
          .eq('user_id', ownerId)
          .eq('client_id', ownerId)
          .eq('brand_id', brandId)
          .eq('agent_type', 'web')
          .maybeSingle();
        if (error) throw error;
        const p = data?.config;
        if (!p) return;
        if (p.agentName) setAgentName(p.agentName);
        if (p.welcomeMessage) setWelcomeMessage(p.welcomeMessage);
        if (p.agentPrompt) setAgentPrompt(p.agentPrompt);
        if (p.themeColor) setThemeColor(p.themeColor);
        if (p.widgetPosition) setWidgetPosition(p.widgetPosition);
        if (p.autoSendPaymentLink !== undefined) setAutoSendPaymentLink(p.autoSendPaymentLink);
        if (p.orderTrackingSupport !== undefined) setOrderTrackingSupport(p.orderTrackingSupport);
      } catch (e: any) {
        showToast(e?.message || 'Failed to load Web Custom Agent configuration.', 'error');
      }
    };
    void loadConfig();
  }, [user?.id, selectedBrandId, sharedContext]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandId = selectedBrandId || sharedContext?.brandId;
    const ownerId = sharedContext?.clientId || user?.id;
    if (!ownerId || !brandId) {
      showToast('Select a brand before saving the Web Custom Agent.', 'error');
      return;
    }
    if (sharedContext && !sharedContext.actions.includes('edit')) {
      showToast('This shared Web Custom Agent page is view-only.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (sharedContext) {
        if (sharedContext.pageKey !== 'web_custom_agent' || sharedContext.brandId !== brandId || sharedContext.clientId !== ownerId) {
          throw new Error('The shared Web Custom Agent context is invalid.');
        }
        const { data: allowed, error: accessError } = await supabase.rpc('has_dashboard_page_access', {
          p_client_id: sharedContext.clientId,
          p_brand_id: sharedContext.brandId,
          p_page_key: 'web_custom_agent',
          p_action: 'edit'
        });
        if (accessError) throw accessError;
        if (allowed !== true) throw new Error('Active shared edit access for Web Custom Agent was not verified.');
      }
      const { error } = await supabase.from('brand_agent_configs').upsert({
        user_id: ownerId,
        client_id: ownerId,
        brand_id: brandId,
        agent_type: 'web',
        config: {
          agentName,
          welcomeMessage,
          agentPrompt,
          themeColor,
          widgetPosition,
          autoSendPaymentLink,
          orderTrackingSupport
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,client_id,brand_id,agent_type' });
      if (error) throw error;
      setSaving(false);
      showToast('Web Custom Agent configuration saved successfully!', 'success');
    } catch (saveError: any) {
      showToast(saveError?.message || 'Failed to save Web Custom Agent configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = 'ধন্যবাদ! আমাদের স্টোরে আপনার জন্য প্রোডাক্ট পাওয়া যাবে। আপনি কি অর্ডার নিশ্চিত করতে চান?';
      let link: string | undefined;

      if (lower.includes('price') || lower.includes('দাম') || lower.includes('cost')) {
        reply = 'এই পণ্যটির নির্ধারিত অফার মূল্য ১২৫০ টাকা (কুরিয়ার চার্জ ফ্রি)। আপনি কি অগ্রিম বা ক্যাশ অন ডেলিভারিতে অর্ডার করতে চান?';
        if (autoSendPaymentLink) {
          link = 'https://pay.mecopay.space/c/demo-checkout';
        }
      } else if (lower.includes('order') || lower.includes('অর্ডার') || lower.includes('buy') || lower.includes('কিনব')) {
        reply = 'অর্ডার করতে নিচে দেওয়া লিংকে ক্লিক করে আপনার নাম, ঠিকানা ও মোবাইল নাম্বার প্রদান করুন। আমরা দ্রুত ডেলিভারির ব্যবস্থা করব!';
        if (autoSendPaymentLink) {
          link = 'https://pay.mecopay.space/c/demo-checkout';
        }
      } else if (lower.includes('delivery') || lower.includes('ডেলিভারি') || lower.includes('track') || lower.includes('ট্র্যাকিং')) {
        reply = 'আপনার ডেলিভারি Steadfast/Pathao কুরিয়ারের মাধ্যমে পাঠানো হয়। সাধারণত ঢাকা সিটিতে ২৪ ঘন্টা ও ঢাকার বাইরে ৪৮-৭২ ঘন্টার মধ্যে পৌঁছে যায়।';
      }

      setChatMessages((prev) => [...prev, { sender: 'agent', text: reply, link }]);
    }, 500);
  };

  const embedClientId = sharedContext?.clientId || user?.id || 'client_demo';
  const embedScript = `<script async src="https://cdn.mecopay.space/agent/web.js" data-client-id="${embedClientId}" data-brand="${selectedBrandId || sharedContext?.brandId || 'brand_default'}" data-theme="${themeColor}" data-position="${widgetPosition}"></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiableCode(true);
    showToast('Embed script copied to clipboard!', 'success');
    setTimeout(() => setCopiableCode(false), 2000);
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            Web Custom Agent
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Deploy an intelligent AI sales closer directly on your website to answer visitor questions, recommend products, and generate instant MecoPay checkout links.
          </p>
        </div>
        {brands && brands.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Brand:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Agent Persona */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Agent Identity & Training Prompt
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Agent Display Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Maya - Sales Executive"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Welcome Greeting</label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome message popped up to visitors"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-white placeholder:text-slate-600 text-sm focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom System Prompt / Behavior</label>
                <textarea
                  rows={3}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="Define your agent's tone, sales behavior, discount limits, and return policy instructions"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-white placeholder:text-slate-600 text-xs font-mono focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Smart Sales Automations */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Sales & Checkout Automations
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-white">Auto-Generate MecoPay Checkout Links</p>
                    <p className="text-xs text-slate-400">Agent creates and sends instant payment links when customer asks to purchase or inquire about price.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSendPaymentLink}
                    onChange={(e) => setAutoSendPaymentLink(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-white">Courier & Order Tracking Assistant</p>
                    <p className="text-xs text-slate-400">Allows customers to check parcel status and delivery updates right inside the chat.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderTrackingSupport}
                    onChange={(e) => setOrderTrackingSupport(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Visual Appearance */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Widget Appearance & Position
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Theme Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Screen Position</label>
                  <select
                    value={widgetPosition}
                    onChange={(e) => setWidgetPosition(e.target.value as 'right' | 'left')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="right">Bottom Right Corner</option>
                    <option value="left">Bottom Left Corner</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || Boolean(sharedContext && !sharedContext.actions.includes('edit'))}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Agent Configuration
            </button>
          </form>

          {/* Embed Snippet Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Embed Code for Website (1-Click)
              </h4>
              <button
                onClick={copyEmbedCode}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiableCode ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste this tag right before the closing <code className="text-slate-300">&lt;/body&gt;</code> tag on WordPress, WooCommerce, Shopify, Laravel, or custom HTML sites.
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all">
              {embedScript}
            </pre>
          </div>
        </div>

        {/* Live Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Live Interactive Simulator
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active Test Mode
            </span>
          </div>

          {/* Chat Window Frame */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Widget Top Bar */}
            <div
              style={{ backgroundColor: themeColor }}
              className="p-4 flex items-center justify-between text-slate-950 font-bold"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-950/15 flex items-center justify-center text-slate-950">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm leading-tight text-slate-950 font-bold">{agentName || 'Maya'}</h4>
                  <span className="text-[10px] text-slate-900/80 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-pulse"></span>
                    Online • Typically replies instantly
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.link && (
                      <a
                        href={msg.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Complete Order (Pay Now)
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type a test message (e.g. দাম কত? / কিনব)..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
