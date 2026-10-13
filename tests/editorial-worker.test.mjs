import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { news } from '../lib/news-data.ts';
import { kiokus } from '../lib/kioku-catalog.ts';
import { communityLinks, petitionTitle, initialPetition } from '../lib/community-data.ts';
const require=createRequire(import.meta.resolve('wrangler'));
const {Miniflare,createFetchMock}=require('miniflare');
const {build}=require('esbuild');
const root=fileURLToPath(new URL('../',import.meta.url));
const {outputFiles}=await build({stdin:{contents:`import {POST} from './app/mcp/route'; import {GET} from './app/api/public-content/route'; export default {fetch:r=>new URL(r.url).pathname==='/mcp'?POST(r):GET()};`,resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers'],write:false});
const editor={'oai-authenticated-user-id':'site-scoped-owner','oai-authenticated-user-email':'owner@example.test'};
async function setup(t) {
 const mock=createFetchMock();mock.disableNetConnect();
 const mf=new Miniflare({modules:true,compatibilityDate:'2026-05-15',script:outputFiles[0].text,bindings:{CONTENT_EDITOR_EMAIL:'owner@example.test'},d1Databases:['DB'],fetchMock:mock});
 t.after(()=>mf.dispose());const db=await mf.getD1Database('DB');
 for(const file of readdirSync(root+'drizzle').filter(f=>f.endsWith('.sql')).sort()) await db.batch(readFileSync(root+'drizzle/'+file,'utf8').split('--> statement-breakpoint').map(s=>db.prepare(s.trim())));
 const call=(name,args={},headers=editor)=>mf.dispatchFetch('https://archive.test/mcp',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});
 const state=async()=> (await mf.dispatchFetch('https://archive.test/api/public-content')).json();
 return {mf,db,mock,call,state};
}
const sourceBody='<html><body><main>Homulilly VT Madoka Magica en más cines de España y durante más tiempo '+ 'Official campaign information. '.repeat(20)+'<script>{"signatureCount":{"displayed":158,"total":158,"goal":200}}</script></main></body></html>';
test('one corrupt public record cannot discard valid persisted news, petition or new Kioku and does not delete stored data',async t=>{
 const {db,state}=await setup(t),article={...news[0],id:'persisted-story',title:{...news[0].title,es:'Noticia conservada'}},unit={...kiokus[0],id:'19999999'},petition={...initialPetition,count:193,goal:200};
 await db.prepare('INSERT INTO editorial_news (id,source,article_json,checked_at) VALUES (?,?,?,?)').bind(article.id,article.source,JSON.stringify(article),'2026-10-13T10:00:00.000Z').run();
 await db.prepare('INSERT INTO editorial_news (id,source,article_json,checked_at) VALUES (?,?,?,?)').bind('broken-story','https://invalid.test/','{','2026-10-13T10:00:00.000Z').run();
 for(const [key,value] of [['kioku:19999999',JSON.stringify(unit)],['kioku:10010701','{'],['petition',JSON.stringify(petition)],['catalog_check','{"failures":null}']])await db.prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?)').bind(key,value,'2026-10-13T10:00:00.000Z').run();
 const current=await state();assert.equal(current.partial,true);assert.equal(current.unavailable,undefined);assert.ok(current.articles.some(a=>a.id===article.id));assert.ok(current.kiokus.some(k=>k.id===unit.id));assert.ok(current.kiokus.some(k=>k.id==='10010701'));assert.equal(current.petition.count,193);assert.equal(current.catalogCheck,undefined);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM editorial_news WHERE id='broken-story'").first()).n,1);assert.equal((await db.prepare("SELECT value_json FROM public_updates WHERE key='kioku:10010701'").first()).value_json,'{');
});
function petitionReply(mock,body=sourceBody,status=200) {const u=new URL(communityLinks.petition);mock.get(u.origin).intercept({path:u.pathname,method:'GET'}).reply(status,body,{headers:{'content-type':'text/html'}});}

test('editorial writing requires verified owner identity; public discovery contains no credentials',async t=>{
 const {mf,call,state}=await setup(t);
 assert.equal((await call('refresh_petition',{},{})).status,403);
 assert.equal((await call('refresh_petition',{}, {...editor,'oai-authenticated-user-email':'visitor@example.test'})).status,403);
 assert.equal((await call('refresh_petition',{}, {...editor,origin:'https://elsewhere.test'})).status,403);
 assert.equal((await call('refresh_petition',{}, {...editor,origin:'null'})).status,403);
 const listing=await (await mf.dispatchFetch('https://archive.test/mcp',{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})})).json();
 assert.equal(listing.result.tools.length,9);assert.ok(!JSON.stringify(listing).includes('owner@example'));
 assert.equal((await state()).articles.length,3);
 const plan=await (await call('get_update_plan')).json();assert.equal(plan.result.structuredContent.revision,'2026-10-09.1');
});
test('public petition observations require fresh canonical evidence and preserve prior counts on failure',async t=>{
 const {call,state}=await setup(t);
 const observedAt=new Date().toISOString();
 const evidence='Madoka Magica en más cines de España y durante más tiempo\nHomulilly VT\n## 159\n###\nFirmas verificadas';
 const input={source:communityLinks.petition,observedAt,evidence};
 assert.equal((await call('record_petition_snapshot',input,{})).status,403);
 const saved=await (await call('record_petition_snapshot',input)).json();
 assert.deepEqual(saved.result.structuredContent,{source:communityLinks.petition,count:159,goal:null,checkedAt:observedAt});
 const first=(await state()).petition;
 const compatible=await (await call('refresh_petition',{observation:input})).json();
 assert.deepEqual(compatible.result.structuredContent,first);
 for(const bad of [
   {...input,source:'https://www.change.org/p/another-petition'},
   {...input,observedAt:'2020-01-01T00:00:00.000Z'},
   {...input,observedAt:'2099-01-01T00:00:00.000Z'},
   {...input,evidence:evidence.replace('Homulilly VT','Another creator')},
   {...input,evidence:evidence.replace(petitionTitle,'Selecta Visión: estrena Madoka Magica: Walpurgisnacht Rising en cines de España')},
   {...input,evidence:evidence+'\n160\nFirmas verificadas'},
   {...input,evidence:evidence.replace('159','No visible count')},
 ]) {
   assert.equal((await (await call('record_petition_snapshot',bad)).json()).result.isError,true);
   assert.deepEqual((await state()).petition,first);
 }
 const lowered=await (await call('record_petition_snapshot',{...input,observedAt:new Date().toISOString(),evidence:evidence.replace('159','156')})).json();
 assert.equal(lowered.result.structuredContent.count,156);
 assert.equal((await state()).petition.count,156);
});
test('petition count persists and survives a failed or ambiguous source response',async t=>{
 const {mock,call,state,db}=await setup(t);petitionReply(mock);
 const r=await (await call('refresh_petition')).json();assert.equal(r.result.structuredContent.count,158);
 const first=(await state()).petition;assert.equal(first.checkedAt,r.result.structuredContent.checkedAt);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM public_updates WHERE key='petition'").first()).n,1);
 petitionReply(mock,sourceBody.replace('158','wrong-format'));
 const failed=await (await call('refresh_petition')).json();assert.equal(failed.result.isError,true);
 assert.deepEqual((await state()).petition,first);
 petitionReply(mock,'blocked',403);assert.equal((await (await call('refresh_petition')).json()).result.isError,true);
 assert.deepEqual((await state()).petition,first);mock.assertNoPendingInterceptors();
});
test('news publication retains stable URLs and translations, rejects incomplete content and foreign sources',async t=>{
 const {mock,call,state,db}=await setup(t);
 const article={...structuredClone(news[0]),id:'renamed-should-not-break-url',category:'exedra',region:'JP'};
 mock.get('https://madoka-exedra.com').intercept({path:'/news/?id=71380',method:'GET'}).reply(200,sourceBody,{headers:{'content-type':'text/html'}}).times(2);
 for(let i=0;i<2;i++) {const out=await (await call('publish_news',article)).json();assert.equal(out.result.structuredContent.id,'sorana');}
 const saved=(await state()).articles.find(a=>a.id==='sorana');assert.deepEqual(saved.title,article.title);assert.equal(saved.sections.length,3);assert.ok(saved.checkedAt);
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM editorial_news').first()).n,1);
 assert.equal((await (await call('publish_news',{...article,source:'https://madoka-exedra.com.evil.test/news/'})).json()).result.isError,true);
 const partial=structuredClone(article);delete partial.title.ja;
 assert.equal((await (await call('publish_news',partial)).json()).result.isError,true);
 assert.equal((await (await call('publish_news',{...article,date:'2099-12-01'})).json()).result.isError,true);
 assert.equal((await state()).articles.length,3);
 mock.assertNoPendingInterceptors();
});


