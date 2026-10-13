import { getRawDb } from '@/db';
import { accountUser, requireSameOrigin } from '@/lib/account-auth';
import { isListId } from '@/lib/tier-list-model';
import { personalTierLists, savePersonalTierList, deletePersonalTierList } from '@/lib/tier-list-store';
const reply = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
function failure(error: unknown) {
  const code = error instanceof Error ? error.message : 'UNAVAILABLE';
  const status: Record<string, number> = { FORBIDDEN: 403, SIGN_IN_REQUIRED: 401, INVALID_REQUEST: 400, NOT_FOUND: 404, CONFLICT: 409, LIMIT_REACHED: 409 };
  return reply({ error: code in status ? code : 'UNAVAILABLE' }, status[code] || 503);
}
export async function GET(request: Request) {
  try {
    const user = await accountUser(request);
    if (!user) return reply({ error: 'SIGN_IN_REQUIRED' }, 401);
    return reply({ lists: await personalTierLists(getRawDb(), user.id) });
  } catch (error) { return failure(error); }
}
async function body(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') || 0) > 40000) throw new Error('INVALID_REQUEST');
  const text = await request.text();
  if (text.length > 40000) throw new Error('INVALID_REQUEST');
  let value: unknown; try { value = JSON.parse(text); } catch { throw new Error('INVALID_REQUEST'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_REQUEST');
  return value as Record<string, unknown>;
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await accountUser(request);
    if (!user) return reply({ error: 'SIGN_IN_REQUIRED' }, 401);
    return reply({ list: await savePersonalTierList(getRawDb(), user.id, await body(request)) });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await accountUser(request);
    if (!user) return reply({ error: 'SIGN_IN_REQUIRED' }, 401);
    const value = await body(request);
    if (!isListId(value.id) || !Number.isInteger(value.revision) || Number(value.revision) < 0) throw new Error('INVALID_REQUEST');
    await deletePersonalTierList(getRawDb(), user.id, { id: value.id, revision: Number(value.revision) });
    return reply({ deleted: true });
  } catch (error) { return failure(error); }
}
