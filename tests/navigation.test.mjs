import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { kiokus } from "../lib/kioku-catalog.ts";
import { communityGuides } from '../lib/community-guides.ts';
import { news } from "../lib/news-data.ts";
import { languages } from "../lib/locales.ts";
import { resolvePortalRoute } from "../lib/portal-routes.ts";
import { tierRatings, teamBuilds, teamRanking, teamRarity } from "../lib/tier-data.ts";
import { characterRanking } from '../lib/rarity-ratings.ts';
import { archiveCopy } from '../lib/archive-copy.ts';
import { portraitCopy } from '../lib/portrait-copy.ts';
import { portraits, portraitName, portraitAssessment, portraitRanking, filterPortraits, effectValue } from '../lib/portrait-data.ts';
import { createHash } from 'node:crypto';
import { databaseItems } from "../lib/database-data.ts";
import {gameItems,itemCategories,itemsCopy,itemName,itemPurpose} from "../lib/items-copy.ts";
import {toolPaths,toolsCopy,toolKey} from "../lib/tools-copy.ts";
import {steamAchievements,achievementDescription} from "../lib/achievement-data.ts";
import {faqData} from "../lib/faq-data.ts";
import { expansionCopy } from "../lib/expansion-copy.ts";
import { buildCopy } from "../lib/build-copy.ts";
import { databaseCopy } from "../lib/database-copy.ts";
import { tierResearchCopy } from '../lib/tier-research-copy.ts';
import { communityLinks, initialPetition } from '../lib/community-data.ts';
import { readFileSync } from 'node:fs';

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(new URL("../package.json", import.meta.url));
const { build } = createRequire(import.meta.resolve("wrangler"))("esbuild");
const { createElement, Fragment } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { outputFiles } = await build({
  stdin: { contents: 'export { default as Portal } from "./components/magia-portal"; export {TierUnit,TeamCard,TierRow} from "./components/tier-lists"; export {PortraitCard} from "./components/portrait-pages";', resolveDir: root, loader: "tsx" },
  absWorkingDir: root, bundle: true, format: "cjs", platform: "node", packages: "external", write: false, logLevel: "silent",
});
const bundle = { exports: {} };
new Function("module", "exports", "require", outputFiles[0].text)(bundle, bundle.exports, require);
const render = (path, lang = "es") => renderToStaticMarkup(createElement(bundle.exports.Portal, { lang, path }));
const renderUnits = () => renderToStaticMarkup(createElement(Fragment, null, tierRatings.map(({unit}) => createElement(bundle.exports.TierUnit,{unit,lang:'es',reason:true,key:unit.id}))));
const renderTeams = () => renderToStaticMarkup(createElement(Fragment, null, teamBuilds.map(team => createElement(bundle.exports.TeamCard,{team,lang:'es',key:team.id}))));
const renderPortraits = () => renderToStaticMarkup(createElement(Fragment, null, portraits.map(portrait => createElement(bundle.exports.PortraitCard,{portrait,lang:'es',ranking:true,key:portrait.id}))));
const containsText = (markup, value) => markup.includes(renderToStaticMarkup(createElement('span', null, value)).slice(6, -7));
const links = markup => [...markup.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => match[1].replaceAll("&amp;", "&"));
function follow(href) {
  const url = new URL(href, "https://magia.test");
  const [lang, ...slug] = url.pathname.split("/").filter(Boolean);
  const path = resolvePortalRoute(lang, slug);
  assert.notEqual(path, null, "Link must resolve to a real page: " + href);
  return render(path, lang);
}

test("home links lead to a populated catalog and distinct five-, four- and three-star profiles", () => {
  const home = render("");
  const catalogHref = links(home).find(href => href === "/es/characters/");
  assert.ok(catalogHref);
  const catalog = follow(catalogHref);
  const profiles = links(catalog).filter(href => href.startsWith("/es/kioku/"));
  assert.equal(new Set(profiles).size, 115);
  for (const rarity of [5, 4, 3]) {
    const unit = kiokus.find(item => item.rarity === rarity);
    const destination = "/es/kioku/" + unit.id + "/";
    assert.ok(profiles.includes(destination));
    const profile = follow(destination);
    assert.ok(profile.includes(unit.name) && profile.includes(unit.image));
    assert.ok(profile.includes("kioku-stats") && profile.includes("kioku-skill-list"));
    assert.ok(links(profile).includes("/es/characters/"));
    assert.notEqual(profile, catalog);
  }
});

