import React from 'react';
import ServerSideTrackingSettings from '../../mysite/ServerSideTrackingSettings';
import type { SharedDashboardPageContext } from '../types';

export default function ServerSideTrackingSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <ServerSideTrackingSettings user={context.user} brands={[context.brand]} sharedContext={context} />;
}
