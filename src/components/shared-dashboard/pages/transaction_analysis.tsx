import React from 'react';
import Invoices from '../../payment-hub/Invoices';
import type { SharedDashboardPageContext } from '../types';

/**
 * Transaction Analysis has no separate transaction/analysis table in the app.
 * Its existing data capability is the invoice-backed transaction table, so keep
 * the shared page honest by rendering that table with only the authorized brand.
 */
export default function TransactionAnalysisSharedPage({
  context,
}: {
  context: SharedDashboardPageContext;
}) {
  return <Invoices brands={[context.brand]} sharedContext={context} />;
}
