import { languages } from './locales.ts';
import { elements, rarities, roles, type Kioku } from './kioku-catalog.ts';
import type { NewsArticle } from './news-data';
import type { PetitionSnapshot } from './community-data';
import type { PublicContent } from './public-content';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const localized = (value: unknown) => object(value) && languages.every(lang => typeof value[lang] === 'string');

export function publicJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return null; }
}
export function storedArticle(value: unknown): value is NewsArticle {
  return object(value) && ['id', 'date', 'source', 'image'].every(key => typeof value[key] === 'string') && typeof value.date === 'string' && Number.isFinite(Date.parse(value.date)) && localized(value.title) && localized(value.text) && Array.isArray(value.sections) && value.sections.every(section => object(section) && typeof section.id === 'string' && localized(section.title) && localized(section.text));
}
export function storedPetition(value: unknown): value is PetitionSnapshot {
  return object(value) && typeof value.source === 'string' && typeof value.checkedAt === 'string' && Number.isFinite(Date.parse(value.checkedAt)) && typeof value.count === 'number' && Number.isSafeInteger(value.count) && value.count >= 0 && (value.goal === null || (typeof value.goal === 'number' && Number.isSafeInteger(value.goal) && value.goal >= value.count));
}
export function storedKioku(value: unknown): value is Kioku {
  if (!object(value) || !['id', 'name', 'japanese', 'kioku', 'kiokuJapanese', 'family', 'series', 'color', 'image', 'source'].every(key => typeof value[key] === 'string') || !rarities.some(rarity => rarity === value.rarity) || !elements.some(element => element === value.element) || !roles.some(role => role === value.role) || !number(value.speed) || !object(value.stats)) return false;
  const stats = value.stats;
  if (!(value.releaseDate === null || typeof value.releaseDate === 'string') || !(value.releaseSource === null || typeof value.releaseSource === 'string')) return false;
  if (!['base', 'max'].every(key => object(stats[key]) && ['hp', 'atk', 'def'].every(stat => number((stats[key] as Record<string, unknown>)[stat])))) return false;
  return Array.isArray(value.skills) && value.skills.every(skill => object(skill) && ['special', 'battle', 'basic', 'ability', 'support'].includes(String(skill.kind)) && typeof skill.name === 'string' && typeof skill.japanese === 'string' && strings(skill.features) && Array.isArray(skill.damage) && skill.damage.every(damage => object(damage) && number(damage.low) && number(damage.high) && ['single', 'all', 'random'].includes(String(damage.target))));
}
export function storedCatalogCheck(value: unknown): value is NonNullable<PublicContent['catalogCheck']> {
  return object(value) && typeof value.checkedAt === 'string' && Number.isFinite(Date.parse(value.checkedAt)) && typeof value.source === 'string' && number(value.count) && number(value.sourceCount) && strings(value.added) && strings(value.updated) && strings(value.failures);
}
