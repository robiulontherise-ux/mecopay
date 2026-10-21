import { useEffect, useState } from 'react';
import { Loader2, LockKeyhole, Send, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

type Freelancer = { id: string; name: string; portfolio_url: string | null; service_categories: string[] };
type AccessRow = { id: string; member_id: string; resource_key: string; actions: string[]; status: string; requested_at: string };
const pages = [
  { key: 'dashboard', label: 'Dashboard overview' },
  { key: 'payment_links', label: 'Payment Links' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'digital_service', label: 'Digital Service' },
  { key: 'full_cod_service', label: 'Full COD Service' },
  { key: 'courier_service', label: 'Courier Service' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'transaction_analysis', label: 'Transaction Analysis' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'website_builder', label: 'Website Builder' },
  { key: 'custom_domain', label: 'Custom Domain' },
  { key: 'server_side_tracking', label: 'Server Side Tracking' },
  { key: 'email_service', label: 'Email Service' },
  { key: 'web_custom_agent', label: 'Web Custom Agent' },
  { key: 'social_custom_agent', label: 'Social Custom Agent' },
];

export default function ClientDashboardAccess({ userId, brands }: { userId: string; brands: any[] }) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [brandId, setBrandId] = useState('');
  const [freelancerId, setFreelancerId] = useState('');
  const [scope, setScope] = useState<'selected_pages' | 'full_dashboard'>('selected_pages');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [currentAccess, setCurrentAccess] = useState<AccessRow[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId && brands.length) setBrandId(String(brands[0].id));
  }, [brands, brandId]);

  const loadAccess = async () => {
    if (!brandId) { setCurrentAccess([]); return; }
    setLoadingAccess(true);
    const { data, error: accessError } = await supabase
      .from('client_resource_access')
      .select('id,member_id,resource_key,actions,status,requested_at')
      .eq('client_id', userId)
      .eq('brand_id', brandId)
      .eq('resource_type', 'dashboard_page')
      .order('requested_at', { ascending: false });
    if (accessError) {
      console.error('Could not load client dashboard access grants:', accessError);
      showToast(accessError.message || 'Could not load dashboard access status.', 'error');
    } else setCurrentAccess((data || []) as AccessRow[]);
    setLoadingAccess(false);
  };

  useEffect(() => { void loadAccess(); }, [userId, brandId]);

  useEffect(() => {
    let cancelled = false;
    const loadFreelancers = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: directoryError } = await supabase.rpc('list_dashboard_freelancers');
        if (directoryError) throw directoryError;
        const available = (data || []).map((person: any) => ({
          id: person.id,
          name: person.name || 'Approved freelancer',
          portfolio_url: person.portfolio_url || null,
          service_categories: person.service_categories || [],
        }));
        if (!cancelled) {
          setFreelancers(available);
          setFreelancerId(current => available.some(item => item.id === current) ? current : (available[0]?.id || ''));
        }
      } catch (err: any) {
        console.error('Could not load dashboard-capable freelancers:', err);
        if (!cancelled) setError(err?.message || 'Could not load approved freelancers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadFreelancers();
    return () => { cancelled = true; };
  }, [userId]);

  const togglePage = (key: string) => setSelectedPages(current => current.includes(key)
    ? current.filter(item => item !== key)
    : [...current, key]);

  const submit = async () => {
    if (!userId || !brandId || !freelancerId) {
      showToast('Select your brand and an approved dashboard freelancer.', 'error');
      return;
    }
    if (scope === 'selected_pages' && !selectedPages.length) {
      showToast('Select at least one dashboard page, or choose full dashboard.', 'error');
      return;
    }
    setSending(true);
    try {
      const resourceKeys = scope === 'full_dashboard' ? ['*'] : selectedPages;
      const { error: requestError } = await supabase.rpc('request_dashboard_access', {
        p_client_id: userId,
        p_brand_id: brandId,
        p_member_id: freelancerId,
        p_scope: scope,
        p_page_keys: scope === 'selected_pages' ? resourceKeys : [],
      });
      if (requestError) throw requestError;
      showToast('Access request sent. The freelancer must accept before the selected scope becomes active.', 'success');
      setSelectedPages([]);
      await loadAccess();
    } catch (err: any) {
      console.error('Dashboard access request failed:', err);
      showToast(err?.message || 'Could not send the access request. Check table permissions and SQL setup.', 'error');
    } finally {
      setSending(false);
    }
  };

  const revokeAccess = async (id: string) => {
    setRevokingId(id);
    try {
      const { error: revokeError } = await supabase.rpc('revoke_dashboard_access', { p_access_id: id });
      if (revokeError) throw revokeError;
      showToast('Dashboard access revoked.', 'success');
      await loadAccess();
    } catch (err: any) {
      console.error('Could not revoke dashboard access:', err);
      showToast(err?.message || 'Could not revoke access.', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <section className="mt-7 rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-200"><LockKeyhole className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold text-white">Request Client Dashboard Work</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Choose an approved freelancer and grant only the pages needed, or the full dashboard, for this brand. Once accepted, the freelancer works on the client’s existing page data; this selection does not include Tele Sales invoice-field access.</p>
        </div>
      </div>
      {!brands.length && <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200">Create a brand first; dashboard access is scoped to a client brand.</p>}
      {error && <p className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-200">{error}. Ensure the SQL and authenticated-user RLS policies are installed.</p>}
      {loading ? <div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading approved freelancers…</div> : freelancers.length === 0 && !error ? <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">No approved freelancers currently offer Dashboard Work.</p> : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Brand
              <select value={brandId} onChange={event => setBrandId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white" disabled={!brands.length}>
                {brands.map(brand => <option key={brand.id} value={String(brand.id)}>{brand.name || brand.id}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300">Approved freelancer
              <select value={freelancerId} onChange={event => setFreelancerId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white">
                {freelancers.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-200">Page access scope</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300"><input type="radio" checked={scope === 'selected_pages'} onChange={() => setScope('selected_pages')} className="accent-violet-500" /> Selected pages only</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300"><input type="radio" checked={scope === 'full_dashboard'} onChange={() => setScope('full_dashboard')} className="accent-violet-500" /> Full dashboard</label>
            </div>
          </fieldset>
          {scope === 'selected_pages' && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map(page => <label key={page.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={selectedPages.includes(page.key)} onChange={() => togglePage(page.key)} className="accent-violet-500" />{page.label}</label>)}
          </div>}
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3 text-xs leading-5 text-emerald-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Access is limited to the selected brand and accepted page scope. The freelancer’s session remains their own; reads and saves must pass the active page grant. Revoke the grant to stop future access.</div>
          <button onClick={() => void submit()} disabled={sending || !brands.length || loading || !freelancerId} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send access request</button>
        </div>
      )}
      <div className="mt-6 border-t border-slate-800 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-bold text-white">Dashboard Access Requests & Grants</h3><p className="text-xs text-slate-500">Pending requests become active only after the freelancer accepts. You can revoke a pending or active grant at any time.</p></div><button type="button" onClick={() => void loadAccess()} disabled={loadingAccess} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300">{loadingAccess ? 'Loading…' : 'Refresh'}</button></div>
        {loadingAccess ? <p className="text-sm text-slate-400">Loading access records…</p> : currentAccess.length === 0 ? <p className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">No dashboard access requests or grants for this brand.</p> : <div className="space-y-2">{currentAccess.map(row => <article key={row.id} className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-100">{row.resource_key === '*' ? 'Full client dashboard' : pages.find(page => page.key === row.resource_key)?.label || row.resource_key}</p><p className="mt-1 text-xs text-slate-500">Freelancer: {freelancers.find(person => person.id === row.member_id)?.name || 'Approved freelancer'} · {row.status} · {row.actions?.includes('edit') ? 'view + edit' : 'view only'}</p></div>{['requested', 'active'].includes(row.status) && <button type="button" onClick={() => void revokeAccess(row.id)} disabled={revokingId === row.id} className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"><X className="h-3.5 w-3.5" />Revoke</button>}</article>)}</div>}
      </div>
    </section>
  );
}
