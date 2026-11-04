import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramMark from './TelegramMark';
import './email-otp-login.css';
import './telegram-login.css';

type TelegramChallenge = {
  challengeId: string;
  loginUrl: string;
  expiresAt: number;
  remainingRequests: number;
  retryAfterSeconds?: number;
};

type WorkerResponse = {
  status?: string;
  token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  message?: string;
  retryAfterSeconds?: number;
  challengeId?: string;
  loginUrl?: string;
  expiresAt?: number;
  remainingRequests?: number;
};

async function postWorkerJson(path: string, payload: Record<string, string>): Promise<{ response: Response; result: WorkerResponse | null }> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null) as WorkerResponse | null;
  return { response, result };
}

function readableError(result: WorkerResponse | null, status: number): string {
  if (result?.error === 'TELEGRAM_LOGIN_IP_RATE_LIMITED') {
    return 'Too many Telegram login requests came from this network. Please wait five minutes.';
  }
  if (status === 429 || result?.error === 'TELEGRAM_LOGIN_RATE_LIMITED') {
    return 'You have used the two Telegram login-link requests for this five-minute window.';
  }
  if (result?.error === 'TELEGRAM_LOGIN_NOT_CONFIGURED') {
    return 'Telegram sign-in is temporarily unavailable. Please use Email or Google for now.';
  }
  if (result?.error === 'CHALLENGE_SESSION_MISMATCH') {
    return 'This login link belongs to another browser session. Request a new link here.';
  }
  return result?.message || 'We could not complete Telegram sign-in. Please try again.';
}

