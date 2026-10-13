import type { NewsArticle } from './news-data';
import { languages, type Lang } from './locales';
const regions = {
  JP:['Japón','Japan','日本','Japonia','Japon','Giappone','Japan','日本','日本'],
  ES:['España','Spain','スペイン','Hiszpania','Espagne','Spagna','Spanien','西班牙','西班牙'],
  global:['Internacional','International','国際','Międzynarodowe','International','Internazionale','International','国际','國際'],
};
export function newsRegion(article:NewsArticle,lang:Lang) {return regions[article.region??'JP'][languages.indexOf(lang)];}
