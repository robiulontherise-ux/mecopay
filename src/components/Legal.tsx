import React from 'react';
import { ArrowLeft, ShieldCheck, ShieldAlert, FileText, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/LocaleContext';
import { getLegalCopy, type LegalPageKey } from '../lib/legalLocalization';

const LegalLayout = ({ page, icon: Icon }: { page: LegalPageKey; icon: React.ComponentType<{ className?: string }> }) => {
  const { country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage } = useLocale();
  const content = getLegalCopy(page, language);
  const lastUpdated = language === 'bn' ? '৩ আগস্ট ২০২৬' : 'August 3, 2026';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-8 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <span className="text-xs font-semibold text-neutral-500">{isDetecting ? 'Detecting location…' : `Country: ${countryData?.name || 'Select country'}`}</span>
          <select aria-label="Country" value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-neutral-200">
            <option value="">Select country</option>
            {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-neutral-200">
            {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white">{content.title}</h1>
            <p className="text-neutral-500 mt-2">{language === 'bn' ? 'সর্বশেষ আপডেট' : 'Last updated'}: {lastUpdated}</p>
          </div>
        </div>

        <div className="prose prose-invert prose-blue max-w-none prose-headings:text-white prose-p:leading-relaxed prose-li:leading-relaxed">
          {content.alert && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8 not-prose">
              <div className="flex gap-4">
                <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                <div className="text-sm text-red-200">
                  <p className="font-bold text-red-400 mb-2 text-base">{content.alertTitle}</p>
                  <p>{content.alert}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-8">
            {content.sections.map((section: any, index: number) => (
              <section key={`${page}-${index}`}>
                {section.heading && <h2 className="text-2xl font-bold text-white mb-4">{section.heading}</h2>}
                {section.paragraphs.map((paragraph: string, paragraphIndex: number) => <p key={`p-${paragraphIndex}`} className={paragraphIndex > 0 ? 'mt-3' : undefined}>{paragraph}</p>)}
                {section.items.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    {section.items.map((item: string, itemIndex: number) => <li key={`i-${itemIndex}`}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy = () => <LegalLayout page="privacy" icon={ShieldCheck} />;
export const TermsConditions = () => <LegalLayout page="terms" icon={FileText} />;
export const RefundPolicy = () => <LegalLayout page="refund" icon={RefreshCcw} />;
export const CustomerRightsAndAntiFraud = () => <LegalLayout page="antiFraud" icon={ShieldCheck} />;
export const DeveloperDocsPage = () => <LegalLayout page="docs" icon={FileText} />;
