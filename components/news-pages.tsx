import { CalendarDays, Info } from "lucide-react";
import { checked, dateLabel, words, type Lang } from "@/lib/magia-data";
import { news, newsCopy, type NewsArticle } from "@/lib/news-data";
import { portalCopy } from "@/lib/portal-copy";
import { newsRegion } from "@/lib/news-region";
import SourcePanel from "./source-panel";

export function NewsListing({ lang, articles = news }: { lang: Lang; articles?: NewsArticle[] }) {
  const w = words[lang], n = newsCopy[lang];
  return <><div className="page-heading"><p className="eyebrow">MAGIA ARCHIVE</p><h1>{w.newsTitle}</h1><p>{n.intro}</p></div><div className="news-list">{articles.map(item => <a key={item.id} className="news-article news-story-card" href={`/${lang}/news/${item.id}/`}><div className="news-date"><CalendarDays size={20} aria-hidden="true" /><time dateTime={item.date}>{dateLabel(item.date, lang)}</time><span>{newsRegion(item,lang)}</span></div><div><img className="news-card-image" src={item.image} alt="" loading="lazy" width={600} height={338} /><h2>{item.title[lang]}</h2><p>{item.text[lang]}</p><span className="text-link">{n.read}</span></div></a>)}</div></>;
}

export function NewsDetail({ lang, article, articles = news }: { lang: Lang; article: NewsArticle; articles?: NewsArticle[] }) {
  const w = words[lang], n = newsCopy[lang], base = `/${lang}/`;
  return <>
    <nav className="breadcrumb" aria-label={portalCopy[lang].breadcrumb}><a href={base}>{w.home}</a><span>/</span><a href={base + "news/"}>{w.news}</a><span>/</span><span>{article.title[lang]}</span></nav>
    <div className="article-layout news-detail"><article className="guide-article">
      <header className="article-header"><span className="feature-tag">{newsRegion(article,lang)} · {article.category === "anime" ? "MADOKA MAGICA" : "MAGIA EXEDRA"}</span><h1>{article.title[lang]}</h1><p className="article-summary">{article.text[lang]}</p><div className="article-byline"><span className="author-dot" aria-hidden="true">H</span><a href={base + "homulilly/"}>Magia Archive</a><span>·</span><time dateTime={article.date}>{dateLabel(article.date, lang)}</time></div></header>
      <img className="article-image news-detail-image" src={article.image} alt="" width={1100} height={620} />
      {article.sections.map(section => <section key={section.id} id={section.id} className="article-section"><h2>{section.title[lang]}</h2><p>{section.text[lang]}</p></section>)}
      {article.category !== "anime" && (article.region ?? "JP") === "JP" && <div className="inline-note"><Info size={18} aria-hidden="true" /><p>{n.regionNote}</p></div>}
      <SourcePanel lang={lang} checkedAt={article.checkedAt} sources={[{ title: n.source, url: article.source }]} />
      <a className="button button-outline" href={base + "news/"}>{n.back}</a>
    </article><aside className="article-sidebar"><h2>{w.contents}</h2><ol>{article.sections.map(section => <li key={section.id}><a href={"#" + section.id}>{section.title[lang]}</a></li>)}</ol><p className="news-checked">{w.revised} <time dateTime={article.checkedAt ?? checked}>{dateLabel(article.checkedAt ?? checked, lang)}</time></p></aside></div>
    <section className="archive-section"><div className="section-heading"><h2>{n.related}</h2></div><div className="related-news">{articles.filter(item => item.id !== article.id).slice(0, 3).map(item => <a key={item.id} className="headline-small" href={base + "news/" + item.id + "/"}><time dateTime={item.date}>{dateLabel(item.date, lang)}</time><h2>{item.title[lang]}</h2><p>{item.text[lang]}</p><span className="text-link">{n.read}</span></a>)}</div></section>
  </>;
}
