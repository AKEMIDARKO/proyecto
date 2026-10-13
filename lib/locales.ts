export const languages = ["es", "en", "ja", "pl", "fr", "it", "de", "zh-Hans", "zh-Hant"] as const;
export type Lang = typeof languages[number];
export type BaseLang = "es" | "en" | "ja";
export type ExtraLang = Exclude<Lang, BaseLang>;
export const languageNames: Record<Lang, string> = { es: "Español", en: "English", ja: "日本語", pl: "Polski", fr: "Français", it: "Italiano", de: "Deutsch", "zh-Hans": "简体中文", "zh-Hant": "繁體中文" };
// Compact visible labels; the full current language remains in the accessible name.
export const languageShortNames: Record<Lang, string> = { es: "ES", en: "EN", ja: "日本語", pl: "PL", fr: "FR", it: "IT", de: "DE", "zh-Hans": "简中", "zh-Hant": "繁中" };
export const localeNames: Record<Lang, string> = { es: "es-ES", en: "en-GB", ja: "ja-JP", pl: "pl-PL", fr: "fr-FR", it: "it-IT", de: "de-DE", "zh-Hans": "zh-CN", "zh-Hant": "zh-TW" };
export const ogLocales: Record<Lang, string> = { es: "es_ES", en: "en_GB", ja: "ja_JP", pl: "pl_PL", fr: "fr_FR", it: "it_IT", de: "de_DE", "zh-Hans": "zh_CN", "zh-Hant": "zh_TW" };
export function isLang(value: unknown): value is Lang { return typeof value === "string" && languages.includes(value as Lang); }
