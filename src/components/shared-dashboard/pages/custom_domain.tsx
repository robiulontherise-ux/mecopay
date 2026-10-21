import React from 'react';
import IntegrateCustomDomain from '../../mysite/IntegrateCustomDomain';
import type { SharedDashboardPageContext } from '../types';

export default function CustomDomainSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <IntegrateCustomDomain user={context.user} brands={[context.brand]} sharedContext={context} />;
}
