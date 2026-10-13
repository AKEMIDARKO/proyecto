import { getRawDb } from '@/db';
import { accountUser,requireSameOrigin } from '@/lib/account-auth';
import { toolReply,toolFailure,toolBody } from '@/lib/tool-api';
import { readShowcase,saveShowcase,deleteShowcase,voteShowcase } from '@/lib/tool-store';
import { readKiokus } from '@/lib/kioku-store';
export async function GET(request:Request){try{
  const kiokus=await readKiokus(getRawDb());
  const user=await accountUser(request),url=new URL(request.url),unit=url.searchParams.get('kioku')||'',order=url.searchParams.get('order')||'votes',offset=Number(url.searchParams.get('offset')||0);
  if((unit&&!kiokus.some(u=>u.id===unit))||!['votes','newest'].includes(order)||!Number.isInteger(offset)||offset<0||offset>100000)throw Error('INVALID_REQUEST');
  return toolReply({user:user?{nickname:user.nickname}:null,cards:await readShowcase(getRawDb(),user?.id||null,unit,order,offset)});
}catch(e){return toolFailure(e);}}
export async function POST(request:Request){try{requireSameOrigin(request);const user=await accountUser(request);if(!user)return toolReply({error:'SIGN_IN_REQUIRED'},401);const a=await toolBody(request,12000);return toolReply(a.action==='vote'?await voteShowcase(getRawDb(),user.id,a.id,a.voted):{card:await saveShowcase(getRawDb(),user.id,a)});}catch(e){return toolFailure(e);}}
export async function DELETE(request:Request){try{requireSameOrigin(request);const user=await accountUser(request);if(!user)return toolReply({error:'SIGN_IN_REQUIRED'},401);const a=await toolBody(request,1000);await deleteShowcase(getRawDb(),user.id,a.id,a.revision);return toolReply({deleted:true});}catch(e){return toolFailure(e);}}
