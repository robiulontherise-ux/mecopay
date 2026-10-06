import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCountryLanguageOptions, getDefaultCountryLanguage, loadCountriesByContinent, type Continent, type CountryLanguage } from './marketingLocalization';

type LocaleContextValue = {
  continent: Continent;
  country: string;
  language: string;
  countries: CountryLanguage[];
  isDetecting: boolean;
  countryData?: CountryLanguage;
  languageOptions: { value: string; label: string }[];
  setCountry: (code: string) => void;
  setLanguage: (language: string) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const continentFromCode: Record<string, Continent> = { AF: 'africa', AS: 'asia', EU: 'europe', NA: 'north-america', SA: 'south-america', OC: 'oceania' };
const languageAliases: Record<string, string> = {
  eng: 'en', ben: 'bn', hin: 'hi', ara: 'ar', fra: 'fr', fre: 'fr', spa: 'es', por: 'pt',
  zho: 'zh', chi: 'zh', deu: 'de', ger: 'de', jpn: 'ja', kor: 'ko', rus: 'ru', tur: 'tr',
  tam: 'ta', tel: 'te', urd: 'ur', ita: 'it', nld: 'nl', dut: 'nl', tha: 'th', vie: 'vi',
  ukr: 'uk', pol: 'pl', ell: 'el', heb: 'he', nep: 'ne', sin: 'si', swe: 'sv', dan: 'da'
};

const normalizeLanguage = (language: string) => {
  const code = language.trim().toLowerCase();
  return languageAliases[code] || code;
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [continent, setContinent] = useState<Continent>(() => (typeof window !== 'undefined' ? (window.localStorage.getItem('mecopay.continent') as Continent) || 'asia' : 'asia'));
  const [country, setCountryState] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('mecopay.country') || '' : ''));
  const [detectedCountry, setDetectedCountry] = useState('');
  const [language, setLanguageState] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('mecopay.language') || 'en' : 'en'));
  const [countries, setCountries] = useState<CountryLanguage[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        let data: { continent_code?: string; country_code?: string };
        try {
          const response = await fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('primary lookup failed');
          data = await response.json();
        } catch {
          const response = await fetch('https://ipwho.is/');
          if (!response.ok) throw new Error('fallback lookup failed');
          data = await response.json();
        }
        if (cancelled) return;
        const nextContinent = continentFromCode[data.continent_code || ''] || 'asia';
        const nextCountry = data.country_code || '';
        const savedCountry = window.localStorage.getItem('mecopay.country');
        const savedContinent = window.localStorage.getItem('mecopay.continent') as Continent | null;
        const savedLanguage = window.localStorage.getItem('mecopay.language');
        setContinent(savedContinent || nextContinent);
        window.localStorage.setItem('mecopay.continent', savedContinent || nextContinent);
        setDetectedCountry(nextCountry);
        if (!savedCountry) {
          setCountryState(nextCountry);
          window.localStorage.setItem('mecopay.country', nextCountry);
        }
        if (savedLanguage) setLanguageState(normalizeLanguage(savedLanguage));
      } catch {
        if (!cancelled) setContinent('asia');
      } finally {
        if (!cancelled) setIsDetecting(false);
      }
    };
    detect();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadCountriesByContinent(continent).then((list) => {
      if (cancelled) return;
      setCountries(list);
      const preferred = country || detectedCountry;
      const nextCountry = list.some((item) => item.code === preferred) ? preferred : (list[0]?.code || '');
      setCountryState(nextCountry);
      if (!window.localStorage.getItem('mecopay.language')) setLanguageState(getDefaultCountryLanguage(list.find((item) => item.code === nextCountry)));
    }).catch(() => { if (!cancelled) setCountries([]); });
    return () => { cancelled = true; };
  }, [continent, detectedCountry]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'he', 'ur'].includes(language) ? 'rtl' : 'ltr';
    window.localStorage.setItem('mecopay.language', language);
  }, [language]);

  const countryData = countries.find((item) => item.code === country);
  const languageOptions = useMemo(() => getCountryLanguageOptions(countryData, countries), [countryData, countries]);
  const setCountry = (code: string) => {
    setCountryState(code);
    window.localStorage.setItem('mecopay.country', code);
    const nextLanguage = getDefaultCountryLanguage(countries.find((item) => item.code === code));
    setLanguageState(nextLanguage);
  };
  const setLanguage = (nextLanguage: string) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    window.localStorage.setItem('mecopay.language', normalized);
  };

  return <LocaleContext.Provider value={{ continent, country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
