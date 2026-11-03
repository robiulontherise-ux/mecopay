import { useEffect } from 'react';

const allowedParentOrigins = new Set([
  'https://mecopay.space',
  'https://www.mecopay.space',
]);

export default function GoogleAuthPopupComplete() {
  const parentOrigin = new URLSearchParams(window.location.search).get('parentOrigin') ?? '';
  const validParentOrigin = allowedParentOrigins.has(parentOrigin);

  useEffect(() => {
    if (!window.opener || !validParentOrigin) return;

    window.opener.postMessage({ type: 'MECOPAY_GOOGLE_AUTH_COMPLETE' }, parentOrigin);
    window.close();
  }, [parentOrigin, validParentOrigin]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <section className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-7 text-center shadow-xl">
        <img
          src="https://i.postimg.cc/gX1nxKHH/logo.png"
          alt="MecoPay"
          className="mx-auto mb-5 h-10 w-auto rounded-lg"
          onError={(event) => { event.currentTarget.src = 'https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png'; }}
        />
        <h1 className="text-xl font-bold">Google sign-in complete</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-300">You can close this window and return to MecoPay.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Continue to MecoPay
        </a>
      </section>
    </main>
  );
}
