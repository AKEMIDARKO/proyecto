import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { growthCosts, combinedCosts } from '../lib/progression.ts';
import { kiokus } from '../lib/kioku-catalog.ts';
import { newGoal, goal, plan } from '../lib/tool-model.ts';
import { gameItems, itemName, itemPurpose, itemsCopy, itemCategories } from '../lib/items-copy.ts';
import { steamAchievements, achievementDescription } from '../lib/achievement-data.ts';
import { languages } from '../lib/locales.ts';
import { faqData } from '../lib/faq-data.ts';
const five=kiokus.find(u=>u.rarity===5&&u.element==='Flame'),four=kiokus.find(u=>u.rarity===4),three=kiokus.find(u=>u.rarity===3);
const blank=(unit=five)=>({...newGoal(unit.id),targetLevel:1,targetMagic:0,targetSpecial:unit.rarity===3?0:1});

test('documented growth costs match reference totals at level 100 and Magic Unlock 120',()=>{
 const cost=growthCosts({...newGoal(five.id),targetSpecial:1});
 assert.deepEqual(cost,{materials:{'enhance-glow':931193,'stone-prism':19750,'aq-chip':144450,'stone-flame':905,'gem-prism':1595,'gem-flame':360,'orb-prism':12,'orb-flame':24},copies:0,partialAq:false});
 assert.deepEqual(growthCosts(blank()),{materials:{},copies:0,partialAq:false});
 const late=growthCosts({...blank(),currentLevel:110,targetLevel:110,currentMagic:120,targetMagic:130});
 assert.equal(late.partialAq,true); assert.equal(late.materials['core-prism'],3); assert.equal(late.materials['core-flame'],6);assert.ok(!('aq-chip'in late.materials));
});
test('special skills use rarity costs and ascension caps, while three-star Kioku have no special',()=>{
 const target=unit=>({...blank(unit),currentAscension:5,targetAscension:5,targetSpecial:10});
 assert.deepEqual(growthCosts(target(five)).materials,{'magia-book-small':750,'magia-book-medium':155,'magia-book':40});
 assert.deepEqual(growthCosts(target(four)).materials,{'magia-book-small':485,'magia-book-medium':72,'magia-book':10});
 assert.deepEqual(growthCosts(blank(three)).materials,{});
 for(const invalid of [{...blank(three),targetSpecial:1},{...blank(),targetSpecial:5},{...blank(),targetAscension:3,targetSpecial:8},{...blank(),currentLevel:29,targetLevel:29,targetMagic:31},{...blank(),currentLevel:60,targetLevel:59},{...blank(),targetAscension:2,crystals:3}]) assert.throws(()=>goal(invalid),/INVALID_REQUEST/);
});
test('collection totals subtract shared inventory once and allocate crystals without inventing copies',()=>{
 const a={...blank(),targetSpecial:2,targetAscension:3,crystals:2},b={...blank(four),targetSpecial:2};
 const combined=combinedCosts([a,b],{'magia-book-small':12,'kioku-crystal':1});
 assert.equal(combined.materials['magia-book-small'],15);assert.equal(combined.missing['magia-book-small'],3);assert.equal(combined.missing['kioku-crystal'],1);assert.deepEqual(combined.copies,{[five.id]:1});
 const saved=plan({revision:-1,entries:[a,b],inventory:{'style-ticket':2,'magical-palette-small':4}});assert.equal(saved.entries.length,2);
 assert.throws(()=>plan({...saved,entries:[a,a]}),/INVALID_REQUEST/);assert.throws(()=>plan({...saved,inventory:{unknown:2}}),/INVALID_REQUEST/);
});
test('expanded item catalog and Steam checklist have verified assets and complete localized descriptions',()=>{
 assert.equal(gameItems.length,66);assert.equal(new Set(gameItems.map(i=>i.id)).size,66);assert.deepEqual(itemCategories.map(c=>gameItems.filter(i=>i.category===c).length),[39,9,9,5,4]);
 for(const item of gameItems){const bytes=readFileSync(new URL('../public'+item.image,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);for(const lang of languages){assert.ok(itemName(item,lang)&&itemPurpose(item,lang));assert.ok(!itemName(item,lang).includes('undefined'));assert.equal(Object.keys(itemsCopy[lang]).length,Object.keys(itemsCopy.en).length);}}
 assert.equal(steamAchievements.length,31);assert.equal(new Set(steamAchievements.map(a=>a.image)).size,31);
 for(const a of steamAchievements){assert.ok(existsSync(new URL('../public'+a.image,import.meta.url)));for(const lang of languages)assert.ok(achievementDescription(a,lang)&&!achievementDescription(a,lang).includes('undefined'));}
 for(const lang of languages){assert.equal(faqData[lang].length,10);assert.ok(faqData[lang].every(q=>q.question&&q.answer));}
});
