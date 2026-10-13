import { communityResearch, type ResearchKey } from './tier-assessments.ts';
import type { TeamBuild } from './tier-data.ts';
import type { TierRank } from './tier-list-model.ts';
import type { Kioku } from './kioku-catalog.ts';
const squad=(id:string,rank:TierRank,element:Kioku['element'],members:string[],strategy:string,limit:string,sources:ResearchKey[],alternatives:TeamBuild['alternatives']=[],use:TeamBuild['use']='starter'):TeamBuild=>({id,nameKey:id+'Team',textKey:id+'Text',rank:id.startsWith('r-')?'C':'B',cohortRank:rank,element,members,strategy,limit,sources,alternatives,use,scope:'starter',portraits:id.startsWith('r-')?'rPortraits':'budgetPortraits',source:communityResearch[sources[0]].url});
// Pure-rarity examples. Three-star teams are editorial constructions. The
// published four-star challenge clears retain their original dates and limits.
export const rarityTeams:TeamBuild[]=[
 squad('sr-void-duel','S','Void',['10840101','11070101','10820101','10830101','11260101'],'srAttackRotation','srLimit',['fourStarClears','jpBudget'],[{for:'10830101',choices:['10860101','10900101']}]),
 squad('sr-forest-break','S','Forest',['10610101','10710101','10820101','10860101','11260101'],'srAttackRotation','srLimit',['fourStarClears','jpBudget'],[{for:'10860101',choices:['10830101','10900101']}]),
 squad('sr-aqua-break','A','Aqua',['10180101','10700101','10820101','10860101','11260101'],'srAttackRotation','srLimit',['fourStarClears','jpBudget'],[{for:'11260101',choices:['10690101']},{for:'10860101',choices:['10830101','10900101']}]),
 squad('sr-flame-control','B','Flame',['10170101','10860101','10830101','10760101','10690101'],'srFlameRotation','srNoAttacker',['jpBudget','fourStarClears'],[{for:'10760101',choices:['10820101']}]),
 squad('sr-balanced-waves','S+','Dark',['11140101','10860101','10720101','11070101','11260101'],'srBalancedRotation','srBossMechanics',['fourStarClears'],[{for:'11140101',choices:['10830101','10760101']}],'waves'),
 squad('sr-stagecraft','S','Dark',['10690101','10830101','11140101','10820101','10900101'],'srStageRotation','oldChallenge',['jpStage','jpDispel'],[{for:'10690101',choices:['11260101']}],'boss'),
 squad('sr-birdcage','A','Dark',['11140101','10720101','10690101','10740101','11260101'],'srBirdRotation','oldChallenge',['jpBirdcage'],[{for:'10690101',choices:['10820101']}],'boss'),
 squad('sr-mermaid-burst','A','Flame',['10170101','10710101','10820101','10830101','10760101'],'srMermaidRotation','srNoSustain',['jpMermaid'],[{for:'10710101',choices:['10690101']}],'boss'),
 squad('sr-horse-status','B','Dark',['10170101','11140101','10820101','10900101','10740101'],'srHorseRotation','srNoSustain',['jpBirdcage'],[{for:'10900101',choices:['11260101']}],'boss'),
 squad('r-flame-break','S','Flame',['10860102','10170102','10760102','10820102','11260102'],'rAttackRotation','rLimit',['jpDispel','beginner'],[{for:'10170102',choices:['10690102']},{for:'10760102',choices:['10830102']}]),
 squad('r-aqua-boss','S+','Aqua',['10180102','10700102','10580101','10820102','10810101'],'rAttackRotation','rLimit',['jpDispel','beginner'],[{for:'10700102',choices:['10680101']},{for:'10810101',choices:['11260102']}]),
 squad('r-forest-support','B','Forest',['10670101','10610102','10710102','10760102','11260102'],'rForestRotation','rNoBreaker',['beginner','budget'],[{for:'10760102',choices:['10580101']}]),
 squad('r-dark-waves','A','Dark',['11070102','10740102','10760102','10820102','11260102'],'rAttackRotation','rLimit',['jpDispel','beginner'],[{for:'11070102',choices:['11140102']}],'waves'),
 squad('r-light-waves','A','Light',['10840102','10900102','10760102','10820102','11260102'],'rAttackRotation','rLimit',['jpDispel','beginner'],[{for:'10840102',choices:['11520101']}],'waves'),
 squad('r-light-survival','C','Light',['11520101','10720102','10820102','10810101','11260102'],'rSurvivalRotation','rSlow',['jpDispel','beginner'],[{for:'10810101',choices:['10900102']},{for:'11520101',choices:['10840102']}]),
];
