import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './email-otp-login.css';

type OtpStep = 'email' | 'code';

type AuthError = {
  code?: string;
  error?: string;
  message?: string;
};

async function postAuthJson(path: string, payload: Record<string, string>) {
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

  const result = await response.json().catch(() => null) as AuthError | null;
  if (!response.ok) {
    const detail = result?.message || result?.code || result?.error;
    throw new Error(detail || 'The request could not be completed. Please try again.');
  }
  return result;
}

function readableError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/rate.?limit/i.test(message)) return 'Too many attempts. Please wait a minute and try again.';
  if (/invalid.?otp/i.test(message)) return 'That code is not valid. Check the email and try again.';
  if (/expired/i.test(message)) return 'That code has expired. Request a new one.';
  if (/email_sending_binding_not_configured/i.test(message)) return 'Email sign-in is not ready yet. Please try again later.';
  return message || 'Something went wrong. Please try again.';
}

export default function EmailOtpLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OtpStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      // Better Auth-এর Email OTP endpoint-এ sign-in কোড পাঠানোর অনুরোধ।
      await postAuthJson('/api/auth/email-otp/send-verification-otp', {
        email: normalizedEmail,
        type: 'sign-in',
      });
      setEmail(normalizedEmail);
      setStep('code');
      setNotice(`If ${normalizedEmail} can receive mail, a sign-in code is on its way.`);
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      // Better Auth কোড যাচাই করে session cookie তৈরি করলে app-এ ফিরে যাই।
      await postAuthJson('/api/auth/sign-in/email-otp', {
        email,
        otp: otp.trim(),
      });
      window.location.assign('/dashboard');
    } catch (verificationError) {
      setError(readableError(verificationError));
      setBusy(false);
    }
  }

  async function resendCode() {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await postAuthJson('/api/auth/email-otp/send-verification-otp', {
        email,
        type: 'sign-in',
      });
      setNotice(`If ${email} can receive mail, a new sign-in code is on its way.`);
      setOtp('');
    } catch (requestError) {
      setError(readableError(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="email-login-page">
      <div className="email-login-glow email-login-glow-one" aria-hidden="true" />
      <div className="email-login-glow email-login-glow-two" aria-hidden="true" />
      <section className="email-login-card" aria-labelledby="email-login-title">
        <button type="button" className="email-login-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Back to login options
        </button>

        <div className="email-login-brand" aria-label="MecoPay Authentication">
          <span className="email-login-brand-mark" aria-hidden="true">M</span>
          <span>MecoPay Authentication</span>
        </div>

        <div className="email-login-icon" aria-hidden="true">
          {step === 'email' ? <Mail size={27} /> : <CheckCircle2 size={27} />}
        </div>
        <p className="email-login-eyebrow">Email sign-in</p>
        <h1 id="email-login-title">{step === 'email' ? 'Sign in with email' : 'Enter your code'}</h1>
        <p className="email-login-description">
          {step === 'email'
            ? 'We will email you a one-time code. No password needed.'
            : <>Enter the 6-digit code sent to <strong>{email}</strong>. It expires in 5 minutes.</>}
        </p>

        {step === 'email' ? (
          <form className="email-login-form" onSubmit={requestCode}>
            <label htmlFor="email-login-address">Email address</label>
            <input
              id="email-login-address"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              autoFocus
            />
            <button className="email-login-submit" type="submit" disabled={busy}>
              {busy ? 'Sending code…' : 'Send email code'}
            </button>
          </form>
        ) : (
          <form className="email-login-form" onSubmit={verifyCode}>
            <label htmlFor="email-login-code">6-digit code</label>
            <input
              id="email-login-code"
              type="text"
              name="otp"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
            />
            <button className="email-login-submit" type="submit" disabled={busy || otp.length !== 6}>
              {busy ? 'Verifying…' : 'Verify and sign in'}
            </button>
            <div className="email-login-code-actions">
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); setNotice(''); }} disabled={busy}>
                Change email
              </button>
              <button type="button" onClick={resendCode} disabled={busy}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {error && <p className="email-login-message email-login-error" role="alert">{error}</p>}
        {notice && <p className="email-login-message email-login-notice" role="status">{notice}</p>}

        <p className="email-login-security">
          <ShieldCheck size={15} aria-hidden="true" />
          A one-time code keeps your sign-in secure.
        </p>
      </section>
    </main>
  );
}
