"use client";
import { useKiokus } from './kioku-context';

import { useCallback, useEffect, useRef, useState } from 'react';
import { kiokuLabel } from '@/lib/kioku-catalog';
import { toolsCopy } from '@/lib/tools-copy';
import { emptyPlan, newGoal, goal, type GrowthGoal, type GrowthPlan } from '@/lib/tool-model';
import { combinedCosts, specialCap, magicCap, progressionSources } from '@/lib/progression';
import { gameItems, itemName } from '@/lib/items-copy';
import type { Lang } from '@/lib/locales';
import { useToolAccount, ToolAuth, ToolStatus, toolFetch, errorKey, KiokuSelect, PortraitSelect, UnitIdentity, NumericField } from './tools-common';
import SourcePanel from './source-panel';

type Account=ReturnType<typeof useToolAccount>;
function usePlanner(account:Account){
  const [plan,setPlan]=useState<GrowthPlan>(emptyPlan),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),sequence=useRef(0);
  const reload=useCallback(async()=>{const run=++sequence.current;setLoaded(false);try{const data=await toolFetch<{plan:GrowthPlan}>('/api/planner');if(run!==sequence.current)return;setPlan(data.plan);setLoaded(true);setStatus('');}catch{if(run===sequence.current)setStatus('loadError');}},[]);
  useEffect(()=>{if(account.user)void reload();return()=>{sequence.current++;};},[account.user,reload]);
  const change=(value:GrowthPlan)=>{setPlan(value);setStatus('unsaved');};
  const save=async(value=plan)=>{if(busy||!account.user||!loaded)return;setBusy(true);try{setPlan((await toolFetch<{plan:GrowthPlan}>('/api/planner',value)).plan);setStatus('saved');}catch(e){setStatus(errorKey(e,'goal'));}finally{setBusy(false);}};
  return{plan,change,save,reload,loaded,busy,status};
}
function adjust(entry:GrowthGoal,key:keyof GrowthGoal,n:number,kiokus:readonly import("@/lib/kioku-catalog").Kioku[]):GrowthGoal{
  const next={...entry,[key]:n},u=kiokus.find(u=>u.id===entry.kiokuId)!;
  next.targetLevel=Math.max(next.currentLevel,next.targetLevel);next.targetAscension=Math.max(next.currentAscension,next.targetAscension);
  next.currentMagic=Math.min(next.currentMagic,magicCap(next.currentLevel));next.targetMagic=Math.max(next.currentMagic,Math.min(next.targetMagic,magicCap(next.targetLevel)));
  next.currentSpecial=Math.min(next.currentSpecial,specialCap(u,next.currentAscension));next.targetSpecial=Math.max(next.currentSpecial,Math.min(next.targetSpecial,specialCap(u,next.targetAscension)));
  next.crystals=Math.min(next.crystals,next.targetAscension-next.currentAscension);return next;
}
function GoalEditor({lang,entry,onChange}:{lang:Lang;entry:GrowthGoal;onChange:(value:GrowthGoal)=>void}){
  const kiokus=useKiokus();
  const t=toolsCopy[lang],unit=kiokus.find(u=>u.id===entry.kiokuId)!;
  const pairs=[['level','currentLevel','targetLevel',1,141,141],['magic','currentMagic','targetMagic',0,magicCap(entry.currentLevel),magicCap(entry.targetLevel)],['ascension','currentAscension','targetAscension',0,5,5],...(unit.rarity===3?[]:[['special','currentSpecial','targetSpecial',1,specialCap(unit,entry.currentAscension),specialCap(unit,entry.targetAscension)]])] as [string,keyof GrowthGoal,keyof GrowthGoal,number,number,number][];
  return <div className="goal-editor"><div className="goal-head" aria-hidden="true"><span/><span>{t.current}</span><span>{t.target}</span></div>{pairs.map(([name,current,target,min,currentMax,targetMax])=><div className="goal-row" key={name}><strong>{t[name]}</strong><NumericField label={t[name]+' · '+t.current} value={Number(entry[current])} min={min} max={currentMax} onChange={n=>onChange(adjust(entry,current,n,kiokus))}/><NumericField label={t[name]+' · '+t.target} value={Number(entry[target])} min={Number(entry[current])} max={targetMax} onChange={n=>onChange(adjust(entry,target,n,kiokus))}/></div>)}{unit.rarity===3&&<p className="tool-note">{t.noSpecial}</p>}<NumericField label={t.crystals} value={entry.crystals} max={entry.targetAscension-entry.currentAscension} onChange={n=>onChange({...entry,crystals:n})}/><PortraitSelect lang={lang} value={entry.portraitId} onChange={portraitId=>onChange({...entry,portraitId})}/><label className="tool-field"><span>{t.notes}</span><textarea rows={3} maxLength={2000} value={entry.notes} onChange={e=>onChange({...entry,notes:e.target.value})}/></label></div>;
}
function CostTable({lang,entries,inventory,onInventory}:{lang:Lang;entries:GrowthGoal[];inventory:Record<string,number>;onInventory:(value:Record<string,number>)=>void}){
  const kiokus=useKiokus();
  const t=toolsCopy[lang];let cost:ReturnType<typeof combinedCosts>;
  try{cost=combinedCosts(entries,inventory,kiokus);}catch{return <p className="tool-error" role="alert">{t.invalidGoal}</p>;}
  return <section className="tool-costs"><h2>{t.materials}</h2>{cost.partialAq&&<p className="tool-note" role="status">{t.partialAq}</p>}{Object.keys(cost.materials).length?<div className="tool-table-wrap"><table className="tool-table"><thead><tr><th scope="col">{t.materials}</th><th scope="col">{t.required}</th><th scope="col">{t.owned}</th><th scope="col">{t.missing}</th></tr></thead><tbody>{Object.entries(cost.materials).map(([id,n])=>{const item=gameItems.find(i=>i.id===id)!;return <tr key={id}><th scope="row"><a href={`/${lang}/database/items/${id}/`}><img src={item.image} width={44} height={44} alt="" loading="lazy"/><span>{itemName(item,lang)}</span></a></th><td>{n.toLocaleString(lang)}</td><td><input type="number" aria-label={t.owned+' · '+itemName(item,lang)} inputMode="numeric" min={0} max={1000000000} value={inventory[id]||0} onChange={e=>onInventory({...inventory,[id]:Math.max(0,Math.min(1000000000,Math.trunc(Number(e.target.value)||0)))})}/></td><td>{cost.missing[id].toLocaleString(lang)}</td></tr>;})}</tbody></table></div>:<p>{t.noMaterials}</p>}{Object.entries(cost.copies).map(([id,n])=><p className="tool-copy-cost" key={id}>{kiokuLabel(kiokus.find(u=>u.id===id)!,lang)} · {t.copies}: <strong>{n}</strong></p>)}</section>;
}
export function MyCharacters({lang}:{lang:Lang}){
  const kiokus=useKiokus();
  const t=toolsCopy[lang],account=useToolAccount(),p=usePlanner(account),[selected,setSelected]=useState(kiokus[0].id),[search,setSearch]=useState('');
  const update=(entry:GrowthGoal)=>p.change({...p.plan,entries:p.plan.entries.map(e=>e.kiokuId===entry.kiokuId?entry:e)});
  const entries=p.plan.entries.filter(e=>kiokuLabel(kiokus.find(u=>u.id===e.kiokuId)!,lang).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <><ToolAuth lang={lang} account={account}/>{account.user&&<><div className="tool-card"><div className="tool-actions"><KiokuSelect lang={lang} value={selected} onChange={setSelected}/><button className="button button-rose" type="button" disabled={!p.loaded||p.busy||p.plan.entries.some(e=>e.kiokuId===selected)} onClick={()=>p.change({...p.plan,entries:[...p.plan.entries,newGoal(selected,kiokus)]})}>{t.add}</button></div><label className="tool-field"><span>{t.search}</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="collection-grid">{entries.map(entry=>{const unit=kiokus.find(u=>u.id===entry.kiokuId)!;return <article className="tool-card" key={entry.kiokuId}><UnitIdentity lang={lang} unit={unit}/><p>{t.level} {entry.currentLevel} → {entry.targetLevel} · {t.ascension} {entry.currentAscension} → {entry.targetAscension}</p><details><summary>{t.edit} · {t.target}</summary><fieldset disabled={!p.loaded||p.busy}><GoalEditor lang={lang} entry={entry} onChange={update}/><button type="button" className="text-link" onClick={()=>p.change({...p.plan,entries:p.plan.entries.filter(e=>e.kiokuId!==entry.kiokuId)})}>{t.remove}</button></fieldset></details></article>;})}</div>{p.loaded&&!p.plan.entries.length&&<p className="tool-empty">{t.emptyCollection}</p>}<fieldset disabled={!p.loaded||p.busy}><CostTable lang={lang} entries={p.plan.entries} inventory={p.plan.inventory} onInventory={inventory=>p.change({...p.plan,inventory})}/><details className="tool-card"><summary>{t.inventory}</summary><div className="inventory-grid">{gameItems.map(item=><label className="tool-field" key={item.id}><span><img src={item.image} width={32} height={32} alt="" loading="lazy"/>{itemName(item,lang)}</span><input type="number" min={0} max={1000000000} inputMode="numeric" value={p.plan.inventory[item.id]||0} onChange={e=>p.change({...p.plan,inventory:{...p.plan.inventory,[item.id]:Math.max(0,Math.min(1000000000,Math.trunc(Number(e.target.value)||0)))}})}/></label>)}</div></details></fieldset><div className="tool-save-bar"><button type="button" className="button button-rose" disabled={!p.loaded||p.busy} onClick={()=>void p.save()}>{t.save}</button><button className="button button-outline" type="button" disabled={p.busy} onClick={()=>void p.reload()}>{t.reload}</button><ToolStatus lang={lang} status={p.status} busy={p.busy}/></div></>}<p className="tool-note">{t.calcCoverage}</p><p className="tool-note">{t.checkInGame}</p><SourcePanel lang={lang} sources={progressionSources}/></>;
}
export function AscensionCalculator({lang}:{lang:Lang}){
  const kiokus=useKiokus();
  const t=toolsCopy[lang],account=useToolAccount(),p=usePlanner(account),[entry,setEntry]=useState(()=>newGoal(kiokus[0].id,kiokus)),[inventory,setInventory]=useState<Record<string,number>>({});
  useEffect(()=>{if(p.loaded)setInventory(old=>({...p.plan.inventory,...old}));},[p.loaded,p.plan.inventory]);
  const save=async()=>{try{goal(entry,kiokus);}catch{ return; }await p.save({...p.plan,entries:[...p.plan.entries.filter(e=>e.kiokuId!==entry.kiokuId),entry],inventory:{...p.plan.inventory,...inventory}});};
  return <><div className="calculator-layout"><section className="tool-card"><KiokuSelect lang={lang} value={entry.kiokuId} onChange={id=>setEntry(newGoal(id,kiokus))}/><UnitIdentity lang={lang} unit={kiokus.find(u=>u.id===entry.kiokuId)!}/><GoalEditor lang={lang} entry={entry} onChange={setEntry}/></section><CostTable lang={lang} entries={[entry]} inventory={inventory} onInventory={setInventory}/></div><div className="tool-card"><ToolAuth lang={lang} account={account}/>{account.user&&<div className="tool-actions"><button type="button" className="button button-rose" disabled={!p.loaded||p.busy} onClick={()=>void save()}>{t.saveGoal}</button><a className="text-link" href={`/${lang}/my-characters/`}>{t.myCharacters}</a><button type="button" className="text-link" onClick={()=>void p.reload()} disabled={p.busy}>{t.reload}</button></div>}<ToolStatus lang={lang} status={p.status} busy={p.busy}/></div><p className="tool-note">{t.calcCoverage}</p><p className="tool-note">{t.checkInGame}</p><SourcePanel lang={lang} sources={progressionSources}/></>;
}
