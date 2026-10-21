import React from 'react';
import EmailServiceSettings from '../../mysite/EmailServiceSettings';
import type { SharedDashboardPageContext } from '../types';

export default function EmailServiceSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <EmailServiceSettings user={context.user} brands={[context.brand]} sharedContext={context} />;
}
