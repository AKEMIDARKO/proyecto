import { kiokus } from './kioku-catalog.ts';
import { tierAssessments } from './tier-assessments.ts';
import type { TierRank } from './tier-list-model.ts';
// Utility comparisons inside each rarity, separate from the overall ranking.
const reviews=`
10170101 A
10180101 B
10610101 B
10690101 A
10700101 B
10710101 S
10720101 S
10740101 A
10760101 A
10820101 S+
10830101 S
10840101 B
10860101 S
10900101 B
11070101 S
11140101 A
11260101 S+
10170102 B
10180102 A
10580101 A
10610102 A
10670101 C
10680101 B
10690102 C
10700102 B
10710102 B
10720102 S
10740102 B
10760102 S
10810101 A
10820102 S+
10830102 B
10840102 B
10860102 A
10900102 C
11070102 B
11140102 C
11260102 S+
11520101 C
`;
export const rarityRatings=Object.fromEntries(reviews.trim().split('\n').map(line=>line.split(' '))) as Record<string,TierRank>;
export const characterRanking=(rarity?:number)=>tierAssessments.filter(a=>!rarity||kiokus.find(u=>u.id===a.id)!.rarity===rarity).map(assessment=>({unit:kiokus.find(u=>u.id===assessment.id)!,assessment,rank:rarity&&rarity<5?rarityRatings[assessment.id]:assessment.rank}));
