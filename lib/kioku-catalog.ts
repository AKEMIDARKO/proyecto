import snapshot from "./kioku-data.ts";
import { kiokuCopy } from "./kioku-copy.ts";
import { localeNames, type Lang } from "./locales.ts";

export const rarities = [5, 4, 3] as const;
export const elements = ["Flame", "Aqua", "Forest", "Light", "Dark", "Void"] as const;
export const roles = ["Attacker", "Breaker", "Buffer", "Debuffer", "Healer", "Defender"] as const;
export const sortOrders = ["dateDesc", "dateAsc", "nameAsc", "nameDesc", "attackDesc", "attackAsc", "speedDesc", "speedAsc"] as const;
export type SortOrder = typeof sortOrders[number];
export type KiokuSkill = {
  kind: "special" | "battle" | "basic" | "ability" | "support";
  name: string; japanese: string; cost: number | null; bpCost: number | null;
  damage: { low: number; high: number; target: "single" | "all" | "random" }[];
  features: string[];
};
type Stats = { hp: number; atk: number; def: number };
export type Kioku = {
  id: string; name: string; japanese: string; kioku: string; kiokuJapanese: string; family: string;
  rarity: typeof rarities[number]; role: typeof roles[number]; element: typeof elements[number];
  series: string; color: string; image: string; speed: number;
  stats: { base: Stats; max: Stats }; releaseDate: string | null; releaseSource: string | null;
  skills: KiokuSkill[]; source: string;
};
export const kiokus = snapshot.units as Kioku[];
export const kiokuChecked = snapshot.checked;
export const kiokuName = (unit: Kioku, lang: Lang) => lang === "ja" ? unit.japanese : unit.name;
export const kiokuVersion = (unit: Kioku, lang: Lang) => lang === "ja" ? unit.kiokuJapanese : unit.kioku;
export const kiokuLabel = (unit: Kioku, lang: Lang) => kiokuName(unit, lang) + " · " + kiokuVersion(unit, lang);
export function kiokuSummary(unit: Kioku, lang: Lang) {
  const copy = kiokuCopy[lang];
  const values: Record<string, string> = { stars: String(unit.rarity), element: copy[unit.element], role: copy[unit.role], name: kiokuName(unit, lang) };
  return copy.summary.replace(/\{(stars|element|role|name)\}/g, (_, key: string) => values[key]);
}
const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase().replace(/[☆★✦]/g, "");
export type CatalogFilters = { query: string; rarity: string; element: string; role: string };
export const defaultFilters: CatalogFilters = { query: "", rarity: "all", element: "all", role: "all" };
export function filterKiokus(units: readonly Kioku[], filters: CatalogFilters): Kioku[] {
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return units.filter(unit => (filters.rarity === "all" || String(unit.rarity) === filters.rarity)
    && (filters.element === "all" || unit.element === filters.element)
    && (filters.role === "all" || unit.role === filters.role)
    && terms.every(term => normalize([unit.name, unit.japanese, unit.kioku, unit.kiokuJapanese, unit.family].join(" ")).includes(term)));
}
export function sortKiokus(units: readonly Kioku[], order: SortOrder, lang: Lang): Kioku[] {
  const collator = new Intl.Collator(localeNames[lang], { numeric: true, sensitivity: "base" });
  const nameCompare = (a: Kioku, b: Kioku) => collator.compare(kiokuName(a, lang), kiokuName(b, lang)) || collator.compare(kiokuVersion(a, lang), kiokuVersion(b, lang)) || a.id.localeCompare(b.id);
  return [...units].sort((a, b) => {
    if (order === "nameAsc" || order === "nameDesc") return nameCompare(a, b) * (order === "nameAsc" ? 1 : -1);
    if (order === "dateAsc" || order === "dateDesc") {
      if (!a.releaseDate && b.releaseDate) return 1;
      if (a.releaseDate && !b.releaseDate) return -1;
      return (a.releaseDate || "").localeCompare(b.releaseDate || "") * (order === "dateAsc" ? 1 : -1) || nameCompare(a, b);
    }
    const value = (unit: Kioku) => order.startsWith("attack") ? unit.stats.max.atk : unit.speed;
    return (value(a) - value(b)) * (order.endsWith("Asc") ? 1 : -1) || nameCompare(a, b);
  });
}
export function groupKiokus(units: readonly Kioku[], order: SortOrder, lang: Lang) {
  return rarities.map(rarity => ({ rarity, units: sortKiokus(units.filter(unit => unit.rarity === rarity), order, lang) })).filter(group => group.units.length > 0);
}
