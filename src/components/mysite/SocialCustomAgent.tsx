import React, { useState, useEffect } from 'react';
import {
  Share2,
  MessageCircle,
  Save,
  CheckCircle2,
  Copy,
  Zap,
  ShieldCheck,
  Send,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { showToast } from '../../lib/toast';
import { supabase } from '../../lib/supabase';
import type { SharedDashboardPageContext } from '../shared-dashboard/types';

interface SocialCustomAgentProps {
  user: any;
  brands?: any[];
  sharedContext?: SharedDashboardPageContext;
}

export default function SocialCustomAgent({ user, brands = [], sharedContext }: SocialCustomAgentProps) {
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [channel, setChannel] = useState<'messenger' | 'instagram' | 'whatsapp' | 'telegram'>('messenger');

  // Credentials
  const [metaPageToken, setMetaPageToken] = useState('');
  const [metaVerifyToken, setMetaVerifyToken] = useState('mecopay_verify_token_2026');
  const [whatsappPhoneId, setWhatsappPhoneId] = useState('');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');

  // Bot Behaviors
  const [autoSendPaymentLink, setAutoSendPaymentLink] = useState(true);
  const [autoAdvancePaymentRequest, setAutoAdvancePaymentRequest] = useState(true);
  const [advanceAmount, setAdvanceAmount] = useState('150');
  const [humanHandoverKeyword, setHumanHandoverKeyword] = useState('agent, support, কথা বলতে চাই');
  const [saving, setSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Social Chat Simulator
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; link?: string }>>([
    {
      sender: 'bot',
      text: 'হ্যালো! MecoPay Social Sales Agent-এ স্বাগতম। আপনি Facebook, Instagram বা WhatsApp এ যেকোনো প্রডাক্ট অর্ডার করতে পারেন।'
    }
  ]);
  const [testInput, setTestInput] = useState('');

    useEffect(() => {
      if (brands && brands.length > 0 && !selectedBrandId) {
        setSelectedBrandId(sharedContext?.brandId || brands[0].id);
      }
    }, [brands, sharedContext?.brandId, selectedBrandId]);

    useEffect(() => {
      const loadConfig = async () => {
        const brandId = sharedContext?.brandId || selectedBrandId;
      const ownerId = sharedContext?.clientId || user?.id;
      if (!ownerId || !brandId) return;
      try {
        if (sharedContext) {
          if (sharedContext.pageKey !== 'social_custom_agent' || sharedContext.brandId !== brandId || sharedContext.clientId !== ownerId) {
            throw new Error('The shared Social Custom Agent context is invalid.');
          }
          const { data: allowed, error: accessError } = await supabase.rpc('has_dashboard_page_access', {
            p_client_id: sharedContext.clientId,
            p_brand_id: sharedContext.brandId,
            p_page_key: 'social_custom_agent',
            p_action: 'view'
          });
          if (accessError) throw accessError;
          if (allowed !== true) throw new Error('Active shared access for Social Custom Agent was not verified.');
        }
        const { data, error } = await supabase
          .from('brand_agent_configs')
          .select('config')
          .eq('user_id', ownerId)
          .eq('client_id', ownerId)
          .eq('brand_id', brandId)
          .eq('agent_type', 'social')
          .maybeSingle();
        if (error) throw error;
        const p = data?.config;
        if (!p) return;
        if (p.channel) setChannel(p.channel);
        if (p.metaPageToken) setMetaPageToken(p.metaPageToken);
        if (p.metaVerifyToken) setMetaVerifyToken(p.metaVerifyToken);
        if (p.whatsappPhoneId) setWhatsappPhoneId(p.whatsappPhoneId);
        if (p.whatsappAccessToken) setWhatsappAccessToken(p.whatsappAccessToken);
        if (p.telegramBotToken) setTelegramBotToken(p.telegramBotToken);
        if (p.autoSendPaymentLink !== undefined) setAutoSendPaymentLink(p.autoSendPaymentLink);
        if (p.autoAdvancePaymentRequest !== undefined) setAutoAdvancePaymentRequest(p.autoAdvancePaymentRequest);
        if (p.advanceAmount) setAdvanceAmount(p.advanceAmount);
        if (p.humanHandoverKeyword) setHumanHandoverKeyword(p.humanHandoverKeyword);
      } catch (e: any) {
        showToast(e?.message || 'Failed to load Social Custom Agent configuration.', 'error');
      }
    };
    void loadConfig();
  }, [user?.id, selectedBrandId, sharedContext]);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      const brandId = sharedContext?.brandId || selectedBrandId;
    const ownerId = sharedContext?.clientId || user?.id;
    if (!ownerId || !brandId) {
      showToast('Select a brand before saving the Social Custom Agent.', 'error');
      return;
    }
    if (sharedContext && !sharedContext.actions.includes('edit')) {
      showToast('This shared Social Custom Agent page is view-only.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (sharedContext) {
        if (sharedContext.pageKey !== 'social_custom_agent' || sharedContext.brandId !== brandId || sharedContext.clientId !== ownerId) {
          throw new Error('The shared Social Custom Agent context is invalid.');
        }
        const { data: allowed, error: accessError } = await supabase.rpc('has_dashboard_page_access', {
          p_client_id: sharedContext.clientId,
          p_brand_id: sharedContext.brandId,
          p_page_key: 'social_custom_agent',
          p_action: 'edit'
        });
        if (accessError) throw accessError;
        if (allowed !== true) throw new Error('Active shared edit access for Social Custom Agent was not verified.');
      }
      const { error } = await supabase.from('brand_agent_configs').upsert({
        user_id: ownerId,
        client_id: ownerId,
        brand_id: brandId,
        agent_type: 'social',
        config: {
          channel,
          metaPageToken,
          metaVerifyToken,
          whatsappPhoneId,
          whatsappAccessToken,
          telegramBotToken,
          autoSendPaymentLink,
          autoAdvancePaymentRequest,
          advanceAmount,
          humanHandoverKeyword
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,client_id,brand_id,agent_type' });
      if (error) throw error;
      setSaving(false);
      showToast('Social Custom Agent configuration saved successfully!', 'success');
    } catch (saveError: any) {
      showToast(saveError?.message || 'Failed to save Social Custom Agent configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const webhookClientId = sharedContext?.clientId || user?.id || 'client_id';
  const webhookUrl = `https://api.mecopay.space/webhooks/social-agent/${webhookClientId}`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    showToast('Webhook URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const userText = testInput.trim();
    setTestMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setTestInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = 'ধন্যবাদ! আপনার ইনকোয়ারি পেয়েছি। আপনি কি নির্দিষ্ট কোনো সাইজ বা রঙের আইটেম খুঁজছেন?';
      let link: string | undefined;

      if (lower.includes('order') || lower.includes('অর্ডার') || lower.includes('buy') || lower.includes('কিনব')) {
        if (autoAdvancePaymentRequest) {
          reply = `আপনার ক্যাশ অন ডেলিভারি (COD) অর্ডার কনফার্ম করতে অনুগ্রহ করে কুরিয়ার অগ্রিম ৳${advanceAmount} টাকা পেমেন্ট করুন। বাকি টাকা পণ্য হাতে পেয়ে পরিশোধ করবেন।`;
          link = 'https://pay.mecopay.space/c/social-advance';
        } else {
          reply = 'নিচের লিংকে ক্লিক করে আপনার অর্ডারটি সরাসরি প্লেস করুন:';
          link = 'https://pay.mecopay.space/c/social-checkout';
        }
      } else if (lower.includes('price') || lower.includes('দাম')) {
        reply = 'এই প্রিমিয়াম প্রোডাক্টটির রেগুলার প্রাইস ১৪৫০ টাকা, আজকের স্পেশাল অফারে পাবেন ১১৫০ টাকায়!';
        if (autoSendPaymentLink) {
          link = 'https://pay.mecopay.space/c/social-checkout';
        }
      } else if (lower.includes('agent') || lower.includes('support') || lower.includes('কথা')) {
        reply = '🔔 একজন লাইভ সাপোর্ট প্রতিনিধিকে আপনার চ্যাট হস্তান্তরিত করা হয়েছে। অনুগ্রহ করে লাইনে থাকুন।';
      }

      setTestMessages((prev) => [...prev, { sender: 'bot', text: reply, link }]);
    }, 500);
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-400" />
            Social Custom Agent
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Automate sales conversations on Facebook Messenger, Instagram DMs, and WhatsApp Business with an AI bot that collects orders & dispatches MecoPay checkout links 24/7.
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

      {/* Channel Selector Pills */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { id: 'messenger', name: 'Facebook Messenger', icon: '💬' },
          { id: 'instagram', name: 'Instagram Direct (DM)', icon: '📸' },
          { id: 'whatsapp', name: 'WhatsApp Business API', icon: '🟢' },
          { id: 'telegram', name: 'Telegram Bot', icon: '✈️' }
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChannel(c.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              channel === c.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Channel Connection & Tokens */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                {channel === 'messenger' && 'Facebook Messenger Setup (Meta Graph API)'}
                {channel === 'instagram' && 'Instagram Direct API Connection'}
                {channel === 'whatsapp' && 'WhatsApp Cloud API Setup'}
                {channel === 'telegram' && 'Telegram Bot Token Configuration'}
              </h3>

              {/* Webhook Info for Meta */}
              {(channel === 'messenger' || channel === 'instagram') && (
                <div className="space-y-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Meta Callback Webhook URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-emerald-300 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={copyWebhook}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedWebhook ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Verify Token</label>
                    <input
                      type="text"
                      value={metaVerifyToken}
                      onChange={(e) => setMetaVerifyToken(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Specific Channel Inputs */}
              {(channel === 'messenger' || channel === 'instagram') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Page Access Token (Meta App)
                  </label>
                  <input
                    type="password"
                    value={metaPageToken}
                    onChange={(e) => setMetaPageToken(e.target.value)}
                    placeholder="EAAK..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none font-mono"
                  />
                </div>
              )}

              {channel === 'whatsapp' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      placeholder="e.g. 105649XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      WhatsApp Permanent Access Token
                    </label>
                    <input
                      type="password"
                      value={whatsappAccessToken}
                      onChange={(e) => setWhatsappAccessToken(e.target.value)}
                      placeholder="EAAG..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {channel === 'telegram' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <input
                    type="password"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="123456789:ABCDefgh..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>

            {/* Social Commerce Automations */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Social Selling & Payment Automations
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-white">Auto-Reply with Payment Links</p>
                    <p className="text-xs text-slate-400">Instantly generate and send MecoPay checkout links in DMs when a customer asks to buy.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSendPaymentLink}
                    onChange={(e) => setAutoSendPaymentLink(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-white">Require Courier Advance Payment for COD</p>
                      <p className="text-xs text-slate-400">Ask the customer to pay courier delivery charge upfront to eliminate fake COD orders.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoAdvancePaymentRequest}
                      onChange={(e) => setAutoAdvancePaymentRequest(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                  {autoAdvancePaymentRequest && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                      <span className="text-xs text-slate-300">Advance Amount (BDT):</span>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">৳</span>
                        <input
                          type="number"
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Live Human Handover Trigger Keywords
                  </label>
                  <input
                    type="text"
                    value={humanHandoverKeyword}
                    onChange={(e) => setHumanHandoverKeyword(e.target.value)}
                    placeholder="agent, talk, কথা বলতে চাই"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    When a customer types these keywords, the bot pauses and notifies your team.
                  </p>
                </div>
              </div>
            </div>

              <button
                type="submit"
                disabled={saving || Boolean(sharedContext && !sharedContext.actions.includes('edit'))}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Social Agent Settings
            </button>
          </form>
        </div>

        {/* Live Social DM Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Social DM Chat Simulator
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 capitalize">
              {channel} Mode
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Top Bar */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {channel === 'messenger' && '💬'}
                  {channel === 'instagram' && '📸'}
                  {channel === 'whatsapp' && '🟢'}
                  {channel === 'telegram' && '✈️'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">MecoPay Social Sales Bot</h4>
                  <span className="text-[10px] text-slate-400">Automated DM Responder</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.link && (
                      <a
                        href={msg.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {autoAdvancePaymentRequest ? `Pay ৳${advanceAmount} Advance (Secure MecoPay)` : 'Checkout Now'}
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
                placeholder="Type in DM (e.g. আমি কিনব / দাম কত)..."
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
