import { emptyPlan,plan,showcase,isId,bounded,clean,type GrowthPlan,type ShowcaseCard,type SupportEntry } from './tool-model.ts';
import { isLang } from './locales.ts';
import { readKiokus } from './kioku-store.ts';
export async function readPlan(db:D1Database,userId:string):Promise<GrowthPlan>{
  const row=await db.prepare('SELECT plan_json,revision,updated_at FROM growth_plans WHERE user_id=?').bind(userId).first<{plan_json:string;revision:number;updated_at:number}>();
  return row?{...JSON.parse(row.plan_json),revision:row.revision,updatedAt:row.updated_at}:{...emptyPlan};
}
export async function savePlan(db:D1Database,userId:string,input:unknown):Promise<GrowthPlan>{
  const value=plan(input,await readKiokus(db)),data=JSON.stringify({entries:value.entries,inventory:value.inventory}),now=Date.now();
  const result=value.revision===-1?await db.prepare('INSERT INTO growth_plans (user_id,plan_json,revision,updated_at) VALUES (?,?,0,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,data,now).run():await db.prepare('UPDATE growth_plans SET plan_json=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(data,now,userId,value.revision).run();
  if(result.meta.changes!==1)throw Error('CONFLICT');return{...value,revision:value.revision+1,updatedAt:now};
}
export async function readShowcase(db:D1Database,userId:string|null,kiokuId:string,order:string,offset:number){
  const sort=order==='newest'?'b.updated_at DESC,b.id':'votes DESC,b.updated_at DESC,b.id';
  const query=`SELECT b.id,b.user_id,b.build_json,b.revision,b.updated_at,p.nickname,(SELECT COUNT(*) FROM showcase_votes v WHERE v.build_id=b.id) AS votes,EXISTS(SELECT 1 FROM showcase_votes v WHERE v.build_id=b.id AND v.user_id=?) AS voted FROM showcase_builds b JOIN profiles p ON p.id=b.user_id ${kiokuId?'WHERE b.kioku_id=?':''} ORDER BY ${sort} LIMIT 40 OFFSET ?`;
  const params=kiokuId?[userId||'',kiokuId,offset]:[userId||'',offset];
  const {results}=await db.prepare(query).bind(...params).all<{id:string;user_id:string;build_json:string;revision:number;updated_at:number;nickname:string;votes:number;voted:number}>();
  return results.map(row=>({...JSON.parse(row.build_json),id:row.id,revision:row.revision,nickname:row.nickname,votes:row.votes,mine:row.user_id===userId,voted:!!row.voted,updatedAt:row.updated_at})) as ShowcaseCard[];
}
export async function saveShowcase(db:D1Database,userId:string,input:unknown){
  const value=showcase(input,await readKiokus(db)),now=Date.now(),json=JSON.stringify(value);
  if(value.revision===-1){
    const result=await db.prepare('INSERT INTO showcase_builds (id,user_id,kioku_id,build_json,revision,created_at,updated_at) VALUES (?,?,?,?,0,?,?) ON CONFLICT DO NOTHING').bind(value.id,userId,value.kiokuId,json,now,now).run();
    if(result.meta.changes!==1)throw Error('CONFLICT');
  }else{
    const existing=await db.prepare('SELECT kioku_id FROM showcase_builds WHERE id=? AND user_id=?').bind(value.id,userId).first<{kioku_id:string}>();
    if(!existing)throw Error('NOT_FOUND');if(existing.kioku_id!==value.kiokuId)throw Error('INVALID_REQUEST');
    const result=await db.prepare('UPDATE showcase_builds SET build_json=?,revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND revision=?').bind(json,now,value.id,userId,value.revision).run();if(result.meta.changes!==1)throw Error('CONFLICT');
  }return{...value,revision:value.revision+1,updatedAt:now};
}
export async function deleteShowcase(db:D1Database,userId:string,id:unknown,revision:unknown){
  if(!isId(id))throw Error('INVALID_REQUEST');const version=bounded(revision,0,1000000);
  if(!await db.prepare('SELECT id FROM showcase_builds WHERE id=? AND user_id=?').bind(id,userId).first())throw Error('NOT_FOUND');
  const removed=await db.prepare('DELETE FROM showcase_builds WHERE id=? AND user_id=? AND revision=? RETURNING id').bind(id,userId,version).first<{id:string}>();if(!removed)throw Error('CONFLICT');
}
export async function voteShowcase(db:D1Database,userId:string,id:unknown,voted:unknown){
  if(!isId(id)||typeof voted!=='boolean')throw Error('INVALID_REQUEST');
  const row=await db.prepare('SELECT user_id FROM showcase_builds WHERE id=?').bind(id).first<{user_id:string}>();if(!row)throw Error('NOT_FOUND');if(row.user_id===userId)throw Error('OWN_VOTE');
  if(voted)await db.prepare('INSERT INTO showcase_votes (user_id,build_id,created_at) SELECT ?,id,? FROM showcase_builds WHERE id=? AND user_id<>? ON CONFLICT(user_id,build_id) DO NOTHING').bind(userId,Date.now(),id,userId).run();
  else await db.prepare('DELETE FROM showcase_votes WHERE user_id=? AND build_id=?').bind(userId,id).run();
  const count=await db.prepare('SELECT COUNT(*) AS total FROM showcase_votes WHERE build_id=?').bind(id).first<{total:number}>();return{voted,votes:count?.total||0};
}
type SupportRow={id:string;user_id:string;kind:'bug'|'contact';title:string;body:string;page:string;language:string;public:number;status:SupportEntry['status'];reply:string;created_at:number;updated_at:number};
const supportEntry=(r:SupportRow):SupportEntry=>({id:r.id,kind:r.kind,title:r.title,body:r.body,page:r.page,language:r.language,public:!!r.public,status:r.status,reply:r.reply,createdAt:r.created_at,updatedAt:r.updated_at});
export async function readSupport(db:D1Database,userId:string|null,kind:string){
  const {results:publicRows}=await db.prepare("SELECT id,title,status,created_at,updated_at FROM support_requests WHERE kind='bug' AND public=1 ORDER BY updated_at DESC LIMIT 100").all<SupportRow>();
  const mine=userId?(await db.prepare('SELECT * FROM support_requests WHERE user_id=? AND kind=? ORDER BY updated_at DESC LIMIT 100').bind(userId,kind).all<SupportRow>()).results.map(supportEntry):[];
  const {results:counts}=await db.prepare("SELECT status,COUNT(*) AS total FROM support_requests WHERE kind='bug' AND public=1 GROUP BY status").all<{status:string;total:number}>();
  return{entries:kind==='bug'?publicRows.map(r=>({id:r.id,kind:'bug',title:r.title,status:r.status,createdAt:r.created_at,updatedAt:r.updated_at})):[],mine,counts:Object.fromEntries(counts.map(c=>[c.status,c.total]))};
}
export async function saveSupport(db:D1Database,userId:string,a:Record<string,unknown>){
  if(!isId(a.id)||!['bug','contact'].includes(String(a.kind))||!isLang(a.language)||typeof a.public!=='boolean')throw Error('INVALID_REQUEST');
  const title=clean(a.title,3,120),body=clean(a.body,10,5000),page=clean(a.page,0,300);
  if(page&&(!page.startsWith('/')||page.startsWith('//')||/[\r\n]/.test(page)))throw Error('INVALID_REQUEST');if(a.kind==='contact'&&a.public)throw Error('INVALID_REQUEST');
  const match=(r:SupportRow)=>r.kind===a.kind&&r.title===title&&r.body===body&&r.page===page&&r.language===a.language&&r.public===Number(a.public);
  const previous=await db.prepare('SELECT * FROM support_requests WHERE id=?').bind(a.id).first<SupportRow>();
  if(previous){if(previous.user_id!==userId)throw Error('NOT_FOUND');if(!match(previous))throw Error('CONFLICT');return supportEntry(previous);}
  const now=Date.now();
  const result=await db.prepare("INSERT INTO support_requests (id,user_id,kind,title,body,page,language,public,status,reply,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,'new','',?,? WHERE (SELECT COUNT(*) FROM support_requests WHERE user_id=? AND created_at>?)<10 ON CONFLICT(id) DO NOTHING").bind(a.id,userId,a.kind,title,body,page,a.language,Number(a.public),now,now,userId,now-86400000).run();
  if(result.meta.changes!==1){const existing=await db.prepare('SELECT * FROM support_requests WHERE id=? AND user_id=?').bind(a.id,userId).first<SupportRow>();if(existing&&match(existing))return supportEntry(existing);throw Error('LIMIT_REACHED');}
  return supportEntry((await db.prepare('SELECT * FROM support_requests WHERE id=? AND user_id=?').bind(a.id,userId).first<SupportRow>())!);
}
// Accessible through the existing owner-authenticated Site MCP only.
export async function supportAction(db:D1Database,name:string,input:Record<string,unknown>){
  if(name==='get_support_inbox'){const {results}=await db.prepare('SELECT * FROM support_requests ORDER BY updated_at DESC LIMIT 100').all<SupportRow>();return{requests:results.map(supportEntry)};}
  if(name!=='answer_support_request'||!isId(input.id)||!['new','review','resolved','discarded'].includes(String(input.status)))throw Error('INVALID_REQUEST');
  const reply=clean(input.reply,0,3000);const result=await db.prepare('UPDATE support_requests SET status=?,reply=?,updated_at=? WHERE id=?').bind(input.status,reply,Date.now(),input.id).run();if(result.meta.changes!==1)throw Error('NOT_FOUND');return{updated:true,id:input.id};
}