test('old campaign counters cannot appear beside the new petition or overwrite its identity',async t=>{
 const {db,state,call,mock}=await setup(t);
 const old={count:1143,goal:1500,checkedAt:'2026-10-07T18:37:50Z'};
 await db.prepare("INSERT INTO public_updates (key,value_json,updated_at) VALUES ('petition',?,?)").bind(JSON.stringify(old),old.checkedAt).run();
 assert.deepEqual((await state()).petition,initialPetition);
 await db.prepare("UPDATE public_updates SET value_json=? WHERE key='petition'").bind(JSON.stringify({...old,source:'https://www.change.org/p/previous-campaign'})).run();
 assert.deepEqual((await state()).petition,initialPetition);
 petitionReply(mock,sourceBody.replace(petitionTitle,'Selecta Visión Walpurgisnacht campaign'));
 assert.equal((await (await call('refresh_petition')).json()).result.isError,true);
 assert.deepEqual((await state()).petition,initialPetition);
 petitionReply(mock);
 const out=await (await call('refresh_petition')).json();
 assert.equal(out.result.structuredContent.source,communityLinks.petition);
 assert.equal(out.result.structuredContent.count,158);
 assert.equal((await state()).petition.source,communityLinks.petition);
 assert.equal((await state()).articles.length,3);
 mock.assertNoPendingInterceptors();
});

