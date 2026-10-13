import { languages, type Lang } from './locales.ts';
import { characters, guides, origin } from './magia-data.ts';
import { databaseItems } from './database-data.ts';
import { teamBuilds } from './tier-data.ts';
import { itemCategories } from './items-copy.ts';

export const privateSeoRoutes = ['profile', 'tierlists/create', 'my-characters', 'contact'] as const;
export function sitemapPaths(articles: readonly { id: string }[], units: readonly { id: string }[]) {
  return [...new Set([
    '', 'news', 'characters', 'guides', 'builds', 'tierlists', 'tierlists/teams',
    'tierlists/portraits', 'database', 'database/items', 'database/materials', 'database/portraits',
    'tools', 'ascension-calculator', 'achievements', 'ranking', 'madokadle', 'leaderboard',
    'madoka', 'community', 'homulilly', 'about', 'privacy', 'faq', 'bug-tracker', 'leaks',
    ...itemCategories.map(category => 'database/' + category),
    ...articles.map(item => 'news/' + item.id), ...units.map(unit => 'kioku/' + unit.id),
    ...characters.map(item => 'characters/' + item.id), ...guides.map(item => 'guides/' + item.id),
    ...teamBuilds.map(item => 'builds/' + item.id),
    ...databaseItems.map(item => `database/${item.kind === 'portraits' ? 'portraits' : 'items'}/${item.id}`),
    ...['tierlists', 'tierlists/teams', 'tierlists/portraits'].flatMap(base => [3,4,5].map(rarity => `${base}/${rarity}-stars`)),
  ])];
}
const escape = (value: string) => value.replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[c]!));
export function sitemapXml(articles: readonly { id: string }[], units: readonly { id: string }[], locale?: Lang) {
  const entries = sitemapPaths(articles, units).flatMap(path => {
    const suffix = path ? path + '/' : '';
    const alternate = [...languages, 'x-default'].map(locale => `<xhtml:link rel="alternate" hreflang="${locale}" href="${escape(origin + '/' + (locale === 'x-default' ? 'es' : locale) + '/' + suffix)}"/>`).join('');
    return (locale ? [locale] : languages).map(lang => `<url><loc>${escape(origin + '/' + lang + '/' + suffix)}</loc>${alternate}</url>`);
  });
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + entries.join('') + '</urlset>';
}
export const sitemapIndexXml = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + languages.map(lang => `<sitemap><loc>${origin}/sitemap/${lang}.xml</loc></sitemap>`).join('') + '</sitemapindex>';
export const robotsText = 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /mcp\n' + languages.flatMap(lang => privateSeoRoutes.map(path => `Disallow: /${lang}/${path}/\n`)).join('') + 'Sitemap: ' + origin + '/sitemap.xml\n';
