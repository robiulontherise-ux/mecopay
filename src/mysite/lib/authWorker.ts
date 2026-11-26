export interface NoCodeAuthSession {
  session: {
    id: string;
    expiresAt: string;
    [key: string]: unknown;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    image?: string | null;
    [key: string]: unknown;
  };
}

const REFRESH_SKEW_MS = 60_000;
let refreshTimer: number | null = null;
let refreshInFlight: Promise<NoCodeAuthSession | null> | null = null;

async function fetchNoCodeSession(): Promise<NoCodeAuthSession | null> {
  const response = await fetch("/api/auth/tenant/session", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`AUTH_SESSION_${response.status}`);
  const payload = await response.json() as NoCodeAuthSession | null;
  if (!payload?.session || !payload.user?.id) return null;
  return payload;
}

function scheduleNoCodeRefresh(session: NoCodeAuthSession): void {
  if (typeof window === "undefined") return;
  if (refreshTimer !== null) window.clearTimeout(refreshTimer);
  const expiresAt = Date.parse(session.session.expiresAt);
  if (!Number.isFinite(expiresAt)) return;
  const delay = Math.max(1_000, expiresAt - Date.now() - REFRESH_SKEW_MS);
  refreshTimer = window.setTimeout(() => { void refreshNoCodeAuthSession({ retryOnFailure: true }); }, delay);
}

export async function refreshNoCodeAuthSession(options: { retryOnFailure?: boolean } = {}): Promise<NoCodeAuthSession | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const response = await fetch("/api/auth/tenant/session-token", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: "{}",
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => ({}));
    if (typeof payload?.token !== "string") return null;
    const session = await fetchNoCodeSession();
    if (session) scheduleNoCodeRefresh(session);
    return session;
  })().catch((error) => {
    console.warn("No-code Auth Worker background refresh failed:", error);
    if (options.retryOnFailure && typeof window !== "undefined") {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => { void refreshNoCodeAuthSession({ retryOnFailure: true }); }, 60_000);
    }
    return null;
  }).finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export async function getNoCodeAuthSession(): Promise<NoCodeAuthSession | null> {
  try {
    const session = await fetchNoCodeSession();
    if (session) { scheduleNoCodeRefresh(session); return session; }
  } catch (error) {
    console.warn("No-code Auth Worker session check failed; attempting refresh:", error);
  }
  return refreshNoCodeAuthSession();
}

export function startNoCodeGoogleLogin(): void {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const startUrl = new URL("/api/auth/tenant/start", window.location.origin);
  startUrl.searchParams.set("provider", "google");
  startUrl.searchParams.set("returnTo", returnTo || "/");
  window.location.assign(startUrl.toString());
}

export async function requestNoCodeEmailOtp(email: string): Promise<{ flowId: string; expiresIn: number }> {
  const response = await fetch("/api/auth/tenant/email/start", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}` }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.flowId) throw new Error(payload.error || "Could not send the sign-in code.");
  return payload;
}

export async function verifyNoCodeEmailOtp(flowId: string, otp: string): Promise<void> {
  const response = await fetch("/api/auth/tenant/email/verify", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ flowId, otp }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status && payload.status !== "verified") throw new Error(payload.error || "The sign-in code was rejected.");
}

export async function requestNoCodeTelegramLink(): Promise<{ challengeId: string; loginUrl: string; expiresAt: number }> {
  const response = await fetch("/api/auth/tenant/telegram/request-link", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}` }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.challengeId) throw new Error(payload.error || "Could not create the Telegram login link.");
  return payload;
}

export async function verifyNoCodeTelegram(challengeId: string): Promise<boolean> {
  const response = await fetch("/api/auth/tenant/telegram/verify", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ challengeId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok && payload.status !== "pending") throw new Error(payload.error || "Telegram verification failed.");
  return payload.status === "verified";
}

export async function signOutNoCodeAuth(): Promise<void> {
  if (refreshTimer !== null && typeof window !== "undefined") window.clearTimeout(refreshTimer);
  refreshTimer = null;
  const response = await fetch("/api/auth/tenant/sign-out", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error("Could not sign out from the Auth Worker.");
}
