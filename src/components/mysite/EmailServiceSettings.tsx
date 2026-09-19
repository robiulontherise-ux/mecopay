import React, { useState, useEffect } from 'react';
import { Mail, Save, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { showToast } from '../../lib/toast';

interface EmailServiceSettingsProps {
  user: any;
  brands?: any[];
}

export default function EmailServiceSettings({ user, brands = [] }: EmailServiceSettingsProps) {
  const [provider, setProvider] = useState('smtp');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [sendCustomerReceipt, setSendCustomerReceipt] = useState(true);
  const [sendAdminAlert, setSendAdminAlert] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`mecopay_email_config_${user?.id}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.provider) setProvider(p.provider);
        if (p.host) setHost(p.host);
        if (p.port) setPort(p.port);
        if (p.username) setUsername(p.username);
        if (p.password) setPassword(p.password);
        if (p.fromEmail) setFromEmail(p.fromEmail);
        if (p.fromName) setFromName(p.fromName);
        if (p.sendCustomerReceipt !== undefined) setSendCustomerReceipt(p.sendCustomerReceipt);
        if (p.sendAdminAlert !== undefined) setSendAdminAlert(p.sendAdminAlert);
      } catch (e) {}
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(
        `mecopay_email_config_${user?.id}`,
        JSON.stringify({
          provider,
          host,
          port,
          username,
          password,
          fromEmail,
          fromName,
          sendCustomerReceipt,
          sendAdminAlert
        })
      );
      setSaving(false);
      showToast('Email Service settings saved successfully!', 'success');
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-emerald-400" />
          Email Service (SMTP / Transactional)
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Deliver automated invoices, digital product downloads, and payment receipts directly to customer inboxes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Credentials */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            SMTP & Delivery Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Service Type</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none cursor-pointer"
              >
                <option value="smtp">Standard SMTP Server</option>
                <option value="resend">Resend (Modern API)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="ses">Amazon SES</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Host / Server</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g. smtp.mailgun.org or mail.yourdomain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">SMTP Port</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="587 or 465"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username / API Key</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="SMTP username or api key"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password / Secret</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter SMTP password"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sender Email Address</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="e.g. billing@yourdomain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sender Display Name</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="e.g. ROR SHOP or MecoPay Store"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Email Automation Rules
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">Send Customer Payment Receipt</p>
                <p className="text-xs text-slate-400">Instantly email PDF/HTML invoice and digital product download links to customer.</p>
              </div>
              <input
                type="checkbox"
                checked={sendCustomerReceipt}
                onChange={(e) => setSendCustomerReceipt(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-sm font-semibold text-white">Send Admin Order Alert</p>
                <p className="text-xs text-slate-400">Receive an email whenever a customer submits an advance payment or new order.</p>
              </div>
              <input
                type="checkbox"
                checked={sendAdminAlert}
                onChange={(e) => setSendAdminAlert(e.target.checked)}
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
          Save Email Configuration
        </button>
      </form>
    </div>
  );
}
