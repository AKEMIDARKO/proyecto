"use client";
import { useKiokus } from './kioku-context';

import { useState, useId, useLayoutEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { ListOrdered, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expansionCopy } from '@/lib/expansion-copy';
import { archiveCopy } from '@/lib/archive-copy';
import { characterRanking } from '@/lib/rarity-ratings';
import { buildCopy } from '@/lib/build-copy';
import { tierResearchCopy } from '@/lib/tier-research-copy';
import { assessmentFor, communityResearch } from '@/lib/tier-assessments';
import { kiokuCopy } from '@/lib/kioku-copy';
import { words, dateLabel } from '@/lib/magia-data';
import { elements, filterKiokus, kiokuName, kiokuVersion, kiokuLabel, type Kioku } from '@/lib/kioku-catalog';
import { tierRanks, type TierRank } from '@/lib/tier-list-model';
import { watchMedia } from '@/lib/watch-media';
import { tierRatings, tierReviewed, tierSources, teamBuilds, teamMembers, teamUses, teamRarity, teamRanking, type TeamBuild } from '@/lib/tier-data';
import type { Lang } from '@/lib/locales';
import SourcePanel from './source-panel';

const rankColors = { 'S+': '#edaf91', S: '#e7c577', A: '#87c6b6', B: '#91b7df', C: '#be9ed5' };
const rankKeys = { 'S+': 'must', S: 'strong', A: 'solid', B: 'situational', C: 'niche' };
export function TierRow({ rank, lang, children, count, collapsed = false, onToggle }: { rank: TierRank; lang: Lang; children: ReactNode; count: number; collapsed?: boolean; onToggle?: () => void }) {
  const id = useId(), label = expansionCopy[lang][rankKeys[rank]], a = archiveCopy[lang];
  const [present, setPresent] = useState(!collapsed), content = useRef<HTMLDivElement>(null), mounted = useRef(false);
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    if (!mounted.current) { mounted.current = true; return; }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced.matches || connection?.saveData || typeof element.animate !== 'function') { setPresent(!collapsed); return; }
    if (!collapsed) setPresent(true);
    const style = getComputedStyle(element), height = element.scrollHeight;
    const expanded = { height: `${height}px`, opacity: 1, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom };
    const closed = { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' };
    element.style.overflow = 'hidden';
    const animation = element.animate(collapsed ? [expanded, closed] : [closed, expanded], { duration: 280, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'both' });
    let alive = true;
    const finish = () => { if (alive) { setPresent(!collapsed); element.style.overflow = ''; stopReduced(); document.removeEventListener('visibilitychange', visibility); animation.cancel(); } };
    const visibility = () => { if (document.hidden) finish(); };
    const stopReduced = watchMedia(reduced, () => { if (reduced.matches) finish(); });
    document.addEventListener('visibilitychange', visibility);
    void animation.finished.then(finish).catch(() => {});
    return () => { alive = false; stopReduced(); document.removeEventListener('visibilitychange', visibility); animation.cancel(); element.style.overflow = ''; };
  }, [collapsed]);
  const heading = <><strong>{rank}</strong><span>{label}</span><span className="tier-rank-count">{count}</span></>;
  return <section className={`tier-row${collapsed && !present ? ' is-collapsed' : ''}`} style={{ '--tier-color': rankColors[rank] } as CSSProperties} aria-label={rank + ': ' + label}><h2 className="tier-rank">{onToggle ? <button type="button" className="tier-rank-toggle" onClick={onToggle} aria-expanded={!collapsed} aria-controls={id} aria-label={`${collapsed ? a.showRank : a.hideRank}: ${rank} · ${label} (${count})`}>{heading}<ChevronDown size={18} aria-hidden="true" /></button> : heading}</h2><div ref={content} id={id} className="tier-row-content" hidden={collapsed && !present} inert={collapsed} aria-hidden={collapsed}>{collapsed && !present ? null : children}</div></section>;
}
export function CollapsibleTierBoard({ lang, renderRank, className = '' }: { lang: Lang; renderRank: (rank: TierRank) => { count: number; children: ReactNode }; className?: string }) {
  const [collapsed, setCollapsed] = useState<TierRank[]>(tierRanks.filter(rank => rank !== 'S+')), a = archiveCopy[lang];
  return <><p className="tier-ranking-context">{a.expandHint}</p><div className="tier-collapse-controls" role="group" aria-label={expansionCopy[lang].tierlists}><button type="button" disabled={!collapsed.length} onClick={() => setCollapsed([])}>{a.expandAll}</button><button type="button" disabled={collapsed.length === tierRanks.length} onClick={() => setCollapsed([...tierRanks])}>{a.collapseAll}</button></div><div className={`tier-board ${className}`.trim()}>{tierRanks.map(rank => { const row = renderRank(rank); return <TierRow key={rank} rank={rank} lang={lang} count={row.count} collapsed={collapsed.includes(rank)} onToggle={() => setCollapsed(current => current.includes(rank) ? current.filter(item => item !== rank) : [...current, rank])}>{row.children}</TierRow>; })}</div></>;
}
export function TierNavigation({ lang, active }: { lang: Lang; active: 'characters' | 'teams' | 'portraits' | 'create' }) {
  const x = expansionCopy[lang];
  return <nav className="database-tabs tier-tabs" aria-label={x.tierlists}>{[{ id: 'characters', path: 'tierlists', label: words[lang].characters }, { id: 'teams', path: 'tierlists/teams', label: x.teams }, { id: 'portraits', path: 'tierlists/portraits', label: x.portraits }, { id: 'create', path: 'tierlists/create', label: x.myLists }].map(item => <a key={item.id} href={`/${lang}/${item.path}/`} className={active === item.id ? 'active' : ''} aria-current={active === item.id ? 'page' : undefined}>{item.label}</a>)}</nav>;
}
export function ElementFilters({ lang, value, onChange }: { lang: Lang; value: string; onChange: (value: string) => void }) {
  const k = kiokuCopy[lang];
  return <div className="tier-filters" role="group" aria-label={k.element}><button type="button" aria-pressed={value === 'all'} onClick={() => onChange('all')}>{k.allElements}</button>{elements.map(element => <button type="button" key={element} aria-pressed={value === element} onClick={() => onChange(element)}><img src={`/assets/game-ui/element-${element === 'Flame' ? 'fire' : element.toLowerCase()}.webp`} width={24} height={24} alt="" />{k[element]}</button>)}</div>;
}
export function TierUnit({ unit, lang, reason = false }: { unit: Kioku; lang: Lang; reason?: boolean }) {
  const k = kiokuCopy[lang], r=tierResearchCopy[lang], a=assessmentFor(unit.id);
  return <article className="tier-unit"><a href={`/${lang}/kioku/${unit.id}/`}><img src={unit.image} width={600} height={369} alt="" loading="lazy" /><div className="tier-unit-copy"><h3>{kiokuName(unit, lang)}</h3><span className="tier-version">{kiokuVersion(unit, lang)}</span><span className="tier-role">{'★'.repeat(unit.rarity)} · {k[unit.element]} · {k[unit.role]}</span></div></a>{reason && a && <details className="tier-card-details tier-assessment"><summary>{archiveCopy[lang].cardDetails}<ChevronDown size={16} aria-hidden="true" /></summary><div className="tier-unit-copy tier-assessment-copy"><span className="evidence-label">{a.sources.length ? r.communityEvidence : r.kitEvidence}</span><p className="tier-reason">{r[a.focus]}</p>{['asc4','asc2','asc5'].includes(a.limit)&&<span className="ascension-label">{a.limit.replace('asc','A')}</span>}<p className="tier-reason">{r[a.limit]}</p><ul className="assessment-sources">{a.sources.map(key=><li key={key}><a href={communityResearch[key].url} target="_blank" rel="noopener noreferrer">{communityResearch[key].title} · {communityResearch[key].date}</a></li>)}<li><a href={unit.source} target="_blank" rel="noopener noreferrer">Puella Magi Wiki · {kiokuVersion(unit,lang)}</a></li></ul><a className="text-link" href={`/${lang}/kioku/${unit.id}/`}>{k.profile}</a></div></details>}</article>;
}
export function UseFilters({lang,value,onChange}:{lang:Lang;value:string;onChange:(value:string)=>void}) {
  const r=tierResearchCopy[lang];
  return <div className="tier-filters use-filters" role="group" aria-label={r.purpose}>{['all',...teamUses].map(use=><button type="button" key={use} aria-pressed={value===use} onClick={()=>onChange(use)}>{r[use==='all'?'allUses':use]}</button>)}</div>;
}
export function TeamCard({ team, lang, rank=team.rank }: { team: TeamBuild; lang: Lang; rank?: TierRank }) {
  const x = expansionCopy[lang], b = buildCopy[lang], r=tierResearchCopy[lang];
  return <article className="team-card"><p className="team-purpose"><span>{rank}</span>{r[team.use]}</p><p className="team-rarity">{teamRarity(team)?'★'.repeat(teamRarity(team)!):archiveCopy[lang].mixed}</p><h3><a href={`/${lang}/builds/${team.id}/`}>{b[team.nameKey]}</a></h3><div className="team-members">{teamMembers(team).map(unit => <a key={unit.id} href={`/${lang}/kioku/${unit.id}/`} title={kiokuLabel(unit, lang)}><img src={unit.image} alt={kiokuLabel(unit, lang)} width={600} height={369} loading="lazy" /></a>)}</div><details className="tier-card-details team-details"><summary>{archiveCopy[lang].cardDetails}<ChevronDown size={16} aria-hidden="true" /></summary><div className="tier-card-details-copy"><p>{b[team.textKey]}</p><p className="team-limit">{b[team.limit]||r[team.limit]}</p><a className="text-link" href={`/${lang}/builds/${team.id}/`}>{x.viewBuild}</a></div></details></article>;
}
export function RarityNavigation({lang,base,rarity,values=[5,4,3]}:{lang:Lang;base:string;rarity?:number;values?:number[]}) {
 return <nav className="rarity-navigation" aria-label={kiokuCopy[lang].rarity}><a href={`/${lang}/${base}/`} aria-current={!rarity?'page':undefined}>{archiveCopy[lang].all}</a>{values.map(value=><a key={value} href={`/${lang}/${base}/${value}-stars/`} aria-current={rarity===value?'page':undefined}>{'★'.repeat(value)}</a>)}</nav>;
}
export default function TierLists({lang,teams=false,rarity}:{lang:Lang;teams?:boolean;rarity?:number}) {
  const kiokus=useKiokus();
 const x=expansionCopy[lang],k=kiokuCopy[lang],r=tierResearchCopy[lang],a=archiveCopy[lang];
 const [element,setElement]=useState('all'),[query,setQuery]=useState(''),[role,setRole]=useState('all'),[use,setUse]=useState('all');
 const ids=new Set(filterKiokus(kiokus,{query,element,rarity:rarity?String(rarity):'all',role}).map(u=>u.id));
 const ranking=characterRanking(rarity),filtered=ranking.filter(item=>ids.has(item.unit.id)),groups=teamRanking(rarity);
 const matchedTeams=groups.filter(({team})=>(use==='all'||team.use===use)&&(element==='all'||team.element===element)&&(!query.trim()||[buildCopy[lang][team.nameKey],...teamMembers(team).flatMap(u=>[u.name,u.japanese,u.kioku])].join(' ').toLowerCase().includes(query.toLowerCase().trim())));
 return <><div className="expansion-heading"><div className="page-heading"><p className="eyebrow"><ListOrdered size={15} aria-hidden="true"/> MAGIA EXEDRA</p><h1>{x.tierlists} · {teams?x.teams:words[lang].characters}{rarity?' · '+'★'.repeat(rarity):''}</h1></div><a className="button button-rose" href={`/${lang}/tierlists/create/${teams?'?kind=teams':''}`}>{x.create}</a></div>
 <TierNavigation lang={lang} active={teams?'teams':'characters'}/><RarityNavigation lang={lang} base={teams?'tierlists/teams':'tierlists'} rarity={rarity}/>
 <div className="tier-context"><span>{a.personal}</span><span>{x.reviewed}: <time dateTime={tierReviewed}>{dateLabel(tierReviewed,lang)}</time></span><span>{teams?groups.length+' '+x.teams:ranking.length+' / '+kiokus.length+' '+k.results}</span></div>
 {rarity&&<p className="tier-ranking-context">{a.withinRarity}</p>}{teams&&<UseFilters lang={lang} value={use} onChange={setUse}/>}
 <ElementFilters lang={lang} value={element} onChange={setElement}/>{rarity===3&&element==='Void'&&<p className="tier-empty">{a.noVoidThree}</p>}
 <div className="tier-toolbar"><div><label htmlFor="tier-search">{k.searchLabel}</label><input id="tier-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={k.search}/></div>{!teams&&<div><label id="tier-role-label">{k.role}</label><Select value={role} onValueChange={setRole}><SelectTrigger aria-labelledby="tier-role-label"><SelectValue/></SelectTrigger><SelectContent position="popper" align="start" className="archive-select-menu"><SelectItem value="all">{k.allRoles}</SelectItem>{['Attacker','Breaker','Buffer','Debuffer','Healer','Defender'].map(value=><SelectItem value={value} key={value}>{k[value]}</SelectItem>)}</SelectContent></Select></div>}</div>
 <p className="tier-empty" role="status">{teams?matchedTeams.length+' '+x.teams:filtered.length+' '+k.results}</p><CollapsibleTierBoard lang={lang} renderRank={rank=>{const units=filtered.filter(item=>item.rank===rank),grouped=matchedTeams.filter(item=>item.rank===rank),count=teams?grouped.length:units.length;return {count,children:count?<div className={teams?'tier-team-grid':'tier-unit-grid'}>{teams?grouped.map(({team})=><TeamCard team={team} rank={rank} lang={lang} key={team.id}/>):units.map(item=><TierUnit unit={item.unit} lang={lang} reason key={item.unit.id}/>)}</div>:<p className="tier-empty">{x.noMatches}</p>};}}/>
 <details className="tier-method tier-page-details"><summary>{a.rankingMethod}<ChevronDown size={18} aria-hidden="true" /></summary><div className="tier-page-details-copy"><p>{r.researchNote}</p>{teams&&<p>{rarity?a.pureTeams:x.teamMethod}</p>}<p>{r.method}</p>{rarity&&<p>{a.rarityMethod}</p>}<SourcePanel lang={lang} sources={tierSources} checkedAt={tierReviewed}/></div></details></>;
}
