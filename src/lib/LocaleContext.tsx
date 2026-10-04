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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [continent, setContinent] = useState<Continent>('asia');
  const [country, setCountryState] = useState('');
  const [detectedCountry, setDetectedCountry] = useState('');
  const [language, setLanguage] = useState('en');
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
        setContinent(nextContinent);
        setDetectedCountry(nextCountry);
        setCountryState(nextCountry);
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
      const preferred = detectedCountry || country;
      const nextCountry = list.some((item) => item.code === preferred) ? preferred : (list[0]?.code || '');
      setCountryState(nextCountry);
      setLanguage(getDefaultCountryLanguage(list.find((item) => item.code === nextCountry)));
    }).catch(() => { if (!cancelled) setCountries([]); });
    return () => { cancelled = true; };
  }, [continent, detectedCountry]);

  const countryData = countries.find((item) => item.code === country);
  const languageOptions = useMemo(() => getCountryLanguageOptions(countryData, countries), [countryData, countries]);
  const setCountry = (code: string) => {
    setCountryState(code);
    setLanguage(getDefaultCountryLanguage(countries.find((item) => item.code === code)));
  };

  return <LocaleContext.Provider value={{ continent, country, language, countries, isDetecting, countryData, languageOptions, setCountry, setLanguage }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
