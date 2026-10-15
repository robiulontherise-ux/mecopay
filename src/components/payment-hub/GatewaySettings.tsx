import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';
import { showConfirm } from '../../lib/confirm';
import { notifyMerchantWebhook } from '../../lib/webhookDispatcher';
import { CheckCircle2, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';

interface GatewaySettingsProps {
  brands: any[];
  isAdmin: boolean;
}

export default function GatewaySettings({ brands, isAdmin }: GatewaySettingsProps) {
  const [gateways, setGateways] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<'Personal MFS' | 'Merchant' | 'International' | 'Bangla QR'>('Personal MFS');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedMerchantProvider, setSelectedMerchantProvider] = useState<'bkash' | 'nagad' | null>(null);
  const [selectedInternationalProvider, setSelectedInternationalProvider] = useState<string | null>(null);
  const [internationalForm, setInternationalForm] = useState<Record<string, string>>({});

  // Merchant Credentials State
  const [merchantAppKey, setMerchantAppKey] = useState('');
  const [merchantAppSecret, setMerchantAppSecret] = useState('');
  const [merchantUsername, setMerchantUsername] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [nagadMerchantId, setNagadMerchantId] = useState('');
  const [nagadPublicKey, setNagadPublicKey] = useState('');
  const [nagadPrivateKey, setNagadPrivateKey] = useState('');
  const [merchantActive, setMerchantActive] = useState(true);

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [secondaryAccountNumber, setSecondaryAccountNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceName2, setDeviceName2] = useState('');
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [additionalNumbers, setAdditionalNumbers] = useState<{ number: string; device_name: string }[]>([]);
  const [minAmount, setMinAmount] = useState('1');
  const [maxAmount, setMaxAmount] = useState('100000');
  const [currency, setCurrency] = useState('BDT');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (brands.length > 0) {
      if (!selectedBrandId || !brands.find(b => b.id === selectedBrandId)) {
        setSelectedBrandId(brands[0].id);
      }
    } else {
      if (selectedBrandId) setSelectedBrandId('');
    }
    fetchGateways();
  }, [brands]);

  const fetchGateways = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Query devices from both device_status and sms_forwarder_settings
        const [statusRes, forwarderRes] = await Promise.all([
          supabase.from('device_status').select('device_id').eq('user_id', user.id),
          supabase.from('sms_forwarder_settings').select('device_name').eq('user_id', user.id)
        ]);

        const devSet = new Set<string>();
        (statusRes.data || []).forEach((d: any) => {
          if (d.device_id && d.device_id !== 'android-app-1' && d.device_id !== 'default-device') {
            devSet.add(d.device_id);
          }
        });
        (forwarderRes.data || []).forEach((s: any) => {
          if (s.device_name && s.device_name !== '__GLOBAL_CONFIG__') {
            devSet.add(s.device_name);
          }
        });
        setAvailableDevices(Array.from(devSet));
      }
    } catch (e) {
      console.error("Error fetching devices:", e);
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('payment_numbers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setGateways(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteGatewayRow = async (gwId: string, provider: string, brandId: string) => {
    const res = await showConfirm({
      msg: "Are you sure you want to delete this Gateway? Payment links associated with it might fail to process.",
      requireType: "delete"
    });
    if (!res || !res.confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('payment_numbers')
        .delete()
        .eq('id', gwId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      showToast("Gateway deleted successfully!", "success");
      fetchGateways();
    } catch (e: any) {
      showToast("Failed to delete gateway: " + e.message, "error");
    }
  };
  
  const getGwDevice = (gw: any, type: 'primary' | 'secondary') => {
    if (type === 'primary' && gw.device_name) return gw.device_name;
    if (type === 'secondary' && gw.device_name_2) return gw.device_name_2;
    if (Array.isArray(gw.additional_numbers)) {
      const meta = gw.additional_numbers.find((x: any) => x && x._meta_type === type);
      if (meta && meta.device_name) return meta.device_name;
    }
    return '';
  };

  const getRealBackupNumbers = (gw: any) => {
    if (!Array.isArray(gw.additional_numbers)) return [];
    return gw.additional_numbers.filter((x: any) => x && !x._meta_type && (typeof x === 'string' || x.number));
  };

  const loadMerchantConfigForBrand = (brandId: string, provider: 'bkash' | 'nagad') => {
    const brand = brands.find(b => b.id === brandId);
    const mConf = brand?.merchant_config?.[provider] || {};
    if (provider === 'bkash') {
      setMerchantAppKey(mConf.app_key || brand?.merchant_config?.app_key || '');
      setMerchantAppSecret(mConf.app_secret || brand?.merchant_config?.app_secret || '');
      setMerchantUsername(mConf.username || brand?.merchant_config?.username || '');
      setMerchantPassword(mConf.password || brand?.merchant_config?.password || '');
      setMerchantActive(mConf.active !== false);
    } else {
      setNagadMerchantId(mConf.merchant_id || '');
      setNagadPublicKey(mConf.public_key || '');
      setNagadPrivateKey(mConf.private_key || '');
      setMerchantActive(mConf.active !== false);
    }
  };

  const handleSaveMerchant = async () => {
    if (!selectedBrandId || !selectedMerchantProvider) {
      showToast("Please select a brand and merchant provider", "error");
      return;
    }

    if (selectedMerchantProvider === 'bkash') {
      if (!merchantAppKey.trim() || !merchantAppSecret.trim() || !merchantUsername.trim() || !merchantPassword.trim()) {
        showToast("Please fill all bKash merchant credential fields", "error");
        return;
      }
    } else if (selectedMerchantProvider === 'nagad') {
      if (!nagadMerchantId.trim() || !nagadPublicKey.trim() || !nagadPrivateKey.trim()) {
        showToast("Please fill all Nagad merchant credential fields", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const brand = brands.find(b => b.id === selectedBrandId);
      const existingConfig = brand?.merchant_config || {};

      const updatedMerchantConfig = {
        ...existingConfig,
        [selectedMerchantProvider]: selectedMerchantProvider === 'bkash' ? {
          app_key: merchantAppKey.trim(),
          app_secret: merchantAppSecret.trim(),
          username: merchantUsername.trim(),
          password: merchantPassword.trim(),
          active: merchantActive
        } : {
          merchant_id: nagadMerchantId.trim(),
          public_key: nagadPublicKey.trim(),
          private_key: nagadPrivateKey.trim(),
          active: merchantActive
        }
      };

      // 1. Update Supabase brands table
      const { error: brandErr } = await supabase
        .from('brands')
        .update({
          merchant_api: merchantActive,
          merchant_provider: selectedMerchantProvider,
          merchant_config: updatedMerchantConfig
        })
        .eq('id', selectedBrandId);

      if (brandErr) throw brandErr;

      if (brand) {
        brand.merchant_api = merchantActive;
        brand.merchant_provider = selectedMerchantProvider;
        brand.merchant_config = updatedMerchantConfig;
      }

      // 2. Upsert into payment_numbers table for unified gateways view
      const displayIdentifier = selectedMerchantProvider === 'bkash'
        ? `AppKey: ${merchantAppKey.trim().slice(0, 8)}...`
        : `MerchantID: ${nagadMerchantId.trim()}`;

      const existingGw = gateways.find(
        g => g.brand_id === selectedBrandId && g.provider === selectedMerchantProvider && g.type === 'merchant'
      );

      if (existingGw) {
        await supabase
          .from('payment_numbers')
          .update({
            number: displayIdentifier,
            min_amount: parseFloat(minAmount) || 1,
            max_amount: parseFloat(maxAmount) || 100000,
          })
          .eq('id', existingGw.id);
      } else {
        await supabase
          .from('payment_numbers')
          .insert({
            user_id: user.id,
            brand_id: selectedBrandId,
            provider: selectedMerchantProvider,
            type: 'merchant',
            number: displayIdentifier,
            min_amount: parseFloat(minAmount) || 1,
            max_amount: parseFloat(maxAmount) || 100000,
            monthly_volume: 0
          });
      }

      showToast(`${selectedMerchantProvider === 'bkash' ? 'bKash' : 'Nagad'} Merchant credentials saved for ${brand?.name || 'Brand'}!`, "success");
      setIsCreating(false);
      setSelectedMerchantProvider(null);
      setSelectedProvider(null);
      fetchGateways();

      // Dispatch Webhook (Method 1) to notify merchant's WordPress/Laravel/Custom site cache
      notifyMerchantWebhook(selectedBrandId, 'brand.settings_updated', {
        brand_id: selectedBrandId,
        personal_api_active: brand?.personal_api ?? true,
        merchant_api_active: true,
        auto_courier_on_full_cod: brand?.auto_courier_on_full_cod ?? false
      });

      // 🚀 Auto-sync to Cloudflare Edge KV via Edge Function
      supabase.functions.invoke('cloudflare-custom-hostname', {
        body: { action: 'sync_brand', brand_id: selectedBrandId }
      }).catch(err => console.warn('Edge KV sync error:', err));
    } catch (err: any) {
      showToast("Failed to save merchant credentials: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMerchantGateway = async (brandId: string, provider: 'bkash' | 'nagad') => {
    const res = await showConfirm({
      msg: `Are you sure you want to remove ${provider === 'bkash' ? 'bKash' : 'Nagad'} Merchant credentials for this brand?`,
      requireType: "delete"
    });
    if (!res || !res.confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const brand = brands.find(b => b.id === brandId);
      const existingConfig = brand?.merchant_config || {};
      const updatedConfig = { ...existingConfig };
      delete updatedConfig[provider];

      await supabase
        .from('brands')
        .update({
          merchant_config: updatedConfig,
          merchant_api: Object.keys(updatedConfig).length > 0
        })
        .eq('id', brandId);

      await supabase
        .from('payment_numbers')
        .delete()
        .eq('brand_id', brandId)
        .eq('provider', provider)
        .eq('type', 'merchant');

      showToast("Merchant Gateway deleted successfully", "success");
      setIsCreating(false);
      setSelectedMerchantProvider(null);
      fetchGateways();

      // Dispatch Webhook (Method 1) to notify merchant's WordPress/Laravel/Custom site cache
      notifyMerchantWebhook(brandId, 'brand.settings_updated', {
        brand_id: brandId,
        personal_api_active: brand?.personal_api ?? true,
        merchant_api_active: Object.keys(updatedConfig).length > 0,
        auto_courier_on_full_cod: brand?.auto_courier_on_full_cod ?? false
      });

      // 🚀 Auto-sync to Cloudflare Edge KV via Edge Function
      supabase.functions.invoke('cloudflare-custom-hostname', {
        body: { action: 'sync_brand', brand_id: brandId }
      }).catch(err => console.warn('Edge KV sync error:', err));
    } catch (e: any) {
      showToast("Error deleting merchant gateway: " + e.message, "error");
    }
  };

  const handleSave = async () => {
    if (!selectedBrandId || selectedProviders.length === 0 || !accountNumber) {
      showToast("Please fill required fields!", 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      for (const provider of selectedProviders) {
        // Clean and sanitize additional_numbers to store number and device_name
        const sanitizedAdditionalNumbers = additionalNumbers
          .filter(item => item && item.number && item.number.trim() !== '')
          .map(item => ({
            number: item.number.trim(),
            device_name: item.device_name || null
          }));

        // Embed device metadata in additional_numbers as dual-storage fallback
        const enrichedAdditionalNumbers = [
          ...sanitizedAdditionalNumbers,
          ...(deviceName ? [{ _meta_type: 'primary', device_name: deviceName }] : []),
          ...(deviceName2 ? [{ _meta_type: 'secondary', device_name: deviceName2 }] : [])
        ];

        const payloadWithColumns: any = {
          number: accountNumber,
          brand_id: selectedBrandId,
          number_2: secondaryAccountNumber || null,
          additional_numbers: enrichedAdditionalNumbers,
          min_amount: parseFloat(minAmount) || 1,
          max_amount: parseFloat(maxAmount) || 100000,
          provider: provider,
          device_name: deviceName || null,
          device_name_2: deviceName2 || null
        };

        const payloadFallback: any = {
          number: accountNumber,
          brand_id: selectedBrandId,
          number_2: secondaryAccountNumber || null,
          additional_numbers: enrichedAdditionalNumbers,
          min_amount: parseFloat(minAmount) || 1,
          max_amount: parseFloat(maxAmount) || 100000,
          provider: provider
        };

        let saveError: any = null;

        if (editingId) {
          const res = await supabase
            .from('payment_numbers')
            .update(payloadWithColumns)
            .eq('id', editingId);
          
          if (res.error && (res.error.code === '42703' || res.error.message?.includes('device_name'))) {
            // Column device_name does not exist in table yet, fallback to saving without it
            const fallbackRes = await supabase
              .from('payment_numbers')
              .update(payloadFallback)
              .eq('id', editingId);
            saveError = fallbackRes.error;
          } else {
            saveError = res.error;
          }
        } else {
          const res = await supabase
            .from('payment_numbers')
            .insert({
              ...payloadWithColumns,
              user_id: user.id,
              type: 'personal',
              monthly_volume: 0
            });
          
          if (res.error && (res.error.code === '42703' || res.error.message?.includes('device_name'))) {
            // Column device_name does not exist in table yet, fallback to saving without it
            const fallbackRes = await supabase
              .from('payment_numbers')
              .insert({
                ...payloadFallback,
                user_id: user.id,
                type: 'personal',
                monthly_volume: 0
              });
            saveError = fallbackRes.error;
          } else {
            saveError = res.error;
          }
        }

        if (saveError) {
          console.error(`Error saving ${provider}:`, saveError);
          throw new Error(saveError.message || `Failed to save ${provider}`);
        }
      }

      showToast("Saved successfully!", "success");
      setSelectedProvider(null);
      setSelectedProviders([]);
      setIsCreating(false);
      setEditingId(null);
      fetchGateways();

      if (selectedBrandId) {
        const brand = brands.find(b => b.id === selectedBrandId);
        notifyMerchantWebhook(selectedBrandId, 'brand.settings_updated', {
          brand_id: selectedBrandId,
          personal_api_active: true,
          merchant_api_active: brand?.merchant_api ?? false,
          auto_courier_on_full_cod: brand?.auto_courier_on_full_cod ?? false
        });

        // 🚀 Auto-sync to Cloudflare Edge KV via Edge Function
        supabase.functions.invoke('cloudflare-custom-hostname', {
          body: { action: 'sync_brand', brand_id: selectedBrandId }
        }).catch(err => console.warn('Edge KV sync error:', err));
      }
    } catch (err: any) {
      console.error("Save gateway error:", err);
      showToast(err.message || "Failed to save!", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const mfsProviders = [
    { 
      id: 'bkash', 
      name: 'Bkash', 
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/bkash.png'
    },
    { 
      id: 'nagad', 
      name: 'Nagad', 
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png'
    },
    { 
      id: 'upay', 
      name: 'Upay', 
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/upay.png'
    },
    { 
      id: 'rocket', 
      name: 'Rocket', 
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/rocket.png'
    },
    {
      id: 'tap',
      name: 'TAP',
      logoUrl: '/assets/mfs/tap.png'
    },
    {
      id: 'mcash',
      name: 'mCash',
      logoUrl: '/assets/mfs/mcash.png'
    }
  ];

  const merchantProviders = [
    { 
      id: 'bkash', 
      name: 'bKash Merchant', 
      badge: 'Tokenized API Gateway',
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/bkash.png'
    },
    { 
      id: 'nagad', 
      name: 'Nagad Merchant', 
      badge: 'Direct Official PGW',
      logoUrl: 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png'
    }
  ];
  type InternationalField = { label: string; key: string; type?: string; placeholder?: string; required?: boolean; options?: string[] };
  type InternationalProvider = { id: string; name: string; logoUrl: string; badge: string; capability: string; gateway: boolean; note: string };
  const internationalProviders: InternationalProvider[] = [
    { id: 'stripe', name: 'Stripe', logoUrl: '/assets/international/stripe.png', badge: 'Cards & Wallets', capability: 'Hosted card checkout', gateway: true, note: 'সাধারণ international card/Wallet checkout-এর জন্য উপযুক্ত।' },
    { id: 'paypal', name: 'PayPal', logoUrl: '/assets/international/paypal.png', badge: 'Online Payments', capability: 'Orders + capture checkout', gateway: true, note: 'Single-merchant PayPal checkout-এর জন্য উপযুক্ত।' },
    { id: 'payoneer', name: 'Payoneer', logoUrl: '/assets/international/payoneer.png', badge: 'Approved Checkout', capability: 'Payoneer Checkout', gateway: true, note: 'শুধুমাত্র Payoneer Checkout approval থাকা merchant-এর জন্য।' },
    { id: 'cryptomus', name: 'Cryptomus', logoUrl: '/assets/international/cryptomus.png', badge: 'Crypto Gateway', capability: 'Crypto invoice checkout', gateway: true, note: 'Official Merchant UUID ও Payment API Key দিয়ে crypto invoice তৈরি করে; আলাদা webhook secret নেই।' }
  ];
  const internationalFieldConfig: Record<string, InternationalField[]> = {
    stripe: [
      { label: 'Environment', key: 'environment', options: ['Sandbox / Test', 'Live'], required: true },
      { label: 'Server API Key (Restricted key recommended)', key: 'serverApiKey', type: 'password', placeholder: 'rk_live_... or sk_live_...', required: true },
      { label: 'Publishable Key (optional for hosted Checkout)', key: 'publishableKey', placeholder: 'pk_live_...', required: false },
      { label: 'Webhook Signing Secret', key: 'webhookSecret', type: 'password', placeholder: 'whsec_...', required: true }
    ],
    paypal: [
      { label: 'Environment', key: 'environment', options: ['Sandbox', 'Live'], required: true },
      { label: 'Client ID', key: 'clientId', placeholder: 'PayPal client ID', required: true },
      { label: 'Client Secret', key: 'clientSecret', type: 'password', placeholder: 'PayPal client secret', required: true },
      { label: 'Webhook ID', key: 'webhookId', placeholder: 'PayPal webhook ID', required: true }
    ],
    payoneer: [
      { label: 'Environment', key: 'environment', options: ['Sandbox', 'Live'], required: true },
      { label: 'Checkout API Username', key: 'checkoutUsername', placeholder: 'Payoneer Checkout API username', required: true },
      { label: 'Payment API Token', key: 'paymentApiToken', type: 'password', placeholder: 'Payoneer Checkout payment token', required: true },
      { label: 'Store Code / Division', key: 'division', placeholder: 'Payoneer store division code', required: true },
      { label: 'Notification URL', key: 'notificationUrl', type: 'url', placeholder: 'https://api.mecopay.space/api/webhooks/payoneer', required: false }
    ],
    cryptomus: [
      { label: 'Merchant UUID', key: 'merchantId', placeholder: 'Cryptomus merchant UUID', required: true },
      { label: 'Payment API Key (not Payout API Key)', key: 'apiKey', type: 'password', placeholder: 'Cryptomus payment API key', required: true },
      { label: 'Return URL', key: 'returnUrl', type: 'url', placeholder: 'https://your-domain.com/payment/success', required: false }
    ]
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-500">💳</span> View Gateways
          </h2>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { 
              setIsCreating(true); 
              setEditingId(null);
              setAccountNumber('');
              setSecondaryAccountNumber('');
              setDeviceName('');
              setDeviceName2('');
              setAdditionalNumbers([]);
              setSelectedProvider(null);
              setSelectedMerchantProvider(null);
              setSelectedInternationalProvider(null);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            + Add Gateways
          </button>
        )}
      </div>

      {!isCreating ? (
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-blue-400">
            Showing wallets and merchant gateways for all brands.
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-250px)] min-h-[400px] w-full">
<div className="overflow-auto flex-1 relative">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0f1523] text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">GATEWAY</th>
                    <th className="px-6 py-4">TYPE</th>
                    <th className="px-6 py-4">ACCOUNT TYPE</th>
                    <th className="px-6 py-4">METHOD</th>
                    <th className="px-6 py-4">BRAND</th>
                    <th className="px-6 py-4">CREDENTIALS</th>
                    <th className="px-6 py-4">LIMITS</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">ORDER</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={10} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                  ) : gateways.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-8 text-center text-slate-500">No gateways configured yet. Click "Add Gateways" to setup.</td></tr>
                  ) : (
                    gateways.map((gw, idx) => {
                      const providerObj = mfsProviders.find(p => p.id === gw.provider) || merchantProviders.find(p => p.id === gw.provider);
                      const brandObj = brands.find(b => b.id === gw.brand_id);
                      const isMerchant = gw.type === 'merchant';
                      return (
                        <tr key={gw.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white capitalize flex items-center gap-3">
                            {providerObj?.name || gw.provider}
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {isMerchant ? 'merchant_pgw' : 'mobile_banking'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${isMerchant ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400'} px-2.5 py-1 rounded-full text-xs font-semibold uppercase`}>
                              {gw.type || 'personal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                              {isMerchant ? 'Direct OTP / PIN' : (() => {
                                if (gw.type !== 'personal' && gw.type) {
                                  return (gw.provider || 'API').toUpperCase();
                                }
                                const vTrx = brandObj?.redirect_links?.verify_trx_id ?? true;
                                const vPhone = brandObj?.redirect_links?.verify_phone ?? false;
                                if (vTrx && vPhone) return "10 Min Live + Manual";
                                if (vPhone) return "10 Min Live";
                                if (vTrx) return "Manual";
                                return "None";
                              })()}
                          </td>
                          <td className="px-6 py-4 text-slate-300">{brandObj?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-xs">
                            {isMerchant ? (
                              <div>
                                <div className="text-slate-400">Identifier:</div>
                                <div className="text-emerald-400 font-mono font-medium">{gw.number}</div>
                                <div className="text-slate-500 text-[10px]">Official API Active</div>
                              </div>
                            ) : (
                              <>
                                <div className="text-slate-400">Account 1:</div>
                                <div className="text-slate-300">
                                  {gw.number}
                                  {getGwDevice(gw, 'primary') && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px]">
                                      {getGwDevice(gw, 'primary')}
                                    </span>
                                  )}
                                </div>
                                {gw.number_2 && (
                                  <>
                                    <div className="text-slate-400 mt-1">Account 2:</div>
                                    <div className="text-slate-300">
                                      {gw.number_2}
                                      {getGwDevice(gw, 'secondary') && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px]">
                                          {getGwDevice(gw, 'secondary')}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                                {getRealBackupNumbers(gw).length > 0 && (
                                  <div className="text-slate-400 mt-1 text-[11px]">
                                    +{getRealBackupNumbers(gw).length} Backup Number(s)
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            <div>Min: {gw.min_amount || '1.00'}</div>
                            <div>Max: {gw.max_amount || '100000.00'}</div>
                            <div>Fee: 0</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              ON
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button className="text-slate-500 hover:text-blue-400"><ArrowUp className="w-4 h-4" /></button>
                              <button className="text-slate-500 hover:text-blue-400"><ArrowDown className="w-4 h-4" /></button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-400 hover:text-blue-300 p-2" onClick={() => {
                              if (isMerchant) {
                                setActiveCategory('Merchant');
                                setSelectedMerchantProvider(gw.provider as 'bkash' | 'nagad');
                                setSelectedProvider(null);
                                setSelectedBrandId(gw.brand_id);
                                loadMerchantConfigForBrand(gw.brand_id, gw.provider as 'bkash' | 'nagad');
                                setMinAmount(gw.min_amount ? String(gw.min_amount) : '1');
                                setMaxAmount(gw.max_amount ? String(gw.max_amount) : '100000');
                                setIsCreating(true);
                                setEditingId(gw.id);
                                return;
                              }
                              setSelectedProvider(gw.provider);
                              setSelectedProviders([gw.provider]);
                              setSelectedMerchantProvider(null);
                              setSelectedBrandId(gw.brand_id);
                              setAccountNumber(gw.number);
                              setSecondaryAccountNumber(gw.number_2 || '');
                              const d1 = getGwDevice(gw, 'primary');
                              const d2 = getGwDevice(gw, 'secondary');
                              setDeviceName(d1);
                              setDeviceName2(d2);
                              const parsedAdd = getRealBackupNumbers(gw).map((item: any) =>
                                typeof item === 'object' && item !== null
                                  ? { number: item.number || '', device_name: item.device_name || '' }
                                  : { number: String(item || ''), device_name: '' }
                              );
                              setAdditionalNumbers(parsedAdd);
                              if (d1) setAvailableDevices(prev => Array.from(new Set([...prev, d1])));
                              if (d2) setAvailableDevices(prev => Array.from(new Set([...prev, d2])));
                              parsedAdd.forEach((pa: any) => {
                                if (pa.device_name) setAvailableDevices(prev => Array.from(new Set([...prev, pa.device_name])));
                              });
                              setMinAmount(gw.min_amount ? String(gw.min_amount) : '1');
                              setMaxAmount(gw.max_amount ? String(gw.max_amount) : '100000');
                              setIsCreating(true);
                              setEditingId(gw.id);
                            }}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-400 hover:text-red-300 p-2 ml-1" onClick={() => {
                              if (isMerchant) {
                                handleDeleteMerchantGateway(gw.brand_id, gw.provider as 'bkash' | 'nagad');
                              } else {
                                handleDeleteGatewayRow(gw.id, gw.provider, gw.brand_id);
                              }
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
</div>
</div>
</div>
      ) : (
        <div>
          <button
            onClick={() => { 
              setIsCreating(false); 
              setSelectedProvider(null); 
              setSelectedProviders([]); 
              setSelectedMerchantProvider(null);
              showToast("Cancelled", "error"); 
            }}
            className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-2"
          >
            ← Back to Gateways
          </button>

          {!selectedProvider && !selectedMerchantProvider && !selectedInternationalProvider ? (
            <div className="space-y-6">
              {/* Category Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveCategory('Personal MFS')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    activeCategory === 'Personal MFS'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Personal MFS
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('Merchant')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    activeCategory === 'Merchant'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Merchant (MFS / Bank / Card)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('International')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    activeCategory === 'International'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  International
                </button>
              </div>

              {activeCategory === 'Personal MFS' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h3 className="text-lg font-bold text-white">Personal MFS Gateways</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mfsProviders.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setSelectedProviders([provider.id]);
                          setAccountNumber('');
                          setSecondaryAccountNumber('');
                          setDeviceName('');
                          setDeviceName2('');
                          setAdditionalNumbers([]);
                        }}
                        className={`flex flex-col items-center justify-center p-6 bg-[#0f1523] border border-slate-800/80 rounded-xl hover:border-slate-600 transition-colors gap-5 h-36`}
                      >
                        <div className="h-10 flex items-center justify-center w-full">
                          <img src={provider.logoUrl} alt={provider.name} className="h-full max-w-[100px] object-contain" />
                        </div>
                        <span className="font-bold text-slate-100 text-[15px]">{provider.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeCategory === 'Merchant' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <h3 className="text-lg font-bold text-white">Merchant (MFS / Bank / Card) Gateways</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {merchantProviders.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedMerchantProvider(provider.id as 'bkash' | 'nagad');
                          if (selectedBrandId) {
                            loadMerchantConfigForBrand(selectedBrandId, provider.id as 'bkash' | 'nagad');
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-6 bg-[#0f1523] border border-slate-800/80 rounded-xl hover:border-purple-500/50 hover:bg-slate-900/60 transition-all gap-4 h-36 relative group`}
                      >
                        <div className="h-10 flex items-center justify-center w-full">
                          <img src={provider.logoUrl} alt={provider.name} className="h-full max-w-[100px] object-contain" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-slate-100 text-[15px] block">{provider.name}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{provider.badge}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t-2 border-red-600 pt-2.5 space-y-4">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7fd6c3]"></span>
                    <h3 className="text-[15px] leading-none font-bold text-slate-100">International</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {internationalProviders.filter(provider => provider.id !== 'cryptomus' || isAdmin).map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedMerchantProvider(null);
                          setSelectedInternationalProvider(provider.id);
                          setInternationalForm({});
                        }}
                        className="flex flex-col items-center justify-center px-4 py-4 bg-[#111a2e] border border-[#263653] rounded-[14px] hover:border-cyan-400/70 hover:bg-[#15213a] transition-all gap-3.5 h-[134px] relative group shadow-[0_8px_22px_rgba(2,8,23,0.16)]"
                      >
                        <div className="h-11 w-full flex items-center justify-center">
                          <img 
                            src={provider.logoUrl} 
                            alt={provider.name} 
                            className={`max-h-10 max-w-[124px] object-contain ${''}`}
                            onError={(e) => {
                               // Fallback if needed
                               (e.target as any).src = `https://ui-avatars.com/api/?name=${provider.name}&background=1a2234&color=7fd6c3&bold=true`;
                            }}
                          />
                        </div>
                        <span className="font-bold text-slate-200 text-[15px] leading-none block">{provider.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedInternationalProvider ? (
            /* International Gateway UI Form - persistence will be connected separately */
            <div className="bg-[#1a2234] border border-slate-800 rounded-xl p-6 relative max-w-3xl">
              <button
                onClick={() => setSelectedInternationalProvider(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              {(() => {
                const provider = internationalProviders.find(item => item.id === selectedInternationalProvider);
                const fields = internationalFieldConfig[selectedInternationalProvider] || [];
                const webhookEndpoint = `https://api.mecopay.space/api/webhooks/${selectedInternationalProvider}`;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <img src={provider?.logoUrl} alt={provider?.name} className="h-9 max-w-[120px] object-contain" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{provider?.name} International Gateway</h3>
                        <p className="text-xs text-cyan-300 font-semibold">{provider?.capability}</p>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-4 text-sm ${provider?.gateway ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>
                      <div className="font-bold mb-1">{provider?.gateway ? 'Payment gateway capability' : 'Not a generic payment gateway'}</div>
                      <div className="text-xs leading-5 opacity-90">{provider?.note}</div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-blue-400 font-medium mb-1.5">🏢 Select Brand</label>
                        <select
                          value={selectedBrandId}
                          onChange={e => setSelectedBrandId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 font-semibold"
                        >
                          {Array.isArray(brands) && brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>

                      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                        <div className="text-sm font-bold text-cyan-200 mb-1">MecoPay Webhook URL — provider dashboard-এ বসাবেন</div>
                        <div className="text-xs text-cyan-100/80 mb-3">Client এই URL নিজের provider account-এর Webhooks / Callback / Notification settings-এ যোগ করবে। Client-এর নিজের webhook URL এখানে দেওয়ার দরকার নেই; provider event আগে MecoPay-তে আসবে, তারপর MecoPay client website-এ configured merchant webhook পাঠাবে।</div>
                        <code className="block rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-emerald-300 break-all">{webhookEndpoint}</code>
                        <div className="text-[11px] text-slate-400 mt-2">Provider dashboard-এ payment completed/succeeded এবং refund/failed events enable করুন। Secret/signature verification MecoPay backend-এ হবে।</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.length > 0 ? fields.map(field => (
                          <div key={field.key} className={field.key === 'callbackUrl' ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">{field.label} {field.required !== false ? '*' : '(optional)'}</label>
                            {field.options ? (
                              <select
                                value={internationalForm[field.key] || field.options[0]}
                                onChange={e => setInternationalForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                              >
                                {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                              </select>
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={internationalForm[field.key] || ''}
                                onChange={e => setInternationalForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                required={field.required !== false}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                              />
                            )}
                          </div>
                        )) : null}
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-white">Enable Gateway Status</div>
                          <div className="text-xs text-slate-400">Allow customers to use this gateway after API connection is completed</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInternationalForm(prev => ({ ...prev, active: prev.active === 'false' ? 'true' : 'false' }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${internationalForm.active !== 'false' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}
                        >
                          {internationalForm.active !== 'false' ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex gap-4">
                        <button type="button" onClick={() => setSelectedInternationalProvider(null)} className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold">
                          Cancel
                        </button>
                        <button type="button" disabled={!provider?.gateway} onClick={() => showToast(provider?.gateway ? 'Gateway configuration saved for preview. Backend API connection is not enabled yet.' : 'This provider cannot be enabled as an automated payment gateway.', provider?.gateway ? 'success' : 'error')} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-colors">
                          {provider?.gateway ? 'Save Gateway Configuration' : 'Gateway Unavailable'}
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : selectedMerchantProvider ? (
            /* Merchant Setup Form */
            <div className="bg-[#1a2234] border border-slate-800 rounded-xl p-6 relative max-w-3xl">
              <button 
                onClick={() => setSelectedMerchantProvider(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={selectedMerchantProvider === 'bkash' 
                    ? 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/bkash.png'
                    : 'https://raw.githubusercontent.com/helloanaroul/bd-mfs-logos/main/logos/png/nagad.png'}
                  alt={selectedMerchantProvider}
                  className="h-8 object-contain"
                />
                <div>
                  <h3 className="text-xl font-bold text-white capitalize">
                    {selectedMerchantProvider === 'bkash' ? 'bKash Merchant' : 'Nagad Merchant'} Gateway Setup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct automated OTP/PIN payment processing credentials.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Brand Selection Dropdown (Queried from brands table for client) */}
                <div>
                  <label className="block text-sm text-blue-400 font-medium mb-1.5 flex items-center gap-1.5">
                    <span className="text-lg">🏢</span> Select Brand for this Merchant Gateway *
                  </label>
                  <select 
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      loadMerchantConfigForBrand(e.target.value, selectedMerchantProvider);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {Array.isArray(brands) && brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Queried from your registered brands. Credentials will be securely tied to this brand.
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Enable Gateway Status</div>
                    <div className="text-xs text-slate-400">Allow customers to use this merchant gateway during checkout</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMerchantActive(!merchantActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      merchantActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {merchantActive ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}
                  </button>
                </div>

                {/* Provider-specific Credentials */}
                {selectedMerchantProvider === 'bkash' ? (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-blue-400 font-medium flex items-center gap-1.5">
                      <span>🔑</span> bKash Tokenized API Credentials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">bKash App Key *</label>
                        <input
                          type="text"
                          value={merchantAppKey}
                          onChange={e => setMerchantAppKey(e.target.value)}
                          placeholder="e.g. 4f1a238b9c..."
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">bKash App Secret *</label>
                        <input
                          type="password"
                          value={merchantAppSecret}
                          onChange={e => setMerchantAppSecret(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant Username *</label>
                        <input
                          type="text"
                          value={merchantUsername}
                          onChange={e => setMerchantUsername(e.target.value)}
                          placeholder="sandboxTestUser / merchantUser"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant Password *</label>
                        <input
                          type="password"
                          value={merchantPassword}
                          onChange={e => setMerchantPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-orange-400 font-medium flex items-center gap-1.5">
                      <span>🔑</span> Nagad Official PGW Credentials
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Nagad Merchant ID *</label>
                        <input
                          type="text"
                          value={nagadMerchantId}
                          onChange={e => setNagadMerchantId(e.target.value)}
                          placeholder="e.g. 680123456789"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Nagad PGW Public Key *</label>
                        <textarea
                          rows={3}
                          value={nagadPublicKey}
                          onChange={e => setNagadPublicKey(e.target.value)}
                          placeholder="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Merchant Private Key *</label>
                        <textarea
                          rows={3}
                          value={nagadPrivateKey}
                          onChange={e => setNagadPrivateKey(e.target.value)}
                          placeholder="MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Limits */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-blue-400 font-medium mb-4">Limits & Currency</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-400">💲</span> Minimum Amount (BDT)
                      </label>
                      <input 
                        type="number" 
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-400">💲</span> Maximum Amount (BDT)
                      </label>
                      <input 
                        type="number" 
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-800 flex gap-4">
                  {gateways.find(g => g.provider === selectedMerchantProvider && g.brand_id === selectedBrandId && g.type === 'merchant')?.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMerchantGateway(selectedBrandId, selectedMerchantProvider)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Gateway
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={handleSaveMerchant}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                  >
                    💾 {isSaving ? 'Saving...' : 'Save Merchant Gateway Credentials'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a2234] border border-slate-800 rounded-xl p-6 relative max-w-3xl">
              <button 
                onClick={() => { setSelectedProvider(null); setSelectedProviders([]); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6 capitalize">
                Setup for <span className="text-blue-400">{brands.find(b => b.id === selectedBrandId)?.name || 'Brand'}</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-blue-400 font-medium mb-3 flex items-center gap-1">
                    <span className="text-lg">📱</span> Apply these numbers to:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mfsProviders.map(provider => {
                      const isChecked = selectedProviders.includes(provider.id);
                      return (
                        <label 
                          key={provider.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-blue-500/10 border-blue-500 text-white' 
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProviders(prev => [...prev, provider.id]);
                              } else {
                                setSelectedProviders(prev => prev.filter(p => p !== provider.id));
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <img src={provider.logoUrl} alt={provider.name} className="h-5 w-5 object-contain" />
                            <span className="font-medium text-sm">{provider.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-blue-400 font-medium mb-1 flex items-center gap-1">
                    <span className="text-lg">🔗</span> Select Brand
                  </label>
                  <select 
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {Array.isArray(brands) && brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-blue-400 font-medium mb-4">Credentials (Personal MFS)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1 font-medium">
                          <span className="text-blue-400">💰</span> Primary Account Number
                        </label>
                        <input 
                          type="text" 
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 01712345678"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <span className="text-blue-400">📱</span> Select App Device (Primary)
                        </label>
                        <select
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Any Device / None</option>
                          {availableDevices.map(dev => (
                            <option key={dev} value={dev}>{dev}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1 font-medium">
                          <span className="text-blue-400">📱</span> Secondary Account Number <span className="text-xs text-slate-500 ml-1">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          value={secondaryAccountNumber}
                          onChange={(e) => setSecondaryAccountNumber(e.target.value)}
                          placeholder="e.g. 01812345678"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <span className="text-blue-400">📱</span> Select App Device (Secondary)
                        </label>
                        <select
                          value={deviceName2}
                          onChange={(e) => setDeviceName2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Any Device / None</option>
                          {availableDevices.map(dev => (
                            <option key={dev} value={dev}>{dev}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Numbers */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="text-blue-400">📱</span> Additional Backup Numbers (Auto-Fallback)
                      </label>
                      <button 
                        type="button"
                        onClick={() => setAdditionalNumbers([...additionalNumbers, { number: '', device_name: '' }])}
                        className="text-xs font-semibold px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        + Add Backup Number
                      </button>
                    </div>

                    {additionalNumbers.length === 0 && (
                      <div className="text-xs text-slate-500 italic p-3 border border-dashed border-slate-800 rounded-lg">
                        No additional backup numbers added yet. Click &quot;+ Add Backup Number&quot; to add more numbers with dedicated device assignment.
                      </div>
                    )}

                    {additionalNumbers.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                            <span>📱</span> Backup Account #{idx + 3}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setAdditionalNumbers(additionalNumbers.filter((_, i) => i !== idx))}
                            className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors border border-red-500/20"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Account Number</label>
                            <input 
                              type="text" 
                              value={item.number}
                              onChange={(e) => {
                                const newArr = [...additionalNumbers];
                                newArr[idx] = { ...newArr[idx], number: e.target.value };
                                setAdditionalNumbers(newArr);
                              }}
                              placeholder="e.g. 01812345678"
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Select App Device</label>
                            <select
                              value={item.device_name}
                              onChange={(e) => {
                                const newArr = [...additionalNumbers];
                                newArr[idx] = { ...newArr[idx], device_name: e.target.value };
                                setAdditionalNumbers(newArr);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Any Device / None</option>
                              {availableDevices.map(dev => (
                                <option key={dev} value={dev}>{dev}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-3">
                    * If a number reaches its limit, the system will automatically route to the next available backup number in sequence. When the limit resets, it starts from the primary number again.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-blue-400 font-medium mb-4">Limits & Fees</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-400">💲</span> Minimum Amount (BDT)
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">BDT</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-400">💲</span> Maximum Amount (BDT)
                      </label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:border-blue-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">BDT</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1 flex items-center gap-1">
                        <span className="text-blue-400">🔄</span> Payment Currency
                      </label>
                      <input 
                        type="text" 
                        value={currency}
                        readOnly
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 opacity-80"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex gap-4">
                    {gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)?.id && (
                      <button
                        onClick={() => handleDeleteGatewayRow(gateways.find(g => g.provider === selectedProvider && g.brand_id === selectedBrandId)!.id, selectedProvider, selectedBrandId!)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                      💾 {isSaving ? 'Saving...' : 'Save Gateway Credentials'}
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
