import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ShieldAlert, Key, X, CheckCircle2 } from 'lucide-react';

export default function MfaSettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactor = data.totp.find(f => f.status === 'verified');
      if (totpFactor) {
        setIs2FAEnabled(true);
        setFactorId(totpFactor.id);
      } else {
        setIs2FAEnabled(false);
        setFactorId(null);
      }
    } catch (err: any) {
      console.error("Error checking MFA status:", err);
    }
  };

  const handleEnable2FA = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setShowSetup(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!factorId) return;
    setError(null);
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode
      });
      if (verify.error) throw verify.error;

      setIs2FAEnabled(true);
      setShowSetup(false);
      setVerifyCode('');
      setQrCode(null);
      setSecret(null);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!factorId) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      
      setIs2FAEnabled(false);
      setFactorId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 border-t border-slate-800/50 mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white font-medium">2-Step Verification (TOTP)</h3>
          {!is2FAEnabled ? (
            <p className="text-xs text-slate-400 mt-1">Add an extra layer of security using Google Authenticator.</p>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-emerald-400 font-bold mb-1">✓ 2-Step Verification is Active</p>
              <p className="text-xs text-slate-400">Your account is highly secure. To turn off 2-Step Verification, click the disable button below.</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {showSetup ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" /> Setup Authenticator
            </h4>
            <button onClick={() => setShowSetup(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              1. Scan this QR code with Google Authenticator, OR copy the manual setup key.
            </p>
            
            {qrCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                  <div dangerouslySetInnerHTML={{ __html: qrCode }} className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-slate-500 mb-2">Or enter this setup key manually:</p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800 justify-center">
                    <code className="text-sm font-mono text-emerald-400">{secret}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(secret || '')}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Copy Key"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-slate-300 mt-4">
              2. Enter the 6-digit code generated by the app:
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="000000" 
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <button 
                onClick={handleVerify2FA}
                disabled={loading || verifyCode.length < 6}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 border px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${is2FAEnabled ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
        >
          {is2FAEnabled ? (
            <ShieldCheck className="w-5 h-5 text-red-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          {loading ? 'Processing...' : (is2FAEnabled ? 'Disable 2-Step Verify' : 'Enable 2-Step Verify')}
        </button>
      )}
    </div>
  );
}
