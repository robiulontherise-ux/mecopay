import SharedDashboardOverview from '../SharedDashboardOverview';
import type { SharedDashboardPageContext } from '../types';

export default function DashboardSharedPage({ context }: { context: SharedDashboardPageContext }) {
  return <SharedDashboardOverview context={context} />;
}
