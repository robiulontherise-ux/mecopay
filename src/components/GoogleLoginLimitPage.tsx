import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

function isGoogleRateLimit(search: string): boolean {
  const params = new URLSearchParams(search);
  const errorText = `${params.get('error') ?? ''} ${params.get('error_description') ?? ''}`;
  return /too[_\s-]?many|rate.?limit|two sign.?ins|limit.{0,80}(five|5)|five.?minute|5.?minute/i.test(errorText);
}

export default function GoogleLoginLimitPage() {
  const location = useLocation();
  const rateLimitReached = isGoogleRateLimit(location.search);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-10 text-[#e7f1ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(32,171,193,0.2),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(91,92,255,0.18),transparent_35%),linear-gradient(135deg,#07111f_0%,#0a1728_54%,#0a1122_100%)]" aria-hidden="true" />
      <section className="relative w-full max-w-lg rounded-3xl border border-cyan-100/10 bg-slate-950/70 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10" aria-labelledby="google-login-error-title">
        <div className="mb-8 flex items-center gap-3" aria-label="MecoPay Authentication">
          <img
            className="h-9 w-auto rounded-lg object-contain"
            src="https://i.postimg.cc/gX1nxKHH/logo.png"
            alt=""
            onError={(event) => { event.currentTarget.src = 'https://i.postimg.cc/Zn53D792/Meco-Pay-Logo.png'; }}
          />
          <span className="text-sm font-bold tracking-wide text-white">MecoPay Authentication</span>
        </div>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 id="google-login-error-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {rateLimitReached ? 'লগইন সীমা অতিক্রম হয়েছে' : 'Google দিয়ে লগইন সম্পন্ন হয়নি'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          {rateLimitReached
            ? 'এই Google অ্যাকাউন্ট দিয়ে ৫ মিনিটের মধ্যে সর্বোচ্চ ২ বার সফলভাবে লগইন করা যাবে। পাঁচ মিনিটের সীমা শেষ হলে আবার চেষ্টা করুন।'
            : 'Google দিয়ে লগইনটি সম্পন্ন করা যায়নি। লগইন পেজে ফিরে আবার চেষ্টা করুন।'}
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cyan-100/15 bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          লগইন পেজে ফিরুন
        </Link>
      </section>
    </main>
  );
}
