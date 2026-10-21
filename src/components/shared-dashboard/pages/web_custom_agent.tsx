import React from 'react';
import WebCustomAgent from '../../mysite/WebCustomAgent';
import type { SharedDashboardPageContext } from '../types';

export default function WebCustomAgentSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <WebCustomAgent user={context.user} brands={[context.brand]} sharedContext={context} />;
}
