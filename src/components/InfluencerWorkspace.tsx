import { useEffect, useState } from 'react';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';

const parseList = (value: string) => value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);
const formatList = (value: string[] | null | undefined) => (value || []).join(', ');

export default function InfluencerWorkspace({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [niches, setNiches] = useState('');
  const [languages, setLanguages] = useState('');
  const [audienceCountries, setAudienceCountries] = useState('');
  const [platformAccounts, setPlatformAccounts] = useState('[]');
  const [audienceSummary, setAudienceSummary] = useState('');
  const [rateCard, setRateCard] = useState('{}');
  const [profileStatus, setProfileStatus] = useState<'active' | 'paused' | 'hidden'>('active');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('influencer_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) {
        console.error('Could not load influencer profile:', error);
        showToast(error.message || 'Could not load influencer profile. Run the supplied SQL migration.', 'error');
      } else if (data && !cancelled) {
        setBio(data.bio || '');
        setNiches(formatList(data.niches));
        setLanguages(formatList(data.languages));
        setAudienceCountries(formatList(data.audience_countries));
        setPlatformAccounts(JSON.stringify(data.platform_accounts || [], null, 2));
        setAudienceSummary(data.audience_summary || '');
        setRateCard(JSON.stringify(data.rate_card || {}, null, 2));
        setProfileStatus(data.profile_status || 'active');
      }
      if (!cancelled) setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const save = async () => {
    let accounts: any;
    let rates: any;
    try {
      accounts = JSON.parse(platformAccounts || '[]');
      rates = JSON.parse(rateCard || '{}');
      if (!Array.isArray(accounts) || !rates || Array.isArray(rates) || typeof rates !== 'object') throw new Error('Platform accounts must be a JSON array and rate card must be a JSON object.');
    } catch (error: any) {
      showToast(error?.message || 'Platform and rate card JSON is invalid.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('influencer_profiles').upsert({
        user_id: userId,
        bio: bio.trim() || null,
        niches: parseList(niches),
        languages: parseList(languages),
        audience_countries: parseList(audienceCountries),
        platform_accounts: accounts,
        audience_summary: audienceSummary.trim() || null,
        rate_card: rates,
        profile_status: profileStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
      showToast('Influencer profile saved.', 'success');
    } catch (error: any) {
      console.error('Could not save influencer profile:', error);
      showToast(error?.message || 'Could not save influencer profile. Confirm influencer role and SQL policies.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading influencer workspace…</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header><h2 className="flex items-center gap-2 text-2xl font-bold text-white"><Sparkles className="h-6 w-6 text-fuchsia-300" /> Influencer Workspace</h2><p className="mt-1 text-sm text-slate-400">Your influencer role is enabled by an admin. Maintain your public-facing profile and campaign information here.</p></header>
      <section className="grid gap-4 rounded-2xl border border-fuchsia-500/20 bg-slate-950/60 p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm text-slate-300 sm:col-span-2">Bio
          <textarea value={bio} onChange={event => setBio(event.target.value)} rows={4} maxLength={3000} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" placeholder="Introduce your content and audience." />
        </label>
        <label className="text-sm text-slate-300">Niches (comma-separated)<input value={niches} onChange={event => setNiches(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" placeholder="beauty, travel, technology" /></label>
        <label className="text-sm text-slate-300">Languages (comma-separated)<input value={languages} onChange={event => setLanguages(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" placeholder="Bengali, English" /></label>
        <label className="text-sm text-slate-300">Audience countries (comma-separated)<input value={audienceCountries} onChange={event => setAudienceCountries(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" placeholder="Bangladesh, India" /></label>
        <label className="text-sm text-slate-300">Profile status<select value={profileStatus} onChange={event => setProfileStatus(event.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"><option value="active">Active</option><option value="paused">Paused</option><option value="hidden">Hidden</option></select></label>
        <label className="text-sm text-slate-300 sm:col-span-2">Audience summary<textarea value={audienceSummary} onChange={event => setAudienceSummary(event.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" placeholder="Audience size, engagement, demographics (avoid private personal data)." /></label>
        <label className="text-sm text-slate-300">Platform accounts (JSON array)<textarea value={platformAccounts} onChange={event => setPlatformAccounts(event.target.value)} rows={6} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-xs text-white" placeholder={'[{"platform":"Instagram","url":"https://...","followers":0}]'} /></label>
        <label className="text-sm text-slate-300">Rate card (JSON object)<textarea value={rateCard} onChange={event => setRateCard(event.target.value)} rows={6} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-xs text-white" placeholder={'{"currency":"BDT","post":0,"story":0}'} /></label>
        <div className="sm:col-span-2"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-fuchsia-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save influencer profile</button></div>
      </section>
    </div>
  );
}
