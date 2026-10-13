import { kiokus } from './kioku-catalog.ts';
import { portraits } from './portrait-data.ts';
import { databaseItems } from './database-data.ts';
export type GrowthGoal = { kiokuId:string; currentLevel:number; targetLevel:number; currentMagic:number; targetMagic:number; currentAscension:number; targetAscension:number; currentSpecial:number; targetSpecial:number; crystals:number; portraitId:string; notes:string };
export type GrowthPlan = {revision:number;entries:GrowthGoal[];inventory:Record<string,number>;updatedAt:number|null};
export const emptyPlan:GrowthPlan={revision:-1,entries:[],inventory:{},updatedAt:null};
export const isId=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(v);
export function object(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('INVALID_REQUEST');return v as Record<string,unknown>;}
export function bounded(v:unknown,min:number,max:number):number{if(typeof v!=='number'||!Number.isInteger(v)||v<min||v>max)throw Error('INVALID_REQUEST');return v;}
export function clean(v:unknown,min:number,max:number):string{if(typeof v!=='string'||v.trim().length<min||v.length>max)throw Error('INVALID_REQUEST');return v.trim();}
export function goal(v:unknown,units:readonly typeof kiokus[number][]=kiokus):GrowthGoal{
  const a=object(v),unit=units.find(u=>u.id===a.kiokuId);if(!unit)throw Error('INVALID_REQUEST');
  const result={kiokuId:unit.id,currentLevel:bounded(a.currentLevel,1,141),targetLevel:bounded(a.targetLevel,1,141),currentMagic:bounded(a.currentMagic,0,130),targetMagic:bounded(a.targetMagic,0,130),currentAscension:bounded(a.currentAscension,0,5),targetAscension:bounded(a.targetAscension,0,5),currentSpecial:bounded(a.currentSpecial,unit.rarity===3?0:1,unit.rarity===3?0:10),targetSpecial:bounded(a.targetSpecial,unit.rarity===3?0:1,unit.rarity===3?0:10),crystals:bounded(a.crystals,0,5),portraitId:clean(a.portraitId,0,80),notes:clean(a.notes,0,2000)};
  const specialCap=(a:number)=>unit.rarity===3?0:a===5?10:a>=3?7:4; const magicCap=(n:number)=>n>=110?130:n>=90?120:n>=60?90:n>=30?60:30;
  if(result.currentSpecial>specialCap(result.currentAscension)||result.targetSpecial>specialCap(result.targetAscension)||result.currentMagic>magicCap(result.currentLevel)||result.targetMagic>magicCap(result.targetLevel)||result.targetSpecial<result.currentSpecial||result.crystals>result.targetAscension-result.currentAscension||result.targetLevel<result.currentLevel||result.targetMagic<result.currentMagic||result.targetAscension<result.currentAscension||(result.portraitId&&!portraits.some(p=>p.id===result.portraitId)))throw Error('INVALID_REQUEST');return result;
}
export function plan(v:unknown,units:readonly typeof kiokus[number][]=kiokus):Omit<GrowthPlan,'updatedAt'>{
  const a=object(v),revision=bounded(a.revision,-1,1000000);if(!Array.isArray(a.entries)||a.entries.length>units.length)throw Error('INVALID_REQUEST');
  const entries=a.entries.map(entry=>goal(entry,units));if(new Set(entries.map(e=>e.kiokuId)).size!==entries.length)throw Error('INVALID_REQUEST');
  const inventory:Record<string,number>={};for(const [id,count]of Object.entries(object(a.inventory))){if(!databaseItems.some(i=>i.id===id&&i.kind!=='portraits'))throw Error('INVALID_REQUEST');inventory[id]=bounded(count,0,1000000000);}return{revision,entries,inventory};
}
export function newGoal(kiokuId:string,units:readonly typeof kiokus[number][]=kiokus):GrowthGoal{return{kiokuId,currentLevel:1,targetLevel:100,currentMagic:0,targetMagic:120,currentAscension:0,targetAscension:0,currentSpecial:units.find(u=>u.id===kiokuId)?.rarity===3?0:1,targetSpecial:units.find(u=>u.id===kiokuId)?.rarity===3?0:4,crystals:0,portraitId:'',notes:''};}
export type ShowcaseDraft={id:string;revision:number;kiokuId:string;title:string;level:number;magic:number;ascension:number;portraitId:string;hp:number;atk:number;def:number;speed:number;notes:string};
export type ShowcaseCard=ShowcaseDraft&{nickname:string;votes:number;mine:boolean;voted:boolean;updatedAt:number};
export function showcase(v:unknown,units:readonly typeof kiokus[number][]=kiokus):ShowcaseDraft{
  const a=object(v);if(!isId(a.id)||!units.some(u=>u.id===a.kiokuId)||a.publish!==true)throw Error('INVALID_REQUEST');
  const portraitId=clean(a.portraitId,0,80);if(portraitId&&!portraits.some(p=>p.id===portraitId))throw Error('INVALID_REQUEST');
  return{id:a.id,revision:bounded(a.revision,-1,1000000),kiokuId:String(a.kiokuId),title:clean(a.title,2,100),level:bounded(a.level,1,200),magic:bounded(a.magic,1,130),ascension:bounded(a.ascension,0,5),portraitId,hp:bounded(a.hp,0,1000000),atk:bounded(a.atk,0,1000000),def:bounded(a.def,0,1000000),speed:bounded(a.speed,0,10000),notes:clean(a.notes,0,2000)};
}
export type SupportEntry={id:string;kind:'bug'|'contact';title:string;body?:string;page?:string;language?:string;public?:boolean;status:'new'|'review'|'resolved'|'discarded';reply?:string;createdAt:number;updatedAt:number};
