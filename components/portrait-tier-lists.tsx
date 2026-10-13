"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { portraitCopy } from '@/lib/portrait-copy';
import { archiveCopy } from '@/lib/archive-copy';
import { expansionCopy } from '@/lib/expansion-copy';
import { portraitChecked,portraitIndexSources,portraitRanking,filterPortraits,type PortraitFilters } from '@/lib/portrait-data';
import { communityResearch } from '@/lib/tier-assessments';
import { dateLabel } from '@/lib/magia-data';
import type { Lang } from '@/lib/locales';
import { TierNavigation,RarityNavigation,CollapsibleTierBoard,ElementFilters } from './tier-lists';
import { PortraitControls,PortraitCard } from './portrait-pages';
import SourcePanel from './source-panel';
export default function PortraitTierLists({lang,rarity}:{lang:Lang;rarity?:number}){
 const [filters,setFilters]=useState<PortraitFilters>({}),a=archiveCopy[lang],t=portraitCopy[lang],x=expansionCopy[lang],ranking=portraitRanking(rarity),ids=new Set(filterPortraits(ranking.map(i=>i.portrait),filters,lang).map(p=>p.id)),filtered=ranking.filter(i=>ids.has(i.portrait.id));
 return <><div className="expansion-heading"><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA · {a.personal}</p><h1>{a.portraitRanking}{rarity?' · '+'★'.repeat(rarity):''}</h1></div><a href={`/${lang}/database/portraits/`} className="button button-outline">{a.portraitCatalog}</a></div><TierNavigation lang={lang} active="portraits"/><RarityNavigation lang={lang} base="tierlists/portraits" rarity={rarity} values={[5,4]}/><div className="tier-context"><span>{a.personal}</span><span>{x.reviewed}: <time dateTime={portraitChecked}>{dateLabel(portraitChecked,lang)}</time></span><span>{ranking.length} {x.portraits}</span></div>{rarity&&<p className="tier-ranking-context">{a.withinRarity}</p>}
 {rarity===3?<p className="tier-empty">{a.noThreePortraits}</p>:<><ElementFilters lang={lang} value={filters.element||'all'} onChange={element=>setFilters({...filters,element})}/><PortraitControls lang={lang} filters={filters} onChange={setFilters}/><p className="portrait-results" role="status">{filtered.length} / {ranking.length} {x.portraits}</p><CollapsibleTierBoard lang={lang} className="portrait-tier-board" renderRank={rank=>{const group=filtered.filter(i=>i.rank===rank);return {count:group.length,children:group.length?<div className="portrait-tier-grid">{group.map(i=><PortraitCard key={i.portrait.id} portrait={i.portrait} lang={lang} ranking rarity={rarity}/>)}</div>:<p className="tier-empty">{x.noMatches}</p>};}}/></>}
 <details className="tier-method tier-page-details"><summary>{a.rankingMethod}<ChevronDown size={18} aria-hidden="true" /></summary><div className="tier-page-details-copy"><p>{a.portraitMethod}</p><p>{t.portraitConditions}</p><h2>{t.grading}</h2><p>{t.gradingNote}</p><p>{t.noThreeCatalog}</p><SourcePanel lang={lang} sources={[{title:communityResearch.portraitChoice.title+' · '+communityResearch.portraitChoice.date,url:communityResearch.portraitChoice.url},...portraitIndexSources]} checkedAt={portraitChecked}/></div></details></>;
}
