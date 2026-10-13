"use client";

import { useEffect, type CSSProperties } from "react";
import { BookOpen, CalendarDays, Clock3, Database, Diamond, Gamepad2, Gem, Globe2, Heart, Info, ListOrdered, Menu, Music2, Sparkles, UserRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { characters, dateLabel, guides, official, words, type Guide, type Lang } from "@/lib/magia-data";

import { portalCopy } from "@/lib/portal-copy";
import DailyClock from "@/components/daily-clock";
import Madokadle from "@/components/madokadle";
import { isLang, languages, languageNames, languageShortNames } from "@/lib/locales";
import { accountCopy } from "@/lib/account-copy";
import AccountProfile from "@/components/account-profile";
import Leaderboard from "@/components/leaderboard";
import AccountPrivacy from "@/components/account-privacy";
import FavoriteButton from "@/components/favorite-button";
import SourcePanel from "@/components/source-panel";
import { NewsListing, NewsDetail } from "@/components/news-pages";
import KiokuCatalog, { KiokuCard } from "@/components/kioku-catalog";
import KiokuProfile from "@/components/kioku-profile";
import { sortKiokus } from "@/lib/kioku-catalog";
import { kiokuCopy } from "@/lib/kioku-copy";
import CreatorSocials from "@/components/creator-socials";
import CommunityPage, { CommunityCards } from '@/components/community';
import MadokaUniverse from '@/components/madoka-universe';
import { communityCopy, communityLinks } from '@/lib/community-data';
import { initialContent, type PublicContent } from '@/lib/public-content';
import { newsRegion } from '@/lib/news-region';
import { creatorCopy } from "@/lib/creator-links";
import GameIcon from '@/components/game-icon';
import ThemeToggle from '@/components/theme-toggle';
import PortalNavigation, { navigationGroups, DatabaseTabs } from '@/components/portal-navigation';
import TierLists from '@/components/tier-lists';
import PortraitTierLists from '@/components/portrait-tier-lists';
import TierListEditor from '@/components/tier-list-editor';
import DatabasePages from '@/components/database-pages';
import BuildPages from '@/components/build-pages';
import { expansionCopy } from '@/lib/expansion-copy';
import ToolsPages from '@/components/tools-pages';
import { toolsCopy,toolPaths } from '@/lib/tools-copy';
import { KiokuProvider } from './kioku-context';
import ArchiveBackdrop from './archive-backdrop';

type Character = typeof characters[number];
type Props = { lang: Lang; path: string; content?: PublicContent };

function CharacterCard({ c, lang }: { c: Character; lang: Lang }) {
  return <a className="character-card" href={"/" + lang + "/characters/" + c.id + "/"} style={{ "--character-color": c.color, "--portrait-position": c.position } as CSSProperties}>
    <div className="character-art"><img src={c.image} alt={c.name} loading="lazy" width="420" height="520" /><span className="character-number" aria-hidden="true">{String(characters.indexOf(c) + 1).padStart(2, "0")}</span></div>
    <div className="character-caption"><span lang={lang === "ja" ? "en" : "ja"}>{lang === "ja" ? c.name : c.japanese}</span><h3>{lang === "ja" ? c.japanese : c.name}</h3><p>{c.series}</p></div>
  </a>;
}

function GuideCard({ guide, lang }: { guide: Guide; lang: Lang }) {
  return <a className="guide-card" href={"/" + lang + "/guides/" + guide.id + "/"}>
    <div className="guide-art"><img src={guide.image} alt="" loading="lazy" width="500" height="300" /><span>{guide.category[lang]}</span></div>
    <div className="guide-caption"><h3>{guide.title[lang]}</h3><p>{guide.summary[lang]}</p><span className="reading-time"><Clock3 size={14} aria-hidden="true" />{guide.minutes} {words[lang].minutes}</span></div>
  </a>;
}

export default function Portal({ lang, path, content = initialContent }: Props) {
  const u = portalCopy[lang];
  const c = communityCopy[lang];
  const news = content.articles;
  const kiokus = content.kiokus;
  const w = words[lang];
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const href = (route = "") => "/" + lang + "/" + (route ? route + "/" : "");
  const account = accountCopy[lang];
  const x = expansionCopy[lang];
  const character = characters.find(c => path === "characters/" + c.id);
  const guide = guides.find(g => path === "guides/" + g.id);
  const article = news.find(item => path === "news/" + item.id);
  const unit = kiokus.find(item => path === "kioku/" + item.id);
  const featuredKiokus = path === '' ? sortKiokus(kiokus.filter(item => item.rarity === 5), "dateDesc", lang).slice(0, 4) : [];

  return <KiokuProvider units={kiokus}><div className="site-shell"><ArchiveBackdrop />
    <a className="skip-link" href="#main">{u.skip}</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand book-brand" href={href()} aria-label="Magia Archive"><span className="brand-book" aria-hidden="true"><BookOpen /><span>✦</span></span><span className="brand-wordmark" aria-hidden="true"><strong>MAGIA</strong><small>ARCHIVE</small></span></a>
        <PortalNavigation lang={lang} path={path} />
        <div className="header-actions">
          <ThemeToggle lang={lang} />
          <a className="header-profile icon-button" href={href("profile")} aria-label={account.profile} title={account.profile} aria-current={path === "profile" ? "page" : undefined}><UserRound size={20} aria-hidden="true" /></a>
          <Globe2 className="language-icon" size={17} aria-hidden="true" />
          <Select value={lang} onValueChange={value => { if (isLang(value)) { const destination = "/" + value + "/" + (path ? path + "/" : "") + window.location.search + window.location.hash; if (window.dispatchEvent(new CustomEvent('magia:navigate', { detail: destination, cancelable: true }))) window.location.assign(destination); } }}>
            <SelectTrigger className="language-select" aria-label={w.language + ": " + languageNames[lang]}><SelectValue><span className="language-full" lang={lang}>{languageNames[lang]}</span><span className="language-short" lang={lang} aria-hidden="true">{languageShortNames[lang]}</span></SelectValue></SelectTrigger>
            <SelectContent position="popper" align="end" className="language-menu">{languages.map(locale => <SelectItem key={locale} value={locale}><span lang={locale}>{languageNames[locale]}</span></SelectItem>)}</SelectContent>
          </Select>
          <Sheet><SheetTrigger asChild><button className="mobile-menu icon-button" aria-label={w.menu}><Menu size={22} /></button></SheetTrigger><SheetContent className="mobile-sheet"><SheetHeader><SheetTitle>Magia Archive</SheetTitle><SheetDescription>{w.fan}</SheetDescription></SheetHeader><nav aria-label={w.menu}>{navigationGroups(lang).map(group => <div className="mobile-nav-group" key={group.path}>{group.items ? <><p>{group.label}</p>{group.items.map(item => <SheetClose key={item.path} asChild><a href={href(item.path)} aria-current={path === item.path ? 'page' : undefined}>{item.label}</a></SheetClose>)}</> : <SheetClose asChild><a href={href(group.path)} aria-current={path === group.path ? 'page' : undefined}>{group.label}</a></SheetClose>}</div>)}</nav></SheetContent></Sheet>
        </div>
      </div>
    </header>
    <main id="main" className="page-main" tabIndex={-1}>
      {toolPaths.some(route=>route===path)&&<ToolsPages lang={lang} path={path}/>}
      {(path === 'characters' || path.startsWith('kioku/') || path.startsWith('database')) && <DatabaseTabs lang={lang} path={path} />}
      {(content.unavailable || content.partial) && ["", "news", "characters", "madoka", "community"].includes(path) && <p className="inline-note" role="status">{c.unavailable}</p>}
      {path === "" && <>
        <div className="page-heading home-heading"><div><p className="eyebrow"><BookOpen size={13} aria-hidden="true" /> PUELLA MAGI MADOKA MAGICA</p><h1>{w.homeTitle}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{w.homeIntro}</p></div></div>
        <nav className="portal-tabs" aria-label={u.explore}><a href="#home-news">{w.news}</a><a href="#home-characters">{w.characters}</a><a href="#home-guides">{w.guides}</a><a href={href("madokadle")}>Madokadle</a></nav>
        <section className="headline-grid" id="home-news" aria-label={u.recent}>
          <a className="headline-main" href={href("news/" + news[0].id)}>
            <img src={news[0].image} alt="" width="1100" height="620" fetchPriority="high" decoding="async" />
            <div className="headline-main-copy"><span className="feature-tag"><CalendarDays size={14} aria-hidden="true" />{newsRegion(news[0], lang)} · {w.news}</span><h2>{news[0].title[lang]}</h2><p>{news[0].text[lang]}</p><div className="headline-bottom"><time dateTime={news[0].date}>{dateLabel(news[0].date, lang)}</time><span>{u.seeNews}</span></div></div>
          </a>
          <div className="headline-side">{news.slice(1, 3).map(item => <a className="headline-small headline-with-art" key={item.id} href={href("news/" + item.id)}><img className="headline-small-art" src={item.image} alt="" loading="lazy" width={500} height={300} /><div className="news-meta"><span>{newsRegion(item, lang)} · {w.news}</span><time dateTime={item.date}>{dateLabel(item.date, lang)}</time></div><h2>{item.title[lang]}</h2><p>{item.text[lang]}</p></a>)}</div>
        </section>
        <p className="home-news-note"><Info size={15} aria-hidden="true" />{w.regional}</p>
        <section className="madokadle-banner" aria-label="Madokadle">
          <div className="daily-symbol" aria-hidden="true"><GameIcon name="play" /></div>
          <div className="madokadle-banner-copy"><p className="eyebrow">{u.daily} · MADOKADLE</p><h2>{u.gameTitle}</h2><p>{u.gameText}</p></div>
          <div className="madokadle-banner-actions"><a className="button button-rose" href={href("madokadle")}>{u.play}</a><span>{u.next} <DailyClock lang={lang} /></span></div>
        </section>
        <section className="home-explore" aria-label={u.explore}><h2>{u.explore}</h2><div className="shortcut-grid">
          <a href={href("characters")}><GameIcon name="kioku" /><div><h3>{w.characters}</h3><p>{u.characterShortcut}</p></div></a>
          <a href={href("guides")}><GameIcon name="book" /><div><h3>{w.guides}</h3><p>{u.guideShortcut}</p></div></a>
          <a href={href("news")}><GameIcon name="archive" /><div><h3>{w.news}</h3><p>{u.newsShortcut}</p></div></a>
          <a href={href("madokadle")}><GameIcon name="play" /><div><h3>Madokadle</h3><p>{u.gameShortcut}</p></div></a>
          <a href={href('database')}><span className="shortcut-symbol"><Database aria-hidden="true" /></span><div><h3>{x.database}</h3><p>{x.dbIntro}</p></div></a>
          <a href={href('tools')}><span className="shortcut-symbol"><Gem aria-hidden="true" /></span><div><h3>{toolsCopy[lang].tools}</h3><p>{toolsCopy[lang].toolsIntro}</p></div></a>
          <a href={href('tierlists')}><span className="shortcut-symbol"><ListOrdered aria-hidden="true" /></span><div><h3>{x.tierlists}</h3><p>{x.tierIntro}</p></div></a>
        </div></section>
        <section className="archive-section home-roster" id="home-characters"><div className="section-heading"><div><p className="eyebrow">MAGIA EXEDRA · {kiokus.length} KIOKU</p><h2>{kiokuCopy[lang].latest}</h2></div><a className="text-link" href={href("characters")}>{w.all}</a></div><div className="kioku-grid">{featuredKiokus.map(item => <KiokuCard key={item.id} unit={item} lang={lang} />)}</div></section>
        <section className="guide-section" id="home-guides"><div className="section-heading"><div><p className="eyebrow">{u.pace}</p><h2>{u.essential}</h2><p>{u.guidesSub}</p></div><a className="text-link" href={href("guides")}>{w.all}</a></div><div className="home-guide-layout">
          <a className="feature-card home-guide-feature" href={href("guides/first-steps")}><img className="feature-image" src="/assets/hero.webp" alt="" width="1440" height="800" /><div className="feature-shade" /><div className="feature-copy"><span className="feature-tag"><BookOpen size={14} aria-hidden="true" />{w.featured}</span><h2>{w.heroTitle}</h2><p>{w.heroText}</p><span className="button button-rose">{w.readGuide}</span></div></a>
          <div className="home-guide-side">{guides.slice(1,4).map(g => <GuideCard key={g.id} guide={g} lang={lang} />)}</div>
        </div></section>
        <section className="universe-home"><div><p className="eyebrow">PUELLA MAGI MADOKA MAGICA</p><h2>{c.universe}</h2><p>{c.universeIntro}</p><a className="button button-outline" href={href("madoka")}>{c.explore}</a></div><img src="/assets/anime/original.webp" alt="Puella Magi Madoka Magica" loading="lazy" width={800} height={1100} /></section>
        <section className="archive-section"><div className="section-heading"><h2>{c.community}</h2><a className="text-link" href={href("community")}>{c.allSupport}</a></div><CommunityCards lang={lang} petition={content.petition} /></section>
        <section className="creator-banner"><div className="creator-monogram" aria-hidden="true">H<span>✦</span></div><div><p className="eyebrow">{w.creatorCard}</p><h2>{w.creatorCardTitle}</h2><p>{w.creatorCardText}</p><CreatorSocials lang={lang} compact /></div><a className="button button-outline" href={href("homulilly")}>{w.meet}</a></section>
      </>}
      {path === "madoka" && <MadokaUniverse lang={lang} articles={news} />}
      {path === "community" && <CommunityPage lang={lang} petition={content.petition} />}
      {path === "madokadle" && <Madokadle lang={lang} />}
      {path === "profile" && <AccountProfile lang={lang} />}
      {path === "leaderboard" && <Leaderboard lang={lang} />}
      {path === "privacy" && <AccountPrivacy lang={lang} />}
      {(path === 'tierlists'||/^tierlists\/[345]-stars$/.test(path)) && <TierLists lang={lang} rarity={path.match(/([345])-stars$/)?.[1]?Number(path.match(/([345])-stars$/)![1]):undefined} />}
      {(path === 'tierlists/teams'||/^tierlists\/teams\/[345]-stars$/.test(path)) && <TierLists lang={lang} teams rarity={path.match(/([345])-stars$/)?.[1]?Number(path.match(/([345])-stars$/)![1]):undefined} />}
      {(path === 'tierlists/portraits'||/^tierlists\/portraits\/[345]-stars$/.test(path)) && <PortraitTierLists lang={lang} rarity={path.match(/([345])-stars$/)?.[1]?Number(path.match(/([345])-stars$/)![1]):undefined} />}
      {path === 'tierlists/create' && <TierListEditor lang={lang} />}
      {(path === 'database' || path.startsWith('database/')) && <DatabasePages lang={lang} path={path} />}
      {(path === 'builds' || path.startsWith('builds/')) && <BuildPages lang={lang} path={path} />}
      {path === 'leaks' && <><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA</p><h1>{x.leaks}</h1><p>{x.leaksIntro}</p></div><section className="expansion-card"><GameIcon name="archive" /><p>{x.noLeaks}</p><a className="button button-outline" href={href('news')}>{w.news}</a></section></>}

      {path === "characters" && <KiokuCatalog lang={lang} />}
      {unit && <KiokuProfile unit={unit} lang={lang} />}

      {character && <>
        <nav className="breadcrumb" aria-label={u.breadcrumb}><a href={href()}>{w.home}</a><span>/</span><a href={href("characters")}>{w.characters}</a><span>/</span><span>{character.name}</span></nav>
        <div className="character-detail" style={{ "--character-color": character.color, "--portrait-position": character.position } as CSSProperties}><div className="character-detail-copy"><span className="feature-tag">{w.introProfile}</span><p className="character-japanese" lang="ja">{character.japanese}</p><h1>{lang === "ja" ? character.japanese : character.name}</h1><p className="series-label">{character.series}</p><h2>{w.profile}</h2><p className="profile-description">{character.description[lang]}</p><div className="kioku-note"><Gem size={22} aria-hidden="true" /><div><h3>{w.keylightTitle}</h3><p>{w.keylightText}</p></div></div><FavoriteButton lang={lang} kind="character" itemId={character.id} /><a className="button button-outline" href={character.source} target="_blank" rel="noopener noreferrer">{w.source}</a></div><div className="detail-art"><img src={character.image} alt={character.name} width="900" height="1200" /></div></div>
        <SourcePanel lang={lang} sources={[{ title: character.name + " · Magia Exedra", url: character.source }]} />
        <section className="archive-section"><div className="section-heading"><h2>{w.moreGuides}</h2><a className="text-link" href={href("characters")}>{w.viewArchive}</a></div><div className="characters-grid">{characters.filter(c => c.id !== character.id).slice(0, 3).map(c => <CharacterCard key={c.id} c={c} lang={lang} />)}</div></section>
      </>}

      {path === "guides" && <><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA · {w.articleLabel}</p><h1>{w.guides}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{w.guidesIntro}</p></div><div className="guides-grid guide-library">{guides.map(g => <GuideCard key={g.id} guide={g} lang={lang} />)}</div></>}

      {guide && <>
        <nav className="breadcrumb" aria-label={u.breadcrumb}><a href={href()}>{w.home}</a><span>/</span><a href={href("guides")}>{w.guides}</a></nav>
        <div className="article-layout"><article className="guide-article"><header className="article-header"><span className="feature-tag">{guide.category[lang]}</span><h1>{guide.title[lang]}</h1><p className="article-summary">{guide.summary[lang]}</p><FavoriteButton lang={lang} kind="guide" itemId={guide.id} /><div className="article-byline"><span className="author-dot">H</span><a href={href("homulilly")}>Homulilly</a><span>·</span><span><Clock3 size={14} aria-hidden="true" />{guide.minutes} {w.minutes}</span>{guide.reviewedAt && <><span>·</span><span>{x.reviewed} <time dateTime={guide.reviewedAt}>{dateLabel(guide.reviewedAt,lang)}</time></span></>}</div></header><img className="article-image" src={guide.image} alt="" width="1000" height="540" />{guide.sections.map((section, i) => <section key={i} id={"section-" + i} className="article-section"><h2>{section.title[lang]}</h2><p>{section.text[lang]}</p></section>)}<SourcePanel lang={lang} sources={guide.sources} /></article><aside className="article-sidebar"><h2>{w.contents}</h2><ol>{guide.sections.map((s, i) => <li key={i}><a href={"#section-" + i}>{s.title[lang].replace(/^\d+\. /, "")}</a></li>)}</ol><div className="article-sidebar-creator"><Music2 size={23} aria-hidden="true" /><h3>Homulilly</h3><p>{w.creatorCardText}</p><a className="text-link" href={href("homulilly")}>{w.meet}</a></div></aside></div>
        <section className="guide-section"><div className="section-heading"><h2>{w.moreGuides}</h2><a className="text-link" href={href("guides")}>{w.backGuides}</a></div><div className="guides-grid">{guides.filter(g => g.id !== guide.id).slice(0,3).map(g => <GuideCard key={g.id} guide={g} lang={lang} />)}</div></section>
      </>}

      {path === "news" && <NewsListing lang={lang} articles={news} />}
      {article && <NewsDetail lang={lang} article={article} articles={news} />}

      {path === "homulilly" && <><div className="creator-page"><div className="creator-kicker"><Music2 size={17} aria-hidden="true" /> VSINGER · CREATOR</div><h1>Homulilly<span aria-hidden="true">✦</span></h1><p className="creator-lead">{w.creatorIntro}</p><div className="creator-divider"><Diamond size={14} aria-hidden="true" /></div><div className="creator-bio"><p>{w.creatorText}</p><p>{w.creatorNote}</p></div><div className="creator-topics">{w.creatorTopics.map((t, i) => <div key={t}>{i === 0 ? <Music2 size={24} aria-hidden="true" /> : i === 1 ? <Sparkles size={24} aria-hidden="true" /> : <Heart size={24} aria-hidden="true" />}<h2>{t}</h2></div>)}</div><section className="creator-socials-section"><h2>{creatorCopy[lang].title}</h2><p>{creatorCopy[lang].intro}</p><CreatorSocials lang={lang} /><div className="creator-support-links"><a className="button button-rose" href={communityLinks.kofi} target="_blank" rel="noopener noreferrer">{c.kofi}</a><a className="button button-outline" href={communityLinks.x} target="_blank" rel="noopener noreferrer">{c.follow}</a></div></section><a className="button button-rose" href={href("guides")}>{w.guides}</a></div></>}

      {path === "about" && <article className="about-page"><p className="eyebrow">MAGIA ARCHIVE</p><h1>{w.about}</h1><p>{w.disclaimer}</p><h2>{w.editorial}</h2><p>{w.editorialText}</p><p>{w.regional}</p><h2>{w.author}</h2><p>{w.creatorText}</p><p>{w.footerArt}</p><a className="text-link" href={official} target="_blank" rel="noopener noreferrer">{w.officialSite}</a></article>}
    </main>
    <footer className="site-footer"><div className="footer-top"><a className="footer-brand" href={href()}><BookOpen size={22} strokeWidth={1.25} aria-hidden="true" /> MAGIA ARCHIVE</a><nav aria-label={account.footerLinks}><a href={href("about")}>{w.about}</a><a href={href("madoka")}>{c.universe}</a><a href={href("community")}>{c.community}</a><a href={href("profile")}>{account.profile}</a><a href={href("privacy")}>{account.privacy}</a><a href={official} target="_blank" rel="noopener noreferrer">{w.officialSite}</a><a href={href('faq')}>{toolsCopy[lang].faq}</a><a href={href('contact')}>{toolsCopy[lang].contact}</a></nav><a className="footer-author" href={href("homulilly")}>{w.author} <Heart size={13} aria-hidden="true" /></a></div><div className="footer-socials"><p>{creatorCopy[lang].socials}</p><CreatorSocials lang={lang} compact /></div><div className="footer-community"><a href={communityLinks.x} target="_blank" rel="noopener noreferrer">Madoka Mágica España · X</a><a href={communityLinks.kofi} target="_blank" rel="noopener noreferrer">{c.kofi}</a><a href={communityLinks.petition} target="_blank" rel="noopener noreferrer">{c.sign}</a></div><div className="footer-bottom"><p>{w.disclaimer}<br />{w.footerArt}</p><span>© 2026 MAGIA ARCHIVE</span></div></footer>
  </div></KiokuProvider>;
}
