import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MfaVerification({ onVerified }: { onVerified: () => void }) {
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the TOTP factor ID
    const fetchFactor = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        
        const totp = data.totp.find(f => f.status === 'verified');
        if (totp) {
          setFactorId(totp.id);
        } else {
          // If no verified factor but we are here, just let them through
          onVerified();
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFactor();
  }, [onVerified]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Verification successful
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">2-Step Verification</h2>
        <p className="text-slate-400 text-center text-sm mb-8">
          Enter the 6-digit code from Google Authenticator to continue.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="000000" 
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-center text-2xl text-white font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || verifyCode.length < 6}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={handleSignOut} className="text-sm text-slate-500 hover:text-white transition-colors">
            Cancel & Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
