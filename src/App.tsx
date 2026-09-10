import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import MfaVerification from './components/MfaVerification';
import DashboardRoute from './components/DashboardRoute';
import CheckoutPage from './components/checkout/CheckoutPage';
import AccessPage from './components/checkout/AccessPage';
import { PrivacyPolicy, TermsConditions, RefundPolicy, CustomerRightsAndAntiFraud, DeveloperDocsPage } from './components/Legal';
import StorefrontApp from './mysite/App';

interface EBProps { children?: React.ReactNode; }
interface EBState { hasError: boolean; error: any; }
class ErrorBoundary extends React.Component<EBProps, EBState> {
  public state: EBState = { hasError: false, error: null };

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'red', padding: '20px', backgroundColor: 'black', minHeight: '100vh'}}>
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <pre className="mt-4">{this.state.error.toString()}</pre>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStoreDomain, setIsStoreDomain] = useState(false);

  useEffect(() => {
    // 1. Domain Detection Logic
    const hostname = window.location.hostname;
    const isMainDomain = 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname === 'mecopay.com' || 
      hostname === 'www.mecopay.com' ||
      hostname.includes('run.app') || 
      hostname.includes('webcontainer.io');

    if (!isMainDomain) {
      setIsStoreDomain(true);
      // We don't need to load main app auth if it's a store domain, 
      // StorefrontApp handles its own auth and data fetching.
      setLoading(false);
      return; 
    }

    // 2. Main App Auth Check
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.has('error_description')) {
      alert("Login Error: " + decodeURIComponent(hashParams.get('error_description') || ''));
    }
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("App getSession error:", error);
        alert("Login Failed: " + (error.message || "Your account might be blocked or invalid."));
      }
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session ? "Session exists" : "No session");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- STOREFRONT ROUTING ---
  if (isStoreDomain) {
    return (
      <ErrorBoundary>
        <StorefrontApp />
      </ErrorBoundary>
    );
  }

  // --- MAIN APP ROUTING (MecoPay Dashboard & Checkout) ---
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Authentication */}
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          
          {/* Public Checkout */}
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/pay/:slug" element={<CheckoutPage />} />
          <Route path="/access/:invoiceId" element={<AccessPage />} />

          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/customer-rights" element={<CustomerRightsAndAntiFraud />} />
          <Route path="/anti-fraud" element={<CustomerRightsAndAntiFraud />} />
          <Route path="/developers" element={<DeveloperDocsPage />} />
          
          {/* Dashboard Workspace */}
          <Route
            path="/dashboard/*"
            element={session ? <DashboardRoute /> : <Navigate to="/login" />}
          />
          
          {/* Redirect root based on auth status */}
          <Route 
            path="/" 
            element={<Navigate to={session ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
              </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
