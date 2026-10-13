import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Use the same workerd runtime as deployment, not Node's fetch implementation.
const require = createRequire(import.meta.resolve("wrangler"));
const { Miniflare, createFetchMock } = require("miniflare");
const { build } = require("esbuild");
const root = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://magia.test";
const clientId = "worker-test-client";
const { outputFiles } = await build({
  stdin: {
    contents: `
      import { GET, POST } from "./app/api/auth/google/route";
      import { accountUser } from "./lib/account-auth";
      import { GET as accountGet, POST as accountPost } from "./app/api/account/route";
      export default { async fetch(request) {
        if (new URL(request.url).pathname === "/api/account") {
          return request.method === "POST" ? accountPost(request) : accountGet(request);
        }
        if (new URL(request.url).pathname === "/session") {
          return Response.json(await accountUser(request));
        }
        return request.method === "POST" ? POST(request) : GET();
      }};
    `,
    resolveDir: root,
    loader: "ts",
  },
  absWorkingDir: root,
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["cloudflare:workers"],
  write: false,
});
const script = outputFiles[0].text;
const pair = await crypto.subtle.generateKey({
  name: "RSASSA-PKCS1-v1_5", modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256",
}, true, ["sign", "verify"]);
const key = { ...await crypto.subtle.exportKey("jwk", pair.publicKey), kid: "worker-test-key", alg: "RS256" };
const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
async function credential(nonce, subject = "worker-test-user") {
  const now = Math.floor(Date.now() / 1000);
  const content = encode({ alg: "RS256", kid: key.kid }) + "." + encode({
    iss: "https://accounts.google.com", sub: subject, aud: clientId,
    nonce, iat: now, exp: now + 600, email_verified: true,
  });
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(content));
  return content + "." + Buffer.from(signature).toString("base64url");
}
async function worker(t, status = 200) {
  const fetchMock = createFetchMock();
  fetchMock.disableNetConnect();
  fetchMock.get("https://www.googleapis.com")
    .intercept({ path: "/oauth2/v3/certs", method: "GET" })
    .reply(status, status === 200 ? JSON.stringify({ keys: [key] }) : "", {
      headers: status === 200 ? { "content-type": "application/json" } : { location: "https://untrusted.test/keys" },
    }).persist();
  const mf = new Miniflare({
    modules: true,
    compatibilityDate: "2026-05-15",
    script,
    bindings: { GOOGLE_CLIENT_ID: clientId },
    d1Databases: ["DB"],
    fetchMock,
  });
  t.after(() => mf.dispose());
  const db = await mf.getD1Database("DB");
  const migrations = new URL("../drizzle/", import.meta.url);
  const statements = readdirSync(migrations).filter(file => file.endsWith(".sql")).sort()
    .flatMap(file => readFileSync(new URL(file, migrations), "utf8").split("--> statement-breakpoint"))
    .map(sql => sql.trim()).filter(Boolean).map(sql => db.prepare(sql));
  await db.batch(statements);
  async function challenge() {
    const response = await mf.dispatchFetch(origin + "/api/auth/google");
    assert.equal(response.status, 200);
    const config = await response.json();
    assert.equal(config.clientId, clientId);
    assert.match(response.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
    return config.nonce;
  }
  async function signIn(nonce, token, requestOrigin = origin) {
    return mf.dispatchFetch(origin + "/api/auth/google", {
      method: "POST",
      headers: { origin: requestOrigin, cookie: "__Host-magia_nonce=" + nonce, "content-type": "application/json" },
      body: JSON.stringify({ credential: token }),
    });
  }
  return { mf, db, fetchMock, challenge, signIn };
}

test("deployed runtime verifies Google keys, creates a D1 session and rejects nonce replay", async t => {
  const { mf, db, fetchMock, challenge, signIn } = await worker(t);
  const nonce = await challenge(), token = await credential(nonce);
  const response = await signIn(nonce, token);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { signedIn: true });
  const cookies = response.headers.getSetCookie();
  const sessionCookie = cookies.find(value => value.startsWith("__Host-magia_session="));
  assert.match(sessionCookie, /HttpOnly; Secure; SameSite=Lax/);
  assert.ok(cookies.some(value => value.startsWith("__Host-magia_nonce=;") && value.includes("Max-Age=0")));
  const session = await mf.dispatchFetch(origin + "/session", { headers: { cookie: sessionCookie.split(";")[0] } });
  const user = await session.json();
  assert.equal(typeof user.id, "string");
  assert.ok(!("google_sub" in user) && !("email" in user));
  assert.equal((await signIn(nonce, token)).status, 400);
  assert.equal((await signIn(nonce, token, "https://untrusted.test")).status, 403);
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM sessions").first()).n, 1);
  fetchMock.assertNoPendingInterceptors();
});

