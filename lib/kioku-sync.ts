import { kiokus as seed, elements, roles, type Kioku, type KiokuSkill } from './kioku-catalog';
import { getRawDb } from '@/db';
import { allowedNewsSource } from './editorial-validation';
import { z } from 'zod';
import { readKiokus } from './kioku-store';

export const catalogSource = 'https://wiki.puella-magi.net/Category:Magia_Exedra_Kioku_by_ID';
const api = 'https://wiki.puella-magi.net/w/api.php';
type WikiPage = { title: string; revisions?: { revid: number; slots: { main: { content: string } } }[]; images?: { title: string }[]; imageinfo?: { url: string }[] };
export const releaseObservations = z.object({releases:z.array(z.object({id:z.string().regex(/^\d{8}$/),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&v<=new Date().toISOString().slice(0,10)),source:z.string().url().refine(allowedNewsSource)}).strict()).max(20).optional()}).strict();

async function wikiRequest(params: Record<string,string>) {
  const url = new URL(api);
  url.search = new URLSearchParams({...params,format:'json',formatversion:'2'}).toString();
  const response = await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(18000),headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('CATALOG_SOURCE_HTTP_'+response.status);
  const body=await response.text();
  if(body.length>6_000_000)throw Error('CATALOG_SOURCE_TOO_LARGE');
  const data=JSON.parse(body) as {error?:unknown;query?:{pages:WikiPage[]};continue?:Record<string,string>};
  if(data.error||!Array.isArray(data.query?.pages))throw Error('CATALOG_SOURCE_FORMAT_CHANGED');
  return data;
}
function parameters(raw:string) {
  const p:Record<string,string>={};
  for(const match of raw.matchAll(/^\|([a-z][a-z0-9_]*)\s*=\s*([^]*?)(?=\n\|[a-z][a-z0-9_]*\s*=|\n\}\}|$)/gm)) {
    if(match[1] in p)throw Error('CATALOG_DUPLICATE_FIELD');
    p[match[1]]=match[2].trim();
  }
  return p;
}
const clean=(value:string|undefined,max=160)=>{
  if(!value||value.length>max||/[<>\[\]{}\n]/.test(value))throw Error('CATALOG_INCOMPLETE_FIELD');
  return value;
};
const number=(value:string|undefined)=>{
  if(!value||!/^\d+(?:\.\d+)?$/.test(value))throw Error('CATALOG_INCOMPLETE_STATS');
  const n=Number(value);if(!Number.isFinite(n)||n<0||n>1_000_000)throw Error('CATALOG_INVALID_STATS');return n;
};
export function parseWikiKioku(page:WikiPage,previous?:Kioku):Kioku {
  if(!/^Magia Exedra Kioku - .{1,150}$/.test(page.title)||!page.revisions?.[0])throw Error('CATALOG_INVALID_PAGE');
  const revision=page.revisions[0],raw=revision.slots.main.content;
  if(!Number.isSafeInteger(revision.revid)||revision.revid<=0)throw Error('CATALOG_INVALID_REVISION');
  if(raw.length>100_000||!raw.includes('{{Magia Exedra Stats'))throw Error('CATALOG_SOURCE_FORMAT_CHANGED');
  const p=parameters(raw);
  if(!/^\d{8}$/.test(p.id??''))throw Error('CATALOG_INVALID_ID');
  const rarity=Number(p.rarity);
  if(![3,4,5].includes(rarity)||!roles.includes(p.role as Kioku['role'])||!elements.includes(p.element as Kioku['element']))throw Error('CATALOG_INVALID_CLASSIFICATION');
  if(previous&&previous.id!==p.id)throw Error('CATALOG_ID_CONFLICT');
  const name=clean(p.character_name_en),kioku=clean(p.kioku_name_en);
  const skills:KiokuSkill[]=[];
  for(const [kind,prefix] of [['special','special'],['battle','battle_skill'],['basic','basic'],['ability','ability'],['support','support_ability']] as const) {
    const effect=p[prefix+'_effect'];if(!effect)continue;
    const damage:KiokuSkill['damage']=[];
    for(const m of effect.matchAll(/(?:Deals|deal) \[(\d+)\]%[^.]{0,100}?DMG to (?:a |an )?(single|all|random)?\s*(?:enem|target)/gi)) {
      const low=p[`${prefix}_lvl_1_${m[1]}`],high=p[`${prefix}_lvl_10_${m[1]}`];
      if(low&&high){const l=number(low),h=number(high);if(h>=l)damage.push({low:l,high:h,target:m[2]==='random'?'random':m[2]==='all'?'all':'single'});}
    }
    const featurePatterns:Record<string,RegExp>={break:/break (?:gauge|bonus)/i,speed:/increases?[^.]{0,90}SPD/i,attackBuff:/increases?[^.]{0,90}ATK/i,mp:/grants?[^.]{0,30}MP|MP recovery/i,heal:/restores?[^.]{0,90}HP/i,shield:/barrier/i,bp:/grants?[^.]{0,30}BP/i,defenseDown:/decreases?[^.]{0,90}DEF/i,followUp:/follow.?up/i,field:/field/i,cleanse:/removes?[^.]{0,50}debuff/i};
    skills.push({kind,name:kind==='special'?kioku:(p[prefix+'_name_en']??''),japanese:kind==='special'?clean(p.kioku_name_jp):(p[prefix+'_name_jp']??''),cost:kind==='special'&&p.special_mp?number(p.special_mp):null,bpCost:kind==='special'&&p.special_bp?number(p.special_bp):null,damage,features:Object.entries(featurePatterns).filter(([,re])=>re.test(effect)).map(([feature])=>feature)});
  }
  if(!skills.some(s=>s.kind==='basic')||!skills.some(s=>s.kind==='battle')||(rarity!==3&&!skills.some(s=>s.kind==='special')))throw Error('CATALOG_INCOMPLETE_SKILLS');
  const stats={base:{hp:number(p.hp1),atk:number(p.atk1),def:number(p.def1)},max:{hp:number(p.hp_max),atk:number(p.atk_max),def:number(p.def_max)}};
  if(Object.values(stats.base).some(n=>n===0)||(['hp','atk','def'] as const).some(k=>stats.max[k]<stats.base[k]))throw Error('CATALOG_INVALID_STATS');
  const source=new URL('https://wiki.puella-magi.net/w/index.php');source.search=new URLSearchParams({title:page.title,oldid:String(revision.revid)}).toString();
  return {id:p.id,name,japanese:clean(p.character_name_jp),kioku,kiokuJapanese:clean(p.kioku_name_jp),family:previous?.family??name.replace(/\s*\([^)]*\)\s*$/,''),rarity:rarity as Kioku['rarity'],role:p.role as Kioku['role'],element:p.element as Kioku['element'],series:previous?.series??seed.find(u=>u.family===name)?.series??'Magia Exedra',color:/^[0-9a-f]{6}$/i.test(p.color??'')?'#'+p.color:(previous?.color??'#bca476'),image:previous?.image??'',speed:number(p.spd),stats,releaseDate:previous?.releaseDate??null,releaseSource:previous?.releaseSource??null,skills,source:source.href};
}
async function cardImage(page:WikiPage,id:string) {
  const listed=await wikiRequest({action:'query',titles:page.title,prop:'images',imlimit:'max'});
  const file=listed.query!.pages[0]?.images?.find(i=>new RegExp('^File:'+id+'[ _](?:original|card)\\.(png|webp|jpg)$','i').test(i.title));
  if(!file)throw Error('CATALOG_CARD_IMAGE_UNAVAILABLE');
  const info=await wikiRequest({action:'query',titles:file.title,prop:'imageinfo',iiprop:'url'});
  const image=info.query!.pages[0]?.imageinfo?.[0]?.url;
  if(!image)throw Error('CATALOG_CARD_IMAGE_UNAVAILABLE');
  const url=new URL(image);if(url.protocol!=='https:'||url.hostname!=='images.puella-magi.net'||url.username||url.password||url.port)throw Error('CATALOG_INVALID_IMAGE');
  return image;
}
export async function refreshKiokuCatalog(args:unknown={}) {
  const input=releaseObservations.parse(args),db=getRawDb();
  const previous=await readKiokus(db),byId=new Map(previous.map(u=>[u.id,u]));
  const pages:WikiPage[]=[];let continuation:Record<string,string>={};
  for(let i=0;i<12;i++) {
    const data=await wikiRequest({action:'query',generator:'categorymembers',gcmtitle:'Category:Magia_Exedra_Kioku_by_ID',gcmnamespace:'0',gcmlimit:'50',prop:'revisions',rvprop:'content|ids',rvslots:'main',...continuation});
    pages.push(...data.query!.pages);if(!data.continue)break;
    if(i===11)throw Error('CATALOG_PAGINATION_INCOMPLETE');continuation=data.continue;
  }
  if(pages.length<seed.length||pages.length>1000)throw Error('CATALOG_SOURCE_INCOMPLETE_LAST_VALUE_PRESERVED');
  const updates:Kioku[]=[],failures:string[]=[];const seen=new Set<string>();
  for(const page of pages) {
    try {
      const id=parameters(page.revisions?.[0]?.slots.main.content??'').id;
      if(!id||seen.has(id))throw Error('CATALOG_DUPLICATE_OR_MISSING_ID');seen.add(id);
      const old=byId.get(id);
      if(old&&Number(new URL(old.source).searchParams.get('oldid'))>Number(page.revisions?.[0]?.revid))throw Error('CATALOG_STALE_REVISION_PRESERVED');
      if(old&&new URL(old.source).searchParams.get('oldid')===String(page.revisions?.[0]?.revid)&&!input.releases?.some(r=>r.id===id))continue;
      const unit=parseWikiKioku(page,old);
      if(!unit.image)unit.image=await cardImage(page,id);
      const release=input.releases?.find(r=>r.id===id);
      if(release) {
        const response=await fetch(release.source,{redirect:'manual',signal:AbortSignal.timeout(18000)});
        if(!response.ok)throw Error('CATALOG_RELEASE_SOURCE_UNAVAILABLE');const html=await response.text();
        const [y,m,d]=release.date.split('-').map(Number);
        if(!html.includes(unit.japanese)||!new RegExp(`${y}(?:年|[./-])\\s*0?${m}(?:月|[./-])\\s*0?${d}(?:日|[ T<])`).test(html))throw Error('CATALOG_RELEASE_NOT_VERIFIED');
        unit.releaseDate=release.date;unit.releaseSource=release.source;
      }
      updates.push(unit);
    } catch(e){failures.push(page.title+': '+(e instanceof Error?e.message:'CATALOG_ENTRY_FAILED'));}
  }
  // Missing pages never delete a character or its saved collection references.
  const now=new Date().toISOString();
  for(let i=0;i<updates.length;i+=40)await db.batch(updates.slice(i,i+40).map(unit=>db.prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at WHERE excluded.updated_at>=public_updates.updated_at').bind('kioku:'+unit.id,JSON.stringify(unit),now)));
  const result={checkedAt:now,source:catalogSource,sourceCount:pages.length,count:previous.length+updates.filter(u=>!byId.has(u.id)).length,added:updates.filter(u=>!byId.has(u.id)).map(u=>u.id),updated:updates.filter(u=>byId.has(u.id)).map(u=>u.id),failures};
  await db.prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at').bind('catalog_check',JSON.stringify(result),now).run();
  return result;
}
