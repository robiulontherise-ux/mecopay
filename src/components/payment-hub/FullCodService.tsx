import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Globe,
  Truck,
  CreditCard,
  Calendar,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';
import type { SharedDashboardPageContext } from '../shared-dashboard/types';

interface FullCodServiceProps {
  brands?: any[];
  user?: any;
  sharedContext?: SharedDashboardPageContext;
}

export default function FullCodService({ brands = [], user, sharedContext }: FullCodServiceProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [fullCodActive, setFullCodActive] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [brandData, setBrandData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isSharedReadOnly = Boolean(sharedContext && !sharedContext.actions.includes('edit'));

  useEffect(() => {
    if (sharedContext) {
      setSelectedBrandId(sharedContext.brandId);
      return;
    }
    if (brands && brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId, sharedContext?.brandId]);

  useEffect(() => {
    if (!selectedBrandId) return;
    void loadBrandDetails();
  }, [selectedBrandId, sharedContext?.clientId, sharedContext?.brandId, sharedContext?.pageKey]);

  const verifySharedAccess = async (action: 'view' | 'edit') => {
    if (!sharedContext) return;
    if (!['full_cod_service', '*'].includes(sharedContext.pageKey)) {
      throw new Error('This shared access grant is not valid for Full COD Service.');
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Authentication required.');
    const { data: allowed, error } = await supabase.rpc('has_dashboard_page_access', {
      p_client_id: sharedContext.clientId,
      p_brand_id: sharedContext.brandId,
      p_page_key: 'full_cod_service',
      p_action: action,
    });
    if (error) throw error;
    if (allowed !== true) throw new Error(`Active shared ${action} access for Full COD Service was not verified.`);
  };

  const loadBrandDetails = async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    setErrorMessage('');
    try {
      await verifySharedAccess('view');
      const ownerId = sharedContext?.clientId;
      let brandQuery = supabase
        .from('brands')
        .select('id, user_id, name, full_cod_active, full_cod_expires_at, personal_api, merchant_api, international_api, auto_courier_on_full_cod, auto_courier_on_advance')
        .eq('id', selectedBrandId);
      if (ownerId) brandQuery = brandQuery.eq('user_id', ownerId);
      const { data: brand, error: brandError } = await brandQuery.maybeSingle();
      if (brandError) throw brandError;
      if (!brand) {
        throw new Error('The granted brand could not be loaded for this client.');
      }
      if (brand) {
        setBrandData(brand);
        setFullCodActive(Boolean(brand.full_cod_active));
        setExpiresAt(brand.full_cod_expires_at || null);
      }
    } catch (err: any) {
      console.error('Error loading brand details:', err);
      setBrandData(null);
      setErrorMessage(err?.message || 'Failed to load Full COD service details.');
      showToast(err?.message || 'Failed to load Full COD service details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentBrand = brandData || brands.find(b => b.id === selectedBrandId);

  // Check if any payment gateway is ON:
  const hasPaymentGateway = Boolean(
    currentBrand?.personal_api ||
    currentBrand?.merchant_api ||
    currentBrand?.international_api
  );

  // Check if any courier service is ON:
  const hasCourierActive = Boolean(
    currentBrand?.auto_courier_on_full_cod ||
    currentBrand?.auto_courier_on_advance
  );

  // If either gateway or courier is active, Full COD order receiving is 100% FREE!
  const isFullCodFree = hasPaymentGateway || hasCourierActive;

  const handleToggleFullCod = async () => {
    if (isSharedReadOnly) {
      showToast('This shared Full COD Service page is view-only.', 'error');
      return;
    }
    if (!selectedBrandId) return;
    setToggling(true);
    setErrorMessage('');
    try {
      await verifySharedAccess('edit');
      const nextVal = !fullCodActive;
      const updatePayload = sharedContext
        ? { full_cod_active: nextVal, user_id: sharedContext.clientId }
        : { full_cod_active: nextVal };

      let updateQuery = supabase
        .from('brands')
        .update(updatePayload)
        .eq('id', selectedBrandId);
      if (sharedContext) updateQuery = updateQuery.eq('user_id', sharedContext.clientId);
      const { data: updatedRows, error } = await updateQuery.select('id');

      if (error) throw error;
      if (!updatedRows?.length) throw new Error('No matching client brand was updated.');

      setFullCodActive(nextVal);
      if (currentBrand) {
        currentBrand.full_cod_active = nextVal;
      }

      // Shared grants cannot be verified by this side-effecting function, so do
      // not invoke it in shared mode. Normal merchant behavior is preserved.
      if (!sharedContext) {
        supabase.functions.invoke('cloudflare-custom-hostname', {
          body: { action: 'sync_brand', brand_id: selectedBrandId }
        }).catch(err => console.warn('Edge KV sync error:', err));
      }

      showToast(
        nextVal
          ? 'Full COD Service activated!'
          : 'Full COD Service deactivated.',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to update Full COD service.');
      showToast('Failed to update Full COD service: ' + (err?.message || ''), 'error');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Full COD Service (Cash on Delivery)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            ওয়েবসাইট ফর্ম বা API দিয়ে ১০০% ক্যাশ অন ডেলিভারি (COD) অর্ডার গ্রহণ ও ডাটাবেস ইনভয়েস ম্যানেজমেন্ট সার্ভিস।
          </p>
        </div>

        {brands && brands.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
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

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Main Service Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-white">
                Standalone 100% Full COD Service
              </h3>
              {isFullCodFree ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  FREE FOR YOU (INCLUDED)
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  fullCodActive
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {fullCodActive ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              যেসব মার্চেন্ট কোনো পেমেন্ট গেটওয়ে বা অটো কুরিয়ার ব্যবহার না করে শুধুমাত্র ওয়েবসাইট/ল্যান্ডিং পেজের ফর্ম দিয়ে ১০০% Cash on Delivery (COD) অর্ডার ইনভয়েসে নিতে চান (যেমন: এশিয়া বা আফ্রিকার ফর্ম-অনলি মার্কেট), তাদের জন্য এই সার্ভিস।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {isFullCodFree && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফ্রি সুবিধা সংযুক্ত</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleFullCod}
              disabled={toggling || loading || isSharedReadOnly}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 shadow-lg ${
                fullCodActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {toggling ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span className={`w-2.5 h-2.5 rounded-full ${fullCodActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              )}
              {fullCodActive ? 'Full COD: ON' : 'Full COD: OFF'}
            </button>
          </div>
        </div>

        {/* Status & Information Banner */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3.5 ${
          isFullCodFree
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
        }`}>
          <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isFullCodFree ? 'text-emerald-400' : 'text-indigo-400'}`} />
          <div className="space-y-1">
            <strong className={`text-sm block ${isFullCodFree ? 'text-emerald-200' : 'text-white'}`}>
              {isFullCodFree ? 'আপনার জন্য এই সার্ভিসটি কেন সম্পূর্ণ ফ্রি?' : 'সার্ভিসের নিয়ম ও শর্তাবলী:'}
            </strong>
            <p className="leading-relaxed text-slate-300">
              যেকোনো ১টি পেমেন্ট গেটওয়ে (Personal MFS, Merchant Gateway, International Gateway) অথবা কুরিয়ার সার্ভিস (Advance Pay বা Full COD Auto Courier) চালু থাকলে এই সার্ভিসটি আপনার জন্য সম্পূর্ণ ফ্রি! আপনার ক্ষেত্রে আলাদা সাবস্ক্রিপশন কেনার প্রয়োজন নেই। আর যাদের কোনো গেটওয়ে বা কুরিয়ার সার্ভিস নেই, তাদের কেবল ওয়েবসাইট ফর্মের মাধ্যমে ফুল সিওডি অর্ডার ইনভয়েসে নিতে এই সার্ভিসটি চালু রাখতে হবে।
            </p>
          </div>
        </div>

        {/* Expiry & Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              Payment Gateways
            </span>
            <p className="text-sm font-bold text-white">
              {hasPaymentGateway ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Gateway Found
                </span>
              ) : (
                <span className="text-slate-400">None Connected</span>
              )}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              Courier Automation
            </span>
            <p className="text-sm font-bold text-white">
              {hasCourierActive ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Courier Service
                </span>
              ) : (
                <span className="text-slate-400">Not Configured</span>
              )}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Subscription Validity
            </span>
            <p className="text-sm font-bold text-white">
              {isFullCodFree ? (
                <span className="text-emerald-400 font-semibold">Lifetime (Included)</span>
              ) : fullCodActive && expiresAt ? (
                <span className="text-indigo-300 font-semibold">
                  Valid until {new Date(expiresAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-slate-500">Inactive</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
