import React from 'react';
import SocialCustomAgent from '../../mysite/SocialCustomAgent';
import type { SharedDashboardPageContext } from '../types';

export default function SocialCustomAgentSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <SocialCustomAgent user={context.user} brands={[context.brand]} sharedContext={context} />;
}
