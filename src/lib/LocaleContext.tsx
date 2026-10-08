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
const LANGUAGE_KEY = 'mecopay.language';
const MANUAL_LANGUAGE_KEY = 'mecopay.language.manual';
const CONTINENT_KEY = 'mecopay.continent';
const COUNTRY_KEY = 'mecopay.country';
const continentFromCode: Record<string, Continent> = { AF: 'africa', AS: 'asia', EU: 'europe', NA: 'north-america', SA: 'south-america', OC: 'oceania' };
const validContinents = new Set<Continent>(['asia', 'africa', 'europe', 'north-america', 'south-america', 'oceania', 'unknown']);
const languageAliases: Record<string, string> = {
  eng: 'en', ben: 'bn', hin: 'hi', ara: 'ar', fra: 'fr', fre: 'fr', spa: 'es', por: 'pt',
  zho: 'zh', chi: 'zh', deu: 'de', ger: 'de', jpn: 'ja', kor: 'ko', rus: 'ru', tur: 'tr',
  tam: 'ta', tel: 'te', urd: 'ur', ita: 'it', nld: 'nl', dut: 'nl', tha: 'th', vie: 'vi',
  ukr: 'uk', pol: 'pl', ell: 'el', heb: 'he', nep: 'ne', sin: 'si', swe: 'sv', dan: 'da'
};

const normalizeLanguage = (language: string) => {
  const baseCode = language.trim().toLowerCase().split(/[-_]/)[0];
  return languageAliases[baseCode] || baseCode || 'en';
};

