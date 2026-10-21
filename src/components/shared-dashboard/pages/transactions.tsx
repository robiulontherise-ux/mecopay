import Invoices from '../../payment-hub/Invoices';
import type { SharedDashboardPageContext } from '../types';

/** The current app stores transaction rows in invoices; do not invent a second data source. */
export default function TransactionsSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <Invoices brands={[context.brand]} sharedContext={context} />;
}
