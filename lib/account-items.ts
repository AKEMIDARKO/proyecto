import { characters, guides } from "./magia-data.ts";
import { kiokus, kiokuLabel, kiokuVersion } from "./kioku-catalog.ts";
import type { Lang } from "./locales.ts";
import type { Favorite } from "./account-client.ts";

export function isFavoriteItem(kind: unknown, itemId: unknown,units:readonly typeof kiokus[number][]=kiokus): boolean {
  if (typeof itemId !== "string") return false;
  if (kind === "character") return characters.some(item => item.id === itemId);
  if (kind === "guide") return guides.some(item => item.id === itemId);
  if (kind === "kioku") return units.some(item => item.id === itemId);
  return false;
}
export const isNoteCharacter = (id: unknown,units:readonly typeof kiokus[number][]=kiokus) => typeof id === "string" && (characters.some(item => item.id === id) || units.some(item => item.id === id));
export function favoriteItem(favorite: Favorite, lang: Lang,units:readonly typeof kiokus[number][]=kiokus) {
  const base = `/${lang}/`;
  if (favorite.kind === "kioku") {
    const item = units.find(unit => unit.id === favorite.itemId);
    return item ? { title: kiokuLabel(item, lang), image: item.image, href: base + "kioku/" + item.id + "/" } : null;
  }
  if (favorite.kind === "character") {
    const item = characters.find(character => character.id === favorite.itemId);
    return item ? { title: lang === "ja" ? item.japanese : item.name, image: item.image, href: base + "characters/" + item.id + "/" } : null;
  }
  const item = guides.find(guide => guide.id === favorite.itemId);
  return item ? { title: item.title[lang], image: item.image, href: base + "guides/" + item.id + "/" } : null;
}
export function noteCharacterLabel(id: string, lang: Lang,units:readonly typeof kiokus[number][]=kiokus) {
  const unit = units.find(item => item.id === id);
  if (unit) return kiokuLabel(unit, lang);
  const character = characters.find(item => item.id === id);
  return character ? lang === "ja" ? character.japanese : character.name : id;
}
export function defaultNoteKioku(id: string, lang: Lang,units:readonly typeof kiokus[number][]=kiokus) {
  const unit = units.find(item => item.id === id);
  return unit ? kiokuVersion(unit, lang) : "";
}
