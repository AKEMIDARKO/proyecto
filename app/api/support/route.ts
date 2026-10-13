import { getRawDb } from '@/db';
import { accountUser,requireSameOrigin } from '@/lib/account-auth';
import { toolReply,toolFailure,toolBody } from '@/lib/tool-api';
import { readSupport,saveSupport } from '@/lib/tool-store';
export async function GET(request:Request){try{const kind=new URL(request.url).searchParams.get('kind')||'bug';if(!['bug','contact'].includes(kind))throw Error('INVALID_REQUEST');const user=await accountUser(request);return toolReply({user:user?{nickname:user.nickname}:null,...await readSupport(getRawDb(),user?.id||null,kind)});}catch(e){return toolFailure(e);}}
export async function POST(request:Request){try{requireSameOrigin(request);const user=await accountUser(request);if(!user)return toolReply({error:'SIGN_IN_REQUIRED'},401);return toolReply({request:await saveSupport(getRawDb(),user.id,await toolBody(request,14000))});}catch(e){return toolFailure(e);}}
