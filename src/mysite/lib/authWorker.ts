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
  const response = await fetch("/api/auth/get-session", {
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

export async function signOutNoCodeAuth(): Promise<void> {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error("Could not sign out from the Auth Worker.");
}
