import { useEffect, useState } from 'react';
import { History, Loader2, RefreshCw, ShieldCheck, UserPlus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

const fields = [
  ['invoice_number', 'Invoice number'],
  ['product_name', 'Product name'],
  ['product_type', 'Product type (physical/digital)'],
  ['customer_name', 'Customer name'],
  ['customer_phone', 'Customer phone'],
  ['customer_email', 'Customer email'],
  ['customer_address', 'Customer address'],
  ['amount', 'Amount'],
  ['total_amount', 'Total amount'],
  ['product_price', 'Product price'],
  ['status', 'Invoice status'],
  ['created_at', 'Invoice date'],
] as const;

type AccessRow = {
  access_id: string;
  member_id: string;
  member_name: string | null;
  member_email: string | null;
  field_key: string;
  access_status: string;
  granted_at: string | null;
};
type CallLogRow = { id: string; member_name: string | null; call_status: string; call_note: string | null; follow_up_at: string | null; called_at: string };

export default function TeleSalesAccessPanel({ brands, userId }: { brands: any[]; userId: string }) {
  const [brandId, setBrandId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogRow[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!brandId && brands.length) setBrandId(String(brands[0].id));
  }, [brands, brandId]);

  useEffect(() => {
    let cancelled = false;
    const loadInvoices = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('invoices')
        .select('id,brand_id,invoice_number,product_name,customer_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(250);
      if (error) {
        console.error('Could not load invoices for Tele Sales history:', error);
        if (!cancelled) showToast(error.message || 'Could not load invoices for call history.', 'error');
      } else if (!cancelled) setInvoices(data || []);
    };
    void loadInvoices();
    return () => { cancelled = true; };
  }, [userId]);

  const loadAccess = async () => {
    if (!brandId) { setRows([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('list_tele_sales_access', { p_brand_id: brandId });
      if (error) throw error;
      setRows((data || []) as AccessRow[]);
    } catch (error: any) {
      console.error('Could not load Tele Sales access:', error);
      showToast(error?.message || 'Could not load Tele Sales access. Run the supplied access SQL first.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) void loadAccess();
  }, [brandId]);

  useEffect(() => {
    const eligibleInvoices = invoices.filter(invoice => !brandId || String(invoice.brand_id) === brandId);
    if (!eligibleInvoices.some(invoice => String(invoice.id) === selectedInvoiceId)) {
      setSelectedInvoiceId(eligibleInvoices[0] ? String(eligibleInvoices[0].id) : '');
    }
  }, [invoices, brandId, selectedInvoiceId]);

  const loadCallLogs = async () => {
    if (!selectedInvoiceId) { setCallLogs([]); return; }
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase.rpc('list_tele_sales_call_logs', { p_invoice_id: selectedInvoiceId });
      if (error) throw error;
      setCallLogs((data || []) as CallLogRow[]);
    } catch (error: any) {
      console.error('Could not load client Tele Sales history:', error);
      showToast(error?.message || 'Could not load Tele Sales call history.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (selectedInvoiceId) void loadCallLogs();
  }, [selectedInvoiceId]);

  const toggleField = (key: string) => setSelectedFields(current => current.includes(key)
    ? current.filter(field => field !== key)
    : [...current, key]);

  const grant = async () => {
    if (!brandId || !memberEmail.trim() || !selectedFields.length) {
      showToast('Choose a brand, enter a teammate account email, and select at least one field.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.rpc('grant_tele_sales_invoice_access', {
        p_brand_id: brandId,
        p_member_email: memberEmail.trim(),
        p_field_keys: selectedFields,
      });
      if (error) throw error;
      setMemberEmail('');
      setSelectedFields([]);
      showToast('Selected invoice fields are now available to this teammate.', 'success');
      await loadAccess();
    } catch (error: any) {
      console.error('Could not grant Tele Sales access:', error);
      showToast(error?.message || 'Could not grant access. Ask the teammate to sign in once with this email, then try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (accessId: string) => {
    setRevokingId(accessId);
    try {
      const { error } = await supabase.rpc('revoke_tele_sales_invoice_access', { p_access_id: accessId });
      if (error) throw error;
      showToast('Invoice field access revoked.', 'success');
      await loadAccess();
    } catch (error: any) {
      console.error('Could not revoke Tele Sales access:', error);
      showToast(error?.message || 'Could not revoke access.', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const fieldLabel = (key: string) => fields.find(([id]) => id === key)?.[1] || key;
  const activeRows = rows.filter(row => row.access_status === 'active');
  const grouped = new Map<string, { name: string; email: string; fields: AccessRow[] }>();
  for (const row of activeRows) {
    const group = grouped.get(row.member_id) || { name: row.member_name || 'Teammate', email: row.member_email || '', fields: [] };
    group.fields.push(row);
    grouped.set(row.member_id, group);
  }

  return (
    <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-5 sm:p-6">
      <header className="flex items-center gap-3">
        <span className="flex items-center gap-3">
          <span className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-200"><ShieldCheck className="h-5 w-5" /></span>
          <span><span className="block text-lg font-bold text-white">Tele Sales Access</span><span className="mt-1 block text-sm text-slate-400">Usage: enter a teammate's email after they have logged in once, choose the invoice fields they may use, then review call outcomes and follow-ups. Merchant verification is not required.</span></span>
        </span>
      </header>

      <div className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">Brand
            <select value={brandId} onChange={event => setBrandId(event.target.value)} disabled={!brands.length} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white">
              {brands.map(brand => <option key={brand.id} value={String(brand.id)}>{brand.name || brand.id}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-300">Teammate account email
            <input type="email" value={memberEmail} onChange={event => setMemberEmail(event.target.value)} placeholder="teammate@example.com" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" />
          </label>
        </div>
        {!brands.length && <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200">Create a brand before granting invoice access.</p>}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">Allowed invoice fields</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([key, label]) => <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={selectedFields.includes(key)} onChange={() => toggleField(key)} className="accent-cyan-500" />{label}</label>)}
          </div>
          <p className="mt-2 text-xs text-slate-500">Transaction IDs, gateway numbers, passcodes and raw metadata are never exposed by this view.</p>
        </div>
        <button type="button" onClick={() => void grant()} disabled={saving || !brands.length} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Grant selected fields</button>

        <div className="border-t border-slate-800 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-bold text-white">Active Tele Sales Teammates</h3><p className="text-xs text-slate-500">Revoking a field takes effect immediately in the Tele Sales view.</p></div><button type="button" onClick={() => void loadAccess()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div>
          {loading ? <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading access…</div> : grouped.size === 0 ? <p className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">No active Tele Sales grants for this brand.</p> : <div className="space-y-3">{Array.from(grouped.entries()).map(([memberId, member]) => <article key={memberId} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><div className="mb-3"><p className="font-semibold text-white">{member.name}</p><p className="text-xs text-slate-500">{member.email}</p></div><div className="flex flex-wrap gap-2">{member.fields.map(row => <span key={row.access_id} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-100">{fieldLabel(row.field_key)}<button type="button" aria-label={`Revoke ${fieldLabel(row.field_key)}`} onClick={() => void revoke(row.access_id)} disabled={revokingId === row.access_id} className="text-rose-300 hover:text-rose-200 disabled:opacity-50">{revokingId === row.access_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}</button></span>)}</div></article>)}</div>}
        </div>

        <div className="border-t border-slate-800 pt-5">
          <div className="mb-3 flex items-center gap-2"><History className="h-4 w-4 text-cyan-300" /><div><h3 className="font-bold text-white">Tele Sales Call History</h3><p className="text-xs text-slate-500">Review outcomes and follow-ups saved by your teammates.</p></div></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm text-slate-300">Invoice
              <select value={selectedInvoiceId} onChange={event => setSelectedInvoiceId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white">
                <option value="">Choose invoice</option>
                {invoices.filter(invoice => !brandId || String(invoice.brand_id) === brandId).map(invoice => <option key={invoice.id} value={String(invoice.id)}>{invoice.invoice_number || invoice.id} · {invoice.product_name || invoice.customer_name || 'Invoice'}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => void loadCallLogs()} disabled={loadingLogs || !selectedInvoiceId} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300"><RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />Refresh history</button>
          </div>
          {loadingLogs ? <div className="mt-3 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading call history…</div> : callLogs.length === 0 ? <p className="mt-3 text-sm text-slate-500">No call history for this invoice.</p> : <div className="mt-3 space-y-2">{callLogs.map(log => <article key={log.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"><p className="text-sm font-semibold text-slate-200">{log.call_status.replaceAll('_', ' ')} <span className="font-normal text-slate-500">by {log.member_name || 'teammate'} · {new Date(log.called_at).toLocaleString()}</span></p>{log.call_note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{log.call_note}</p>}{log.follow_up_at && <p className="mt-1 text-xs text-amber-200">Follow-up: {new Date(log.follow_up_at).toLocaleString()}</p>}</article>)}</div>}
        </div>
      </div>
    </section>
  );
}
