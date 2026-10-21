import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SharedDashboardPageContext } from './types';
import DashboardPage from './pages/dashboard';
import PaymentLinksPage from './pages/payment_links';
import InvoicesPage from './pages/invoices';
import DigitalServicePage from './pages/digital_service';
import FullCodPage from './pages/full_cod_service';
import CourierPage from './pages/courier_service';
import TransactionsPage from './pages/transactions';
import TransactionAnalysisPage from './pages/transaction_analysis';
import AnalyticsPage from './pages/analytics';
import WebsiteBuilderPage from './pages/website_builder';
import CustomDomainPage from './pages/custom_domain';
import ServerSideTrackingPage from './pages/server_side_tracking';
import EmailServicePage from './pages/email_service';
import WebCustomAgentPage from './pages/web_custom_agent';
import SocialCustomAgentPage from './pages/social_custom_agent';

const pages = [
  { key: 'dashboard', label: 'Dashboard overview', Component: DashboardPage },
  { key: 'payment_links', label: 'Payment Links', Component: PaymentLinksPage },
  { key: 'invoices', label: 'Invoices', Component: InvoicesPage },
  { key: 'digital_service', label: 'Digital Service', Component: DigitalServicePage },
  { key: 'full_cod_service', label: 'Full COD Service', Component: FullCodPage },
  { key: 'courier_service', label: 'Courier Service', Component: CourierPage },
  { key: 'transactions', label: 'Transactions', Component: TransactionsPage },
  { key: 'transaction_analysis', label: 'Transaction Analysis', Component: TransactionAnalysisPage },
  { key: 'analytics', label: 'Analytics', Component: AnalyticsPage },
  { key: 'website_builder', label: 'Website Builder', Component: WebsiteBuilderPage },
  { key: 'custom_domain', label: 'Custom Domain', Component: CustomDomainPage },
  { key: 'server_side_tracking', label: 'Server Side Tracking', Component: ServerSideTrackingPage },
  { key: 'email_service', label: 'Email Service', Component: EmailServicePage },
  { key: 'web_custom_agent', label: 'Web Custom Agent', Component: WebCustomAgentPage },
  { key: 'social_custom_agent', label: 'Social Custom Agent', Component: SocialCustomAgentPage },
] as const;

type SharedDashboardPageProps = {
  accessId: string;
  resourceKey: string;
  onClose: () => void;
};

export default function SharedDashboardPage({ accessId, resourceKey, onClose }: SharedDashboardPageProps) {
  const [selectedPageKey, setSelectedPageKey] = useState(resourceKey === '*' ? '' : resourceKey);
  const [context, setContext] = useState<SharedDashboardPageContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPage = useMemo(() => pages.find(page => page.key === selectedPageKey), [selectedPageKey]);

  useEffect(() => {
    if (!selectedPageKey) {
      setContext(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setContext(null);
    void (async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_shared_dashboard_page_context', {
          p_access_id: accessId,
          p_page_key: selectedPageKey,
        });
        if (cancelled) return;
        if (rpcError) throw rpcError;
        const value = data as any;
        if (!value?.client_id || !value?.brand_id || !value?.brand?.id) {
          throw new Error('The access context did not return a valid client brand.');
        }
        setContext({
          accessId: value.access_id,
          clientId: value.client_id,
          brandId: value.brand_id,
          pageKey: value.page_key,
          actions: Array.isArray(value.actions) ? value.actions : [],
          expiresAt: value.expires_at || null,
          // UI owner identity only. The freelancer JWT remains the authenticated user;
          // database policies/RPCs must validate every read and write against accessId.
          user: { id: value.client_id },
          brand: value.brand,
        });
      } catch (rpcError: any) {
        if (!cancelled) setError(rpcError?.message || 'Could not open this client page.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [accessId, selectedPageKey]);

  const PageComponent = selectedPage?.Component;

  return (
    <section className="space-y-4 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4 sm:p-6">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white"><ShieldCheck className="h-5 w-5 text-cyan-300" />Shared client dashboard</h3>
          <p className="mt-1 text-xs text-slate-400">Only the selected client brand and active grant are available. Changes are saved to the client’s existing data records.</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900"><X className="h-4 w-4" /> Close page</button>
      </header>

      {resourceKey === '*' && <label className="block max-w-sm text-sm font-medium text-slate-300">Dashboard page
        <select value={selectedPageKey} onChange={event => setSelectedPageKey(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white">
          <option value="">Choose a page</option>
          {pages.map(page => <option key={page.key} value={page.key}>{page.label}</option>)}
        </select>
      </label>}

      {error && <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
      {loading && <div className="flex items-center gap-2 py-8 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Verifying client access and loading page…</div>}
      {!loading && !error && !selectedPageKey && resourceKey !== '*' && <p className="text-sm text-amber-200">This grant does not contain a valid page key.</p>}
      {!loading && !error && selectedPageKey && context && PageComponent && <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Brand: <strong className="text-slate-300">{context.brand.name || context.brandId}</strong></span>
          <span>Page: <strong className="text-slate-300">{selectedPage?.label}</strong></span>
          <span>Permission: <strong className="text-slate-300">{context.actions.includes('edit') ? 'view + edit' : 'view only'}</strong></span>
        </div>
        <PageComponent context={context} />
      </div>}
    </section>
  );
}
