import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle2, ShieldCheck, Zap, Info, RefreshCw } from 'lucide-react';
import { showToast } from '../../lib/toast';

interface SmsServiceSettingsProps {
  user: any;
  brands?: any[];
}

export default function SmsServiceSettings({ user, brands = [] }: SmsServiceSettingsProps) {
  const [provider, setProvider] = useState('greenweb');
  const [apiKey, setApiKey] = useState('');
  const [senderId, setSenderId] = useState('');
  const [orderSms, setOrderSms] = useState(true);
  const [paymentSms, setPaymentSms] = useState(true);
  const [courierSms, setCourierSms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem(`mecopay_sms_config_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.senderId) setSenderId(parsed.senderId);
        if (parsed.orderSms !== undefined) setOrderSms(parsed.orderSms);
        if (parsed.paymentSms !== undefined) setPaymentSms(parsed.paymentSms);
        if (parsed.courierSms !== undefined) setCourierSms(parsed.courierSms);
      } catch (e) {}
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        `mecopay_sms_config_${user?.id}`,
        JSON.stringify({
          provider,
          apiKey,
          senderId,
          orderSms,
          paymentSms,
          courierSms
        })
      );
      setSaving(false);
      showToast('SMS Service configuration saved successfully!', 'success');
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          SMS Notification Service
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Connect your SMS gateway to send instant automated order confirmations and payment alerts to customers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gateway Credentials */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Gateway Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMS Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none cursor-pointer"
              >
                <option value="greenweb">Greenweb Bangladesh</option>
                <option value="bulksmsbd">BulkSMS BD</option>
                <option value="mimsms">MimSMS</option>
                <option value="elitbuzz">ElitBuzz</option>
                <option value="twilio">Twilio (International)</option>
                <option value="custom">Custom Webhook / REST API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sender ID / Masking Name</label>
              <input
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="e.g. 8809601XXXXX or RORSHOP"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">API Key / Token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your SMS API secret token"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Automation Triggers */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Automated Customer Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">Order Confirmation SMS</p>
                <p className="text-xs text-slate-400">Send an SMS with invoice ID and order summary as soon as an order is placed.</p>
              </div>
              <input
                type="checkbox"
                checked={orderSms}
                onChange={(e) => setOrderSms(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">Payment Received Alert</p>
                <p className="text-xs text-slate-400">Notify customers when their TrxID / merchant payment is verified.</p>
              </div>
              <input
                type="checkbox"
                checked={paymentSms}
                onChange={(e) => setPaymentSms(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">Courier Tracking SMS</p>
                <p className="text-xs text-slate-400">Send consignment number and tracking link when parcel is booked on Steadfast/Pathao.</p>
              </div>
              <input
                type="checkbox"
                checked={courierSms}
                onChange={(e) => setCourierSms(e.target.checked)}
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
          Save SMS Configuration
        </button>
      </form>
    </div>
  );
}
