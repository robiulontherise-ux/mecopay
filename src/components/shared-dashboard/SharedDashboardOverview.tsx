import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SharedDashboardPageContext } from './types';

type OverviewData = {
  gateways: any[];
  webhookCount: number;
  smsForwarderCount: number;
};

export default function SharedDashboardOverview({ context }: { context: SharedDashboardPageContext }) {
  const [data, setData] = useState<OverviewData>({ gateways: [], webhookCount: 0, smsForwarderCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ data: rawContext, error: contextError }, { data: allowed, error: accessError }] = await Promise.all([
          supabase.rpc('get_shared_dashboard_page_context', {
            p_access_id: context.accessId,
            p_page_key: 'dashboard',
          }),
          supabase.rpc('has_dashboard_page_access', {
            p_client_id: context.clientId,
            p_brand_id: context.brandId,
            p_page_key: 'dashboard',
            p_action: 'view',
          }),
        ]);
        if (contextError) throw contextError;
        if (accessError) throw accessError;
        const verified = typeof rawContext === 'string' ? JSON.parse(rawContext) : rawContext;
        if (!verified || verified.access_id !== context.accessId || verified.client_id !== context.clientId || verified.brand_id !== context.brandId || verified.page_key !== 'dashboard' || allowed !== true) {
          throw new Error('The active dashboard grant could not be verified.');
        }

        const [gatewaysResult, webhooksResult, forwardersResult] = await Promise.all([
          supabase.from('payment_numbers')
            .select('id,provider,type,number_1,daily_count,monthly_count')
            .eq('user_id', context.clientId).eq('brand_id', context.brandId),
          supabase.from('webhooks').select('id')
            .eq('user_id', context.clientId).eq('brand_id', context.brandId),
          supabase.from('sms_forwarder_settings').select('device_name')
            .eq('user_id', context.clientId).eq('brand_id', context.brandId),
        ]);
        const queryError = gatewaysResult.error || webhooksResult.error || forwardersResult.error;
        if (queryError) throw queryError;
        if (!cancelled) setData({
          gateways: gatewaysResult.data || [],
          webhookCount: webhooksResult.data?.length || 0,
          smsForwarderCount: forwardersResult.data?.length || 0,
        });
      } catch (loadError: any) {
        if (!cancelled) setError(loadError?.message || 'Could not load the shared dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [context.accessId, context.clientId, context.brandId]);

  if (loading) return <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading the authorized brand overview…</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <div><h3 className="font-semibold text-white">{context.brand.name || 'Client brand'} overview</h3><p className="mt-1 text-sm text-slate-400">Read-only summary for this brand. The current device-status table has no brand_id, so device records are intentionally not shown in a brand-specific grant.</p></div>
      </div>
      <section>
        <h3 className="mb-3 text-lg font-bold text-white">Payment gateways</h3>
        {data.gateways.length === 0 ? <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">No gateway numbers are configured for this brand.</p> : <div className="overflow-x-auto rounded-xl border border-slate-800"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-900 text-xs uppercase text-slate-400"><tr><th className="p-3">Provider</th><th className="p-3">Number</th><th className="p-3 text-right">Daily</th><th className="p-3 text-right">Monthly</th></tr></thead><tbody className="divide-y divide-slate-800">{data.gateways.map((gateway, index) => <tr key={gateway.id || index} className="text-slate-200"><td className="p-3">{gateway.provider || gateway.type || 'Gateway'}</td><td className="p-3 font-mono">{gateway.number_1 || '—'}</td><td className="p-3 text-right">{Number(gateway.daily_count) || 0}</td><td className="p-3 text-right">{Number(gateway.monthly_count) || 0}</td></tr>)}</tbody></table></div>}
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"><p className="text-sm text-slate-400">Webhook endpoints</p><p className="mt-2 text-3xl font-bold text-white">{data.webhookCount}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"><p className="text-sm text-slate-400">SMS forwarder settings</p><p className="mt-2 text-3xl font-bold text-white">{data.smsForwarderCount}</p></div>
      </section>
    </div>
  );
}
