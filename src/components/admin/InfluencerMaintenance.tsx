import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Plus, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

type Row = { id: string; user_id: string; country: string | null; platform: string | null; profile_url: string | null; status: string; profiles?: { email: string | null; name: string | null } | { email: string | null; name: string | null }[] | null };

export default function InfluencerMaintenance() {
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [platform, setPlatform] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState('5');
  const [commission, setCommission] = useState('10');
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('influencer_profiles').select('id,user_id,country,platform,profile_url,status,profiles(email,name)').order('created_at', { ascending: false });
    if (error) showToast(error.message || 'Could not load influencers.', 'error');
    else setRows((data || []) as Row[]);
  };
  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return showToast('Enter the user email.', 'error');
    setBusy(true);
    try {
      const { data: profile, error } = await supabase.rpc('admin_set_influencer', { p_email: email.trim(), p_enabled: true }).single();
      if (error) throw error;
      const influencer = profile as unknown as { id: string };
      const { data: assignment, error: assignmentError } = await supabase.from('influencer_profiles').update({ country: country.trim() || null, platform: platform.trim() || null, profile_url: profileUrl.trim() || null, status: 'active', updated_at: new Date().toISOString() }).eq('user_id', influencer.id).select('id').single();
      if (assignmentError) throw assignmentError;
      if (couponCode.trim()) {
        const { error: couponError } = await supabase.from('influencer_coupons').insert({ influencer_profile_id: assignment.id, coupon_code: couponCode.trim(), customer_discount_percent: Number(discount) || 0, commission_percent: Number(commission) || 0, status: 'active' });
        if (couponError) throw couponError;
      }
      showToast('Influencer access and assignment saved.', 'success');
      setEmail(''); setCountry(''); setPlatform(''); setProfileUrl(''); setCouponCode('');
      await load();
    } catch (error: any) { showToast(error?.message || 'Could not assign influencer.', 'error'); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-6xl space-y-6">
    <header><h2 className="flex items-center gap-2 text-2xl font-bold text-white"><ShieldCheck className="h-6 w-6 text-fuchsia-300" />Influencer Maintenance</h2><p className="mt-1 text-sm text-slate-400">Enable an existing profile by email, assign its market and optionally create its coupon.</p></header>
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-fuchsia-500/20 bg-slate-950/60 p-5 sm:grid-cols-2">
      <label className="text-sm text-slate-300 sm:col-span-2">User email<input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="influencer@example.com" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label>
      <label className="text-sm text-slate-300">Country<input value={country} onChange={e => setCountry(e.target.value)} placeholder="Bangladesh" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label>
      <label className="text-sm text-slate-300">Platform<input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="YouTube / Facebook" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label>
      <label className="text-sm text-slate-300 sm:col-span-2">Profile URL<input value={profileUrl} onChange={e => setProfileUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label>
      <div className="sm:col-span-2 border-t border-slate-800 pt-4"><p className="mb-3 text-sm font-semibold text-white">Optional initial coupon</p><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm text-slate-300">Code<input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="BD-PARTNER" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label><label className="text-sm text-slate-300">Customer discount %<input value={discount} onChange={e => setDiscount(e.target.value)} type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label><label className="text-sm text-slate-300">Commission %<input value={commission} onChange={e => setCommission(e.target.value)} type="number" min="0" max="100" step="0.01" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" /></label></div></div>
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2.5 font-bold text-white disabled:opacity-50 sm:col-span-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Enable influencer</button>
    </form>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="font-semibold text-white">Assigned influencers</h3>{rows.length === 0 ? <p className="mt-3 text-sm text-slate-500">No influencer assignments yet.</p> : <div className="mt-3 space-y-2">{rows.map(row => { const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles; return <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm"><span className="text-white">{profile?.name || profile?.email || row.user_id}</span><span className="text-slate-400">{row.country || 'No country'} · {row.platform || 'No platform'}</span><span className="text-emerald-300">{row.status}</span></div>; })}</div>}</section>
  </div>;
}
