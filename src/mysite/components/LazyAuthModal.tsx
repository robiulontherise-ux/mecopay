import React, { useState } from 'react';
import {
  requestNoCodeEmailOtp,
  requestNoCodeTelegramLink,
  startNoCodeGoogleLogin,
  verifyNoCodeEmailOtp,
  verifyNoCodeTelegram,
} from '../lib/authWorker';
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

interface LazyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextAction?: string; // 'buy_volume' | 'take_exam' | 'telegram' | 'navbar' | string
  postTitle?: string;
}

export const LazyAuthModal: React.FC<LazyAuthModalProps> = ({
  isOpen,
  onClose,
  contextAction = 'navbar',
  postTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'email' | 'telegram' | null>(null);
  const [email, setEmail] = useState('');
  const [emailFlowId, setEmailFlowId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [telegramChallengeId, setTelegramChallengeId] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const getDomainName = () => {
    const params = new URLSearchParams(window.location.search);
    let domainName = params.get('subdomain') || params.get('custom_domain');
    if (!domainName) {
      let currentHost = window.location.hostname;
      if (currentHost.endsWith('.mecopay.space')) {
         domainName = currentHost.replace('.mecopay.space', '');
      } else {
         domainName = currentHost;
      }
    }
    return domainName ? domainName.charAt(0).toUpperCase() + domainName.slice(1) : 'Our Platform';
  };

  const getContextDescription = () => {
    const brandName = getDomainName();
    switch (contextAction) {
      case 'buy_volume':
        return {
          title: 'Sign In to Unlock Volume',
          subtitle: postTitle
            ? `Sign in to purchase and download "${postTitle}" with lifetime PDF updates.`
            : 'Sign in to purchase official dreamers volumes and get access to high-yield notes.',
          badge: 'Exclusive Admission Volume',
        };
      case 'take_exam':
        return {
          title: 'Sign In to Take Live Exam',
          subtitle: postTitle
            ? `Sign in to start "${postTitle}" with real-time negative marking and merit list rank.`
            : 'Sign in to record your test score and compare your standing on the national leaderboard.',
          badge: 'Model Test Simulator',
        };
      case 'telegram':
        return {
          title: 'Sign In for Telegram Invite',
          subtitle: 'Sign in to generate your verified student invitation link to the private Telegram discussion channel.',
          badge: 'Verified Community',
        };
      default:
        return {
          title: `Join ${brandName}`,
          subtitle: 'Sign in to save your study progress, access model tests, and download admission materials.',
          badge: 'Student Portal',
        };
    }
  };

  const contextInfo = getContextDescription();

  // Start the tenant OAuth broker with a top-level navigation. The Gateway
  // validates this no-code host and forwards the request to the Auth Worker.
  const handleGoogleSignIn = () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      startNoCodeGoogleLogin();
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setErrorMsg(err.message || 'Could not start Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailStart = async () => {
    setLoading(true); setErrorMsg(null);
    try { const result = await requestNoCodeEmailOtp(email); setEmailFlowId(result.flowId); }
    catch (err: any) { setErrorMsg(err.message || 'Could not send the sign-in code.'); }
    finally { setLoading(false); }
  };

  const handleEmailVerify = async () => {
    if (!emailFlowId) return;
    setLoading(true); setErrorMsg(null);
    try { await verifyNoCodeEmailOtp(emailFlowId, otp); window.location.reload(); }
    catch (err: any) { setErrorMsg(err.message || 'The sign-in code was rejected.'); }
    finally { setLoading(false); }
  };

  const handleTelegramStart = async () => {
    setLoading(true); setErrorMsg(null);
    try { const result = await requestNoCodeTelegramLink(); setTelegramChallengeId(result.challengeId); setTelegramUrl(result.loginUrl); }
    catch (err: any) { setErrorMsg(err.message || 'Could not create the Telegram login link.'); }
    finally { setLoading(false); }
  };

  const handleSelectTelegram = () => {
    setSelectedProvider('telegram');
    setErrorMsg(null);
    if (!telegramChallengeId) void handleTelegramStart();
  };

  const handleTelegramVerify = async () => {
    if (!telegramChallengeId) return;
    setLoading(true); setErrorMsg(null);
    try { if (await verifyNoCodeTelegram(telegramChallengeId)) window.location.reload(); else setErrorMsg('Open the Telegram link, press Start, then verify again.'); }
    catch (err: any) { setErrorMsg(err.message || 'Telegram verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Badge & Title */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {contextInfo.badge}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            {contextInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            {contextInfo.subtitle}
          </p>

          {/* Benefits Grid */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 mb-6 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant sync across mobile & desktop devices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Negative marking exam analytics & national rank</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Exclusive 15-year BUET & DMC solved archives</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="mb-5">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Login with</p>
            <div className="grid grid-cols-3 gap-3" aria-label="Choose a sign-in provider">
              <button type="button" onClick={handleGoogleSignIn} disabled={loading} aria-label="Login with Google" className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50">
                <svg className="h-7 w-7 transition group-hover:scale-105" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
              <button type="button" onClick={() => { setSelectedProvider('email'); setErrorMsg(null); }} aria-pressed={selectedProvider === 'email'} aria-label="Login with Email" className={`group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${selectedProvider === 'email' ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800'}`}>
                <Mail className="h-7 w-7 transition group-hover:scale-105" aria-hidden="true" />
                <span>Email</span>
              </button>
              <button type="button" onClick={handleSelectTelegram} disabled={loading} aria-pressed={selectedProvider === 'telegram'} aria-label="Login with Telegram" className={`group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition disabled:opacity-50 ${selectedProvider === 'telegram' ? 'border-sky-400 bg-sky-500/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800'}`}>
                <Send className="h-7 w-7 text-sky-300 transition group-hover:scale-105" aria-hidden="true" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

          {selectedProvider === 'email' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              {!emailFlowId ? (
                <>
                  <label htmlFor="no-code-login-email" className="block text-xs font-medium text-slate-300">Email address</label>
                  <div className="flex gap-2">
                    <input id="no-code-login-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Email address" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                    <button type="button" onClick={handleEmailStart} disabled={loading || !email} className="rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white disabled:opacity-50">{loading ? 'Sending…' : 'Send code'}</button>
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="no-code-login-otp" className="block text-xs font-medium text-slate-300">Enter the 6-digit code</label>
                  <div className="flex gap-2">
                    <input id="no-code-login-otp" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
                    <button type="button" onClick={handleEmailVerify} disabled={loading || otp.length !== 6} className="rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white disabled:opacity-50">{loading ? 'Verifying…' : 'Verify'}</button>
                  </div>
                </>
              )}
              <button type="button" onClick={() => setSelectedProvider(null)} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Other sign-in methods</button>
            </div>
          )}

          {selectedProvider === 'telegram' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              {!telegramChallengeId ? (
                <button type="button" onClick={handleTelegramStart} disabled={loading} className="w-full rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 text-sm font-semibold text-sky-200 disabled:opacity-50">{loading ? 'Creating link…' : 'Create Telegram login link'}</button>
              ) : (
                <>
                  <a href={telegramUrl || '#'} target="_blank" rel="noreferrer" className="block w-full rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 text-center text-sm font-semibold text-sky-200">Open Telegram and press Start</a>
                  <button type="button" onClick={handleTelegramVerify} disabled={loading} className="w-full rounded-xl border border-slate-700 py-2.5 text-xs font-semibold text-slate-200 disabled:opacity-50">{loading ? 'Checking…' : 'Verify Telegram'}</button>
                </>
              )}
              <button type="button" onClick={() => setSelectedProvider(null)} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Other sign-in methods</button>
            </div>
          )}

          <p className="mt-5 text-[11px] text-center text-slate-400">
            By signing in, you agree to {getDomainName()} Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LazyAuthModal;
