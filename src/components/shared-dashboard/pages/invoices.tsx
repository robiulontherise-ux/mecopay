import React from 'react';
import Invoices from '../../payment-hub/Invoices';
import type { SharedDashboardPageContext } from '../types';

export default function InvoicesSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <Invoices brands={[context.brand]} sharedContext={context} />;
}
