import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DashboardShell from './DashboardShell';
import DashboardLocalizationBoundary from './DashboardLocalizationBoundary';
import MfaVerification from './MfaVerification';

export default function DashboardRoute() {
  const [loading, setLoading] = useState(true);
  const [needsMfa, setNeedsMfa] = useState(false);

  useEffect(() => {
    checkMfa();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkMfa();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkMfa = async () => {
    try {
      // First check the current level from the token
      // We do not force refreshSession here because concurrent refresh requests after OAuth login
      // will cause Supabase to invalidate the session and log the user out.
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      if (aalData.currentLevel === 'aal2') {
        setNeedsMfa(false);
        setLoading(false);
        return;
      }

      // If we are currently aal1, check the server for verified factors.
      // This prevents bypass if the device has an old JWT before MFA was enabled on another device.
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const hasVerifiedFactor = factorsData.totp.some(f => f.status === 'verified');
      
      if (hasVerifiedFactor) {
        setNeedsMfa(true);
      } else {
        setNeedsMfa(false);
      }
    } catch (error) {
      console.error('Error checking MFA level:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (needsMfa) {
    return <MfaVerification onVerified={() => setNeedsMfa(false)} />;
  }

  return <DashboardLocalizationBoundary><DashboardShell /></DashboardLocalizationBoundary>;
}
