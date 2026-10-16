import React from 'react';
import { useLocale } from '../lib/LocaleContext';

type LocaleSwitcherProps = {
  className?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
};

export default function LocaleSwitcher({ className = '', variant = 'light', compact = false }: LocaleSwitcherProps) {
  const { country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage } = useLocale();
  const isDark = variant === 'dark';
  const isBengali = language === 'bn';
  const textClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const selectClass = isDark
    ? 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
    : 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const compactCountryClass = compact ? `${selectClass.replace('px-3', 'px-2')} w-auto max-w-[32vw] sm:max-w-56` : selectClass;
  const compactLanguageClass = compact ? `${selectClass.replace('px-3', 'px-2')} w-auto max-w-[28vw] sm:max-w-40` : selectClass;
  const layoutClass = compact ? 'flex-nowrap justify-center' : 'flex-wrap';
  const countryLabel = isBengali ? 'দেশ' : 'Country';
  const languageLabel = isBengali ? 'ভাষা' : 'Language';

  return (
    <div className={`flex ${layoutClass} items-center ${compact ? 'gap-0.5 sm:gap-2' : 'gap-2'} ${className}`}>
      <span className={`${compact ? 'max-w-[28vw] shrink-0 truncate text-[11px] sm:max-w-none sm:text-xs' : ''} text-xs font-semibold ${textClass}`}>
        {isDetecting
          ? (isBengali ? 'অবস্থান শনাক্ত হচ্ছে…' : 'Detecting location…')
          : `${countryLabel}: ${countryData?.name || (isBengali ? 'দেশ নির্বাচন' : 'Select country')}`}
      </span>
      <select aria-label={countryLabel} value={country} onChange={(event) => setCountry(event.target.value)} className={compact ? compactCountryClass : selectClass}>
        <option value="">{isBengali ? 'দেশ নির্বাচন' : 'Select country'}</option>
        {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
      <select aria-label={languageLabel} value={language} onChange={(event) => setLanguage(event.target.value)} className={compact ? compactLanguageClass : selectClass}>
        {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
