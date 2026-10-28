import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuthWorkerSession } from './lib/authWorker';
import Login from './components/Login';
import MfaVerification from './components/MfaVerification';
import DashboardRoute from './components/DashboardRoute';
import CheckoutPage from './components/checkout/CheckoutPage';
import AccessPage from './components/checkout/AccessPage';
import { PrivacyPolicy, TermsConditions, RefundPolicy, CustomerRightsAndAntiFraud, DeveloperDocsPage } from './components/Legal';
import FeaturesPage from './components/FeaturesPage';
import AuthPage from './components/AuthPages';
import TimeSpentBeaconTracker from './components/analytics/TimeSpentBeaconTracker';
import { LocaleProvider } from './lib/LocaleContext';
import MySiteApp from './mysite/App';

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

function checkIsClientSite(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase().trim();
  const path = window.location.pathname.toLowerCase().trim();
  const searchParams = new URLSearchParams(window.location.search);

  // If user is intentionally navigating to central dashboard, login, public auth or checkout routes
  if (
    path.startsWith('/dashboard') ||
    path === '/login' ||
    path.startsWith('/auth/') ||
    path.startsWith('/checkout') ||
    path.startsWith('/pay') ||
    path.startsWith('/access')
  ) {
    return false;
  }

  // Explicit query parameters (e.g. ?subdomain=watchshop or ?custom_domain=watch.com)
  if (searchParams.has('subdomain') || searchParams.has('custom_domain')) {
    return true;
  }

  // Check if host is a primary official production or development platform domain (Mother site)
  const isPlatformDomain =
    host === 'mecopay.space' ||
    host === 'www.mecopay.space' ||
    host === 'mecopay.pages.dev' ||
    host.includes('localhost') ||
    host === '127.0.0.1' ||
    host.includes('.run.app');

  if (isPlatformDomain) {
    // If on mother site, but explicit /mysite path is visited, allow viewing client site
    if (path.startsWith('/mysite')) {
      return true;
    }
    return false;
  }

  // Subdomain of mecopay.space (e.g. mybrand.mecopay.space)
  if (host.endsWith('.mecopay.space') && host !== 'mecopay.space' && host !== 'www.mecopay.space' && !host.startsWith('api.') && !host.startsWith('checkout.')) {
    return true;
  }

  // Client Subdomain of pages.dev (e.g. mybrand.pages.dev and not mecopay.pages.dev)
  if (host.endsWith('.pages.dev') && host !== 'mecopay.pages.dev' && !host.startsWith('mecopay')) {
    return true;
  }

  // Custom external domain
  return true;
}

function App() {
  const isClientSite = checkIsClientSite();

  if (isClientSite) {
    return (
      <ErrorBoundary>
        <MySiteApp />
      </ErrorBoundary>
    );
  }

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const publicAuthPage = window.location.pathname === '/auth/home'
    ? 'home'
    : window.location.pathname === '/auth/privacy'
      ? 'privacy'
      : window.location.pathname === '/auth/terms'
        ? 'terms'
        : null;

  useEffect(() => {
    // Ensure Mother Site title and favicon are properly set when on Mother Site
    document.title = 'MecoPay Space';
    const motherFavicon = 'https://i.postimg.cc/cJk7YcMb/favicon.jpg';
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon'], link[rel='apple-touch-icon']");
    iconLinks.forEach(link => {
      link.href = motherFavicon;
    });

    // Clear any client site cache stored in localStorage so mother site is never polluted
    try {
      localStorage.removeItem('cached_site_name');
      localStorage.removeItem('mysite_cached_title');
      localStorage.removeItem('cached_site_logo');
      localStorage.removeItem('mysite_cached_logo');
    } catch (e) {}

    // Check for hash errors from OAuth
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.has('error_description')) {
      console.warn("Login Error:", decodeURIComponent(hashParams.get('error_description') || ''));
    }
    
    let isMounted = true;
    void getAuthWorkerSession()
      .then((authState) => {
        if (isMounted) setSession(authState);
      })
      .catch((error) => {
        console.error('Auth Worker session check failed:', error);
        if (isMounted) setSession(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // MecoPay Auth legal/identity pages are intentionally public and must not
  // wait for the Auth Worker or redirect through the login flow.
  if (publicAuthPage) {
    return (
      <ErrorBoundary>
        <AuthPage kind={publicAuthPage} />
      </ErrorBoundary>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <BrowserRouter>
          <TimeSpentBeaconTracker />
          <Routes>
          {/* Hidden MecoPay Auth identity and legal pages. These routes must stay before the catch-all. */}
          <Route path="/auth/home" element={<AuthPage kind="home" />} />
          <Route path="/auth/privacy" element={<AuthPage kind="privacy" />} />
          <Route path="/auth/terms" element={<AuthPage kind="terms" />} />

          {/* Authentication */}
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          
          {/* Public Checkout */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/pay" element={<CheckoutPage />} />
          <Route path="/pay/:slug" element={<CheckoutPage />} />
          <Route path="/access/:invoiceId" element={<AccessPage />} />

          {/* Legal Pages & Docs / Features */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/customer-rights" element={<CustomerRightsAndAntiFraud />} />
          <Route path="/anti-fraud" element={<CustomerRightsAndAntiFraud />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/docs" element={<DeveloperDocsPage />} />
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
          {/* Catch-all for unknown routes */}
          <Route 
            path="*" 
            element={<Navigate to={session ? "/dashboard" : "/login"} replace />} 
          />
          </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;
