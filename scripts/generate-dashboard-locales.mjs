#!/usr/bin/env node
/**
 * Generate dashboard translations for locales outside the 28 common JSON catalogs.
 *
 * Usage:
 *   manus-node scripts/generate-dashboard-locales.mjs --locale fil
 *   manus-node scripts/generate-dashboard-locales.mjs --all --workers 4
 *
 * The script preserves every Bengali source key and every {placeholder}. It writes
 * only src/lib/dashboardAdditionalTranslations.ts; the 28 JSON catalogs and all
 * English copy remain untouched.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(new URL('.', import.meta.url).pathname, '..');
const dashboardDir = resolve(root, 'src/locales/dashboard');
const bnPath = resolve(dashboardDir, 'bn.json');
const additionalPath = resolve(root, 'src/lib/additionalLocaleTranslations.ts');
const outputPath = resolve(root, 'src/lib/dashboardAdditionalTranslations.ts');
const skillDir = '/home/ubuntu/skills/builtin-llm-models';
const { LlmClient, mapLimit, messageText } = await import(pathToFileURL(`${skillDir}/lib/llm.mjs`).href);

const args = process.argv.slice(2);
const requested = args.flatMap((arg, index) => arg === '--locale' ? [args[index + 1]] : []).filter(Boolean);
const all = args.includes('--all');
const workers = Number(args[args.indexOf('--workers') + 1]) || 4;
const limit = Number(args[args.indexOf('--limit') + 1]) || Infinity;
if (!all && requested.length === 0) throw new Error('Pass --locale <code> or --all');

const source = JSON.parse(await readFile(bnPath, 'utf8'));
const english = JSON.parse(await readFile(resolve(dashboardDir, 'en.json'), 'utf8'));
const additionalSource = await readFile(additionalPath, 'utf8');
const locales = [...additionalSource.matchAll(/^  "([a-z0-9-]+)": \{/gm)].map((match) => match[1]);
const common = new Set(['en', 'bn', ...(await readdir(dashboardDir)).filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5))]);
const targets = (all ? locales.filter((locale) => !common.has(locale)) : requested).slice(0, limit);
if (!targets.length) throw new Error('No extra locales selected');
for (const locale of targets) if (!/^[a-z0-9-]+$/.test(locale)) throw new Error(`Invalid locale: ${locale}`);

const placeholders = (text) => [...text.matchAll(/\{[^{}]+\}/g)].map((match) => match[0]).sort();
const validate = (locale, translated) => {
  const missing = Object.keys(source).filter((key) => typeof translated[key] !== 'string');
  if (missing.length) throw new Error(`${locale}: missing ${missing.length} keys; first: ${missing[0]}`);
  for (const key of Object.keys(source)) {
    const expected = placeholders(key).join('|');
    const actual = placeholders(translated[key]).join('|');
    if (expected !== actual) throw new Error(`${locale}: placeholder mismatch for ${JSON.stringify(key)}`);
  }
  return Object.fromEntries(Object.keys(source).map((key) => [key, translated[key]]));
};

const llm = new LlmClient({ timeoutMs: 300000, maxRetries: 3 });
const translateLocale = async (locale) => {
  const entries = Object.entries(source);
  const chunks = [];
  for (let i = 0; i < entries.length; i += 160) chunks.push(entries.slice(i, i + 160));
  const result = {};
  const requestChunk = async (chunk, retry = false) => {
    const payload = Object.fromEntries(chunk);
    const response = await llm.chat({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: `You are a professional UI translator. Translate Bengali values into locale ${locale}. Return JSON only. Keep keys byte-for-byte identical, preserve every placeholder such as {name}, product names, URLs, numbers, HTML-like text, and brand/provider names. Do not translate values that are already English/technical names; do translate Bengali portions. Never omit or add keys. ${retry ? 'This is a retry: output every key in the input exactly once, including short strings, numeric strings, link lists, and values that are already partly English.' : ''}` },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      max_completion_tokens: 24000,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(messageText(response));
  };
  for (const chunk of chunks) {
    Object.assign(result, await requestChunk(chunk));
    let missing = chunk.filter(([key]) => typeof result[key] !== 'string');
    for (let attempt = 1; missing.length && attempt <= 2; attempt += 1) {
      Object.assign(result, await requestChunk(missing, true));
      missing = chunk.filter(([key]) => typeof result[key] !== 'string');
    }
    // A model may still omit a long, mostly-technical sentence after retries.
    // Keep the UI complete and avoid leaking Bengali source text by using the
    // canonical English catalog for only those exceptional keys.
    for (const [key] of missing) result[key] = english[key] || source[key];
  }
  return [locale, validate(locale, result)];
};

const existing = {};
try {
  const current = await readFile(outputPath, 'utf8');
  const match = current.match(/export const dashboardAdditionalTranslations[^=]*= ([\s\S]*);\s*$/);
  if (match) Object.assign(existing, Function(`"use strict"; return (${match[1].replace(/\s+as const\s*$/, '')});`)());
} catch {}
const pending = targets.filter((locale) => !existing[locale]);
let persistQueue = Promise.resolve();
const persist = () => {
  persistQueue = persistQueue.then(async () => {
  const output = `// Generated by scripts/generate-dashboard-locales.mjs.\nexport type DashboardLocaleCatalog = Record<string, string>;\n\nexport const dashboardAdditionalTranslations: Record<string, DashboardLocaleCatalog> = ${JSON.stringify(existing, null, 2)} as const;\n`;
  await writeFile(outputPath, output);
  });
  return persistQueue;
};
let completed = 0;
await mapLimit(pending, Math.max(1, Math.min(workers, 8)), async (locale) => {
  console.log(`Translating ${locale} (${completed + 1}/${pending.length})...`);
  const [, catalog] = await translateLocale(locale);
  existing[locale] = catalog;
  completed += 1;
  await persist();
  console.log(`Saved ${locale} (${Object.keys(catalog).length} keys).`);
  return locale;
});
await persist();
console.log(`Generated ${completed} dashboard locale catalog(s); ${Object.keys(existing).length} total saved.`);
