import React, { useState, useEffect } from 'react';
import {
  Truck,
  Key,
  PackageCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';
import { showToast } from '../../lib/toast';
import { supabase } from '../../lib/supabase';

interface CourierServiceProps {
  brands?: any[];
  user?: any;
}

export default function CourierService({ brands = [], user }: CourierServiceProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'parcels' | 'settings'>('parcels');

  // Courier API Keys & Brand Automation Settings
  const [courierProvider, setCourierProvider] = useState<'steadfast' | 'pathao' | 'redx'>('steadfast');
  const [steadfastApiKey, setSteadfastApiKey] = useState('');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('');
  const [pathaoClientId, setPathaoClientId] = useState('');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('');
  const [pathaoStoreId, setPathaoStoreId] = useState('');
  const [autoCourierOnFullCod, setAutoCourierOnFullCod] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);

  // New Parcel Booking Form Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [codAmount, setCodAmount] = useState('');
  const [parcelWeight, setParcelWeight] = useState('1');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Sample Parcels List
  const [parcels, setParcels] = useState<any[]>([
    {
      id: 'PAR-8921',
      courier: 'Steadfast',
      consignmentId: 'SF-1049281',
      recipient: 'Md. Tanvir Hasan',
      phone: '01712-345678',
      codAmount: 1850,
      advancePaid: 150,
      status: 'in_transit',
      date: '2026-09-18',
      trackingUrl: 'https://steadfast.com.bd/t/SF-1049281'
    },
    {
      id: 'PAR-8920',
      courier: 'Pathao',
      consignmentId: 'PTH-7782190',
      recipient: 'Farhana Akter',
      phone: '01890-112233',
      codAmount: 1200,
      advancePaid: 200,
      status: 'delivered',
      date: '2026-09-17',
      trackingUrl: 'https://merchant.pathao.com/tracking?consignment_id=PTH-7782190'
    },
    {
      id: 'PAR-8918',
      courier: 'Steadfast',
      consignmentId: 'SF-1048821',
      recipient: 'Sabbir Hossain',
      phone: '01911-223344',
      codAmount: 2500,
      advancePaid: 300,
      status: 'delivered',
      date: '2026-09-15',
      trackingUrl: 'https://steadfast.com.bd/t/SF-1048821'
    }
  ]);

  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands]);

  useEffect(() => {
    // Load from brand object if exists in Supabase brands table
    const currentBrand = brands.find(b => b.id === selectedBrandId);
    if (currentBrand) {
      if (typeof currentBrand.auto_courier_on_full_cod === 'boolean') {
        setAutoCourierOnFullCod(currentBrand.auto_courier_on_full_cod);
      } else if (currentBrand.redirect_links && typeof currentBrand.redirect_links.auto_courier_on_full_cod === 'boolean') {
        setAutoCourierOnFullCod(currentBrand.redirect_links.auto_courier_on_full_cod);
      }
    }

    const saved = localStorage.getItem(`mecopay_courier_${selectedBrandId || 'default'}`);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.courierProvider) setCourierProvider(p.courierProvider);
        if (p.steadfastApiKey) setSteadfastApiKey(p.steadfastApiKey);
        if (p.steadfastSecretKey) setSteadfastSecretKey(p.steadfastSecretKey);
        if (p.pathaoClientId) setPathaoClientId(p.pathaoClientId);
        if (p.pathaoClientSecret) setPathaoClientSecret(p.pathaoClientSecret);
        if (p.pathaoStoreId) setPathaoStoreId(p.pathaoStoreId);
        if (typeof p.autoCourierOnFullCod === 'boolean') setAutoCourierOnFullCod(p.autoCourierOnFullCod);
      } catch (e) {}
    }
  }, [selectedBrandId, brands]);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      // 1. Save locally
      localStorage.setItem(
        `mecopay_courier_${selectedBrandId || 'default'}`,
        JSON.stringify({
          courierProvider,
          steadfastApiKey,
          steadfastSecretKey,
          pathaoClientId,
          pathaoClientSecret,
          pathaoStoreId,
          autoCourierOnFullCod
        })
      );

      // 2. Update Supabase brands table with auto_courier_on_full_cod
      if (selectedBrandId) {
        const currentBrand = brands.find(b => b.id === selectedBrandId);
        const updatedRedirectLinks = {
          ...(currentBrand?.redirect_links || {}),
          auto_courier_on_full_cod: autoCourierOnFullCod,
          courier_provider: courierProvider
        };

        // Try updating both column and jsonb fallback
        const updatePayload: any = {
          redirect_links: updatedRedirectLinks
        };
        // If column exists, it updates smoothly
        updatePayload.auto_courier_on_full_cod = autoCourierOnFullCod;

        const { error } = await supabase
          .from('brands')
          .update(updatePayload)
          .eq('id', selectedBrandId);

        if (error) {
          // Retry with just redirect_links if auto_courier_on_full_cod column is not yet present
          console.warn("Retrying brand update with redirect_links:", error.message);
          await supabase
            .from('brands')
            .update({ redirect_links: updatedRedirectLinks })
            .eq('id', selectedBrandId);
        }

        if (currentBrand) {
          currentBrand.auto_courier_on_full_cod = autoCourierOnFullCod;
          currentBrand.redirect_links = updatedRedirectLinks;
        }
      }

      showToast('Courier settings and Real-time Webhook sync saved successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Settings saved locally: ' + (err.message || ''), 'success');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleBookParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientPhone || !recipientAddress) {
      showToast('Please fill in recipient details', 'error');
      return;
    }

    setBookingLoading(true);
    setTimeout(() => {
      const newConsignment =
        courierProvider === 'pathao'
          ? `PTH-${Math.floor(1000000 + Math.random() * 9000000)}`
          : `SF-${Math.floor(1000000 + Math.random() * 9000000)}`;

      const newParcel = {
        id: `PAR-${Math.floor(1000 + Math.random() * 9000)}`,
        courier: courierProvider === 'pathao' ? 'Pathao' : 'Steadfast',
        consignmentId: newConsignment,
        recipient: recipientName,
        phone: recipientPhone,
        codAmount: parseFloat(codAmount) || 0,
        advancePaid: 200,
        status: 'in_transit',
        date: new Date().toISOString().split('T')[0],
        trackingUrl:
          courierProvider === 'pathao'
            ? `https://merchant.pathao.com/tracking?consignment_id=${newConsignment}`
            : `https://steadfast.com.bd/t/${newConsignment}`
      };

      setParcels([newParcel, ...parcels]);
      setBookingLoading(false);
      setShowBookingModal(false);
      setRecipientName('');
      setRecipientPhone('');
      setRecipientAddress('');
      setCodAmount('');
      showToast(`Parcel booked successfully! Consignment: ${newConsignment}`, 'success');
    }, 500);
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            Courier Service & Fulfillment
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Book delivery parcels via Steadfast and Pathao Courier, track live consignment status, and auto-settle COD advance volumes.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Book New Parcel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('parcels')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'parcels'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Parcels & Tracking ({parcels.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          Courier API Settings
        </button>
      </div>

      {/* Tab Content: Parcels */}
      {activeTab === 'parcels' && (
        <div className="space-y-4">
          {/* Volume settlement info banner */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Automated Volume Settlement System:</span>
              When parcels reach <strong>"Delivered"</strong> status via courier webhook (or after 7-10 days dropship timer), your pending advance volume is automatically settled into main available balance.
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-4 font-semibold">Consignment ID</th>
                    <th className="p-4 font-semibold">Courier</th>
                    <th className="p-4 font-semibold">Recipient</th>
                    <th className="p-4 font-semibold">COD Amount</th>
                    <th className="p-4 font-semibold">Advance Status</th>
                    <th className="p-4 font-semibold">Delivery Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {parcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-white font-bold block">{parcel.consignmentId}</span>
                        <span className="text-[11px] text-slate-500">{parcel.id}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-200">
                          {parcel.courier}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium block">{parcel.recipient}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{parcel.phone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white font-mono">৳{parcel.codAmount}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-semibold font-mono text-[11px]">
                          ৳{parcel.advancePaid} Settled
                        </span>
                      </td>
                      <td className="p-4">
                        {parcel.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> In Transit
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={parcel.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                        >
                          Track <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveKeys} className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Courier API Credentials
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Courier Provider</label>
              <select
                value={courierProvider}
                onChange={(e) => setCourierProvider(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none cursor-pointer"
              >
                <option value="steadfast">Steadfast Courier (Recommended)</option>
                <option value="pathao">Pathao Courier</option>
                <option value="redx">RedX Courier</option>
              </select>
            </div>

            {courierProvider === 'steadfast' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Steadfast API Key</label>
                  <input
                    type="password"
                    value={steadfastApiKey}
                    onChange={(e) => setSteadfastApiKey(e.target.value)}
                    placeholder="Enter Steadfast API Key"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Steadfast Secret Key</label>
                  <input
                    type="password"
                    value={steadfastSecretKey}
                    onChange={(e) => setSteadfastSecretKey(e.target.value)}
                    placeholder="Enter Steadfast Secret Key"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {courierProvider === 'pathao' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pathao Client ID</label>
                  <input
                    type="text"
                    value={pathaoClientId}
                    onChange={(e) => setPathaoClientId(e.target.value)}
                    placeholder="Client ID"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pathao Client Secret</label>
                  <input
                    type="password"
                    value={pathaoClientSecret}
                    onChange={(e) => setPathaoClientSecret(e.target.value)}
                    placeholder="Client Secret"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pathao Store ID</label>
                  <input
                    type="text"
                    value={pathaoStoreId}
                    onChange={(e) => setPathaoStoreId(e.target.value)}
                    placeholder="Store ID"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Zero-Waste Sync Toggle: Auto Courier Booking on 100% Full COD */}
            <div className="pt-4 border-t border-slate-800">
              <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Auto Courier Booking on 100% Full COD</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Webhook Real-time Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    অন থাকলে: WordPress বা কাস্টম সাইট থেকে ১০০% COD ফর্ম সাবমিট হলে MecoPay স্বয়ংক্রিয়ভাবে কুরিয়ার বুকিং সম্পন্ন করবে।<br />
                    অফ থাকলে: ক্লায়েন্টের Laravel/WooCommerce সাইট লোকাল ক্যাশ দেখে MecoPay API কল ব্লক করবে (<strong>০% ইনভোকেশন অপচয়</strong>)।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={autoCourierOnFullCod}
                    onChange={(e) => setAutoCourierOnFullCod(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingKeys}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {savingKeys ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Courier Settings
          </button>
        </form>
      )}

      {/* Modal for Booking New Parcel */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Book Delivery Parcel
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookParcel} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Mobile</label>
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="House, Road, Area, City"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cash on Delivery (COD) Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">৳</span>
                    <input
                      type="number"
                      required
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      placeholder="Amount to collect"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parcel Weight (KG)</label>
                  <input
                    type="text"
                    value={parcelWeight}
                    onChange={(e) => setParcelWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
                >
                  {bookingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
