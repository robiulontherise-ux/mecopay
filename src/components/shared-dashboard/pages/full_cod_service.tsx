import React from 'react';
import FullCodService from '../../payment-hub/FullCodService';
import type { SharedDashboardPageContext } from '../types';

export default function FullCodServiceSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <FullCodService brands={[context.brand]} sharedContext={context} />;
}
