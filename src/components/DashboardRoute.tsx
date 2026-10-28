import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthWorkerSession } from '../lib/authWorker';
import DashboardShell from './DashboardShell';
import DashboardLocalizationBoundary from './DashboardLocalizationBoundary';

export default function DashboardRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void getAuthWorkerSession()
      .then((authState) => {
        if (isMounted) setAuthenticated(Boolean(authState));
      })
      .catch((error) => {
        console.error('Auth Worker dashboard check failed:', error);
        if (isMounted) setAuthenticated(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/login" replace />;
  return <DashboardLocalizationBoundary><DashboardShell /></DashboardLocalizationBoundary>;
}