export default function TelegramLogin() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<TelegramChallenge | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [telegramOpened, setTelegramOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (challenge) {
        setSecondsLeft(Math.max(0, Math.ceil((challenge.expiresAt - Date.now()) / 1000)));
      }
      if (cooldownUntil) {
        setCooldownSeconds(Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge, cooldownUntil]);

  async function requestLink() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { response, result } = await postWorkerJson('/api/auth/telegram/request-link', {});
      if (response.status === 429) {
        const retryAfter = Math.max(1, Number(result?.retryAfterSeconds) || Number(response.headers.get('Retry-After')) || 300);
        setCooldownUntil(Date.now() + retryAfter * 1000);
        setError(readableError(result, response.status));
        return;
      }
      if (!response.ok || !result?.challengeId || !result.loginUrl || !result.expiresAt) {
        throw new Error(readableError(result, response.status));
      }
      const nextChallenge: TelegramChallenge = {
        challengeId: result.challengeId,
        loginUrl: result.loginUrl,
        expiresAt: Number(result.expiresAt),
        remainingRequests: Math.max(0, Number(result.remainingRequests) || 0),
        retryAfterSeconds: Number(result.retryAfterSeconds) || undefined,
      };
      setChallenge(nextChallenge);
      setSecondsLeft(Math.max(0, Math.ceil((nextChallenge.expiresAt - Date.now()) / 1000)));
      setTelegramOpened(false);
      setNotice('Your one-time link is ready. Open Telegram and press Start, then return here to verify.');
      if (nextChallenge.remainingRequests === 0 && nextChallenge.retryAfterSeconds) {
        setCooldownUntil(Date.now() + nextChallenge.retryAfterSeconds * 1000);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create a Telegram login link.');
    } finally {
      setBusy(false);
    }
  }

  async function requestJwtFallback(): Promise<string | null> {
    const { response, result } = await postWorkerJson('/api/auth/session-token', {});
    if (!response.ok || typeof result?.token !== 'string') return null;
    return result.token;
  }

  async function verifyTelegram() {
    if (!challenge || secondsLeft <= 0) return;
    setVerifying(true);
    setError('');
    setNotice('Checking Telegram confirmation…');
    try {
      const { response, result } = await postWorkerJson('/api/auth/telegram/verify', {
        challengeId: challenge.challengeId,
      });
      if (result?.status === 'pending') {
        setNotice('Telegram has not confirmed yet. Press Start in the bot, then click Verify again.');
        return;
      }
      if (response.status === 410 || result?.status === 'expired') {
        setSecondsLeft(0);
        setError('This login link has expired. Request another link if one remains in your five-minute limit.');
        return;
      }

      const verificationSucceeded = result?.status === 'verified' || result?.error === 'JWT_ISSUANCE_FAILED';
      if (!verificationSucceeded) throw new Error(readableError(result, response.status));

      let token = typeof result?.token === 'string' ? result.token : '';
      if (!token) {
        // Retry only after the Worker explicitly confirms this challenge.
        const fallback = await requestJwtFallback().catch(() => null);
        if (!fallback) throw new Error(readableError(result, response.status));
      }

      setNotice('Telegram verified. Signing you in…');
      window.location.assign('/dashboard');
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Verification failed. Please try again.');
      setNotice('');
    } finally {
      setVerifying(false);
    }
  }

  const linkExpired = Boolean(challenge && secondsLeft <= 0);
  const cooldownActive = Boolean(cooldownUntil && cooldownSeconds > 0);
  const canRequestAnother = !busy && !cooldownActive && (!challenge || challenge.remainingRequests > 0 || Boolean(cooldownUntil));

  return (
    <main className="email-login-page">
      <section className="email-login-card telegram-login-card" aria-labelledby="telegram-login-title">
        <button type="button" className="email-login-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Back to login options
        </button>

        <div className="email-login-brand" aria-label="MecoPay Authentication">
          <img
            className="email-login-brand-logo"
            src="https://i.postimg.cc/gX1nxKHH/logo.png"
            alt=""
            onError={(event) => { event.currentTarget.src = 'https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png'; }}
          />
          <span>MecoPay Authentication</span>
        </div>

        <h1 id="telegram-login-title">Sign in with Telegram</h1>
        <p className="email-login-description">
          Create a secure, one-time login link, open Telegram, and press <strong>Start</strong>. Return to this page and verify within five minutes.
        </p>

        {!challenge ? (
          <button className="email-login-submit" type="button" onClick={requestLink} disabled={busy}>
            {busy ? 'Creating secure link…' : 'Create Telegram login link'}
          </button>
        ) : (
          <div className="telegram-login-actions">
            <a
              className={`telegram-login-open${linkExpired ? ' is-disabled' : ''}`}
              href={linkExpired ? undefined : challenge.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (!linkExpired) {
                  setTelegramOpened(true);
                  setNotice('Press Start in Telegram, then return here and verify.');
                }
              }}
              aria-disabled={linkExpired}
            >
              <TelegramMark className="h-5 w-5" />
              {telegramOpened ? 'Open Telegram again' : 'Open Telegram'}
            </a>

            <div className="telegram-login-expiry">
              {linkExpired ? 'This link has expired.' : `Link expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`}
            </div>

            <button
              className="email-login-submit"
              type="button"
              onClick={verifyTelegram}
              disabled={busy || verifying || linkExpired}
            >
              {verifying ? 'Verifying…' : 'I pressed Start — Verify and sign in'}
            </button>

            <div className="email-login-code-actions telegram-login-secondary-actions">
              <button type="button" onClick={requestLink} disabled={!canRequestAnother}>
                {busy ? 'Creating link…' : 'Create another link'}
              </button>
              <span>
                {challenge.remainingRequests > 0
                  ? `${challenge.remainingRequests} request${challenge.remainingRequests === 1 ? '' : 's'} left`
                  : cooldownActive
                    ? `Try again in ${Math.floor(cooldownSeconds / 60)}:${String(cooldownSeconds % 60).padStart(2, '0')}`
                    : 'Two-link limit reached'}
              </span>
            </div>
          </div>
        )}

        {cooldownActive && !challenge && (
          <p className="telegram-login-expiry" role="status">
            You can request a fresh login link in {Math.floor(cooldownSeconds / 60)}:{String(cooldownSeconds % 60).padStart(2, '0')}.
          </p>
        )}
        {error && <p className="email-login-message email-login-error" role="alert">{error}</p>}
        {notice && <p className="email-login-message email-login-notice" role="status">{notice}</p>}

        <p className="email-login-security">
          <ShieldCheck size={15} aria-hidden="true" />
          The challenge expires in five minutes and can be used once.
        </p>
      </section>
    </main>
  );
}