test("news journeys remain on the site and render translated article sections in every locale", () => {
  for (const lang of languages) {
    const listing = render("news", lang);
    for (const article of news) {
      const href = `/${lang}/news/${article.id}/`;
      assert.ok(links(listing).includes(href));
      const detail = follow(href);
      assert.ok(detail.includes(article.image));
      for (const section of article.sections) assert.ok(detail.includes('id="' + section.id + '"'));
      assert.ok(links(detail).includes(`/${lang}/news/`));
      assert.ok(links(detail).includes(article.source), "Official source remains available below the article");
    }
  }
});

test("every visible internal link has a valid page destination, including profile notes and old introductions", () => {
  for (const path of ["", "characters", "kioku/10010701", "news", "news/sorana", "characters/madoka", "guides/first-steps", "homulilly", "profile", "privacy", "leaderboard", "madokadle", "database", "database/items", "database/materials", "database/portraits", ...itemCategories.map(c=>"database/"+c), ...toolPaths, "builds", "tierlists", "tierlists/teams", "tierlists/create", "leaks", ...teamBuilds.map(team => 'builds/' + team.id), ...databaseItems.map(item => 'database/' + (item.kind === 'portraits' ? 'portraits' : 'items') + '/' + item.id)]) {
    for (const href of links(render(path))) {
      if (!href.startsWith("/")) continue;
      const url = new URL(href, "https://magia.test");
      const [lang, ...slug] = url.pathname.split("/").filter(Boolean);
      assert.notEqual(resolvePortalRoute(lang, slug), null, path + " links to " + href);
    }
  }
});

