import React from 'react';
import DigitalService from '../../payment-hub/DigitalService';
import type { SharedDashboardPageContext } from '../types';

export default function DigitalServiceSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <DigitalService brands={[context.brand]} sharedContext={context} />;
}
