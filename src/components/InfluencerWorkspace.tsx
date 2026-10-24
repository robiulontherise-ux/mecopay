import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BadgePercent, CircleDollarSign, Loader2, WalletCards } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

type Profile = { id: string; country: string | null; platform: string | null; profile_url: string | null; status: string; };
type Coupon = { id: string; coupon_code: string; customer_discount_percent: number; commission_percent: number; status: string; };
type Conversion = { order_amount: number; commission_amount: number; order_status: string; payout_status: string; };
type Payout = { approved_amount: number; paid_amount: number; status: string; period_start: string; period_end: string; };

const money = (value: number) => `৳${Number(value || 0).toLocaleString()}`;

export default function InfluencerWorkspace({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase.from('influencer_profiles').select('id,country,platform,profile_url,status').eq('user_id', userId).maybeSingle();
      if (profileError) showToast(profileError.message || 'Could not load influencer profile.', 'error');
      if (!profileData) { if (!cancelled) setLoading(false); return; }
      const [couponResult, conversionResult, payoutResult] = await Promise.all([
        supabase.from('influencer_coupons').select('id,coupon_code,customer_discount_percent,commission_percent,status').eq('influencer_profile_id', profileData.id).order('created_at', { ascending: false }),
        supabase.from('influencer_conversions').select('order_amount,commission_amount,order_status,payout_status').eq('influencer_profile_id', profileData.id).order('created_at', { ascending: false }),
        supabase.from('influencer_payouts').select('approved_amount,paid_amount,status,period_start,period_end').eq('influencer_profile_id', profileData.id).order('period_end', { ascending: false }),
      ]);
      if (!cancelled) {
        setProfile(profileData as Profile);
        setCoupons((couponResult.data || []) as Coupon[]);
        setConversions((conversionResult.data || []) as Conversion[]);
        setPayouts((payoutResult.data || []) as Payout[]);
        if (couponResult.error || conversionResult.error || payoutResult.error) showToast('Some influencer statistics could not be loaded.', 'error');
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const stats = useMemo(() => {
    const successful = conversions.filter(row => row.order_status === 'paid');
    const commission = successful.reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
    const sales = successful.reduce((sum, row) => sum + Number(row.order_amount || 0), 0);
    const paid = conversions.filter(row => row.payout_status === 'paid').reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
    return { uses: conversions.length, orders: successful.length, sales, commission, paid, unpaid: Math.max(commission - paid, 0) };
  }, [conversions]);

  if (loading) return <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading influencer dashboard…</div>;
  if (!profile) return <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200">Your influencer access is enabled, but the profile assignment is not ready yet. Please contact the admin.</div>;

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h2 className="text-2xl font-bold text-white">Influencer Dashboard</h2><p className="mt-1 text-sm text-slate-400">Your assigned coupon performance and payout status.</p></header>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[[BarChart3, 'Coupon uses', stats.uses], [BadgePercent, 'Successful orders', stats.orders], [CircleDollarSign, 'Total sales', money(stats.sales)], [CircleDollarSign, 'Commission earned', money(stats.commission)], [WalletCards, 'Paid', money(stats.paid)], [WalletCards, 'Unpaid', money(stats.unpaid)]].map(([Icon, label, value]: any) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"><Icon className="h-5 w-5 text-fuchsia-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div>)}
    </section>
    <section className="rounded-2xl border border-fuchsia-500/20 bg-slate-950/60 p-5"><h3 className="font-semibold text-white">Assigned profile</h3><div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3"><p>Country: <strong className="text-white">{profile.country || 'Not assigned'}</strong></p><p>Platform: <strong className="text-white">{profile.platform || 'Not assigned'}</strong></p><p>Status: <strong className="text-emerald-300">{profile.status}</strong></p></div>{profile.profile_url && <a className="mt-3 inline-block text-sm text-fuchsia-300" href={profile.profile_url} target="_blank" rel="noreferrer">View assigned profile</a>}</section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="font-semibold text-white">Your coupon codes</h3>{coupons.length === 0 ? <p className="mt-3 text-sm text-slate-500">No coupon has been assigned yet.</p> : <div className="mt-3 grid gap-3 md:grid-cols-2">{coupons.map(coupon => <div key={coupon.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-center justify-between"><strong className="text-lg text-fuchsia-200">{coupon.coupon_code}</strong><span className="text-xs uppercase text-slate-500">{coupon.status}</span></div><p className="mt-2 text-sm text-slate-400">Customer discount: {coupon.customer_discount_percent}% · Your commission: {coupon.commission_percent}%</p></div>)}</div>}</section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="font-semibold text-white">Payout history</h3>{payouts.length === 0 ? <p className="mt-3 text-sm text-slate-500">No payout has been recorded yet.</p> : <div className="mt-3 space-y-2">{payouts.map((payout, index) => <div key={`${payout.period_start}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm"><span className="text-slate-300">{payout.period_start} – {payout.period_end}</span><span className="text-emerald-300">{money(payout.paid_amount)} paid</span><span className="text-slate-400">{payout.status}</span></div>)}</div>}</section>
  </div>;
}
