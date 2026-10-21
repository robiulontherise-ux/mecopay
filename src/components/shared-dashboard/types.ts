export interface SharedDashboardPageContext {
  accessId: string;
  clientId: string;
  brandId: string;
  /** The single page authorized by this grant, or '*' for a full-dashboard grant. */
  pageKey: string;
  actions: string[];
  expiresAt: string | null;
  user: { id: string; email?: string | null; name?: string | null };
  /** Only page-relevant, non-secret brand fields should be returned by the context RPC. */
  brand: Record<string, any> & { id: string; user_id: string; name?: string | null };
}

export function canEditSharedPage(context: SharedDashboardPageContext): boolean {
  return context.actions.includes('edit');
}
