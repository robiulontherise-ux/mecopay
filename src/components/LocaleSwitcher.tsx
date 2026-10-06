import React from 'react';
import { useLocale } from '../lib/LocaleContext';

export default function LocaleSwitcher({ className = '' }: { className?: string }) {
  const { country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage } = useLocale();
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-slate-500">
        {isDetecting ? 'Detecting location…' : `Country: ${countryData?.name || 'Select country'}`}
      </span>
      <select aria-label="Country" value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
        <option value="">Select country</option>
        {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
      <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
        {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
