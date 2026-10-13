import data from './progression-costs.json' with {type:'json'};
import { kiokus,type Kioku } from './kioku-catalog.ts';
import { goal,type GrowthGoal } from './tool-model.ts';
export const progressionSources=data.sources.map(url=>({title:new URL(url).hostname,url}));
export function specialCap(unit:Kioku,ascension:number){return unit.rarity===3?0:ascension===5?10:ascension>=3?7:4;}
export function magicCap(level:number){return level>=110?130:level>=90?120:level>=60?90:level>=30?60:30;}
export type CostResult={materials:Record<string,number>;copies:number;partialAq:boolean};
export function growthCosts(input:GrowthGoal,units:readonly Kioku[]=kiokus):CostResult{
  const entry=goal(input,units),unit=units.find(u=>u.id===entry.kiokuId)!;
  const materials:Record<string,number>={},add=(id:string,n:number)=>{if(n>0)materials[id]=(materials[id]||0)+n;};
  add('enhance-glow',data.experienceCumulative[entry.targetLevel-1]-data.experienceCumulative[entry.currentLevel-1]);
  for(let level=entry.currentMagic+1;level<=entry.targetMagic;level++){
    data.magicPerLevel[level].forEach((n,i)=>add(data.magicColumns[i].replace('element',unit.element.toLowerCase()),n));
    if(level<=120)add('aq-chip',data.aqMagicPerLevel[level]);
  }
  if(unit.rarity!==3){const costs=data.specialPerLevel[String(unit.rarity) as '4'|'5'];for(let level=entry.currentSpecial+1;level<=entry.targetSpecial;level++)costs[level-1].forEach((n,i)=>add(['magia-book-small','magia-book-medium','magia-book'][i],n));}
  add('kioku-crystal',entry.crystals);
  return{materials,copies:entry.targetAscension-entry.currentAscension-entry.crystals,partialAq:entry.targetMagic>120&&entry.targetMagic>entry.currentMagic};
}
export function combinedCosts(entries:GrowthGoal[],inventory:Record<string,number>,units:readonly Kioku[]=kiokus){
  const materials:Record<string,number>={},copies:Record<string,number>={};let partialAq=false;
  for(const entry of entries){const cost=growthCosts(entry,units);for(const [id,n]of Object.entries(cost.materials))materials[id]=(materials[id]||0)+n;if(cost.copies)copies[entry.kiokuId]=cost.copies;partialAq||=cost.partialAq;}
  return{materials,copies,partialAq,missing:Object.fromEntries(Object.entries(materials).map(([id,n])=>[id,Math.max(0,n-(inventory[id]||0))]))};
}