test("deployed runtime refuses redirected Google key responses without creating a session", async t => {
  const { db, fetchMock, challenge, signIn } = await worker(t, 302);
  const nonce = await challenge();
  const response = await signIn(nonce, await credential(nonce));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "SIGN_IN_FAILED" });
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM sessions").first()).n, 0);
  fetchMock.assertNoPendingInterceptors();
});

test("Kioku favorites and notes persist through Google sessions with account isolation", async t => {
  const { mf, challenge, signIn } = await worker(t);
  async function cookieFor(subject) {
    const nonce = await challenge();
    const response = await signIn(nonce, await credential(nonce, subject));
    assert.equal(response.status, 200);
    return response.headers.getSetCookie().find(value => value.startsWith("__Host-magia_session=")).split(";")[0];
  }
  const first = await cookieFor("catalog-user-a");
  async function save(body, cookie = first, requestOrigin = origin) {
    return mf.dispatchFetch(origin + "/api/account", { method: "POST", headers: { cookie, origin: requestOrigin, "content-type": "application/json" }, body: JSON.stringify(body) });
  }
  const favorite = { action: "favorite", kind: "kioku", itemId: "10010701", saved: true };
  assert.equal((await save(favorite)).status, 200);
  assert.equal((await save(favorite)).status, 200);
  assert.equal((await save({ action: "favorite", kind: "character", itemId: "madoka", saved: true })).status, 200);
  assert.equal((await save({ action: "note", characterId: "10010701", kioku: "Pluvia☆Magica", portrait: "My portrait", notes: "Team A" })).status, 200);
  assert.equal((await save({ action: "note", characterId: "madoka", kioku: "Old favorite", portrait: "", notes: "Existing note" })).status, 200);
  assert.equal((await save({ ...favorite, itemId: "unknown" })).status, 400);
  assert.equal((await save(favorite, first, "https://untrusted.test")).status, 403);
  assert.equal((await save(favorite, "")).status, 401);
  const restored = await cookieFor("catalog-user-a");
  const account = await (await mf.dispatchFetch(origin + "/api/account", { headers: { cookie: restored } })).json();
  assert.equal(account.favorites.length, 2);
  assert.equal(account.notes.length, 2);
  assert.equal(account.notes.find(note => note.characterId === "10010701").notes, "Team A");
  const other = await cookieFor("catalog-user-b");
  const isolated = await (await mf.dispatchFetch(origin + "/api/account", { headers: { cookie: other } })).json();
  assert.deepEqual(isolated.favorites, []);
  assert.deepEqual(isolated.notes, []);
  assert.equal((await save({ ...favorite, saved: false })).status, 200);
  assert.equal((await save({ action: "delete-note", characterId: "10010701" })).status, 200);
  const remaining = await (await mf.dispatchFetch(origin + "/api/account", { headers: { cookie: first } })).json();
  assert.deepEqual(remaining.favorites.map(item => item.kind), ["character"]);
  assert.deepEqual(remaining.notes.map(item => item.characterId), ["madoka"]);
});
