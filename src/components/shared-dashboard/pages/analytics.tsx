import Invoices from '../../payment-hub/Invoices';
import type { SharedDashboardPageContext } from '../types';

/** No separate analytics table exists; this adapter keeps the existing invoice-backed view read-only. */
export default function AnalyticsSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <Invoices brands={[context.brand]} sharedContext={context} readOnly />;
}
