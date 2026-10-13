import { news, type NewsArticle } from './news-data';
import { initialPetition, type PetitionSnapshot } from './community-data';
import { kiokus, type Kioku } from './kioku-catalog';
export type PublicContent = { articles: NewsArticle[]; petition: PetitionSnapshot; kiokus:Kioku[]; catalogCheck?:{checkedAt:string;source:string;sourceCount:number;count:number;added:string[];updated:string[];failures:string[]}; unavailable?: boolean; partial?: boolean; lastCheck?: string };
export const initialContent: PublicContent = { articles: news, petition: initialPetition, kiokus };
export function combineNews(stored: NewsArticle[]): NewsArticle[] {
  const byId = new Map(news.map(article=>[article.id,article]));
  for (const article of stored) byId.set(article.id,article);
  return [...byId.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
}
