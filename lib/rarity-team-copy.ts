import { languages,type Lang } from './locales.ts';
import { rarityTeams } from './rarity-team-data.ts';
import { kiokus,kiokuName } from './kioku-catalog.ts';
import { kiokuCopy } from './kioku-copy.ts';
import { tierResearchCopy } from './tier-research-copy.ts';
import { rarityStrategyCopy } from './rarity-strategy-copy.ts';
const labels:Record<string,string>={'sr-void-duel':'Masara / Ashley','sr-forest-break':'Nanaka / Mito','sr-aqua-break':'Asuka / Seika','sr-flame-control':'Karin / Ayame','sr-balanced-waves':'Kush / Ashley','sr-stagecraft':'Stagecraft Witch','sr-birdcage':'Birdcage Witch','sr-mermaid-burst':'Mermaid Witch','sr-horse-status':'Horse Witch','r-flame-break':'Rika / Karin','r-aqua-boss':'Asuka / Seika','r-forest-support':'Nanaka / Kako','r-dark-waves':'Ashley / Hanna','r-light-waves':'Masara / Riko','r-light-survival':'Madoka Senpai / Kokoro'};
export const rarityTeamCopy=Object.fromEntries(languages.map(lang=>[lang,Object.fromEntries(rarityTeams.flatMap(team=>[
 [team.nameKey,kiokuCopy[lang][team.element]+' · '+(team.id.startsWith('r-')?'★★★':'★★★★')+' · '+labels[team.id]],
 [team.textKey,team.members.map(id=>kiokuName(kiokus.find(u=>u.id===id)!,lang)).join(' / ')+'. '+tierResearchCopy[lang][team.use]+'. '+rarityStrategyCopy[lang][team.strategy]],
]))])) as Record<Lang,Record<string,string>>;