// Source values here are deliberately synthetic; they never reach a hosted database.
const wikiPage=(id='99990101',overrides={})=>({title:'Magia Exedra Kioku - Test Tempest',revisions:[{revid:300001,slots:{main:{content:'{{Magia Exedra Stats\n'+Object.entries({id,character_name_en:'Test character',character_name_jp:'テスト',kioku_name_en:'Test Tempest',kioku_name_jp:'テストテンペスト',rarity:'5',role:'Buffer',element:'Aqua',spd:'120',hp1:'324',atk1:'101',def1:'107',hp_max:'10785',atk_max:'3788',def_max:'3955',special_mp:'90',special_effect:'Deals [1]% aqua DMG to all enemies.',special_lvl_1_1:'180',special_lvl_10_1:'300',battle_skill_name_en:'Test skill',battle_skill_effect:'Increases ATK.',basic_effect:'Deals [1]% aqua DMG to a single enemy.',basic_lvl_1_1:'50',basic_lvl_10_1:'100',...overrides}).map(([k,v])=>'|'+k+' = '+v).join('\n')+'\n}}'}}}]});
const unchangedPages=()=>kiokus.map(u=>({title:'Magia Exedra Kioku - '+u.kioku,revisions:[{revid:Number(new URL(u.source).searchParams.get('oldid')),slots:{main:{content:'{{Magia Exedra Stats\n|id = '+u.id+'\n}}'}}}]}));
function wikiReply(mock,pages,status=200){mock.get('https://wiki.puella-magi.net').intercept({path:u=>new URL(u,'https://wiki.puella-magi.net').searchParams.get('generator')==='categorymembers',method:'GET'}).reply(status,JSON.stringify({query:{pages}}),{headers:{'content-type':'application/json'}});}
function wikiImageReply(mock,id='99990101'){
 const origin=mock.get('https://wiki.puella-magi.net');
 origin.intercept({path:u=>new URL(u,'https://wiki.puella-magi.net').searchParams.get('prop')==='images',method:'GET'}).reply(200,JSON.stringify({query:{pages:[{title:'Test',images:[{title:'File:'+id+' original.png'}]}]}}));
 origin.intercept({path:u=>new URL(u,'https://wiki.puella-magi.net').searchParams.get('prop')==='imageinfo',method:'GET'}).reply(200,JSON.stringify({query:{pages:[{title:'File:'+id+' original.png',imageinfo:[{url:'https://images.puella-magi.net/test/'+id+'original.png'}]}]}}));
}
test('catalog writer requires owner access, persists new versions and keeps stable IDs on repeated checks',async t=>{
 const {mock,call,state,db}=await setup(t);
 assert.equal((await call('refresh_kioku_catalog',{},{})).status,403);
 assert.equal((await call('refresh_kioku_catalog',{}, {...editor,'oai-authenticated-user-email':'visitor@example.test'})).status,403);
 const pages=[...unchangedPages(),wikiPage()];wikiReply(mock,pages);wikiImageReply(mock);
 const result=await (await call('refresh_kioku_catalog')).json();
 assert.equal(result.result.isError,undefined);assert.deepEqual(result.result.structuredContent.added,['99990101']);assert.equal(result.result.structuredContent.count,116);assert.deepEqual(result.result.structuredContent.failures,[]);
 const saved=(await state()).kiokus.find(u=>u.id==='99990101');
 assert.equal(saved.rarity,5);assert.equal(saved.element,'Aqua');assert.equal(saved.speed,120);assert.equal(saved.stats.max.hp,10785);assert.equal(saved.releaseDate,null);
 assert.deepEqual(saved.skills.find(s=>s.kind==='special').damage,[{low:180,high:300,target:'all'}]);assert.match(saved.source,/oldid=300001/);
 assert.match(saved.image,/images\.puella-magi\.net/);
 wikiReply(mock,pages);const again=await (await call('refresh_kioku_catalog')).json();assert.deepEqual(again.result.structuredContent.added,[]);assert.deepEqual(again.result.structuredContent.updated,[]);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM public_updates WHERE key LIKE 'kioku:%'").first()).n,1);
 const readback=await (await call('get_publication_state')).json();assert.equal(readback.result.structuredContent.kiokus.length,116);assert.equal(readback.result.structuredContent.catalogCheck.count,116);
 mock.assertNoPendingInterceptors();
});
test('incomplete catalogs, invalid stats and missing images preserve the last saved characters',async t=>{
 const {mock,call,state}=await setup(t);const original=(await state()).kiokus;
 wikiReply(mock,unchangedPages().slice(0,10));assert.equal((await (await call('refresh_kioku_catalog')).json()).result.isError,true);assert.deepEqual((await state()).kiokus,original);
 wikiReply(mock,[...unchangedPages(),wikiPage('99990101',{hp_max:'unknown'})]);const invalid=await (await call('refresh_kioku_catalog')).json();assert.equal(invalid.result.structuredContent.added.length,0);assert.match(invalid.result.structuredContent.failures[0],/INCOMPLETE_STATS/);assert.deepEqual((await state()).kiokus,original);
 wikiReply(mock,unchangedPages(),503);assert.equal((await (await call('refresh_kioku_catalog')).json()).result.isError,true);assert.deepEqual((await state()).kiokus,original);
 mock.assertNoPendingInterceptors();
});
test('the existing daily completion tool refreshes the catalog and reports failures without losing news or signatures',async t=>{
 const {mock,call,state}=await setup(t);wikiReply(mock,unchangedPages());
 const result=await (await call('record_check',{checkedSources:['https://wiki.puella-magi.net/Category:Magia_Exedra_Kioku_by_ID'],failures:[]})).json();
 assert.equal(result.result.structuredContent.catalog.count,115);assert.deepEqual(result.result.structuredContent.failures,[]);
 const first=await state();assert.ok(first.lastCheck);assert.equal(first.catalogCheck.count,115);assert.equal(first.articles.length,3);assert.deepEqual(first.petition,initialPetition);
 // A duplicate completion in the same day does not fetch or rewrite unchanged catalog entries.
 const again=await (await call('record_check',{checkedSources:[],failures:[]})).json();assert.equal(again.result.structuredContent.catalog.checkedAt,first.catalogCheck.checkedAt);
 mock.assertNoPendingInterceptors();
});
