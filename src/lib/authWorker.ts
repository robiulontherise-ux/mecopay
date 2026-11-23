export interface AuthWorkerUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  user_metadata?: Record<string, any>;
}

export interface AuthWorkerSession {
  session: {
    id: string;
    expiresAt: string;
    [key: string]: unknown;
  };
  user: AuthWorkerUser;
}

export async function getAuthWorkerSession(): Promise<AuthWorkerSession | null> {
  const response = await fetch('/api/auth/get-session', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Could not check the Auth Worker session.');

  const payload = await response.json() as AuthWorkerSession | null;
  if (!payload?.session || !payload.user?.id) return null;
  return payload;
}

export async function signOutAuthWorker(): Promise<void> {
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!response.ok) throw new Error('Could not sign out from the Auth Worker. Please try again.');
}

export interface SenderBrandStatus { client_id: string; brand_id: string; brand_name: string; sms_enabled: boolean; sms_country_code: string | null; sms_local_prefix: string | null; sim_slot: number | null; is_connected: boolean; }
export async function getSenderBrandStatuses(): Promise<SenderBrandStatus[]> {
  const tokenResponse = await fetch('/api/auth/session-token', { method: 'POST', credentials: 'same-origin', headers: { Origin: window.location.origin, Accept: 'application/json', 'Content-Type': 'application/json' }, body: '{}' });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof token?.token !== 'string') return [];
  const response = await fetch('/api/auth/mobile/sender-brands', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json', Authorization: `Bearer ${token.token}` } });
  if (!response.ok) throw new Error('Could not load SMS sender status.');
  const payload = await response.json() as { brands?: SenderBrandStatus[] };
  return Array.isArray(payload.brands) ? payload.brands : [];
}