const readLanguagePreference = () => typeof window === 'undefined' ? null : window.localStorage.getItem(LANGUAGE_KEY);
const hasExplicitLanguagePreference = () => typeof window !== 'undefined' && window.localStorage.getItem(MANUAL_LANGUAGE_KEY) === 'true';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [continent, setContinent] = useState<Continent>(() => {
    if (typeof window === 'undefined') return 'asia';
    const saved = window.localStorage.getItem(CONTINENT_KEY) as Continent | null;
    return saved && validContinents.has(saved) ? saved : 'asia';
  });
  const [country, setCountryState] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem(COUNTRY_KEY) || '' : ''));
  const [detectedCountry, setDetectedCountry] = useState('');
  const [language, setLanguageState] = useState(() => {
    const saved = readLanguagePreference();
    return saved ? normalizeLanguage(saved) : 'en';
  });
  const [countries, setCountries] = useState<CountryLanguage[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isLocaleReady, setIsLocaleReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        let data: { continent_code?: string; country_code?: string };
        try {
          const response = await fetch('https://ipapi.co/json/', { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('Primary country lookup failed');
          data = await response.json();
          if (!data.country_code) throw new Error('Primary lookup returned no country');
        } catch {
          const response = await fetch('https://ipwho.is/');
          if (!response.ok) throw new Error('Fallback country lookup failed');
          data = await response.json();
          if (!data.country_code) throw new Error('Fallback lookup returned no country');
        }
        if (cancelled) return;

        const nextCountry = (data.country_code || '').toUpperCase();
        const savedCountry = window.localStorage.getItem(COUNTRY_KEY);
        const savedContinentValue = window.localStorage.getItem(CONTINENT_KEY) as Continent | null;
        const detectedContinent = continentFromCode[(data.continent_code || '').toUpperCase()] || 'asia';
        const nextContinent = savedContinentValue && validContinents.has(savedContinentValue) ? savedContinentValue : detectedContinent;

        setContinent(nextContinent);
        window.localStorage.setItem(CONTINENT_KEY, nextContinent);
        setDetectedCountry(nextCountry);
        if (!savedCountry && nextCountry) {
          setCountryState(nextCountry);
          window.localStorage.setItem(COUNTRY_KEY, nextCountry);
        }
      } catch {
        // Keep the last saved country/continent when IP lookup is unavailable.
      } finally {
        if (!cancelled) setIsDetecting(false);
      }
    };
    detect();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isDetecting) return;
    let cancelled = false;
    const load = async () => {
      try {
        const list = await loadCountriesByContinent(continent);
        if (cancelled) return;
        setCountries(list);

        const savedCountry = window.localStorage.getItem(COUNTRY_KEY) || country || detectedCountry;
        const nextCountry = list.find((item) => item.code === savedCountry)?.code
          || list.find((item) => item.code === detectedCountry)?.code
          || '';
        setCountryState(nextCountry);
        if (nextCountry) window.localStorage.setItem(COUNTRY_KEY, nextCountry);
        else window.localStorage.removeItem(COUNTRY_KEY);
        window.localStorage.setItem(CONTINENT_KEY, continent);

        const savedLanguage = readLanguagePreference();
        const normalizedSavedLanguage = savedLanguage ? normalizeLanguage(savedLanguage) : '';
        const explicitPreference = hasExplicitLanguagePreference();
        // Old versions persisted the provisional English default before IP lookup completed.
        // Preserve legacy non-English choices, but recompute an unmarked English value from country.
        const legacyNonEnglishChoice = !!normalizedSavedLanguage && normalizedSavedLanguage !== 'en';
        const keepSavedLanguage = !!normalizedSavedLanguage && (explicitPreference || legacyNonEnglishChoice);
        const nextLanguage = keepSavedLanguage
          ? normalizedSavedLanguage
          : getDefaultCountryLanguage(list.find((item) => item.code === nextCountry));

        if (legacyNonEnglishChoice && !explicitPreference) window.localStorage.setItem(MANUAL_LANGUAGE_KEY, 'true');
        else if (!keepSavedLanguage) window.localStorage.removeItem(MANUAL_LANGUAGE_KEY);
        setLanguageState(nextLanguage);
        setIsLocaleReady(true);
      } catch {
        if (cancelled) return;
        setCountries([]);
        const savedLanguage = readLanguagePreference();
        const normalizedSavedLanguage = savedLanguage ? normalizeLanguage(savedLanguage) : '';
        const keepSavedLanguage = !!normalizedSavedLanguage && (hasExplicitLanguagePreference() || normalizedSavedLanguage !== 'en');
        const nextLanguage = keepSavedLanguage ? normalizedSavedLanguage : 'en';
        if (keepSavedLanguage && normalizedSavedLanguage !== 'en') window.localStorage.setItem(MANUAL_LANGUAGE_KEY, 'true');
        setLanguageState(nextLanguage);
        setIsLocaleReady(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [continent, detectedCountry, isDetecting]);

  useEffect(() => {
    const activeLanguage = language || 'en';
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = ['ar', 'he', 'ur'].includes(activeLanguage) ? 'rtl' : 'ltr';
    // Do not persist the temporary English render before country detection and language resolution finish.
    if (isLocaleReady) window.localStorage.setItem(LANGUAGE_KEY, activeLanguage);
  }, [language, isLocaleReady]);

  const countryData = countries.find((item) => item.code === country);
  const languageOptions = useMemo(() => getCountryLanguageOptions(countryData, countries), [countryData, countries]);

  const setCountry = (code: string) => {
    const selectedCountry = countries.find((item) => item.code === code);
    setCountryState(code);
    window.localStorage.setItem(COUNTRY_KEY, code);
    const nextLanguage = getDefaultCountryLanguage(selectedCountry);
    window.localStorage.removeItem(MANUAL_LANGUAGE_KEY);
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    setIsLocaleReady(true);
  };

  const setLanguage = (nextLanguage: string) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    window.localStorage.setItem(LANGUAGE_KEY, normalized);
    window.localStorage.setItem(MANUAL_LANGUAGE_KEY, 'true');
    setIsLocaleReady(true);
  };

  return <LocaleContext.Provider value={{ continent, country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
