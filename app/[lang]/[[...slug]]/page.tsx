import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Portal from "@/components/magia-portal";
import { characters, guides, origin, words, type Lang } from "@/lib/magia-data";
import { newsCopy } from "@/lib/news-data";
import { portalCopy } from "@/lib/portal-copy";
import { accountCopy } from "@/lib/account-copy";
import { languages, ogLocales } from "@/lib/locales";
import { resolvePortalRoute } from "@/lib/portal-routes";
import { kiokuLabel, kiokuSummary } from "@/lib/kioku-catalog";
import { kiokuCopy } from "@/lib/kioku-copy";

import { readPublicContent } from '@/lib/content-store';
import { communityCopy } from '@/lib/community-data';
import { cache } from 'react';
import { expansionCopy } from '@/lib/expansion-copy';
import { databaseCopy } from '@/lib/database-copy';
import { databaseItems } from '@/lib/database-data';
import { teamBuilds } from '@/lib/tier-data';
import { buildCopy } from '@/lib/build-copy';
import { archiveCopy } from '@/lib/archive-copy';
import { portraitName, effectLabel, effectValue } from '@/lib/portrait-data';
import { itemsCopy,itemName,itemPurpose } from '@/lib/items-copy';
import { toolsCopy,toolKey } from '@/lib/tools-copy';
const contentForRequest = cache(readPublicContent);
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ lang: string; slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug = [] } = await params;
  const content = await contentForRequest();
  const path = resolvePortalRoute(lang, slug, content.articles,content.kiokus);
  if (path === null) return { title: "Magia Archive" };
  const l = lang as Lang;
  const w = words[l];
  const x = expansionCopy[l];
  let title: string = w.homeTitle;
  let description: string = w.homeIntro;
  if(toolKey[path]){title=toolsCopy[l][toolKey[path]];description=toolsCopy[l][({tools:'toolsIntro','my-characters':'myIntro','ascension-calculator':'calcIntro',achievements:'achievementIntro',ranking:'rankIntro','bug-tracker':'bugsIntro',faq:'faqIntro',contact:'contactIntro'} as Record<string,string>)[path]];}
  if (path === "characters") { title = w.characters; description = kiokuCopy[l].intro; }
  if (path === "guides") { title = w.guides; description = w.guidesIntro; }
  if (path === "news") { title = w.news; description = newsCopy[l].intro; }
  if (path === 'database') { title = x.database; description = x.dbIntro; }
  if (path.startsWith('database/')) { title = path.startsWith('database/portraits') ? x.portraits : path === 'database/materials' ? x.materials : x.objects; description = path.startsWith('database/portraits') ? archiveCopy[l].portraitIntro : path === 'database/items' ? archiveCopy[l].objectsIntro : x.itemsIntro; }
  if(path.startsWith('database/')&&itemsCopy[l][path.split('/')[1]]){title=itemsCopy[l][path.split('/')[1]];description=itemsCopy[l].intro;}
  if (path.startsWith('tierlists')) {
    const rarity = path.match(/\/(3|4|5)-stars$/)?.[1];
    title = path === 'tierlists/create' ? x.myLists : x.tierlists + ' · ' + (path.includes('/portraits') ? x.portraits : path.includes('/teams') ? x.teams : w.characters) + (rarity ? ' · ★' + rarity : '');
    description = path === 'tierlists/create' ? x.privateLists : path.includes('/portraits') ? archiveCopy[l].portraitMethod : rarity ? archiveCopy[l].rarityMethod : x.tierIntro;
  }
  if (path.startsWith('builds')) { title = x.builds; description = x.buildIntro; }
  if (path === 'leaks') { title = x.leaks; description = x.leaksIntro; }
  if (path === "homulilly") { title = "Homulilly"; description = w.creatorIntro; }
  if (path === "madoka") { title = communityCopy[l].universe; description = communityCopy[l].universeIntro; }
  if (path === "community") { title = communityCopy[l].community; description = communityCopy[l].communityIntro; }
  if (path === "about") { title = w.about; description = w.editorialText; }
  if (path === "madokadle") { title = "Madokadle"; description = portalCopy[l].gameIntro; }
  if (["profile", "leaderboard", "privacy"].includes(path)) { title = accountCopy[l][path]; description = accountCopy[l][path + "Intro"]; }
  const c = characters.find(c => path === "characters/" + c.id);
  const g = guides.find(g => path === "guides/" + g.id);
  const n = content.articles.find(item => path === "news/" + item.id);
  const unit = content.kiokus.find(item => path === "kioku/" + item.id);
  if (c) { title = l === "ja" ? c.japanese : c.name; description = c.description[l]; }
  if (g) { title = g.title[l]; description = g.summary[l]; }
  if (n) { title = n.title[l]; description = n.text[l]; }
  if (unit) { title = kiokuLabel(unit, l); description = kiokuSummary(unit, l); }
  const build = teamBuilds.find(team => path === 'builds/' + team.id);
  if (build) { title = buildCopy[l][build.nameKey]; description = buildCopy[l][build.textKey]; }
  const item = databaseItems.find(item => path === `database/${item.kind === 'portraits' ? 'portraits' : 'items'}/${item.id}`);
  if (item) {
    title = item.portrait ? portraitName(item.portrait, l) : item.gameItem?itemName(item.gameItem,l):databaseCopy[l][item.nameKey];
    description = item.portrait ? item.portrait.effects.map(effect => effectLabel(effect, l) + ' ' + effectValue(effect, l)).join(' · ') : item.gameItem?itemPurpose(item.gameItem,l):databaseCopy[l][item.textKey];
  }
  const suffix = path ? path + "/" : "";
  return {
    title: path ? title : { absolute: portalCopy[l].seo }, description,
    ...(['profile','tierlists/create','my-characters','contact'].includes(path) ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: origin + "/" + lang + "/" + suffix, languages: { ...Object.fromEntries(languages.map(locale => [locale, origin + "/" + locale + "/" + suffix])), "x-default": origin + "/es/" + suffix } },
    openGraph: { url: origin + "/" + lang + "/" + suffix, images: [{ url: new URL(n?.image ?? unit?.image ?? g?.image ?? "/assets/hero.webp", origin).href, alt: title }], title: path ? title + " | Magia Archive" : portalCopy[l].seo, description, locale: ogLocales[l], type: g || n ? "article" : "website", ...(n ? { publishedTime: n.date, authors: ["Magia Archive"] } : {}) },
  };
}

export default async function Page({ params }: Props) {
  const { lang, slug = [] } = await params;
  const content = await contentForRequest();
  const path = resolvePortalRoute(lang, slug, content.articles,content.kiokus);
  if (path === null) notFound();
  return <Portal key={`${lang}:${path}`} lang={lang as Lang} path={path} content={content} />;
}
