import { BookOpen, Film } from 'lucide-react';
import { communityCopy } from '@/lib/community-data';
import { animeWorks } from '@/lib/universe-data';
import { words, dateLabel, type Lang } from '@/lib/magia-data';
import type { NewsArticle } from '@/lib/news-data';

export default function MadokaUniverse({lang,articles=[]}:{lang:Lang;articles?:NewsArticle[]}) {
  const c=communityCopy[lang],w=words[lang];
  const animeNews=articles.filter(item=>item.category==='anime').slice(0,6);
  return <>
    <div className="page-heading"><p className="eyebrow"><Film size={16} aria-hidden="true"/> PUELLA MAGI MADOKA MAGICA</p><h1>{c.universe}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{c.universeIntro}</p></div>
    <section className="watch-order"><BookOpen size={27} aria-hidden="true"/><div><h2>{c.watchOrder}</h2><p>{c.orderIntro}</p></div></section>
    <div className="anime-grid">{animeWorks.map((item,i)=><article className="anime-card" key={item.id} id={item.id}><img className={item.id === "original" || item.id === "rebellion" ? "anime-art-contain" : ""} src={`/assets/anime/${item.id}.webp`} alt={item.title} loading="lazy" width={400} height={560} /><div className="anime-card-copy"><p className="eyebrow"><span>{String(i+1).padStart(2,'0')}</span> {c[item.type]} {item.year && '· '+item.year}</p><p className="anime-japanese" lang="ja">{item.japanese}</p><h2>{item.title}</h2><p>{c[item.description]}</p><a className="text-link" href={item.source} target="_blank" rel="noopener noreferrer">{w.officialSite}</a></div></article>)}</div>
    <section className="archive-section"><div className="section-heading"><h2>{c.animeNews}</h2><a className="text-link" href={`/${lang}/news/`}>{w.all}</a></div>{animeNews.length ? <div className="related-news">{animeNews.map(item=><a className="headline-small" key={item.id} href={`/${lang}/news/${item.id}/`}><time dateTime={item.date}>{dateLabel(item.date,lang)}</time><h3>{item.title[lang]}</h3><p>{item.text[lang]}</p></a>)}</div> : <p className="universe-empty">{c.emptyAnime}</p>}</section>
    <section className="universe-support"><h2>{c.community}</h2><p>{c.communityIntro}</p><a className="button button-outline" href={`/${lang}/community/`}>{c.allSupport}</a></section>
  </>;
}
