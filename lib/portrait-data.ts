import snapshot from './portrait-snapshot.ts';
import { kiokus,type Kioku } from './kioku-catalog.ts';
import { kiokuCopy } from './kioku-copy.ts';
import { portraitCopy } from './portrait-copy.ts';
import { databaseCopy } from './database-copy.ts';
import { archiveCopy } from './archive-copy.ts';
import { localeNames,type Lang } from './locales.ts';
import type { TierRank } from './tier-list-model.ts';
export const effectKeys=['atk','def','hp','breakEffect','heal','critDamage','mp','damage','critRate','speed','ailmentHit','skillDamage','specialDamage','ailmentRes','weakness','debuffHit','elementDamage','followUp','dot','damageTaken'] as const;
export type EffectKey=typeof effectKeys[number];
export type PortraitEffect={key:EffectKey;initial:number|null;max:number;unit:'%'|'';element?:Kioku['element'];condition?:'break350'};
type PortraitStat={initial:number|null;max:number|null};
export type Portrait={id:string;assetId:string;name:string|null;japanese:string;rarity:number;image:string;thumbnail:string;width:number;height:number;thumbWidth:number;thumbHeight:number;stats:{hp:PortraitStat;atk:PortraitStat;def:PortraitStat};effects:PortraitEffect[];bonus:null|{type:'role'|'character';target:string;effects:PortraitEffect[]};source:string;revision:string;sourceDate:string|null;obtained:{text:string;links:{label:string;url:string}[]};missing:string[];crosscheck?:string;rarityConflict:null|{wiki:number;game8:number;source:string}};
export const portraits=snapshot.portraits as Portrait[];
export const portraitChecked=snapshot.checked;
export const portraitIndexSources=[{title:'Puella Magi Wiki · Portraits',url:'https://wiki.puella-magi.net/Category:Magia_Exedra_Portraits'},{title:'Game8 · ポートレイト一覧',url:'https://game8.jp/madoka-exedra/675094'},{title:'Game8 · イベントポートレイト',url:'https://game8.jp/madoka-exedra/694682'}];
const oldNames:Record<string,string>={'a-close-friend':'friend','meet-again':'again','apostle-of-salvation':'salvation'};
export const portraitName=(p:Portrait,lang:Lang)=>lang==='ja'?p.japanese:oldNames[p.id]?databaseCopy[lang][oldNames[p.id]]:p.name||p.japanese;
export const effectLabel=(e:PortraitEffect,lang:Lang)=>portraitCopy[lang][e.key]+(e.element?' · '+kiokuCopy[lang][e.element]:'');
export function effectValue(e:PortraitEffect,lang:Lang,maximum=true){const n=maximum?e.max:e.initial;return n===null?'—':'+'+new Intl.NumberFormat(localeNames[lang],{maximumFractionDigits:2}).format(n)+(e.unit?' %':'');}
export const effectRoles:Record<EffectKey,Kioku['role'][]>={atk:['Attacker'],def:['Defender'],hp:['Healer','Defender'],breakEffect:['Attacker','Breaker'],heal:['Healer'],critDamage:['Attacker'],mp:['Buffer','Healer','Debuffer','Breaker'],damage:['Attacker'],critRate:['Attacker'],speed:['Buffer','Healer','Debuffer','Breaker','Defender','Attacker'],ailmentHit:['Debuffer'],skillDamage:['Attacker'],specialDamage:['Attacker'],ailmentRes:['Defender','Healer'],weakness:['Attacker'],debuffHit:['Debuffer'],elementDamage:['Attacker'],followUp:['Attacker'],dot:['Debuffer'],damageTaken:['Defender']};
export function bonusKiokus(p:Portrait){if(!p.bonus)return[];return kiokus.filter(u=>p.bonus!.type==='role'?u.role===p.bonus!.target:u.name===p.bonus!.target||(p.bonus!.target==='Uwasa of the Eternal Sakura'&&u.name==='Eternal Sakura'));}
export const portraitRoles=(p:Portrait)=>[...new Set([...p.effects.flatMap(e=>effectRoles[e.key]),...bonusKiokus(p).map(u=>u.role)])];
export const portraitOrigin=(p:Portrait)=>/Heartphial/.test(p.obtained.text)?'originHeart':/Main Quest|Exedra Quest/.test(p.obtained.text)?'originStory':/Event Quest|Login|login|Anniversary|Birthday|birthday|Campaign|Celebration/.test(p.obtained.text)?'originEvent':'originOther';
export function obtainedText(p:Portrait,lang:Lang){const t=portraitCopy[lang],a=archiveCopy[lang];if(p.assetId==='game8_821921')return t.birthday;return p.obtained.text.replace(/Main Quest \(Nightmare\)/g,t.nightmare).replace(/Main Quest \(Battler\)/g,t.battler).replace(/Main Quest/g,t.mainQuest).replace(/Event Quest/g,t.eventQuest).replace(/\(JP Server Exclusive\)/g,t.jpOnly).replace(/([^\n]+)'s Heartphial/g,(_m,n)=>a.originHeart+' · '+n);}
export type PortraitFilters={query?:string;rarity?:number;effect?:string;element?:string;role?:string;origin?:string;order?:string};
export function filterPortraits(input:Portrait[],f:PortraitFilters={},lang:Lang='en'){
 const q=f.query?.trim().toLocaleLowerCase()||'';
 return input.filter(p=>(!f.rarity||p.rarity===f.rarity)&&(!f.effect||f.effect==='all'||p.effects.some(e=>e.key===f.effect)||p.bonus?.effects.some(e=>e.key===f.effect))&&(!f.element||f.element==='all'||!p.effects.some(e=>e.element)||p.effects.some(e=>e.element===f.element))&&(!f.role||f.role==='all'||portraitRoles(p).includes(f.role as Kioku['role']))&&(!f.origin||f.origin==='all'||portraitOrigin(p)===f.origin)&&(!q||[portraitName(p,lang),p.name,p.japanese,p.bonus?.target,obtainedText(p,lang),...p.effects.map(e=>effectLabel(e,lang))].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>{
 const order=f.order||'nameAsc';if(order==='newest')return(b.sourceDate||'').localeCompare(a.sourceDate||'')||a.id.localeCompare(b.id);
 if(['atkDesc','defDesc','hpDesc'].includes(order)){const key=order.replace('Desc','') as 'atk'|'def'|'hp';return(b.stats[key].max??-1)-(a.stats[key].max??-1)||portraitName(a,lang).localeCompare(portraitName(b,lang),localeNames[lang]);}
 return(order==='nameDesc'?-1:1)*portraitName(a,lang).localeCompare(portraitName(b,lang),localeNames[lang]);});
}
// Editorial rubric: compare effect families, base-stat fit and stated bonus
// recipients. This is not a community vote or proof of combat-tested rosters.
const priority:Record<EffectKey,number>={atk:.9,def:.85,hp:.75,breakEffect:.8,heal:.82,critDamage:.9,mp:.92,damage:.9,critRate:.94,speed:1,ailmentHit:.72,skillDamage:.84,specialDamage:.8,ailmentRes:.5,weakness:.82,debuffHit:.75,elementDamage:.86,followUp:.8,dot:.66,damageTaken:.85};
const reasonKeys:Record<EffectKey,string>={atk:'reasonAttack',def:'reasonDefence',hp:'reasonHeal',breakEffect:'reasonBreak',heal:'reasonHeal',critDamage:'reasonAttack',mp:'reasonMp',damage:'reasonAttack',critRate:'reasonAttack',speed:'reasonSpeed',ailmentHit:'reasonDebuff',skillDamage:'reasonAttack',specialDamage:'reasonAttack',ailmentRes:'reasonResist',weakness:'reasonAttack',debuffHit:'reasonDebuff',elementDamage:'reasonAttack',followUp:'reasonAttack',dot:'reasonDot',damageTaken:'reasonDefence'};
function statFor(k:EffectKey):'atk'|'def'|'hp'|null{return['atk','critDamage','damage','critRate','skillDamage','specialDamage','weakness','elementDamage','followUp','dot'].includes(k)?'atk':['def','damageTaken'].includes(k)?'def':['hp','heal'].includes(k)?'hp':null;}
export function portraitAssessment(p:Portrait,rarity?:number){
 const pool=rarity?portraits.filter(x=>x.rarity===rarity):portraits;
 const main=p.effects.reduce((b,e)=>priority[e.key]>priority[b.key]?e:b,p.effects[0]);
 const maximum=Math.max(...pool.flatMap(x=>x.effects.filter(e=>e.key===main.key&&e.unit===main.unit).map(e=>e.max)),main.max),potency=main.max/maximum,key=statFor(main.key);
 const statMax=key?Math.max(...pool.map(x=>x.stats[key].max||0)):1,statRatio=key?(p.stats[key].max||0)/(statMax||1):.82;
 const conditional=['elementDamage','weakness','skillDamage','specialDamage','followUp','dot','ailmentHit','debuffHit','ailmentRes'].includes(main.key);
 let score=50*potency+22*statRatio+20*priority[main.key]+Math.min(8,(p.effects.length-1)*6)-(conditional?5:0);
 if(p.bonus)score+=p.bonus.type==='role'?7:5;
 if(p.stats.atk.max===null)score=Math.min(score,68);
 const rank:TierRank=score>=89?'S+':score>=79?'S':score>=67?'A':score>=52?'B':'C';
 return{rank,score,focus:reasonKeys[main.key],main:main.key,strongEffect:potency>=.8,lowStat:key!==null&&statRatio<.5,conditional,provisional:p.stats.atk.max===null||Boolean(p.rarityConflict)};
}
export const portraitRanking=(rarity?:number)=>portraits.filter(p=>!rarity||p.rarity===rarity).map(p=>({portrait:p,...portraitAssessment(p,rarity)})).sort((a,b)=>b.score-a.score||a.portrait.id.localeCompare(b.portrait.id));
