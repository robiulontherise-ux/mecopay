import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';
import { showConfirm } from '../../lib/confirm';
import { CheckCircle2, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';

interface GatewaySettingsProps {
  brands: any[];
}

export default function GatewaySettings({ brands }: GatewaySettingsProps) {
  const [gateways, setGateways] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<'Personal MFS' | 'Merchant' | 'Bangla QR'>('Personal MFS');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

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
        let error;
        
        // Clean and sanitize additional_numbers to store number and device_name
        const sanitizedAdditionalNumbers = additionalNumbers
          .filter(item => item && item.number && item.number.trim() !== '')
          .map(item => ({
            number: item.number.trim(),
            device_name: item.device_name || null
          }));

        const payload = {
          number: accountNumber,
          brand_id: selectedBrandId,
          number_2: secondaryAccountNumber || null,
          additional_numbers: sanitizedAdditionalNumbers,
          min_amount: parseFloat(minAmount) || 1,
          max_amount: parseFloat(maxAmount) || 100000,
          provider: provider,
          device_name: deviceName || null,
          device_name_2: deviceName2 || null
        };

        if (editingId) {
          const { error: updateError } = await supabase
            .from('payment_numbers')
            .update(payload)
            .eq('id', editingId);
          error = updateError;
        } else {
          const { error: insertError } = await supabase
            .from('payment_numbers')
            .insert({
              ...payload,
              user_id: user.id,
              type: 'personal',
              monthly_volume: 0
            });
          error = insertError;
        }

        if (error) {
          console.error(`Error saving ${provider}:`, error);
          throw new Error(`Failed to save ${provider}`);
        }
      }

      showToast("Saved successfully!", "success");
      setSelectedProvider(null);
      setSelectedProviders([]);
      setIsCreating(false);
      setEditingId(null);
      fetchGateways();
    } catch (err: any) {
      console.error("Save gateway error:", err);
      showToast("Failed to save!", 'error');
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
    }
  ];

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
            Showing wallets for all brands.
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
                      const providerObj = mfsProviders.find(p => p.id === gw.provider);
                      const brandObj = brands.find(b => b.id === gw.brand_id);
                      return (
                        <tr key={gw.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white capitalize flex items-center gap-3">
                            {providerObj?.name || gw.provider}
                          </td>
                          <td className="px-6 py-4 text-slate-400">mobile_banking</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                              personal
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                              {(() => {
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
                            <div className="text-slate-400">Account 1:</div>
                            <div className="text-slate-300">
                              {gw.number}
                              {gw.device_name && <span className="ml-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px]">{gw.device_name}</span>}
                            </div>
                            {gw.number_2 && (
                              <>
                                <div className="text-slate-400 mt-1">Account 2:</div>
                                <div className="text-slate-300">
                                  {gw.number_2}
                                  {gw.device_name_2 && <span className="ml-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px]">{gw.device_name_2}</span>}
                                </div>
                              </>
                            )}
                            {Array.isArray(gw.additional_numbers) && gw.additional_numbers.length > 0 && (
                              <div className="text-slate-400 mt-1 text-[11px]">
                                +{gw.additional_numbers.length} Backup Number(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            <div>Min: 1.00</div>
                            <div>Max: 100000.00</div>
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
                              setSelectedProvider(gw.provider);
                              setSelectedProviders([gw.provider]);
                              setSelectedBrandId(gw.brand_id);
                              setAccountNumber(gw.number);
                              setSecondaryAccountNumber(gw.number_2 || '');
                              setDeviceName(gw.device_name || '');
                              setDeviceName2(gw.device_name_2 || '');
                              const parsedAdd = Array.isArray(gw.additional_numbers)
                                ? gw.additional_numbers.map((item: any) =>
                                    typeof item === 'object' && item !== null
                                      ? { number: item.number || '', device_name: item.device_name || '' }
                                      : { number: String(item || ''), device_name: '' }
                                  )
                                : [];
                              setAdditionalNumbers(parsedAdd);
                              if (gw.device_name) setAvailableDevices(prev => Array.from(new Set([...prev, gw.device_name])));
                              if (gw.device_name_2) setAvailableDevices(prev => Array.from(new Set([...prev, gw.device_name_2])));
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
                            <button className="text-red-400 hover:text-red-300 p-2 ml-1" onClick={() => handleDeleteGatewayRow(gw.id, gw.provider, gw.brand_id)}>
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
            onClick={() => { setIsCreating(false); setSelectedProvider(null); setSelectedProviders([]); showToast("Cancelled", "error"); }}
            className="text-slate-400 hover:text-white mb-6 text-sm flex items-center gap-2"
          >
            ← Back to Gateways
          </button>

          {!selectedProvider ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-lg font-bold text-white">Personal MFS</h3>
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
