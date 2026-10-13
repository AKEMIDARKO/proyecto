import type { BaseLang, ExtraLang, Lang } from "./locales";
export const extraOrder: ExtraLang[] = ["pl", "fr", "it", "de", "zh-Hans", "zh-Hant"];
export function rows(value: string): Record<string, string[]> {
  return Object.fromEntries(value.trim().split("\n").filter(Boolean).map(line => { const [key, ...values] = line.split("~"); return [key, values]; }));
}
export function addLanguages<T extends Record<string, unknown>>(base: Record<BaseLang, T>, translations: Record<string, readonly string[]>): Record<Lang, T> {
  const result = { ...base } as Record<Lang, T>;
  for (const [i, lang] of extraOrder.entries()) {
    const values = Object.fromEntries(Object.entries(base.en).map(([key, value]) => {
      const row = translations[key]; if (!row || row.length !== extraOrder.length || !row[i]) throw new Error("Missing translation: " + lang + "/" + key);
      return [key, Array.isArray(value) ? row[i].split("|") : row[i]];
    }));
    result[lang] = values as T;
  }
  return result;
}
