import React from 'react';
import WebsiteBuilderHub from '../../WebsiteBuilderHub';
import type { SharedDashboardPageContext } from '../types';

export default function WebsiteBuilderSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <WebsiteBuilderHub user={context.user} brands={[context.brand]} sharedContext={context} />;
}
