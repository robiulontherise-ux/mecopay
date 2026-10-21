import { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, ExternalLink, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/toast';

type Application = {
  id: string;
  user_id: string;
  service_categories: string[];
  portfolio_url: string | null;
  portfolio_links: string[];
  experience_years: number | null;
  experience_summary: string | null;
  tools: string[];
  languages: string[];
  weekly_capacity: number | null;
  rate_note: string | null;
  applicant_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  wants_dashboard_work: boolean;
  dashboard_work_review_status: 'not_requested' | 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  profile?: { name: string | null; email: string | null; verification_status: string | null };
};

const labels: Record<string, string> = {
  design: 'Graphic Design',
  video: 'Video & Content',
  social: 'Social Media',
  writing: 'Writing & Blogging',
  marketing: 'Digital Marketing & Ads',
};

export default function FreelancerApplicationsAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: appError } = await supabase
        .from('freelancer_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (appError) throw appError;
      const rows = (data || []) as Application[];
      const ids = [...new Set(rows.map(row => row.user_id))];
      let profiles: any[] = [];
      if (ids.length) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id,name,email,verification_status')
          .in('id', ids);
        if (profileError) throw profileError;
        profiles = profileData || [];
      }
      const byId = new Map(profiles.map(profile => [profile.id, profile]));
      setApplications(rows.map(row => ({ ...row, profile: byId.get(row.user_id) })));
    } catch (err: any) {
      console.error('Could not load freelancer applications:', err);
      const message = err?.message || 'Could not load applications.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  const approve = async (application: Application) => {
    if (application.profile?.verification_status !== 'verified') {
      showToast('Applicant must complete merchant identity verification first.', 'error');
      return;
    }
    setBusyId(application.id);
    try {
      const { error } = await supabase.rpc('admin_review_freelancer_application', {
        p_application_id: application.id,
        p_decision: 'approve',
        p_admin_note: null,
      });
      if (error) throw error;
      showToast('Freelancer application approved.', 'success');
      await loadApplications();
    } catch (err: any) {
      console.error('Freelancer approval failed:', err);
      showToast(err?.message || 'Could not approve application. Run the supplied SQL and verify database permissions.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (application: Application) => {
    const note = window.prompt('Optional note for the applicant:') || '';
    setBusyId(application.id);
    try {
      const { error } = await supabase.rpc('admin_review_freelancer_application', {
        p_application_id: application.id,
        p_decision: 'reject',
        p_admin_note: note.trim() || null,
      });
      if (error) throw error;
      showToast('Application marked as rejected.', 'success');
      await loadApplications();
    } catch (err: any) {
      console.error('Freelancer rejection failed:', err);
      showToast(err?.message || 'Could not reject application.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Freelancer Applications</h2>
          <p className="mt-1 text-sm text-slate-400">Review portfolio and skills. Applicants must already have verified merchant identity.</p>
        </div>
        <button onClick={() => void loadApplications()} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">Could not load freelancer applications. {error}. Ensure the supplied SQL has been run.</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading applications…</div>}
      {!loading && !error && applications.length === 0 && <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">No freelancer applications yet.</div>}

      <div className="space-y-4">
        {applications.map(application => {
          const isBusy = busyId === application.id;
          const verified = application.profile?.verification_status === 'verified';
          return (
            <article key={application.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{application.profile?.name || 'Applicant'}</h3>
                    <span className="text-sm text-slate-400">{application.profile?.email || application.user_id}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${verified ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                      {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      Identity {application.profile?.verification_status || 'unknown'}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">{application.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(application.service_categories || []).map(key => <span key={key} className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">{labels[key] || key}</span>)}
                  </div>
                  <div className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${application.wants_dashboard_work ? 'border-violet-500/30 bg-violet-500/10 text-violet-200' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
                    Dashboard Work: {application.wants_dashboard_work ? `requested (${application.dashboard_work_review_status}) — client chooses page scope` : 'not requested'}
                  </div>
                  {application.experience_summary && <p className="whitespace-pre-wrap text-sm text-slate-300">{application.experience_summary}</p>}
                  <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    {application.experience_years !== null && <p>Experience: {application.experience_years} year(s)</p>}
                    {application.weekly_capacity !== null && <p>Weekly capacity: {application.weekly_capacity} job(s)</p>}
                    {!!application.tools?.length && <p>Tools: {application.tools.join(', ')}</p>}
                    {!!application.languages?.length && <p>Languages: {application.languages.join(', ')}</p>}
                    {application.rate_note && <p>Rate: {application.rate_note}</p>}
                  </div>
                  {application.applicant_note && <p className="text-sm text-slate-400">Applicant note: {application.applicant_note}</p>}
                  <div className="flex flex-wrap gap-3">
                    {application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Portfolio <ExternalLink className="h-3.5 w-3.5" /></a>}
                    {(application.portfolio_links || []).map((link, index) => <a key={`${link}-${index}`} href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Work sample {index + 1} <ExternalLink className="h-3.5 w-3.5" /></a>)}
                  </div>
                  <p className="text-xs text-slate-500">Applied {new Date(application.created_at).toLocaleString()}</p>
                </div>
                {application.status === 'pending' && (
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => void approve(application)} disabled={isBusy || !verified} title={!verified ? 'Merchant identity must be verified first' : 'Approve freelancer'} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve Freelancer
                    </button>
                    <button onClick={() => void reject(application)} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
