import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Clapperboard,
  Image as ImageIcon,
  Megaphone,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';
import ClientDashboardAccess from './ClientDashboardAccess';

type Category = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof ImageIcon;
  accent: string;
  glow: string;
  services: string[];
  packageHint: string;
};

const categories: Category[] = [
  {
    id: 'design',
    title: 'Graphic Design & Image Work',
    subtitle: 'Design that makes your brand recognizable.',
    description: 'Image-based creative work, from quick edits to polished campaign assets.',
    icon: ImageIcon,
    accent: 'text-violet-300',
    glow: 'from-violet-500/20 to-fuchsia-500/5',
    services: ['Photoshop & image editing', 'Social graphics & banners', 'Thumbnails', 'Charts & infographics', 'Product photos & photo cards'],
    packageHint: 'Choose by number of designs and complexity.',
  },
  {
    id: 'video',
    title: 'Video Editing & Content Making',
    subtitle: 'Short clips, long-form edits, and everything between.',
    description: 'Turn your footage or ideas into engaging video content for the platforms you use.',
    icon: Clapperboard,
    accent: 'text-rose-300',
    glow: 'from-rose-500/20 to-orange-500/5',
    services: ['Reels, Shorts & TikTok', 'Long-form video editing', 'Voice recording or voice-over', 'AI-assisted video creation', 'Captions & format resizing'],
    packageHint: 'Choose by final video length, volume, and production style.',
  },
  {
    id: 'social',
    title: 'Social Media Management',
    subtitle: 'Keep your social channels active and consistent.',
    description: 'Invite a specialist to your social account and get help planning, preparing, and managing posts.',
    icon: Share2,
    accent: 'text-sky-300',
    glow: 'from-sky-500/20 to-cyan-500/5',
    services: ['Instagram', 'Facebook', 'LinkedIn', 'Content calendar & scheduling', 'Post publishing & management'],
    packageHint: 'Choose platforms, accounts, and monthly post volume.',
  },
  {
    id: 'writing',
    title: 'Writing, Blogging & Research',
    subtitle: 'Useful words, backed by thoughtful research.',
    description: 'Get clear, audience-ready writing for your website, blog, and social channels.',
    icon: BookOpenText,
    accent: 'text-amber-300',
    glow: 'from-amber-500/20 to-yellow-500/5',
    services: ['Website blogs & articles', 'Social media captions', 'Topic research & analysis', 'Content planning', 'Custom website SEO content'],
    packageHint: 'Choose by word count, research depth, and deliverable type.',
  },
  {
    id: 'marketing',
    title: 'Digital Marketing & Ads',
    subtitle: 'Campaign support across the channels that matter.',
    description: 'Plan, set up, and improve campaigns on the platforms your customers use.',
    icon: Megaphone,
    accent: 'text-emerald-300',
    glow: 'from-emerald-500/20 to-teal-500/5',
    services: ['Google Ads', 'YouTube marketing', 'TikTok marketing', 'Meta campaigns', 'Instagram campaigns'],
    packageHint: 'Choose channels and campaign scope. Ad spend stays separate.',
  },
];

export default function Marketplace({ userId, brands }: { userId: string; brands: any[] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const visibleCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((category) =>
      [category.title, category.subtitle, category.description, ...category.services]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);
  const selectedCategory = categories.find((category) => category.id === selected);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1220] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> MECO PAY MARKETPLACE
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your next great idea, made real.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Find creative, content, social, and marketing support in one place. Explore a service to see what fits your business.
            </p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
            />
          </label>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">5 service categories</span>
          <span className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">One-time or monthly options</span>
          <span className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2">Pick the scope that fits</span>
        </div>
      </section>

      {selectedCategory ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-7">
          <button onClick={() => setSelected(null)} className="mb-6 text-sm font-medium text-slate-400 transition hover:text-white">
            ← All marketplace services
          </button>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedCategory.glow} ${selectedCategory.accent}`}>
              <selectedCategory.icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Service overview</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{selectedCategory.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{selectedCategory.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedCategory.services.map((service) => (
                  <div key={service} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{service}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <div><p className="text-sm font-semibold text-white">How packages are shaped</p><p className="mt-1 text-sm text-slate-400">{selectedCategory.packageHint}</p></div>
              </div>
              <p className="mt-5 text-xs text-slate-500">Fixed-price package checkout is not enabled yet; it needs the platform package catalogue and a verified platform payment flow.</p>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><h2 className="text-lg font-bold text-white">Explore services</h2><p className="mt-1 text-sm text-slate-500">Choose a category to see what is available.</p></div>
            <span className="text-xs text-slate-500">{visibleCategories.length} categories</span>
          </div>
          {visibleCategories.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelected(category.id)}
                    className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/45 p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className={`pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${category.glow} blur-2xl transition group-hover:scale-125`} />
                    <div className="relative flex w-full items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-gradient-to-br ${category.glow} ${category.accent}`}><Icon className="h-6 w-6" /></div>
                      <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" />
                    </div>
                    <h3 className="relative mt-5 text-base font-bold leading-snug text-white">{category.title}</h3>
                    <p className="relative mt-2 text-sm leading-5 text-slate-400">{category.subtitle}</p>
                    <div className="relative mt-auto flex flex-wrap gap-1.5 pt-5">
                      {category.services.slice(0, 3).map((service) => <span key={service} className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-400">{service}</span>)}
                      {category.services.length > 3 && <span className="px-1 py-1 text-[10px] text-slate-500">+{category.services.length - 3} more</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">No services match “{query}”. Try another search.</div>}
        </section>
      )}
      {userId && <ClientDashboardAccess userId={userId} brands={brands} />}
    </div>
  );
}
