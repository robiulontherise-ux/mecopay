import { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, Eye, Loader2, RefreshCw, ShieldCheck, BriefcaseBusiness } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SharedDashboardPage from './shared-dashboard/SharedDashboardPage';

const statusLabel: Record<string, string> = {
  pending_payment: 'Payment pending — no payment system connected',
  placed: 'New order',
  in_progress: 'In progress',
  delivered: 'Delivered',
  revision_requested: 'Revision requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function FreelancerWorkspace({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<string, { note: string; urls: string }>>({});
  const [openedAccessId, setOpenedAccessId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [ordersResult, accessResult] = await Promise.all([
        supabase
          .from('marketplace_orders')
          .select('id,client_id,brand_id,order_kind,service_category,service_key,title,client_brief,dashboard_scope,requested_page_keys,agreed_price,currency,order_status,due_at,delivery_note,delivery_urls,client_revision_note,created_at')
          .eq('provider_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('client_resource_access')
          .select('id,client_id,brand_id,marketplace_order_id,resource_type,resource_key,actions,status,requested_at,expires_at')
          .eq('member_id', userId)
          .eq('resource_type', 'dashboard_page')
          .in('status', ['requested', 'active'])
          .order('requested_at', { ascending: false }),
      ]);
      if (ordersResult.error) throw ordersResult.error;
      if (accessResult.error) throw accessResult.error;
      setOrders(ordersResult.data || []);
      setAccessRequests(accessResult.data || []);
    } catch (err: any) {
      console.error('Freelancer workspace load failed:', err);
      setError(err?.message || 'Could not load your freelancer work.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(true);
    }, 20_000);
    return () => window.clearInterval(refreshTimer);
  }, [load]);

  const acceptAccess = async (id: string) => {
    setBusyId(id);
    try {
      const { error: updateError } = await supabase.rpc('respond_dashboard_access', {
        p_access_id: id,
        p_accept: true,
      });
      if (updateError) throw updateError;
      await load();
    } catch (err: any) {
      console.error('Dashboard access acceptance failed:', err);
      setError(err?.message || 'Could not accept this access request.');
    } finally {
      setBusyId(null);
    }
  };

  const openGrantedPage = (access: any) => {
    setError('');
    setOpenedAccessId(access.id);
  };

  const updateOrder = async (order: any, nextStatus: string) => {
    const draft = deliveryDrafts[order.id] || { note: '', urls: '' };
    const urls = draft.urls.split(/[\n,]/).map(url => url.trim()).filter(Boolean);
    if (nextStatus === 'delivered') {
      if (!draft.note.trim() && urls.length === 0) {
        setError('Add a delivery note or at least one HTTPS delivery link before marking delivered.');
        return;
      }
      if (urls.some(url => !/^https:\/\//i.test(url))) {
        setError('Delivery links must start with https://.');
        return;
      }
    }
    setBusyId(order.id);
    try {
      const { error: updateError } = await supabase.rpc('transition_marketplace_order', {
        p_order_id: order.id,
        p_next_status: nextStatus,
        p_delivery_note: nextStatus === 'delivered' ? draft.note.trim() || null : null,
        p_delivery_urls: nextStatus === 'delivered' ? urls : [],
      });
      if (updateError) throw updateError;
      await load();
    } catch (err: any) {
      console.error('Freelancer order update failed:', err);
      setError(err?.message || 'Could not update this order.');
    } finally {
      setBusyId(null);
    }
  };

  const accessLabel = (row: any) => row.resource_key === '*'
    ? 'Full client dashboard'
    : `Dashboard page: ${row.resource_key.replaceAll('_', ' ')}`;

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white"><BriefcaseBusiness className="h-6 w-6 text-cyan-300" /> Freelancer Workspace</h2>
          <p className="mt-1 text-sm text-slate-400">Marketplace service requests and client-granted dashboard pages appear here. Each shared page is opened against its accepted client-and-brand grant.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">Could not load freelancer data. {error}. Confirm the SQL objects and authenticated-user RLS policies are installed.</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading work…</div>}

      <section className="space-y-3">
        <div><h3 className="text-lg font-bold text-white">Client Dashboard Access</h3><p className="mt-1 text-sm text-slate-500">Accept a client request to activate only the approved page scope.</p></div>
        {!loading && accessRequests.length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">No client page-access requests yet.</div>}
        {accessRequests.map(row => (
          <article key={row.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {row.status === 'active' ? <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" /> : <Clock3 className="mt-0.5 h-5 w-5 text-amber-300" />}
              <div><p className="font-semibold text-white">{accessLabel(row)}</p><p className="mt-1 text-xs text-slate-500">Brand-scoped access · {row.status} · {row.actions?.includes('edit') ? 'view and edit' : 'view only'}</p></div>
            </div>
            {row.status === 'requested' && <button onClick={() => void acceptAccess(row.id)} disabled={busyId === row.id} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">{busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept access</button>}
            {row.status === 'active' && <button onClick={() => openGrantedPage(row)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-500/10"><Eye className="h-4 w-4" /> Open shared page</button>}
          </article>
        ))}
      </section>

      {openedAccessId && (() => {
        const openedAccess = accessRequests.find(row => row.id === openedAccessId && row.status === 'active');
        return openedAccess ? <SharedDashboardPage
          accessId={openedAccess.id}
          resourceKey={openedAccess.resource_key}
          onClose={() => setOpenedAccessId(null)}
        /> : null;
      })()}

      <section className="space-y-3">
        <div><h3 className="text-lg font-bold text-white">Marketplace Orders</h3><p className="mt-1 text-sm text-slate-500">An order is actionable only after the trusted payment function marks it as placed.</p></div>
        {!loading && orders.length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">No marketplace orders have been assigned to you.</div>}
        {orders.map(order => (
          <article key={order.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-white">{order.title}</h4>
                <p className="text-sm text-slate-400">{order.order_kind.replaceAll('_', ' ')}{order.service_category ? ` · ${order.service_category}` : ''}{Number(order.agreed_price) > 0 ? ` · ${order.currency} ${Number(order.agreed_price).toLocaleString()}` : ''}</p>
                <p className="text-xs text-slate-500">Client: {order.client_id} · Status: {statusLabel[order.order_status] || order.order_status}{order.due_at ? ` · Due ${new Date(order.due_at).toLocaleDateString()}` : ''}</p>
                {order.dashboard_scope !== 'none' && <p className="text-xs text-cyan-200">Access scope: {order.dashboard_scope === 'full_dashboard' ? 'full dashboard' : (order.requested_page_keys || []).join(', ')}</p>}
                {order.client_brief && Object.keys(order.client_brief).length > 0 && <pre className="mt-2 max-w-3xl overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{JSON.stringify(order.client_brief, null, 2)}</pre>}
                {order.client_revision_note && <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100">Client revision request: {order.client_revision_note}</p>}
                {(order.delivery_note || (order.delivery_urls || []).length > 0) && <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><p className="text-sm font-semibold text-emerald-200">Submitted delivery</p>{order.delivery_note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{order.delivery_note}</p>}{(order.delivery_urls || []).map((url: string) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-cyan-300 underline">{url}</a>)}</div>}
              </div>
              <div className="flex shrink-0 gap-2">
                {order.order_status === 'placed' && <button onClick={() => void updateOrder(order, 'in_progress')} disabled={busyId === order.id} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">Start work</button>}
                {['in_progress', 'revision_requested'].includes(order.order_status) && <button onClick={() => void updateOrder(order, 'delivered')} disabled={busyId === order.id} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">Mark delivered</button>}
              </div>
            </div>
            {['in_progress', 'revision_requested'].includes(order.order_status) && <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300 sm:col-span-2">Delivery note<textarea value={deliveryDrafts[order.id]?.note || ''} onChange={event => setDeliveryDrafts(current => ({ ...current, [order.id]: { note: event.target.value, urls: current[order.id]?.urls || '' } }))} maxLength={10000} rows={3} placeholder="Summarize the work and any instructions for the client." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-normal text-white placeholder:text-slate-500" /></label><label className="text-xs font-semibold text-slate-300 sm:col-span-2">Delivery link(s) — HTTPS, one per line<input value={deliveryDrafts[order.id]?.urls || ''} onChange={event => setDeliveryDrafts(current => ({ ...current, [order.id]: { note: current[order.id]?.note || '', urls: event.target.value } }))} placeholder="https://drive.google.com/..." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-normal text-white placeholder:text-slate-500" /></label><p className="text-xs text-slate-500 sm:col-span-2">Use a shareable HTTPS link (for example, Drive/Dropbox) and ensure the client has permission to open it. Direct file upload is not configured.</p></div>}
          </article>
        ))}
      </section>
    </div>
  );
}
