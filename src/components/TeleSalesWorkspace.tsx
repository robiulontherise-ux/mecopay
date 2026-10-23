import { useCallback, useEffect, useState } from 'react';
import { Clock3, Loader2, Phone, RefreshCw, Save, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

const labels: Record<string, string> = {
  invoice_number: 'Invoice number',
  product_name: 'Product',
  product_type: 'Product type',
  customer_name: 'Customer',
  customer_phone: 'Phone',
  customer_email: 'Email',
  customer_address: 'Address',
  amount: 'Amount',
  total_amount: 'Total amount',
  product_price: 'Product price',
  status: 'Invoice status',
  created_at: 'Invoice date',
};
const fieldOrder = Object.keys(labels);
const callStatuses = [
  ['no_answer', 'No answer'],
  ['connected', 'Connected'],
  ['interested', 'Interested'],
  ['not_interested', 'Not interested'],
  ['follow_up', 'Follow-up needed'],
  ['converted', 'Converted'],
  ['wrong_number', 'Wrong number'],
] as const;

type CallLog = { id: string; member_name: string | null; call_status: string; call_note: string | null; follow_up_at: string | null; called_at: string };

function formatValue(key: string, value: any) {
  if (key === 'created_at') return new Date(value).toLocaleString();
  if (['amount', 'total_amount', 'product_price'].includes(key)) return value == null ? '' : Number(value).toLocaleString();
  return String(value ?? '');
}

function TeleSalesInvoiceCard({ invoice }: { invoice: any }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [callStatus, setCallStatus] = useState('no_answer');
  const [callNote, setCallNote] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase.rpc('list_tele_sales_call_logs', { p_invoice_id: invoice.invoice_id });
      if (error) throw error;
      setLogs((data || []) as CallLog[]);
    } catch (error: any) {
      console.error('Could not load call history:', error);
      showToast(error?.message || 'Could not load call history.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  }, [invoice.invoice_id]);

  useEffect(() => { if (historyOpen) void loadLogs(); }, [historyOpen, loadLogs]);

  const saveCall = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('record_tele_sales_call', {
        p_invoice_id: invoice.invoice_id,
        p_call_status: callStatus,
        p_call_note: callNote.trim() || null,
        p_follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
      });
      if (error) throw error;
      showToast('Call outcome saved.', 'success');
      setCallNote('');
      setFollowUpAt('');
      await loadLogs();
      setHistoryOpen(true);
    } catch (error: any) {
      console.error('Could not save call outcome:', error);
      showToast(error?.message || 'Could not save call outcome.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const visibleFields = fieldOrder.filter(key => invoice[key] !== undefined && invoice[key] !== null && invoice[key] !== '');

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFields.map(key => <div key={key} className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{labels[key]}</p><p className="mt-1 break-words text-sm font-medium text-slate-100">{formatValue(key, invoice[key])}</p></div>)}
          {visibleFields.length === 0 && <p className="text-sm text-slate-400">No permitted invoice fields are currently available.</p>}
        </div>
        <button type="button" onClick={() => setHistoryOpen(value => !value)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"><History className="h-4 w-4" />{historyOpen ? 'Hide call history' : 'Call history'}</button>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-800 pt-4 md:grid-cols-[1fr_1.5fr_1fr_auto] md:items-end">
        <label className="text-xs text-slate-400">Call outcome
          <select value={callStatus} onChange={event => setCallStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">{callStatuses.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        </label>
        <label className="text-xs text-slate-400">Call note (optional)
          <input value={callNote} onChange={event => setCallNote(event.target.value)} maxLength={1500} placeholder="Brief outcome or note" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Follow-up time (optional)
          <input type="datetime-local" value={followUpAt} onChange={event => setFollowUpAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        </label>
        <button type="button" onClick={() => void saveCall()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save call</button>
      </div>

      {historyOpen && <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold text-white">Call history</h3><p className="text-xs text-slate-500">Activity notes only; calls are not recorded.</p></div><button type="button" onClick={() => void loadLogs()} disabled={loadingLogs} className="rounded-lg border border-slate-700 p-2 text-slate-300"><RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} /></button></div>
        {loadingLogs ? <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading history…</div> : logs.length === 0 ? <p className="text-sm text-slate-500">No calls logged yet.</p> : <div className="space-y-2">{logs.map(log => <div key={log.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"><div className="flex flex-wrap items-center gap-2 text-sm"><Phone className="h-3.5 w-3.5 text-cyan-300" /><span className="font-semibold text-slate-200">{callStatuses.find(([key]) => key === log.call_status)?.[1] || log.call_status}</span><span className="text-xs text-slate-500">by {log.member_name || 'team member'} · {new Date(log.called_at).toLocaleString()}</span></div>{log.call_note && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{log.call_note}</p>}{log.follow_up_at && <p className="mt-2 flex items-center gap-1 text-xs text-amber-200"><Clock3 className="h-3.5 w-3.5" />Follow up: {new Date(log.follow_up_at).toLocaleString()}</p>}</div>)}</div>}
      </div>}
    </article>
  );
}

export default function TeleSalesWorkspace() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessActive, setAccessActive] = useState<boolean | null>(null);

  const loadInvoices = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const { data: hasAccess, error: accessError } = await supabase.rpc('has_tele_sales_access');
      if (accessError) throw accessError;
      setAccessActive(hasAccess === true);
      if (hasAccess !== true) {
        setInvoices([]);
        return;
      }

      const { data, error: queryError } = await supabase.rpc('get_tele_sales_invoices');
      if (queryError) throw queryError;
      setInvoices((data || []).map((row: any) => row.invoice_data).filter(Boolean));
    } catch (error: any) {
      console.error('Could not load permitted Tele Sales invoices:', error);
      setError(error?.message || 'Could not load invoices.');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'hidden') void loadInvoices(true);
    };
    void loadInvoices();
    window.addEventListener('focus', refreshIfVisible);
    const timer = window.setInterval(refreshIfVisible, 15000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshIfVisible);
    };
  }, [loadInvoices]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="flex items-center gap-2 text-2xl font-bold text-white"><Phone className="h-6 w-6 text-cyan-300" /> Tele Sales</h2><p className="mt-1 text-sm text-slate-400">Only invoices and fields granted by each client are returned here. Call outcomes and follow-ups are logged for the client’s review.</p></div>
        <button type="button" onClick={() => void loadInvoices()} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
      </header>
      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}. Run the supplied SQL migration and confirm your access is active.</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading assigned invoices…</div>}
      {!loading && !error && accessActive === false && <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">Tele Sales access is no longer active.</div>}
      {!loading && !error && accessActive !== false && invoices.length === 0 && <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">No invoices are currently assigned to your Tele Sales access.</div>}
      <div className="space-y-4">{invoices.map(invoice => <TeleSalesInvoiceCard key={invoice.invoice_id} invoice={invoice} />)}</div>
    </div>
  );
}
