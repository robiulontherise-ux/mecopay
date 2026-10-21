import React from 'react';
import PaymentLinks from '../../payment-hub/PaymentLinks';
import type { SharedDashboardPageContext } from '../types';

export default function PaymentLinksSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <PaymentLinks brands={[context.brand]} sharedContext={context} />;
}
