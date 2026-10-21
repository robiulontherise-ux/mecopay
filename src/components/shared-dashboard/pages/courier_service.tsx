import React from 'react';
import CourierService from '../../payment-hub/CourierService';
import type { SharedDashboardPageContext } from '../types';

export default function CourierServiceSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <CourierService brands={[context.brand]} sharedContext={context} />;
}
