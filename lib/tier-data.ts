import { rarityTeams } from './rarity-team-data.ts';
import { kiokus, type Kioku } from './kioku-catalog.ts';
import type { TierRank } from './tier-list-model.ts';
import { tierAssessments, communityResearch, type ResearchKey } from './tier-assessments.ts';
export const tierReviewed = '2026-10-09';
export const tierSources = [
  ...Object.values(communityResearch).sort((a,b)=>b.date.localeCompare(a.date)).map(item=>({title:item.title+' · '+item.date,url:item.url})),
  {title:'Puella Magi Wiki · Datos de habilidades; no es una tier list',url:'https://wiki.puella-magi.net/Category:Magia_Exedra_Kioku_by_ID'},
];
export const tierRatings=tierAssessments.map(assessment=>{
  const unit=kiokus.find(unit=>unit.id===assessment.id);
  if(!unit)throw new Error('Tier entry missing from catalog: '+assessment.id);
  return {unit,rank:assessment.rank,assessment};
});
export const ratingFor=(id:string)=>tierAssessments.find(item=>item.id===id)?.rank;
export const teamUses=['boss','waves','pvp','starter'] as const;
export type TeamUse=typeof teamUses[number];
export type TeamBuild={id:string;nameKey:string;textKey:string;rank:TierRank;cohortRank?:TierRank;element:Kioku['element'];members:string[];source:string;scope:'current'|'starter';use:TeamUse;strategy:string;portraits:string;limit:string;sources:ResearchKey[];alternatives:{for:string;choices:string[]}[]};
const team=(id:string,key:string,rank:TierRank,element:Kioku['element'],use:TeamUse,members:string[],strategy:string,portraits:string,limit:string,sources:ResearchKey[],alternatives:TeamBuild['alternatives']):TeamBuild=>({id,nameKey:key+'Team',textKey:key+'TeamText',rank,element,use,members,strategy,portraits,limit,sources,alternatives,scope:use==='starter'?'starter':'current',source:communityResearch[sources[0]].url});
// Editorial compositions informed by the discussions below. They are not tested
// clear guarantees. Their roles, variants, ascensions and purpose remain explicit.
export const teamBuilds:TeamBuild[]=[
  ...rarityTeams,
  team('dark-fatebloom','dark','S+','Dark','boss',['11460101','11380101','10220101','10020701','11250101'],'darkRotation','critPortraits','darkAllies',['teams','beginner','portraits'],[{for:'11460101',choices:['10130101','10250101']},{for:'11250101',choices:['10080501']}]),
  team('flame-critical','flame','S+','Flame','boss',['10020801','10050401','10050201','10050301','10860201'],'flameBpRotation','flamePortraits','asc4',['rising','cinema','summer'],[{for:'10050401',choices:['10190101','10170101']},{for:'10860201',choices:['10620101']}]),
  team('aqua-orchestration','aqua','S','Aqua','boss',['10090301','10080401','11540101','10040301','10040701'],'aquaRotation','aquaPortraits','newUnit',['judgment','beginner'],[{for:'11540101',choices:['10020101','10070101']},{for:'10040701',choices:['10010601']}]),
  team('light-magica','light','S','Light','boss',['10010701','11370101','10010301','10010801','10060101'],'lightRotation','lightPortraits','monoLight',['light','teams','accuracy'],[{for:'10010701',choices:['10030501']},{for:'10010301',choices:['10070101']}]),
  team('void-critical','void','A','Void','boss',['10210101','10230101','11070201','10020101','10240101'],'voidRotation','tempoPortraits','setupTurns',['crisis','beginner'],[{for:'10230101',choices:['10020301']},{for:'10240101',choices:['10620101']}]),
  team('forest-starter','starter','C','Forest','starter',['10010101','10710101','10610101','10900101','11260101'],'budgetRotation','budgetPortraits','mixedStarter',['beginner','budget'],[{for:'10010101',choices:['10820101','10860101']},{for:'11260101',choices:['11260102','10160101']}]),
  team('dark-critical-mifuyu','darkBoss','S+','Dark','boss',['11380101','10130101','10220101','10020701','11250101'],'darkRotation','critPortraits','singleOnly',['teams','portraits','beginner'],[{for:'10020701',choices:['11040101','11160101']},{for:'11250101',choices:['10080501']}]),
  team('light-doppel-tempo','lightDoppel','S+','Light','boss',['11370101','10030501','10070101','10020101','10040101'],'lightRotation','tempoPortraits','speedTuning',['teams','accuracy'],[{for:'10030501',choices:['10010701']},{for:'10040101',choices:['10060101']}]),
  team('forest-sumire','forestSumire','S','Forest','boss',['11450101','11490101','10030101','10200101','10160101'],'forestRotation','forestPortraits','ascensions',['diversity','crisis'],[{for:'11490101',choices:['10920101','10710101']},{for:'11450101',choices:['10030301']}]),
  team('forest-fiore','forestFiore','A','Forest','boss',['10030301','10920101','10030101','10200101','10160101'],'forestRotation','forestPortraits','ascensions',['diversity','summer'],[{for:'10920101',choices:['11490101']},{for:'10160101',choices:['10030401']}]),
  team('dark-status','darkStatus','A','Dark','boss',['11390101','10250101','10220101','10800101','10080501'],'statusRotation','tempoPortraits','immunity',['accuracy','counters','darkFlex'],[{for:'10800101',choices:['10120101','11040101']},{for:'10250101',choices:['11460101','10130101']}]),
  team('flame-shinobu','flameShinobu','S','Flame','boss',['11510101','10050401','10050201','10050301','10620101'],'flameRotation','flamePortraits','asc4',['crisis','summer'],[{for:'10050401',choices:['10190101']},{for:'10620101',choices:['10860201']}]),
  team('aqua-recovery','aquaRecovery','A','Aqua','boss',['10080401','10090301','11540101','10040201','10010601'],'aquaRotation','aquaPortraits','newUnit',['judgment','beginner'],[{for:'11540101',choices:['10040301','10070101']},{for:'10040201',choices:['11170101']}]),
  team('void-debuff-tempo','voidRen','S','Void','boss',['10020301','10210101','10800101','10020101','10240101'],'voidRotation','tempoPortraits','immunity',['accuracy','crisis'],[{for:'10020301',choices:['10230101']},{for:'10210101',choices:['10070201']}]),
  team('light-darc','lightDarc','A','Light','boss',['11440101','10010701','10070101','10260101','10060101'],'lightRotation','lightPortraits','resources',['light','beginner'],[{for:'10260101',choices:['10010801']},{for:'10060101',choices:['10040101']}]),
  team('flame-permanent','flameBudget','B','Flame','starter',['10050101','10170101','10100101','10830101','10620101'],'budgetRotation','budgetPortraits','singleOnly',['budget','beginner'],[{for:'10170101',choices:['10050401','10190101']},{for:'10620101',choices:['10690101']}]),
  team('aqua-permanent','aquaBudget','B','Aqua','starter',['10090101','10700101','10820101','10830101','10810101'],'budgetRotation','budgetPortraits','noCleanse',['budget','beginner'],[{for:'10700101',choices:['10150101','10090301']},{for:'10810101',choices:['10010601']}]),
  team('forest-low-rarity','forestBudget','B','Forest','starter',['10610101','10710101','10610102','10760102','11260102'],'budgetRotation','budgetPortraits','limitedKit',['budget','beginner'],[{for:'10710101',choices:['10920101']},{for:'10610102',choices:['10030101']}]),
  team('light-crystalis-farm','lightFarm','S','Light','waves',['11240101','10010701','10070101','10020101','10160101'],'farmRotation','farmPortraits','farmSlots',['farming','accuracy'],[{for:'10020101',choices:['10820101','10900101']},{for:'10160101',choices:['11260102']}]),
  team('aqua-sakura-farm','sakuraFarm','A','Aqua','waves',['10980101','10090301','10070101','10020101','10010601'],'farmRotation','farmPortraits','farmSlots',['farming'],[{for:'10090301',choices:['10010701']},{for:'10010601',choices:['10700101']}]),
  team('flame-rising-waves','flameWaves','A','Flame','waves',['10020801','10050401','10050201','10070101','10860201'],'flameBpRotation','farmPortraits','asc4',['rising','cinema'],[{for:'10020801',choices:['10140101']},{for:'10050401',choices:['10190101']}]),
  team('pvp-break-rush','pvpRush','S','Light','pvp',['10010701','11460101','10070101','10020101','10030101'],'pvpRushRotation','pvpPortraits','pvpInvestment',['pvp','beginner','synergy'],[{for:'11460101',choices:['10210101','10070201']},{for:'10030101',choices:['10210101']}]),
  team('pvp-rena-hazuki','pvpRena','A','Aqua','pvp',['10150101','10820101','10010701','10020101','11250101'],'pvpCounterRotation','pvpPortraits','asc5',['rena','pvp'],[{for:'11250101',choices:['10070101']},{for:'10010701',choices:['10210101']}]),
  team('pvp-defensive-wall','pvpWall','S','Dark','pvp',['11250101','10040101','11150101','10160101','10820101'],'pvpWallRotation','wallPortraits','tankAscensions',['pvp'],[{for:'11150101',choices:['10030601','10110101']},{for:'10160101',choices:['10040701','10030401']}]),
  team('dark-permanent','darkPermanent','B','Dark','boss',['10020201','10130101','10220101','11040101','11250101'],'darkRotation','critPortraits','competition',['darkFlex','portraits'],[{for:'10020201',choices:['11380101','11140201']},{for:'11250101',choices:['10080501']}]),
  team('light-first-steps','lightBasic','C','Light','starter',['11520101','10010101','10900101','10820102','11260102'],'budgetRotation','budgetPortraits','limitedKit',['budget','beginner'],[{for:'11520101',choices:['11240101','11370101']},{for:'10010101',choices:['10010701']}]),
];
export const teamMembers=(team:TeamBuild)=>team.members.map(id=>kiokus.find(unit=>unit.id===id)!);
export const teamSources=(team:TeamBuild)=>team.sources.map(key=>({title:communityResearch[key].title+' · '+communityResearch[key].date,url:communityResearch[key].url}));

export const teamRarity=(team:TeamBuild)=>{const values=new Set(teamMembers(team).map(u=>u.rarity));return values.size===1?[...values][0]:null;};
export const teamRanking=(rarity?:number)=>teamBuilds.filter(team=>!rarity||teamRarity(team)===rarity).map(team=>({team,rank:rarity&&rarity<5?team.cohortRank||team.rank:team.rank}));
