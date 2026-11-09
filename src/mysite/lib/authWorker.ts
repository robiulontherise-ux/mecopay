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

export async function getNoCodeAuthSession(): Promise<NoCodeAuthSession | null> {
  const response = await fetch("/api/auth/tenant/session", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Could not check the Auth Worker session.");

  const payload = await response.json() as NoCodeAuthSession | null;
  if (!payload?.session || !payload.user?.id) return null;
  return payload;
}

export function startNoCodeGoogleLogin(): void {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const startUrl = new URL("/api/auth/tenant/start", window.location.origin);
  startUrl.searchParams.set("provider", "google");
  startUrl.searchParams.set("returnTo", returnTo || "/");

  // This must be a top-level navigation so Google OAuth and the handoff cookies
  // are processed on the correct first-party domains, never in a cross-origin fetch.
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
  const response = await fetch("/api/auth/tenant/sign-out", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error("Could not sign out from the Auth Worker.");
}
