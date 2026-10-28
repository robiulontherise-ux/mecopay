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
