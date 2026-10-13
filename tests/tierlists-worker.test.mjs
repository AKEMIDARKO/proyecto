import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { completeGoogleIdentity } from '../lib/account-sessions.ts';
import { randomToken, tokenHash } from '../lib/auth-crypto.ts';
import { kiokus } from '../lib/kioku-catalog.ts';

const require = createRequire(import.meta.resolve('wrangler'));
const { Miniflare } = require('miniflare');
const { build } = require('esbuild');
const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://magia.test';
const { outputFiles } = await build({
  stdin: { contents: `
    import { GET, POST, DELETE } from './app/api/tierlists/route';
    import { DELETE as deleteAccount } from './app/api/account/route';
    export default { fetch(request) {
      if (new URL(request.url).pathname === '/api/account') return deleteAccount(request);
      return request.method === 'POST' ? POST(request) : request.method === 'DELETE' ? DELETE(request) : GET(request);
    }};
  `, resolveDir: root, loader: 'ts' },
  absWorkingDir: root, bundle: true, format: 'esm', platform: 'neutral',
  external: ['cloudflare:workers'], write: false,
});
async function worker(t) {
  const mf = new Miniflare({ modules: true, compatibilityDate: '2026-05-15', script: outputFiles[0].text, d1Databases: ['DB'] });
  t.after(() => mf.dispose());
  const db = await mf.getD1Database('DB');
  for (const migration of ['0000_even_master_mold.sql', '0001_elite_blue_marvel.sql', '0002_typical_elektra.sql']) {
    const sql = readFileSync(new URL('../drizzle/' + migration, import.meta.url), 'utf8');
    await db.batch(sql.split('--> statement-breakpoint').filter(s => s.trim()).map(s => db.prepare(s.trim())));
  }
  async function signIn(subject) {
    const nonce = randomToken();
    await db.prepare('INSERT INTO auth_challenges (hash, expires_at) VALUES (?, ?)').bind(await tokenHash(nonce), Date.now() + 600000).run();
    const identity = await completeGoogleIdentity(db, subject, nonce);
    return '__Host-magia_session=' + identity.session;
  }
  const request = (method, cookie, body, options = {}) => mf.dispatchFetch(origin + (options.path || '/api/tierlists'), {
    method, headers: { cookie, origin: options.origin || origin, 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  async function lists(cookie) {
    const response = await request('GET', cookie);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /private, no-store/);
    return (await response.json()).lists;
  }
  return { mf, db, signIn, request, lists };
}
const draft = (overrides = {}) => ({ id: crypto.randomUUID(), revision: -1, title: 'Mi clasificación', kind: 'characters', entries: [{ id: '10010701', tier: 'S+' }], ...overrides });
const team = (overrides = {}) => ({ id: crypto.randomUUID(), name: 'Equipo oscuro', tier: 'A', members: ['11460101', '11380101', '10220101', '10020701', '11250101'], ...overrides });

test('personal rankings accept new persisted characters and team members while staying private',async t=>{
 const {db,signIn,request,lists}=await worker(t),owner=await signIn('future-tier-owner'),other=await signIn('future-tier-other');
 const unit={...kiokus[0],id:'99990101'};
 await db.prepare('INSERT INTO public_updates (key,value_json,updated_at) VALUES (?,?,?)').bind('kioku:'+unit.id,JSON.stringify(unit),new Date().toISOString()).run();
 for(const body of [draft({entries:[{id:unit.id,tier:'S'}]}),draft({kind:'teams',entries:[team({members:[unit.id]})]})])assert.equal((await request('POST',owner,body)).status,200);
 assert.equal((await lists(await signIn('future-tier-owner'))).length,2);assert.deepEqual(await lists(other),[]);
});

test('character and team lists restore through a second Google session and remain private to their owner', async t => {
  const { signIn, request, lists } = await worker(t);
  const first = await signIn('tier-owner-a'), other = await signIn('tier-owner-b');
  assert.equal((await request('GET', '')).status, 401);
  assert.equal((await request('POST', '', draft())).status, 401);
  assert.equal((await request('POST', first, draft(), { origin: 'https://untrusted.test' })).status, 403);
  const characters = draft(), teams = draft({ title: 'Mis equipos', kind: 'teams', entries: [team()] });
  for (const list of [characters, teams]) assert.equal((await request('POST', first, list)).status, 200);
  const restored = await signIn('tier-owner-a');
  const saved = await lists(restored);
  assert.equal(saved.length, 2);
  assert.deepEqual(saved.find(x => x.id === characters.id).entries, characters.entries);
  assert.deepEqual(saved.find(x => x.id === teams.id).entries, teams.entries);
  assert.ok(saved.every(x => !('user_id' in x) && !('google_sub' in x)));
  assert.deepEqual(await lists(other), []);
  for (const list of saved) {
    assert.equal((await request('POST', other, { ...list, title: 'Cambio ajeno' })).status, 404);
    assert.equal((await request('DELETE', other, { id: list.id, revision: list.revision })).status, 404);
  }
  assert.equal((await lists(first)).length, 2);
});

test('simultaneous devices cannot overwrite each other or delete a newer version', async t => {
  const { signIn, request, lists } = await worker(t);
  const first = await signIn('tier-concurrent'), second = await signIn('tier-concurrent');
  const saved = (await (await request('POST', first, draft())).json()).list;
  const attempts = await Promise.all([
    request('POST', first, { ...saved, title: 'Primera edición' }),
    request('POST', second, { ...saved, title: 'Segunda edición' }),
  ]);
  assert.deepEqual(attempts.map(r => r.status).sort(), [200, 409]);
  const accepted = (await attempts.find(r => r.status === 200).json()).list;
  assert.equal(accepted.revision, 1);
  assert.equal((await request('DELETE', first, { id: saved.id, revision: 0 })).status, 409);
  assert.deepEqual((await lists(second))[0], accepted);
  assert.equal((await request('DELETE', second, { id: accepted.id, revision: 1 })).status, 200);
  assert.deepEqual(await lists(first), []);
});

test('invalid entries are rejected, retries are idempotent, and the twenty-list limit is enforced', async t => {
  const { signIn, request, lists } = await worker(t);
  const cookie = await signIn('tier-validation');
  for (const invalid of [
    draft({ entries: [{ id: 'unknown', tier: 'A' }] }),
    draft({ entries: [{ id: '10010701', tier: 'SSS' }] }),
    draft({ entries: [{ id: '10010701', tier: 'A' }, { id: '10010701', tier: 'B' }] }),
    draft({ title: ' ' }),
    draft({ kind: 'teams', entries: [team({ members: [] })] }),
    draft({ kind: 'teams', entries: [team({ members: ['10010701', '10010701'] })] }),
    draft({ kind: 'teams', entries: [team({ members: [...team().members, '10010701'] })] }),
    draft({ kind: 'teams', entries: [team({ name: '\uFB03'.repeat(21) })] }),
  ]) assert.equal((await request('POST', cookie, invalid)).status, 400);
  assert.deepEqual(await lists(cookie), []);
  const value = draft();
  const one = (await (await request('POST', cookie, value)).json()).list;
  const retry = (await (await request('POST', cookie, value)).json()).list;
  assert.deepEqual(retry, one);
  assert.equal((await lists(cookie)).length, 1);
  assert.equal((await request('POST', cookie, { ...value, title: 'Otra creación con la misma ID' })).status, 409);
  for (let i = 1; i < 20; i++) assert.equal((await request('POST', cookie, draft({ title: 'Lista ' + i }))).status, 200);
  assert.equal((await lists(cookie)).length, 20);
  const overflow = await request('POST', cookie, draft());
  assert.equal(overflow.status, 409);
  assert.deepEqual(await overflow.json(), { error: 'LIMIT_REACHED' });
  assert.equal((await request('DELETE', cookie, { id: one.id, revision: one.revision })).status, 200);
  assert.equal((await request('POST', cookie, draft())).status, 200);
});

test('deleting an account removes its personal lists and sessions while keeping other accounts intact', async t => {
  const { signIn, request, lists, db } = await worker(t);
  const a = await signIn('tier-delete-a'), b = await signIn('tier-delete-b');
  assert.equal((await request('POST', a, draft())).status, 200);
  assert.equal((await request('POST', b, draft({ title: 'Conservar' }))).status, 200);
  assert.equal((await request('DELETE', a, undefined, { path: '/api/account' })).status, 200);
  assert.equal((await request('GET', a)).status, 401);
  assert.deepEqual((await lists(b)).map(x => x.title), ['Conservar']);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM personal_tier_lists').first()).n, 1);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM sessions').first()).n, 1);
});
