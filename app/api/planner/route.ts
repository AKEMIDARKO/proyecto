import { getRawDb } from '@/db';
import { accountUser,requireSameOrigin } from '@/lib/account-auth';
import { toolReply,toolFailure,toolBody } from '@/lib/tool-api';
import { readPlan,savePlan } from '@/lib/tool-store';
export async function GET(request:Request){try{const user=await accountUser(request);if(!user)return toolReply({error:'SIGN_IN_REQUIRED'},401);return toolReply({user:{nickname:user.nickname},plan:await readPlan(getRawDb(),user.id)});}catch(e){return toolFailure(e);}}
export async function POST(request:Request){try{requireSameOrigin(request);const user=await accountUser(request);if(!user)return toolReply({error:'SIGN_IN_REQUIRED'},401);return toolReply({plan:await savePlan(getRawDb(),user.id,await toolBody(request,350000))});}catch(e){return toolFailure(e);}}
