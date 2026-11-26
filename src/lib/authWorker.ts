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

const REFRESH_SKEW_MS = 60_000;
let refreshTimer: number | null = null;
let refreshInFlight: Promise<AuthWorkerSession | null> | null = null;

async function fetchMotherSession(): Promise<AuthWorkerSession | null> {
  const response = await fetch('/api/auth/get-session', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`AUTH_SESSION_${response.status}`);
  const payload = await response.json() as AuthWorkerSession | null;
  if (!payload?.session || !payload.user?.id) return null;
  return payload;
}

function scheduleMotherRefresh(session: AuthWorkerSession): void {
  if (typeof window === 'undefined') return;
  if (refreshTimer !== null) window.clearTimeout(refreshTimer);
  const expiresAt = Date.parse(session.session.expiresAt);
  if (!Number.isFinite(expiresAt)) return;
  const delay = Math.max(1_000, expiresAt - Date.now() - REFRESH_SKEW_MS);
  refreshTimer = window.setTimeout(() => {
    void refreshAuthWorkerSession({ retryOnFailure: true });
  }, delay);
}

export async function refreshAuthWorkerSession(options: { retryOnFailure?: boolean } = {}): Promise<AuthWorkerSession | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const response = await fetch('/api/auth/session-token', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Origin: window.location.origin, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!response.ok) {
      if (options.retryOnFailure && response.status >= 500) {
        throw new Error(`AUTH_REFRESH_${response.status}`);
      }
      return null;
    }
    const payload = await response.json().catch(() => ({}));
    if (typeof payload?.token !== 'string') return null;
    const session = await fetchMotherSession();
    if (session) scheduleMotherRefresh(session);
    return session;
  })().catch((error) => {
    console.warn('Auth Worker background refresh failed:', error);
    if (options.retryOnFailure && typeof window !== 'undefined') {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        void refreshAuthWorkerSession({ retryOnFailure: true });
      }, 60_000);
    }
    return null;
  }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function getAuthWorkerSession(): Promise<AuthWorkerSession | null> {
  try {
    const session = await fetchMotherSession();
    if (session) {
      scheduleMotherRefresh(session);
      return session;
    }
  } catch (error) {
    // A transient network/server error is not proof of logout; try the refresh source once.
    console.warn('Auth Worker session check failed; attempting refresh:', error);
  }

  const refreshed = await refreshAuthWorkerSession({ retryOnFailure: true });
  if (refreshed) return refreshed;
  return null;
}

export async function signOutAuthWorker(): Promise<void> {
  if (refreshTimer !== null && typeof window !== 'undefined') window.clearTimeout(refreshTimer);
  refreshTimer = null;
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!response.ok) throw new Error('Could not sign out from the Auth Worker. Please try again.');
}

export interface SenderBrandStatus { client_id: string; brand_id: string; brand_name: string; sms_enabled: boolean; sms_country_code: string | null; sim_slot: number | null; is_connected: boolean; }
export async function getSenderBrandStatuses(): Promise<SenderBrandStatus[]> {
  const tokenResponse = await fetch('/api/auth/session-token', { method: 'POST', credentials: 'same-origin', headers: { Origin: window.location.origin, Accept: 'application/json', 'Content-Type': 'application/json' }, body: '{}' });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof token?.token !== 'string') return [];
  const response = await fetch('/api/auth/mobile/sender-brands', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json', Authorization: `Bearer ${token.token}` } });
  if (!response.ok) throw new Error('Could not load SMS sender status.');
  const payload = await response.json() as { brands?: SenderBrandStatus[] };
  return Array.isArray(payload.brands) ? payload.brands : [];
}
