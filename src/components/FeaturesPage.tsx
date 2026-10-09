import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/LocaleContext';

export default function FeaturesPage() {
  const { country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage } = useLocale();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <Link to="/login" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-8 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <span className="text-xs font-semibold text-neutral-500">
            {isDetecting ? 'Detecting location…' : `Country: ${countryData?.name || 'Select country'}`}
          </span>
          <select 
            aria-label="Country" 
            value={country} 
            onChange={(event) => setCountry(event.target.value)} 
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-neutral-200"
          >
            <option value="">Select country</option>
            {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select 
            aria-label="Language" 
            value={language} 
            onChange={(event) => setLanguage(event.target.value)} 
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-neutral-200"
          >
            {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white">Features</h1>
            <p className="text-neutral-500 mt-2">MecoPay Platform Features</p>
          </div>
        </div>

        {/* Content Section - Ready for adding features */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 md:p-12 text-center text-neutral-400">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-200">
              {language === 'bn' ? 'ফিচারসমূহ' : 'Features'}
            </h3>
            <p className="text-sm text-neutral-500">
              {language === 'bn' 
                ? 'নতুন ফিচার এবং সেবাসমূহের বিস্তারিত শীঘ্রই এখানে যুক্ত করা হবে।' 
                : 'New platform features and integrations will be added here soon.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