test('new database, builds and tier pages are populated and translated in all nine languages', () => {
  for (const lang of languages) {
    for (const dictionary of [expansionCopy, buildCopy, databaseCopy, tierResearchCopy, archiveCopy, portraitCopy,toolsCopy,itemsCopy]) {
      assert.deepEqual(Object.keys(dictionary[lang]).sort(), Object.keys(dictionary.en).sort());
      assert.ok(Object.values(dictionary[lang]).every(value => typeof value === 'string' && value.trim() && !value.includes('undefined')));
    }
    const hub = follow(`/${lang}/database/`);
    assert.ok(containsText(hub, expansionCopy[lang].dbIntro));
    const hubCards=hub.match(/<div class="expansion-grid database-hub">([\s\S]*?)<\/main>/)?.[1]||'';
    assert.ok(hubCards);
    assert.ok(!links(hubCards.split('</div>')[0]).some(href=>href.includes('/tierlists/')||href.includes('/builds/')));
    const items = follow(`/${lang}/database/items/`);
    const types = items.match(/<div class="expansion-grid database-hub object-types">([\s\S]*?)<\/main>/)?.[1] || '';
    assert.deepEqual(links(types), [`/${lang}/database/portraits/`, ...itemCategories.map(c=>`/${lang}/database/${c}/`)]);
    const catalogs = { portraits: follow(`/${lang}/database/portraits/`), ...Object.fromEntries(itemCategories.map(c=>[c,follow(`/${lang}/database/${c}/`)])) };
    assert.equal((catalogs.portraits.match(/data-portrait="/g) || []).length, 290);
    assert.ok(!types.includes('data-portrait="'), 'Objects is a type index, not a duplicate catalog');
    for (const item of databaseItems.filter(item => item.kind === 'materials' || ['a-close-friend','meet-again','apostle-of-salvation','game8_821921','art_04_07_0002'].includes(item.id))) {
      const href = `/${lang}/database/${item.kind === 'portraits' ? 'portraits' : 'items'}/${item.id}/`;
      assert.ok(links(catalogs[item.gameItem?.category||item.kind]).includes(href));
      const detail = follow(href);
      assert.ok(detail.includes(item.source));
      assert.ok(catalogs[item.gameItem?.category||item.kind].includes(item.image)&&detail.includes(item.image));
      assert.ok(!detail.includes('undefined'));
    }
    const ranking = follow(`/${lang}/tierlists/`);
    assert.equal(new Set(links(ranking).filter(href => href.startsWith(`/${lang}/kioku/`))).size, characterRanking().filter(item=>item.rank==='S+').length);
    assert.ok(containsText(ranking, tierResearchCopy[lang].researchNote));
    assert.ok(!containsText(ranking, expansionCopy[lang].unratedNote));
    assert.ok(ranking.includes(tierRatings.length + ' / 115'));
    assert.equal((ranking.match(/class="tier-rank"/g) || []).length, 5);
    const teams = follow(`/${lang}/tierlists/teams/`);
    assert.ok(containsText(teams, expansionCopy[lang].teamMethod));
    for (const team of teamBuilds) {
      const href = `/${lang}/builds/${team.id}/`;
      if(teamRanking().some(item=>item.team.id===team.id&&item.rank==='S+'))assert.ok(links(teams).includes(href));
      const detail = follow(href);
      assert.ok(containsText(detail, buildCopy[lang][team.nameKey]));
      assert.ok(containsText(detail, expansionCopy[lang].rotation));
      assert.ok(containsText(detail,buildCopy[lang][team.strategy]));
      assert.ok(containsText(detail,buildCopy[lang][team.portraits]));
      assert.ok(containsText(detail,tierResearchCopy[lang].alternatives));
      for (const member of team.members) assert.ok(links(detail).includes(`/${lang}/kioku/${member}/`));
    }
    const editor = follow(`/${lang}/tierlists/create/`);
    assert.ok(editor.includes('id="tier-title"'));
    assert.equal((editor.match(/class="tier-pool-unit"/g) || []).length, 115);
    assert.ok(containsText(editor, expansionCopy[lang].privateLists));
    assert.ok(containsText(follow(`/${lang}/leaks/`), expansionCopy[lang].noLeaks));
  }
});

test('anime and community pages work in every language with the correct support destinations', () => {
  for (const lang of languages) {
    const universe=follow(`/${lang}/madoka/`),community=follow(`/${lang}/community/`);
    assert.ok(universe.includes('Walpurgisnacht Rising')&&universe.includes('Magia Record'));
    assert.ok(links(community).includes('https://ko-fi.com/homulillyvt'));
    assert.ok(links(community).includes('https://x.com/madoka_exedraES'));
    assert.ok(links(community).includes(communityLinks.petition));
    assert.ok(!community.includes('selecta-visi%C3%B3n-estrena'));
    assert.ok(links(render('',lang)).includes(`/${lang}/madoka/`));
    assert.ok(links(render('',lang)).includes(`/${lang}/community/`));
  }
});

test('new database news has a working native link and its own localized page', () => {
  const article={...news[0],id:'anime-test-entry',category:'anime',region:'JP',checkedAt:'2026-10-08T04:00:00Z'};
  assert.equal(resolvePortalRoute('es',['news',article.id],[article]),'news/'+article.id);
  const content={articles:[article],petition:initialPetition,kiokus};
  const html=renderToStaticMarkup(createElement(bundle.exports.Portal,{lang:'es',path:'news/'+article.id,content}));
  assert.ok(html.includes(article.title.es));assert.ok(html.includes('MADOKA MAGICA'));
  assert.ok(!html.includes('Estas fechas y recompensas'));
});

test('all new community guides have translated sections, sources and an accessible reviewed date',()=>{
  assert.equal(communityGuides.length,4);
  for(const guide of communityGuides) for(const lang of languages){
    assert.equal(resolvePortalRoute(lang,['guides',guide.id]),'guides/'+guide.id);
    const html=render('guides/'+guide.id,lang);
    assert.ok(containsText(html,guide.title[lang]));
    assert.ok(html.includes('dateTime="'+guide.reviewedAt+'"')||html.includes('datetime="'+guide.reviewedAt+'"'));
    assert.ok(guide.sections.length>=4);
    for(const section of guide.sections){assert.ok(section.text[lang].trim());assert.ok(containsText(html,section.title[lang]));assert.ok(containsText(html,section.text[lang]));}
    assert.ok(guide.sources.length>=3);for(const source of guide.sources)assert.ok(links(html).includes(source.url));
  }
});
test('a persisted future Kioku reaches its profile, catalog and tools without rebuilding static data',()=>{
  const unit={...kiokus[0],id:'99990101',name:'Daily test unit',kioku:'Daily test version',releaseDate:'2026-10-09'};
  const content={articles:news,petition:initialPetition,kiokus:[...kiokus,unit]};
  assert.equal(resolvePortalRoute('es',['kioku',unit.id],news,content.kiokus),'kioku/'+unit.id);
  for(const path of ['characters','kioku/'+unit.id,'ascension-calculator','ranking','tierlists/create']){
    const html=renderToStaticMarkup(createElement(bundle.exports.Portal,{lang:'es',path,content}));
    assert.ok(html.includes(unit.name),path+' shows the current catalog');
    if(path==='tierlists/create')assert.ok(html.includes('116 / 116'), 'the editor includes the expanded pool');
    else assert.ok(html.includes(unit.id),path+' accepts its stable ID');
  }
});

test('all versions receive contextual grades and all teams have valid distinct rosters and usable alternatives',()=>{
  assert.equal(tierRatings.length,kiokus.length);
  assert.equal(new Set(tierRatings.map(entry=>entry.unit.id)).size,kiokus.length);
  assert.ok(tierRatings.some(entry=>entry.unit.rarity===4&&entry.rank==='A'));
  const ranking=renderUnits();
  for(const {unit,assessment} of tierRatings){
    assert.ok(containsText(ranking,tierResearchCopy.es[assessment.focus]),unit.id);
    assert.ok(containsText(ranking,tierResearchCopy.es[assessment.limit]),unit.id);
  }
  assert.ok(ranking.includes('A4')&&ranking.includes('A2')&&ranking.includes('A5'));
  assert.equal(new Set(teamBuilds.map(team=>team.id)).size,41);
  assert.ok(teamBuilds.filter(team=>team.use==='pvp').length>=3);
  assert.ok(teamBuilds.filter(team=>team.use==='waves').length>=3);
  for(const team of teamBuilds){
    assert.equal(new Set(team.members).size,5,team.id);
    assert.ok(team.members.every(id=>kiokus.some(unit=>unit.id===id)),team.id);
    for(const option of team.alternatives){
      assert.ok(team.members.includes(option.for));
      assert.ok(option.choices.every(id=>!team.members.includes(id)&&kiokus.some(unit=>unit.id===id)));
    }
  }
  assert.equal(new Set(databaseItems.map(item=>item.image)).size,databaseItems.length-1);
  const shared=gameItems.filter(item=>item.sharedAssetIds.length>1);
  assert.equal(shared.length,2);
  assert.equal(shared[0].image,shared[1].image);
  for(const item of databaseItems)assert.ok(readFileSync(root+'public'+item.image).length>1000);
});

test('rarity pages contain exactly the matching characters and five-member teams in all languages', () => {
  for (const lang of languages) for (const rarity of [5,4,3]) {
    const characters = follow(`/${lang}/tierlists/${rarity}-stars/`);
    const roster = characterRanking(rarity);
    const characterLinks = new Set(links(characters).filter(href => href.startsWith(`/${lang}/kioku/`)));
    assert.equal(roster.length, {5:76,4:17,3:22}[rarity]);
    assert.equal(characterLinks.size, roster.filter(item=>item.rank==='S+').length);
    for (const {unit,rank} of roster) assert.equal(characterLinks.has(`/${lang}/kioku/${unit.id}/`),rank==='S+');
    assert.ok(containsText(characters,archiveCopy[lang].withinRarity));
    assert.equal((characters.match(/class="tier-rank"/g)||[]).length,5);
    const teams = follow(`/${lang}/tierlists/teams/${rarity}-stars/`);
    const teamIds = new Set(links(teams).filter(href => /^\/[^/]+\/builds\/[^/]+\/$/.test(href)).map(href=>href.split('/')[3]));
    assert.equal(teamRanking(rarity).length,{5:19,4:9,3:6}[rarity]);
    assert.equal(teamIds.size,teamRanking(rarity).filter(item=>item.rank==='S+').length);
    for(const {team,rank} of teamRanking(rarity)) {
      assert.equal(teamIds.has(team.id),rank==='S+');
      assert.equal(teamRarity(team),rarity);
      assert.equal(rank,rarity<5?team.cohortRank||team.rank:team.rank);
      if(rarity<5) for(const swap of team.alternatives) for(const id of swap.choices) assert.equal(kiokus.find(u=>u.id===id).rarity,rarity);
    }
    assert.ok(containsText(teams,archiveCopy[lang].pureTeams));
  }
  assert.notEqual(characterRanking(4).find(i=>i.unit.id==='10820101').rank,tierRatings.find(i=>i.unit.id==='10820101').rank,'A general grade and a rarity grade must remain distinct');
});

test('portrait tier routes show all sourced portraits and do not invent three-star portraits', () => {
  assert.equal(portraits.length,290);
  assert.equal(new Set(portraits.map(p=>p.id)).size,290);
  assert.deepEqual([5,4,3].map(rarity=>portraits.filter(p=>p.rarity===rarity).length),[195,95,0]);
  for(const lang of languages) for(const rarity of [undefined,5,4]) {
    const html=follow(`/${lang}/tierlists/portraits/${rarity?rarity+'-stars/':''}`);
    const visible=[...html.matchAll(/data-portrait="([^"]+)" data-rarity="(\d+)"/g)];
    assert.equal(visible.length,portraitRanking(rarity).filter(item=>item.rank==='S+').length);
    assert.equal(new Set(visible.map(m=>m[1])).size,visible.length);
    if(rarity)assert.ok(visible.every(m=>Number(m[2])===rarity));
    assert.equal((html.match(/class="tier-rank"/g)||[]).length,5);
    assert.ok(containsText(html,archiveCopy[lang].portraitMethod));
    assert.ok(!html.includes('undefined'));
  }
  for(const lang of languages) {
    const empty=follow(`/${lang}/tierlists/portraits/3-stars/`);
    assert.ok(containsText(empty,archiveCopy[lang].noThreePortraits));
    assert.ok(!empty.includes('data-portrait="'));
  }
});

test('portrait details preserve missing data, additional bonuses, legacy links and source disagreements', () => {
  for(const portrait of portraits) {
    const html=follow(`/es/database/portraits/${portrait.id}/`);
    assert.ok(containsText(html,portraitName(portrait,'es')));
    assert.ok(html.includes(portrait.image)&&html.includes(portrait.source));
    assert.ok(!html.includes('undefined'));
    if(portrait.bonus)assert.ok(containsText(html,portraitCopy.es.bonusNote));
    if(portrait.rarityConflict){
      assert.ok(html.includes(portrait.rarityConflict.source));
      assert.ok(containsText(html,portraitCopy.es.rareConflictNote));
    }
  }
  assert.equal(portraits.filter(p=>p.rarityConflict).length,3);
  for(const id of ['a-close-friend','meet-again','apostle-of-salvation'])assert.ok(portraits.some(p=>p.id===id));
  const extra=portraits.find(p=>p.id==='game8_821921');
  assert.equal(extra.name,null);
  for(const key of ['hp','atk','def'])assert.deepEqual(extra.stats[key],{initial:null,max:null});
  assert.ok(containsText(follow('/es/database/portraits/game8_821921/'),portraitCopy.es.missingStats));
  const flatSpeed=portraits.flatMap(p=>p.bonus?.effects||[]).find(e=>e.key==='speed'&&e.unit==='');
  assert.ok(flatSpeed);
  assert.ok(!effectValue(flatSpeed,'es').includes('%'));
  const conditional=portraits.flatMap(p=>[...p.effects,...p.bonus?.effects||[]]).find(e=>e.condition==='break350');
  assert.ok(conditional);
  assert.ok(portraitCopy.es.break350.includes('350'));
});

test('portrait filters and grades account for base stats, match roles, preserve universal effects and sort without mutation', () => {
  const original=portraits.map(p=>p.id);
  const speed=filterPortraits(portraits,{effect:'speed'});
  assert.ok(speed.length>20&&speed.length<portraits.length);
  assert.ok(filterPortraits(portraits,{role:'Defender',rarity:4}).length>0);
  const flame=filterPortraits(portraits,{element:'Flame'});
  const universal=portraits.find(p=>p.effects.every(e=>!e.element));
  const aqua=portraits.find(p=>p.effects.some(e=>e.element==='Aqua'));
  assert.ok(flame.some(p=>p.id===universal.id));
  assert.ok(!flame.some(p=>p.id===aqua.id));
  assert.ok(filterPortraits(portraits,{query:'Velocidad'},'es').length>0);
  assert.ok(filterPortraits(portraits,{query:universal.japanese},'ja').some(p=>p.id===universal.id));
  const ascending=filterPortraits(portraits,{order:'nameAsc'},'es');
  assert.deepEqual(filterPortraits(portraits,{order:'nameDesc'},'es').map(p=>p.id),ascending.map(p=>p.id).reverse());
  for(const order of ['atkDesc','defDesc','hpDesc']) {
    const key=order.replace('Desc',''),sorted=filterPortraits(portraits,{order});
    for(let i=1;i<sorted.length;i++)assert.ok((sorted[i-1].stats[key].max??-1)>=(sorted[i].stats[key].max??-1));
    assert.equal(sorted.at(-1).id,'game8_821921');
  }
  assert.deepEqual(portraits.map(p=>p.id),original);
  const mermaid=portraits.find(p=>p.assetId==='art_00_00_0010'),kawaii=portraits.find(p=>p.assetId==='art_00_01_0007');
  assert.ok(mermaid.stats.atk.max>kawaii.stats.atk.max);
  assert.ok(mermaid.effects[0].max<kawaii.effects[0].max);
  assert.ok(portraitAssessment(mermaid).score>portraitAssessment(kawaii).score,'A slightly larger passive must not eclipse much stronger useful base stats');
  assert.equal(portraitAssessment(kawaii).lowStat,true);
});

test('every portrait illustration is a verified uncropped file with matching provenance', () => {
  const provenance=JSON.parse(readFileSync(root+'lib/portrait-provenance.json','utf8'));
  assert.equal(provenance.portraits.length,290);
  for(const entry of provenance.portraits) {
    const portrait=portraits.find(p=>p.id===entry.id);
    for(const [key,path] of [['display',portrait.image],['thumbnail',portrait.thumbnail]]) {
      const data=readFileSync(root+'public'+path),record=entry[key];
      assert.ok(data.length>1000);
      assert.equal(data.length,record.bytes);
      assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256);
      assert.equal(record.cropped,false);
      assert.ok(record.width<=entry.sourceWidth&&record.height<=entry.sourceHeight);
    }
  }
});

test('public rankings start with compact cards and keep the full advice in closed disclosures', () => {
  const units = [...renderUnits().matchAll(/<article class="tier-unit">([\s\S]*?)<\/article>/g)];
  assert.equal(units.length,115);
  for(const [,card] of units) {
    const basic=card.split('<details')[0];
    assert.ok(basic.includes('tier-version')&&basic.includes('tier-role'));
    assert.ok(!basic.includes('tier-reason')&&!basic.includes('evidence-label')&&!basic.includes('ascension-label'));
    assert.match(card,/<details class="tier-card-details tier-assessment">/);
    assert.ok(card.includes('assessment-sources')&&card.includes('tier-reason'));
  }
  const teams=[...renderTeams().matchAll(/<article class="team-card">([\s\S]*?)<\/article>/g)];
  assert.equal(teams.length,41);
  for(const [,card] of teams) {
    assert.ok(card.split('<details')[0].includes('team-members'));
    assert.ok(!card.split('<details')[0].includes('team-limit'));
    assert.match(card,/<details class="tier-card-details team-details">/);
  }
  const cards=[...renderPortraits().matchAll(/<article class="portrait-card tier-portrait-card"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(cards.length,290);
  for(const [,card] of cards) {
    const basic=card.split('<details')[0];
    assert.ok(basic.includes('portrait-image')&&basic.includes('<h3>'));
    assert.ok(!basic.includes('portrait-effects')&&!basic.includes('portrait-mini-stats')&&!basic.includes('portrait-reason'));
    assert.match(card,/<details class="tier-card-details portrait-card-details">/);
    assert.ok(card.includes('portrait-mini-stats')&&card.includes('portrait-effects'));
  }
  assert.ok(render('database/portraits').includes('portrait-mini-stats'),'Catalog data remains visible outside the compact ranking');
});

test('closed rankings defer card rendering while expanded ranks retain their full content',()=>{
 let renders=0;const expensive=()=>{renders++;return createElement('span',null,'Full ranked content');};
 const closed=renderToStaticMarkup(createElement(bundle.exports.TierRow,{rank:'S',lang:'es',count:1,collapsed:true,onToggle:()=>{}},createElement(expensive)));
 assert.equal(renders,0);assert.ok(!closed.includes('Full ranked content'));assert.match(closed,/aria-expanded="false"/);
 const expanded=renderToStaticMarkup(createElement(bundle.exports.TierRow,{rank:'S',lang:'es',count:1,collapsed:false,onToggle:()=>{}},createElement(expensive)));
 assert.equal(renders,1);assert.ok(expanded.includes('Full ranked content'));assert.match(expanded,/aria-expanded="true"/);
});
test('rankings offer labelled, connected tier controls and localized expand/collapse actions', () => {
  for(const lang of languages) for(const path of ['tierlists','tierlists/teams','tierlists/portraits']) {
    const html=render(path,lang);
    assert.ok(containsText(html,archiveCopy[lang].expandAll));
    assert.ok(containsText(html,archiveCopy[lang].collapseAll));
    const toggles=[...html.matchAll(/<button[^>]*class="tier-rank-toggle"[^>]*aria-expanded="(true|false)"[^>]*aria-controls="([^"]+)"/g)];
    assert.equal(toggles.length,5);
    assert.equal(new Set(toggles.map(m=>m[2])).size,5);
    assert.equal(toggles.filter(m=>m[1]==='true').length,1);
    assert.ok(containsText(html,archiveCopy[lang].expandHint));
    for(const [,,id] of toggles)assert.ok(html.includes(`id="${id}" class="tier-row-content"`));
    assert.match(html,/<details class="tier-method tier-page-details">/);
    assert.ok(containsText(html,archiveCopy[lang].rankingMethod));
    assert.ok(containsText(html,archiveCopy[lang].cardDetails));
  }
});

test('tools and support journeys lead to populated localized pages and the calculator renders real materials',()=>{
 for(const lang of languages){
  const hub=follow(`/${lang}/tools/`);
  for(const path of ['my-characters','ascension-calculator','achievements','ranking'])assert.ok(links(hub).includes(`/${lang}/${path}/`));
  for(const path of toolPaths){const page=follow(`/${lang}/${path}/`);assert.ok(containsText(page,toolsCopy[lang][toolKey[path]]));assert.ok(!page.includes('undefined'));}
  const calc=follow(`/${lang}/ascension-calculator/`);assert.ok(calc.includes('931'));assert.ok(calc.includes('tool-table'));assert.ok(links(calc).includes(`/${lang}/database/items/stone-prism/`));assert.ok(containsText(calc,toolsCopy[lang].calcCoverage));
  const achievements=follow(`/${lang}/achievements/`);assert.equal((achievements.match(/class="tool-card achievement-card/g)||[]).length,31);for(const a of steamAchievements)assert.ok(containsText(achievements,achievementDescription(a,lang)));
  const faq=follow(`/${lang}/faq/`);for(const entry of faqData[lang]){assert.ok(containsText(faq,entry.question));assert.ok(containsText(faq,entry.answer));}
 }
});
