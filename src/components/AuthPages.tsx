import { useEffect } from 'react';
import './auth-pages.css';

type AuthPageKind = 'home' | 'privacy' | 'terms';

const pageContent: Record<AuthPageKind, {
  title: string;
  eyebrow: string;
  heading: string;
  intro?: string;
  sections?: Array<{ title: string; body: string }>;
}> = {
  home: {
    title: 'MecoPay Auth - Identity & Authentication Portal',
    eyebrow: 'MecoPay Auth',
    heading: 'Identity & Authentication Portal',
    intro: 'Welcome to MecoPay Auth. MecoPay Auth is a centralized single sign-on (SSO) and identity verification service designed to provide secure, fast, and seamless authentication across all client websites within the MecoPay network.',
  },
  privacy: {
    title: 'MecoPay Auth - Privacy Policy',
    eyebrow: 'MecoPay Auth',
    heading: 'Privacy Policy',
    sections: [
      {
        title: '1. Information We Collect',
        body: 'When you sign in using MecoPay Auth via Google, we only access basic profile details such as your name, email address, and profile picture provided by Google.',
      },
      {
        title: '2. How We Use Information',
        body: 'The collected information is strictly used for authentication and identity verification purposes across client applications within the MecoPay network.',
      },
      {
        title: '3. Data Sharing & Security',
        body: 'We do not sell, rent, or share your personal information or Google account data with any unauthorized third parties. All authentication processes are encrypted and secured.',
      },
    ],
  },
  terms: {
    title: 'MecoPay Auth - Terms of Service',
    eyebrow: 'MecoPay Auth',
    heading: 'Terms of Service',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By logging in through MecoPay Auth on any participating client website, you agree to these Terms of Service.',
      },
      {
        title: '2. User Responsibilities',
        body: 'You are responsible for maintaining the security of your own Google account used during the login process.',
      },
      {
        title: '3. Service Availability',
        body: 'MecoPay Auth strives to provide reliable and uninterrupted authentication services across all integrated platforms.',
      },
    ],
  },
};

function useAuthPageMetadata(title: string) {
  useEffect(() => {
    document.title = title;

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const createdByAuthPage = !robots;
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }

    robots.content = 'noindex, nofollow';
    robots.dataset.mecopayAuth = 'true';

    return () => {
      if (createdByAuthPage && robots?.dataset.mecopayAuth === 'true') {
        robots.remove();
      }
    };
  }, [title]);
}

export default function AuthPage({ kind }: { kind: AuthPageKind }) {
  const page = pageContent[kind];
  useAuthPageMetadata(page.title);

  return (
    <main className="mecopay-auth-page">
      <div className="mecopay-auth-orb mecopay-auth-orb-one" aria-hidden="true" />
      <div className="mecopay-auth-orb mecopay-auth-orb-two" aria-hidden="true" />

      <section className="mecopay-auth-shell" aria-labelledby="auth-page-heading">
        <div className="mecopay-auth-brand" aria-label="MecoPay Auth">
          <span className="mecopay-auth-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>MecoPay Auth</span>
        </div>

        <div className="mecopay-auth-card">
          <div className="mecopay-auth-card-topline" aria-hidden="true" />
          <p className="mecopay-auth-eyebrow">{page.eyebrow}</p>
          <h1 id="auth-page-heading">{page.heading}</h1>

          {page.intro && <p className="mecopay-auth-intro">{page.intro}</p>}

          {page.sections && (
            <div className="mecopay-auth-sections">
              {page.sections.map((section) => (
                <article className="mecopay-auth-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <p className="mecopay-auth-security-note">
          Secure authentication for the MecoPay network
        </p>
      </section>
    </main>
  );
}
