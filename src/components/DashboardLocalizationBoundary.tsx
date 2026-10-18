/// <reference types="vite/client" />
import { useLayoutEffect, useRef, useState, useEffect, type ReactNode } from 'react';
import { useLocale } from '../lib/LocaleContext';
import { dashboardAdditionalTranslations } from '../lib/dashboardAdditionalTranslations';
import { dashboardRuntimeTranslations } from '../lib/dashboardRuntimeTranslations';

type LocaleCatalog = Record<string, string>;
const localeCatalogLoaders = import.meta.glob('../locales/dashboard/*.json', { import: 'default' }) as Record<string, () => Promise<LocaleCatalog>>;
const normalized = (value: string) => value.trim().replace(/\s+/g, ' ');
const excludedSelector = 'pre, code, script, style, textarea, [data-no-localize="true"]';
const sourceText = new WeakMap<Text, { source: string; rendered: string }>();
const sourceAttributes = new WeakMap<Element, Map<string, { source: string; rendered: string }>>();
const localizableAttributes = ['placeholder', 'title', 'aria-label'] as const;
const phraseCache = new WeakMap<LocaleCatalog, [string, string][]>();
const placeholderCache = new WeakMap<LocaleCatalog, { pattern: RegExp; tokens: string[]; translated: string }[]>();

const canonicalLocale = (value: string) => value.trim().toLowerCase().split(/[-_]/)[0];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function localizedValue(language: string, original: string, catalog: LocaleCatalog) {
  if (language === 'bn') return original.trim();
  const key = normalized(original);
  if (catalog[key]) return catalog[key];

  let templates = placeholderCache.get(catalog);
  if (!templates) {
    templates = Object.entries(catalog)
      .filter(([source]) => /\{[^{}]+\}/.test(source))
      .map(([source, translated]) => {
        const tokens = Array.from(source.matchAll(/\{[^{}]+\}/g), ([token]) => token);
        const pattern = new RegExp(`^${source.split(/\{[^{}]+\}/).map(escapeRegExp).join('([\\s\\S]+?)')}$`);
        return { pattern, tokens, translated };
      });
    placeholderCache.set(catalog, templates);
  }
  for (const { pattern, tokens, translated } of templates) {
    const match = key.match(pattern);
    if (!match) continue;
    let result = translated;
    tokens.forEach((token, index) => { result = result.replace(token, () => match[index + 1]); });
    return result;
  }

  // Dynamic labels can combine Bengali copy with a merchant name or number.
  // Translate only known Bengali phrases and preserve all unmatched content.
  let phrases = phraseCache.get(catalog);
  if (!phrases) {
    phrases = Object.entries(catalog)
      .filter(([source]) => source.length >= 3 && /[\u0980-\u09ff]/.test(source))
      .sort(([a], [b]) => b.length - a.length);
    phraseCache.set(catalog, phrases);
  }
  let result = original;
  for (const [source, translation] of phrases) {
    if (result.includes(source)) result = result.split(source).join(translation);
  }
  // Runtime copy (validation errors, demo agent replies and status messages)
  // is not always present in the generated catalogs. Translate known Bengali
  // fragments as a safe fallback while preserving dynamic IDs, amounts and
  // domain names. Editable textarea/code content remains excluded above.
  const runtimePhrases = Object.entries(dashboardRuntimeTranslations)
    .filter(([source]) => source.length >= 3)
    .sort(([a], [b]) => b.length - a.length);
  for (const [source, translation] of runtimePhrases) {
    if (result.includes(source)) result = result.split(source).join(translation);
  }
  return result === original ? undefined : result;
}

function translateTextNode(node: Text, language: string, catalog: LocaleCatalog) {
  const parent = node.parentElement;
  if (!parent || parent.closest(excludedSelector)) return;
  const current = node.nodeValue || '';
  const previous = sourceText.get(node);
  const original = previous && current === previous.rendered ? previous.source : current;
  if (!/[\u0980-\u09ff]/.test(original)) return;
  const translation = localizedValue(language, original, catalog);
  if (!translation) return;
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  const next = `${leading}${translation}${trailing}`;
  sourceText.set(node, { source: original, rendered: next });
  if (current !== next) node.nodeValue = next;
}

function translateElementAttributes(element: Element, language: string, catalog: LocaleCatalog) {
  if (element.closest(excludedSelector)) return;
  let originals = sourceAttributes.get(element);
  for (const attribute of localizableAttributes) {
    const current = element.getAttribute(attribute);
    if (current === null) continue;
    if (!originals) {
      originals = new Map();
      sourceAttributes.set(element, originals);
    }
    const previous = originals.get(attribute);
    const original = previous && current === previous.rendered ? previous.source : current;
    if (!/[\u0980-\u09ff]/.test(original)) continue;
    const translation = localizedValue(language, original, catalog);
    if (!translation) continue;
    originals.set(attribute, { source: original, rendered: translation });
    if (translation !== current) element.setAttribute(attribute, translation);
  }
}

function localizeSubtree(root: HTMLElement, language: string, catalog: LocaleCatalog) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) translateTextNode(node as Text, language, catalog);
  translateElementAttributes(root, language, catalog);
  root.querySelectorAll('*').forEach((element) => translateElementAttributes(element, language, catalog));
}

export default function DashboardLocalizationBoundary({ children }: { children: ReactNode }) {
  const { language } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [loadedCatalog, setLoadedCatalog] = useState<{ language: string; entries: LocaleCatalog } | null>(null);

  useEffect(() => {
    if (language === 'bn') {
      setLoadedCatalog(null);
      return;
    }
    let cancelled = false;
    const locale = canonicalLocale(language);
    const load = localeCatalogLoaders[`../locales/dashboard/${locale}.json`];
    const generatedCatalog = dashboardAdditionalTranslations[locale];
    if (!load && !generatedCatalog) {
      setLoadedCatalog(null);
      return;
    }
    const catalogPromise = load ? load() : Promise.resolve(generatedCatalog);
    catalogPromise.then((entries) => {
      if (!cancelled) setLoadedCatalog({ language, entries });
    }).catch((error) => {
      console.error(`Dashboard translations unavailable for ${language}:`, error);
      if (!cancelled) setLoadedCatalog(null);
    });
    return () => { cancelled = true; };
  }, [language]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const catalogReady = language === 'bn' || loadedCatalog?.language === language;
    // Restore Bengali source while a newly selected locale chunk loads, rather
    // than briefly showing stale text from the previous language.
    const effectiveLanguage = catalogReady ? language : 'bn';
    const catalog = catalogReady && loadedCatalog?.language === language ? loadedCatalog.entries : {};
    const observationRoot = document.body;
    localizeSubtree(observationRoot, effectiveLanguage, catalog);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData' && record.target instanceof Text) {
          translateTextNode(record.target, effectiveLanguage, catalog);
        }
        for (const added of Array.from(record.addedNodes)) {
          if (added instanceof Text) translateTextNode(added, effectiveLanguage, catalog);
          else if (added instanceof HTMLElement) localizeSubtree(added, effectiveLanguage, catalog);
        }
        if (record.type === 'attributes' && record.target instanceof Element) {
          translateElementAttributes(record.target, effectiveLanguage, catalog);
        }
      }
    });
    observer.observe(observationRoot, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...localizableAttributes] });
    return () => observer.disconnect();
  }, [language, loadedCatalog]);

  return <div ref={rootRef} className="contents" lang={language}>
    {children}
  </div>;
}
