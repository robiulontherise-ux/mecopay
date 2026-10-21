import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, Loader2, Send, UserRoundPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

type Application = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string | null;
  created_at: string;
};

const categories = [
  { id: 'design', label: 'Graphic Design' },
  { id: 'video', label: 'Video & Content' },
  { id: 'social', label: 'Social Media' },
  { id: 'writing', label: 'Writing & Blogging' },
  { id: 'marketing', label: 'Digital Marketing & Ads' },
];

export default function FreelancerApplicationSection({ userId }: { userId: string }) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [tools, setTools] = useState('');
  const [languages, setLanguages] = useState('');
  const [weeklyCapacity, setWeeklyCapacity] = useState('');
  const [rateNote, setRateNote] = useState('');
  const [applicantNote, setApplicantNote] = useState('');

  const loadApplication = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('freelancer_applications')
      .select('id,status,admin_note,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Could not load freelancer application:', error);
      showToast('Freelancer application table is not ready. Run the supplied SQL first.', 'error');
    } else {
      setApplication(data as Application | null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadApplication();
  }, [userId]);

  const toggleCategory = (id: string) => {
    setServiceCategories(current => current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id]);
  };

  const splitList = (value: string) => value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);

  const submitApplication = async (event: FormEvent) => {
    event.preventDefault();
    if (!serviceCategories.length) {
      showToast('Select at least one service category.', 'error');
      return;
    }
    if (!portfolioUrl.trim() && !portfolioLinks.trim()) {
      showToast('Add a portfolio website or at least one work sample link.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('freelancer_applications')
        .insert({
          user_id: userId,
          service_categories: serviceCategories,
          portfolio_url: portfolioUrl.trim() || null,
          portfolio_links: splitList(portfolioLinks),
          experience_years: experienceYears ? Number(experienceYears) : null,
          experience_summary: experienceSummary.trim() || null,
          tools: splitList(tools),
          languages: splitList(languages),
          weekly_capacity: weeklyCapacity ? Number(weeklyCapacity) : null,
          rate_note: rateNote.trim() || null,
          applicant_note: applicantNote.trim() || null,
          status: 'pending',
        })
        .select('id,status,admin_note,created_at')
        .single();
      if (error) throw error;
      setApplication(data as Application);
      setShowForm(false);
      showToast('Freelancer application submitted for admin review.', 'success');
    } catch (error: any) {
      console.error('Freelancer application submit failed:', error);
      showToast(error?.message || 'Could not submit freelancer application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <UserRoundPlus className="h-5 w-5 text-cyan-300" /> Join as a Freelancer
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Your merchant identity is verified. Apply with your portfolio and skills; admin approval is required before you can take freelancer work.
          </p>
        </div>
        {!loading && !application && (
          <button onClick={() => setShowForm(value => !value)} className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-500">
            {showForm ? 'Close application' : 'Apply now'}
          </button>
        )}
      </div>

      {loading && <p className="mt-4 text-sm text-slate-400">Checking application status…</p>}

      {!loading && application?.status === 'pending' && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-200">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Application under review</p><p className="mt-1 text-sm text-slate-400">You can continue using your merchant account while the admin reviews your freelancer application.</p></div>
        </div>
      )}

      {!loading && application?.status === 'approved' && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Freelancer application approved</p><p className="mt-1 text-sm text-slate-400">Freelancer work access is approved for this account.</p></div>
        </div>
      )}

      {!loading && application?.status === 'rejected' && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-200">
          <p className="font-semibold">Application not approved</p>
          {application.admin_note && <p className="mt-1 text-sm text-slate-300">Admin note: {application.admin_note}</p>}
          <button onClick={() => { setApplication(null); setShowForm(true); }} className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">Update and reapply</button>
        </div>
      )}

      {showForm && !application && (
        <form onSubmit={submitApplication} className="mt-6 space-y-5 border-t border-slate-800 pt-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-200">Services you can provide *</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map(category => (
                <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
                  <input type="checkbox" checked={serviceCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} className="accent-cyan-500" />
                  {category.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Portfolio website
              <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300">Other work sample links (comma or new line separated)
              <textarea value={portfolioLinks} onChange={e => setPortfolioLinks(e.target.value)} rows={2} placeholder="https://…" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300">Years of experience
              <input type="number" min="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300">Weekly capacity (jobs)
              <input type="number" min="0" value={weeklyCapacity} onChange={e => setWeeklyCapacity(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300 sm:col-span-2">Experience and service details
              <textarea value={experienceSummary} onChange={e => setExperienceSummary(e.target.value)} rows={3} placeholder="Describe your relevant experience and the work you offer." className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300">Tools/platforms (comma separated)
              <input value={tools} onChange={e => setTools(e.target.value)} placeholder="Photoshop, Meta Ads…" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300">Work languages (comma separated)
              <input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Bangla, English" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300 sm:col-span-2">Rate note (optional)
              <input value={rateNote} onChange={e => setRateNote(e.target.value)} placeholder="For example: quote per project" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
            <label className="text-sm text-slate-300 sm:col-span-2">Note for admin (optional)
              <textarea value={applicantNote} onChange={e => setApplicantNote(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
            </label>
          </div>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Submitting…' : 'Submit for admin review'}
          </button>
        </form>
      )}
    </section>
  );
}
