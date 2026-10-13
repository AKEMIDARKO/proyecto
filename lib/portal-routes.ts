import { characters, guides, news } from "./magia-data.ts";
import { kiokus } from "./kioku-catalog.ts";
import { isLang } from "./locales.ts";
import { teamBuilds } from './tier-data.ts';
import { databaseItems } from './database-data.ts';
import { itemCategories } from './items-copy.ts';
import { toolPaths } from './tools-copy.ts';

export function resolvePortalRoute(lang: string, slug: string[] = [], articles: { id: string }[] = news, units:readonly {id:string}[]=kiokus): string | null {
  if (!isLang(lang)) return null;
  const path = slug.join("/");
  if (toolPaths.some(route=>route===path)||itemCategories.some(category=>path==='database/'+category)) return path;
  if (/^tierlists(?:\/(teams|portraits))?\/(3|4|5)-stars$/.test(path) || path==='tierlists/portraits') return path;
  if (["", "characters", "guides", "news", "homulilly", "about", "madokadle", "profile", "leaderboard", "privacy", "madoka", "community", "database", "database/items", "database/materials", "database/portraits", "leaks", "builds", "tierlists", "tierlists/teams", "tierlists/create"].includes(path)) return path;
  if (slug.length === 3 && slug[0] === 'database' && databaseItems.some(item => slug[1] === (item.kind === 'portraits' ? 'portraits' : 'items') && slug[2] === item.id)) return path;
  if (slug.length !== 2) return null;
  if (slug[0] === "characters" && characters.some(item => item.id === slug[1])) return path;
  if (slug[0] === "kioku" && units.some(item => item.id === slug[1])) return path;
  if (slug[0] === "guides" && guides.some(item => item.id === slug[1])) return path;
  if (slug[0] === "news" && articles.some(item => item.id === slug[1])) return path;
  if (slug[0] === 'builds' && teamBuilds.some(team => team.id === slug[1])) return path;
  return null;
}
