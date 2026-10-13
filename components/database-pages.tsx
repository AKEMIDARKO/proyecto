"use client";
import { useState } from 'react';
import { expansionCopy } from '@/lib/expansion-copy';
import { databaseCopy } from '@/lib/database-copy';
import { archiveCopy } from '@/lib/archive-copy';
import { databaseItems, type DatabaseItem } from '@/lib/database-data';
import { words } from '@/lib/magia-data';
import { kiokus } from '@/lib/kioku-catalog';
import { kiokuCopy } from '@/lib/kioku-copy';
import { gameItems, itemCategories, itemName, itemPurpose, itemsCopy } from '@/lib/items-copy';
import type { Lang } from '@/lib/locales';
import GameIcon from './game-icon';
import { TierUnit } from './tier-lists';
import { PortraitCatalog, PortraitDetail, PortraitArt } from './portrait-pages';
import SourcePanel from './source-panel';

export function ItemArt({ item, detail = false }: { item: DatabaseItem; detail?: boolean }) {
  return <img className={`database-art material-art${detail ? ' detail-art' : ''}`} src={item.image} width={item.width} height={item.height} alt={item.japanese} loading={detail ? 'eager' : 'lazy'} />;
}
export default function DatabasePages({ lang, path }: { lang: Lang; path: string }) {
  const x = expansionCopy[lang], d = databaseCopy[lang], a = archiveCopy[lang], k = kiokuCopy[lang], i = itemsCopy[lang];
  const [query, setQuery] = useState('');
  const item = databaseItems.find(entry => path === `database/${entry.kind === 'portraits' ? 'portraits' : 'items'}/${entry.id}`);
  if (item?.portrait) return <PortraitDetail lang={lang} portrait={item.portrait} />;
  if (path === 'database/portraits') return <PortraitCatalog lang={lang} />;
  if (item?.gameItem) {
    const entry=item.gameItem;
    return <article className="object-detail">
      <nav className="breadcrumb"><a href={`/${lang}/database/`}>{x.database}</a><span>/</span><a href={`/${lang}/database/items/`}>{x.objects}</a><span>/</span><a href={`/${lang}/database/${entry.category}/`}>{i[entry.category]}</a></nav>
      <div className="object-intro"><ItemArt item={item} detail /><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA · {i[entry.category]}</p><h1>{itemName(entry,lang)}</h1><p lang="ja">{entry.japanese}</p></div></div>
      <section className="expansion-card"><h2>{d.use}</h2><p>{itemPurpose(entry,lang)}</p><details className="source-item-details"><summary>{i.sourceDetail}</summary><p lang="ja">{entry.functionJapanese}</p><p lang="ja">{entry.acquisitionJapanese}</p>{entry.sharedAssetIds.length>1&&<p>{i.sharedIcon}</p>}</details></section>
      <SourcePanel lang={lang} sources={[{title: entry.source.includes('game8')?'Game8 · '+entry.japanese:'Madoka Exedra Wiki · '+entry.japanese, url: entry.source}]} />
      {entry.category==='materials'&&<section className="archive-section"><div className="section-heading"><h2>{d.related}</h2><a href={`/${lang}/characters/`} className="text-link">{words[lang].characters}</a></div><div className="kioku-grid">{kiokus.filter(unit => !item.element || unit.element === item.element).slice(0, 4).map(unit => <TierUnit unit={unit} lang={lang} key={unit.id} />)}</div></section>}
    </article>;
  }
  if (path === 'database') {
    const cards = [
      { path: 'characters', label: words[lang].characters, text: kiokus.length + ' KIOKU · ★5 / ★4 / ★3', icon: 'kioku' as const },
      { path: 'database/items', label: x.objects, text: i.intro, icon: 'archive' as const },
    ];
    return <><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA</p><h1>{x.database}</h1><p>{x.dbIntro}</p></div><div className="expansion-grid database-hub">{cards.map(card => <a className="expansion-card" key={card.path} href={`/${lang}/${card.path}/`}><GameIcon name={card.icon} /><h2>{card.label}</h2><p>{card.text}</p></a>)}</div></>;
  }
  if (path === 'database/items') return <>
    <nav className="breadcrumb"><a href={`/${lang}/database/`}>{x.database}</a><span>/</span><span>{x.objects}</span></nav>
    <div className="page-heading"><p className="eyebrow">MAGIA EXEDRA</p><h1>{x.objects}</h1><p>{i.intro}</p></div>
    <div className="expansion-grid database-hub object-types">
      <a className="expansion-card" href={`/${lang}/database/portraits/`}><PortraitArt portrait={databaseItems.find(entry => entry.id === 'a-close-friend')!.portrait!} /><h2>{x.portraits}</h2><span className="text-link">{databaseItems.filter(entry => entry.kind === 'portraits').length} · ★5 / ★4</span></a>
      {itemCategories.map(category=>{const entries=databaseItems.filter(entry=>entry.gameItem?.category===category);return <a className="expansion-card" href={`/${lang}/database/${category}/`} key={category}><ItemArt item={entries[0]} /><h2>{i[category]}</h2><span className="text-link">{entries.length}</span></a>;})}
    </div>
  </>;
  const category=path.split('/')[1],entries=gameItems.filter(entry=>entry.category===category&&[itemName(entry,lang),entry.japanese,itemPurpose(entry,lang)].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <>
    <nav className="breadcrumb"><a href={`/${lang}/database/`}>{x.database}</a><span>/</span><a href={`/${lang}/database/items/`}>{x.objects}</a><span>/</span><span>{i[category]}</span></nav>
    <div className="page-heading"><p className="eyebrow">MAGIA EXEDRA</p><h1>{i[category]}</h1><p>{i.intro}</p></div>
    <div className="tier-toolbar"><div><label htmlFor="items-search">{k.searchLabel}</label><input id="items-search" value={query} onChange={event => setQuery(event.target.value)} /></div></div>
    <p className="tier-empty" role="status">{entries.length} · {i[category]}</p>
    <div className="expansion-grid database-grid">{entries.map(entry => <article className="expansion-card" key={entry.id}><a className="database-art-link" href={`/${lang}/database/items/${entry.id}/`} aria-label={itemName(entry,lang)}><ItemArt item={databaseItems.find(item=>item.id===entry.id)!} /></a><p className="eyebrow">{i[entry.category]}</p><h2><a href={`/${lang}/database/items/${entry.id}/`}>{itemName(entry,lang)}</a></h2><p>{itemPurpose(entry,lang)}</p><a className="text-link" href={`/${lang}/database/items/${entry.id}/`}>{k.profile}</a></article>)}</div>
    {!entries.length && <p className="tier-empty">{x.noMatches}</p>}
  </>;
}
