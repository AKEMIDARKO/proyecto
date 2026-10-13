import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { completeGoogleIdentity } from '../lib/account-sessions.ts';
import { randomToken, tokenHash } from '../lib/auth-crypto.ts';
import { newGoal } from '../lib/tool-model.ts';
import { kiokus } from '../lib/kioku-catalog.ts';
const require=createRequire(import.meta.resolve('wrangler')),{Miniflare}=require('miniflare'),{build}=require('esbuild');
const root=fileURLToPath(new URL('../',import.meta.url)),origin='https://magia.test';
const {outputFiles}=await build({stdin:{contents:`
 import * as planner from './app/api/planner/route';
 import * as achievements from './app/api/achievements/route';
 import * as ranking from './app/api/ranking/route';
 import * as support from './app/api/support/route';
 import {POST as mcp} from './app/mcp/route';
 import * as account from './app/api/account/route';
 const routes={'/api/planner':planner,'/api/achievements':achievements,'/api/ranking':ranking,'/api/support':support};
 export default {fetch(request){const path=new URL(request.url).pathname;if(path==='/mcp')return mcp(request);if(path==='/api/account')return account[request.method](request);return routes[path][request.method](request);}};
`,resolveDir:root,loader:'ts'},absWorkingDir:root,bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers'],write:false});
async function worker(t){
 const mf=new Miniflare({modules:true,compatibilityDate:'2026-05-15',script:outputFiles[0].text,d1Databases:['DB'],bindings:{CONTENT_EDITOR_EMAIL:'owner@magia.test'}});t.after(()=>mf.dispose());const db=await mf.getD1Database('DB');
 for(const migration of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())await db.batch(readFileSync(new URL('../drizzle/'+migration,import.meta.url),'utf8').split('--> statement-breakpoint').filter(s=>s.trim()).map(s=>db.prepare(s.trim())));
 const signIn=async(subject)=>{const nonce=randomToken();await db.prepare('INSERT INTO auth_challenges (hash,expires_at) VALUES (?,?)').bind(await tokenHash(nonce),Date.now()+600000).run();return '__Host-magia_session='+(await completeGoogleIdentity(db,subject,nonce)).session;};
 const request=(path,method='GET',cookie='',body,options={})=>mf.dispatchFetch(origin+path,{method,headers:{cookie,origin:options.origin||origin,'content-type':'application/json',...options.headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const json=async(path,cookie='')=>{const r=await request(path,'GET',cookie);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/private, no-store/);return r.json();};
 return{db,signIn,request,json};
}
const buildDraft=(extra={})=>({id:crypto.randomUUID(),revision:-1,kiokuId:'10010701',title:'Mi Madoka',level:100,magic:120,ascension:1,portraitId:'a-close-friend',hp:12000,atk:5000,def:1000,speed:105,notes:'Manual y verificada por su autora',publish:true,...extra});
const report=(extra={})=>({id:crypto.randomUUID(),kind:'bug',title:'No funciona el enlace',body:'He abierto la ficha y el enlace no funciona.',page:'/es/characters/',language:'es',public:true,...extra});

test('new persisted Kioku work in favorites, notes, private collection and public builds',async t=>{
 const {db,signIn,request,json}=await worker(t),owner=await signIn('future-roster'),other=await signIn('future-other');
 const unit={...kiokus[0],id:'99990101',name:'Future test unit'};
 await db.prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?)').bind('kioku:'+unit.id,JSON.stringify(unit),new Date().toISOString()).run();
 for(const body of [{action:'favorite',kind:'kioku',itemId:unit.id,saved:true},{action:'note',characterId:unit.id,kioku:unit.kioku,portrait:'',notes:'Future catalog note'}])assert.equal((await request('/api/account','POST',owner,body)).status,200);
 const goal=newGoal(unit.id,[unit]);assert.equal((await request('/api/planner','POST',owner,{revision:-1,entries:[goal],inventory:{}})).status,200);
 assert.equal((await json('/api/planner',await signIn('future-roster'))).plan.entries[0].kiokuId,unit.id);
 assert.deepEqual((await json('/api/planner',other)).plan.entries,[]);
 const profile=await json('/api/account',owner);assert.equal(profile.favorites[0].itemId,unit.id);assert.equal(profile.notes[0].characterId,unit.id);
 assert.deepEqual((await json('/api/account',other)).favorites,[]);
 assert.equal((await request('/api/ranking','POST',owner,buildDraft({kiokuId:unit.id}))).status,200);
 assert.equal((await json('/api/ranking?kioku='+unit.id)).cards[0].kiokuId,unit.id);
 assert.equal((await request('/api/ranking?kioku=99999999')).status,400);
});

test('collection goals and shared inventory restore with Google; origin, ownership and concurrent revisions are enforced',async t=>{
 const {signIn,request,json}=await worker(t),owner=await signIn('planner-a'),other=await signIn('planner-b');
 assert.equal((await request('/api/planner')).status,401);assert.equal((await request('/api/planner','POST','',{entries:[]})).status,401);
 const initial=(await json('/api/planner',owner)).plan;assert.equal(initial.revision,-1);
 const draft={...initial,entries:[newGoal('10010701')],inventory:{'magia-book-small':12,'style-ticket':2}};
 assert.equal((await request('/api/planner','POST',owner,draft,{origin:'https://evil.test'})).status,403);
 const saved=await request('/api/planner','POST',owner,draft);assert.equal(saved.status,200);assert.equal((await saved.json()).plan.revision,0);
 assert.equal((await request('/api/planner','POST',owner,draft)).status,409);
 const restored=(await json('/api/planner',await signIn('planner-a'))).plan;assert.deepEqual(restored.entries,draft.entries);assert.deepEqual(restored.inventory,draft.inventory);
 assert.deepEqual((await json('/api/planner',other)).plan.entries,[]);
 assert.equal((await request('/api/planner','POST',owner,{...restored,inventory:{'not-a-material':2}})).status,400);
 assert.equal((await request('/api/planner','POST',owner,{...restored,entries:[draft.entries[0],draft.entries[0]]})).status,400);
});
test('Steam progress is private and idempotent; a second session restores marks and unknown achievements are rejected',async t=>{
 const {signIn,request,json}=await worker(t),owner=await signIn('steam-a'),other=await signIn('steam-b'),body={id:'tutorial-ace',completed:true};
 assert.deepEqual((await json('/api/achievements')).completed,[]);
 assert.equal((await request('/api/achievements','POST','',body)).status,401);
 assert.equal((await request('/api/achievements','POST',owner,body,{origin:'https://evil.test'})).status,403);
 for(let i=0;i<2;i++)assert.equal((await request('/api/achievements','POST',owner,body)).status,200);
 assert.deepEqual((await json('/api/achievements',await signIn('steam-a'))).completed,['tutorial-ace']);assert.deepEqual((await json('/api/achievements',other)).completed,[]);
 assert.equal((await request('/api/achievements','POST',owner,{...body,id:'fictional'})).status,400);
 assert.equal((await request('/api/achievements','POST',owner,{...body,completed:false})).status,200);assert.deepEqual((await json('/api/achievements',owner)).completed,[]);
});
test('public builds require explicit publication; votes are unique and private ownership and revision checks protect edits',async t=>{
 const {signIn,request,json}=await worker(t),owner=await signIn('rank-a'),other=await signIn('rank-b'),draft=buildDraft();
 assert.equal((await request('/api/ranking','POST','',draft)).status,401);assert.equal((await request('/api/ranking','POST',owner,{...draft,publish:false})).status,400);
 assert.equal((await request('/api/ranking','POST',owner,draft)).status,200);
 assert.equal((await request('/api/ranking','POST',owner,buildDraft())).status,409,'one build per player and Kioku');
 const publicCard=(await json('/api/ranking')).cards[0];assert.ok(publicCard.nickname);assert.equal(publicCard.mine,false);for(const key of ['user_id','google_sub','email'])assert.ok(!(key in publicCard));
 const mine=(await json('/api/ranking',owner)).cards[0];assert.equal(mine.mine,true);
 assert.equal((await request('/api/ranking','POST',owner,{action:'vote',id:draft.id,voted:true})).status,400);
 for(let i=0;i<2;i++)assert.equal((await request('/api/ranking','POST',other,{action:'vote',id:draft.id,voted:true})).status,200);
 assert.equal((await json('/api/ranking',other)).cards[0].votes,1);assert.equal((await json('/api/ranking',other)).cards[0].voted,true);
 assert.equal((await request('/api/ranking','POST',other,{...mine,publish:true})).status,404);
 assert.equal((await request('/api/ranking','POST',owner,{...mine,title:'Actualizada',publish:true})).status,200);
 assert.equal((await request('/api/ranking','POST',owner,{...mine,title:'Antigua',publish:true})).status,409);
 assert.equal((await json('/api/ranking')).cards[0].votes,1);
 assert.equal((await request('/api/ranking','DELETE',other,{id:draft.id,revision:1})).status,404);
 assert.equal((await request('/api/ranking','DELETE',owner,{id:draft.id,revision:0})).status,409);
 assert.equal((await request('/api/ranking','DELETE',owner,{id:draft.id,revision:1})).status,200);assert.deepEqual((await json('/api/ranking')).cards,[]);
});
test('support keeps bodies and contacts private, deduplicates retries, rate limits, and allows only the owner to answer',async t=>{
 const {signIn,request,json}=await worker(t),owner=await signIn('support-a'),other=await signIn('support-b'),body=report();
 assert.equal((await request('/api/support','POST','',body)).status,401);assert.equal((await request('/api/support','POST',owner,body,{origin:'https://evil.test'})).status,403);
 for(let i=0;i<2;i++)assert.equal((await request('/api/support','POST',owner,body)).status,200);
 let list=await json('/api/support');assert.equal(list.entries.length,1);assert.ok(!('body'in list.entries[0]));assert.ok(!('reply'in list.entries[0]));assert.deepEqual(list.mine,[]);
 assert.equal((await json('/api/support',other)).mine.length,0);assert.equal((await json('/api/support',owner)).mine[0].body,body.body);
 assert.equal((await request('/api/support','POST',owner,{...body,body:'Different message body'})).status,409);
 assert.equal((await request('/api/support','POST',other,body)).status,404);
 assert.equal((await request('/api/support','POST',owner,report({kind:'contact',public:true}))).status,400);
 const contact=report({kind:'contact',public:false,title:'Un mensaje privado'});assert.equal((await request('/api/support','POST',owner,contact)).status,200);
 assert.deepEqual((await json('/api/support?kind=contact')).entries,[]);assert.equal((await json('/api/support?kind=contact',owner)).mine[0].title,contact.title);
 const rpc=(name,args={})=>({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}}),headers={'oai-authenticated-user-id':'site-owner','oai-authenticated-user-email':'owner@magia.test'};
 assert.equal((await request('/mcp','POST','',rpc('get_support_inbox'))).status,403);
 assert.equal((await request('/mcp','POST','',rpc('get_support_inbox'),{headers:{...headers,'oai-authenticated-user-email':'visitor@magia.test'}})).status,403);
 const inbox=await request('/mcp','POST','',rpc('get_support_inbox'),{headers});assert.equal(inbox.status,200);assert.equal((await inbox.json()).result.structuredContent.requests.length,2);
 const answered=await request('/mcp','POST','',rpc('answer_support_request',{id:body.id,status:'resolved',reply:'El enlace ya está corregido.'}),{headers});assert.equal((await answered.json()).result.isError,undefined);
 assert.equal((await json('/api/support',owner)).mine.find(r=>r.id===body.id).reply,'El enlace ya está corregido.');assert.equal((await json('/api/support')).entries[0].status,'resolved');
 for(let i=0;i<8;i++)assert.equal((await request('/api/support','POST',owner,report({public:false}))).status,200);
 assert.equal((await request('/api/support','POST',owner,report())).status,429);assert.equal((await request('/api/support','POST',owner,body)).status,200,'retry an existing request even after the daily limit');
});
test('deleting an account removes its new private progress, builds, votes and messages without deleting other players',async t=>{
 const {db,signIn,request,json}=await worker(t),owner=await signIn('delete-a'),other=await signIn('delete-b');
 assert.equal((await request('/api/planner','POST',owner,{revision:-1,entries:[newGoal('10010701')],inventory:{}})).status,200);
 assert.equal((await request('/api/achievements','POST',owner,{id:'tutorial-ace',completed:true})).status,200);
 const a=buildDraft(),b=buildDraft({kiokuId:'10020701'});assert.equal((await request('/api/ranking','POST',owner,a)).status,200);assert.equal((await request('/api/ranking','POST',other,b)).status,200);
 for(const [cookie,id] of [[owner,b.id],[other,a.id]])assert.equal((await request('/api/ranking','POST',cookie,{action:'vote',id,voted:true})).status,200);
 assert.equal((await request('/api/support','POST',owner,report())).status,200);
 const removed=await request('/api/account','DELETE',owner);assert.equal(removed.status,200);
 for(const table of ['growth_plans','achievement_progress','showcase_votes','support_requests'])assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM '+table).first()).n,0,table);
 assert.equal((await json('/api/ranking')).cards.length,1);assert.equal((await json('/api/ranking')).cards[0].kiokuId,b.kiokuId);assert.equal((await request('/api/planner','GET',owner)).status,401);
});
