"use client";
import { useState } from 'react';
import { teamBuilds, teamMembers, teamSources, teamRarity, tierReviewed } from '@/lib/tier-data';
import { archiveCopy } from '@/lib/archive-copy';
import { buildCopy } from '@/lib/build-copy';
import { expansionCopy } from '@/lib/expansion-copy';
import { tierResearchCopy } from '@/lib/tier-research-copy';
import { assessmentFor } from '@/lib/tier-assessments';
import { kiokus, kiokuLabel } from '@/lib/kioku-catalog';
import { kiokuCopy } from '@/lib/kioku-copy';
import { TierUnit, TeamCard, ElementFilters, UseFilters } from './tier-lists';
import SourcePanel from './source-panel';
import type { Lang } from '@/lib/locales';
export default function BuildPages({lang,path}:{lang:Lang;path:string}){
  const x=expansionCopy[lang], b=buildCopy[lang], r=tierResearchCopy[lang], k=kiokuCopy[lang];
  const [element,setElement]=useState('all'), [use,setUse]=useState('all');
  const team=teamBuilds.find(team=>path==='builds/'+team.id);
  if(team) {
    const members=teamMembers(team);
    return <article className="build-detail">
      <nav className="breadcrumb"><a href={`/${lang}/builds/`}>{x.builds}</a><span>/</span><span>{b[team.nameKey]}</span></nav>
      <div className="page-heading"><p className="eyebrow">MAGIA EXEDRA · {k[team.element]} · {r[team.use]}</p><h1>{b[team.nameKey]}</h1><p>{b[team.textKey]}</p></div>
      <div className="tier-context"><span>{archiveCopy[lang].all}: {team.rank}</span>{team.cohortRank&&<span>{archiveCopy[lang].rarityStudy} ({'★'.repeat(teamRarity(team)!)}): {team.cohortRank}</span>}<span>{r.purpose}: {r[team.use]}</span></div>
      <div className="kioku-grid">{members.map(unit=><TierUnit key={unit.id} unit={unit} lang={lang}/>)}</div>
      <section className="build-role-section"><h2>{r.memberJobs}</h2><ul className="build-jobs">{members.map(unit=><li key={unit.id}><a href={`/${lang}/kioku/${unit.id}/`}>{kiokuLabel(unit,lang)}</a><span>{k[unit.role]} · {k[unit.element]}</span><p>{r[assessmentFor(unit.id)!.focus]}</p></li>)}</ul></section>
      <section className="expansion-card build-strategy"><h2>{x.rotation}</h2><p>{b[team.strategy]}</p></section>
      <section><h2>{x.portraits}</h2><p>{b[team.portraits]}</p><a className="text-link" href={`/${lang}/database/portraits/`}>{x.portraits}</a></section>
      <section><h2>{r.alternatives}</h2><p>{r.alternativeNote}</p><div className="build-alternatives">{team.alternatives.map(option=>{
        const original=kiokus.find(unit=>unit.id===option.for)!;
        return <div className="expansion-card" key={option.for}><h3>{kiokuLabel(original,lang)}</h3><div className="team-swap-list">{option.choices.map(id=>{
          const candidate=kiokus.find(unit=>unit.id===id)!;
          return <a href={`/${lang}/kioku/${id}/`} key={id}><img src={candidate.image} width={600} height={369} alt="" loading="lazy"/><span>{kiokuLabel(candidate,lang)}<small>{k[candidate.role]} · {k[candidate.element]}</small></span></a>;
        })}</div></div>;
      })}</div></section>
      <section className="build-consideration"><h2>{r.limit}</h2><p>{b[team.limit]||r[team.limit]}</p></section>
      <p className="tier-notice">{x.teamMethod}</p>
      <div className="tier-header-actions"><a className="button button-outline" href={`/${lang}/profile/#notebook`}>{k.notebook}</a><a className="button button-rose" href={`/${lang}/tierlists/create/?kind=teams`}>{x.create}</a></div>
      <SourcePanel lang={lang} sources={teamSources(team)} checkedAt={tierReviewed}/>
    </article>;
  }
  const filtered=teamBuilds.filter(team=>(element==='all'||team.element===element)&&(use==='all'||team.use===use));
  return <><div className="page-heading"><p className="eyebrow">MAGIA EXEDRA · PvE / PvP</p><h1>{x.builds}</h1><p>{x.buildIntro}</p></div><UseFilters lang={lang} value={use} onChange={setUse}/><ElementFilters lang={lang} value={element} onChange={setElement}/><p className="tier-empty" role="status">{filtered.length} {x.teams}</p><div className="expansion-grid">{filtered.map(team=><TeamCard key={team.id} team={team} lang={lang}/>)}</div>{!filtered.length&&<p className="tier-empty">{x.noMatches}</p>}<p className="tier-notice">{x.teamMethod}</p></>;
}
