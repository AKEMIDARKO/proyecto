import { getRawDb } from '@/db';
import { combineNews, initialContent, type PublicContent } from './public-content';
import type { NewsArticle } from './news-data';
import type { PetitionSnapshot } from './community-data';
import { communityLinks } from './community-data';
import { mergeKiokus } from './kioku-store';
import { publicJson, storedArticle, storedPetition, storedCatalogCheck } from './public-records';

export async function readPublicContent(): Promise<PublicContent> {
  try {
    const db=getRawDb();
    const [articles,states]=await db.batch<Record<string, string>>([
      db.prepare('SELECT article_json FROM editorial_news'),
      db.prepare('SELECT key, value_json, updated_at FROM public_updates'),
    ]);
    let partial = false;
    const stored: NewsArticle[] = [];
    for (const row of articles.results) { const article = publicJson(row.article_json as string); if (storedArticle(article)) stored.push(article); else partial = true; }
    const petition=states.results.find(row=>row.key==='petition');
    const parsedPetition=petition ? publicJson(petition.value_json as string) : null;
    const savedPetition=storedPetition(parsedPetition) ? parsedPetition : null;
    if (petition && !savedPetition) partial = true;
    const last=states.results.find(row=>row.key==='last_check');
    const kiokus=mergeKiokus(states.results as {key:string;value_json:string}[], () => { partial = true; });
    const catalog=states.results.find(row=>row.key==='catalog_check');
    const parsedCatalog = catalog ? publicJson(catalog.value_json) : null;
    const validCatalog = storedCatalogCheck(parsedCatalog);
    if (catalog && !validCatalog) partial = true;
    return { articles:combineNews(stored), petition:savedPetition?.source===communityLinks.petition ? savedPetition : initialContent.petition, kiokus, ...(validCatalog?{catalogCheck:parsedCatalog}:{}), ...(partial ? {partial:true}:{}), ...(last ? {lastCheck:last.updated_at as string}:{}) };
  } catch(error) {
    console.error('PUBLIC_CONTENT_UNAVAILABLE',error instanceof Error ? error.message : 'storage');
    return {...initialContent,unavailable:true};
  }
}
export async function saveArticle(article: NewsArticle) {
  const db=getRawDb();
  // Existing source URLs keep their stable internal URLs, including seed articles.
  const sameSource=initialContent.articles.find(item=>item.source===article.source);
  const existing=await db.prepare('SELECT id FROM editorial_news WHERE source = ?').bind(article.source).first<{id:string}>();
  const id=existing?.id??sameSource?.id??article.id;
  const collision=await db.prepare('SELECT source FROM editorial_news WHERE id = ?').bind(id).first<{source:string}>();
  const seed=initialContent.articles.find(item=>item.id===id);
  if ((collision&&collision.source!==article.source)||(seed&&seed.source!==article.source)) throw new Error('ARTICLE_ID_CONFLICT');
  const stored={...article,id};
  await db.prepare('INSERT INTO editorial_news (id,source,article_json,checked_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET article_json=excluded.article_json, checked_at=excluded.checked_at').bind(id,article.source,JSON.stringify(stored),article.checkedAt).run();
  return stored;
}
export async function savePublicState(key:'petition'|'last_check',value:unknown,updatedAt:string) {
  await getRawDb().prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at WHERE excluded.updated_at >= public_updates.updated_at').bind(key,JSON.stringify(value),updatedAt).run();
}
