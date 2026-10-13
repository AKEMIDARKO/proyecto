import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { appendCloudGuess, cloudGame, cloudHistory, cloudStats, CloudConflict, dailyRecord, importHistory, leaderboard } from "../lib/account-store.ts";
import { makePuzzle, answerFor, pool } from "../lib/madokadle-engine.ts";
import { authFailureCode, randomToken, tokenHash, verifyGoogleCredential } from "../lib/auth-crypto.ts";
import { completeGoogleIdentity, sessionUser } from "../lib/account-sessions.ts";
import { languages } from "../lib/locales.ts";
import { words, characters, guides, news, dateLabel } from "../lib/magia-data.ts";
import { gameCopy } from "../lib/madokadle-copy.ts";
import { portalCopy } from "../lib/portal-copy.ts";
import { accountCopy } from "../lib/account-copy.ts";

const now = new Date("2026-10-07T12:00:00Z");
function database(t) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  // Apply the actual deployment migration, rather than a duplicate test schema.
  sqlite.exec(readFileSync(new URL("../drizzle/0000_even_master_mold.sql", import.meta.url), "utf8"));
  t.after(() => sqlite.close());
  function prepared(sql, params = []) {
    return {
      bind(...values) { return prepared(sql, values); },
      async first() { return sqlite.prepare(sql).get(...params) ?? null; },
      async all() { return { results: sqlite.prepare(sql).all(...params), success: true }; },
      async run() { const result = sqlite.prepare(sql).run(...params); return { success: true, meta: { changes: Number(result.changes) } }; },
    };
  }
  return {
    prepare: prepared,
    async batch(statements) {
      sqlite.exec("BEGIN");
      try { const result = []; for (const statement of statements) result.push(await statement.run()); sqlite.exec("COMMIT"); return result; }
      catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
}
async function profile(db, id, ranked = 0) { await db.prepare("INSERT INTO profiles (id, google_sub, nickname, ranked, created_at, imported) VALUES (?, ?, ?, ?, ?, 0)").bind(id, "google-" + id, "Player-" + id, ranked, +now).run(); }
const correct = date => answerFor(makePuzzle("daily", null, date)).id;
const wrong = date => pool.filter(c => c.id !== correct(date)).map(c => c.id);

test("cloud daily progress restores on another session and never mixes accounts", async t => {
  const db = database(t); await profile(db, "a"); await profile(db, "b");
  await appendCloudGuess(db, "a", [wrong(now)[0]], now);
  const restored = await cloudGame(db, "a", now);
  assert.deepEqual(restored.rows.map(r => r.character.id), [wrong(now)[0]]);
  assert.equal(restored.answer, null);
  assert.deepEqual((await cloudGame(db, "b", now)).rows, []);
  const won = await appendCloudGuess(db, "a", [wrong(now)[0], correct(now)], now);
  assert.equal(won.won, true);
  assert.equal((await cloudGame(db, "a", now)).won, true);
  assert.deepEqual(await cloudStats(db, "a", "2026-10-07"), { played: 1, wins: 1, current: 1, best: 1 });
  assert.equal((await cloudStats(db, "b", "2026-10-07")).played, 0);
  assert.equal((await cloudHistory(db, "a"))["2026-10-07"].guesses.length, 2);
});

test("cloud guesses are append-only, idempotent on retry and protect concurrent play", async t => {
  const db = database(t); await profile(db, "a");
  const first = [wrong(now)[0]];
  await appendCloudGuess(db, "a", first, now);
  await appendCloudGuess(db, "a", first, now);
  assert.equal((await dailyRecord(db, "a", "2026-10-07")).revision, 1);
  for (const invalid of [[], [wrong(now)[1]], [...first, wrong(now)[1], wrong(now)[2]]]) {
    await assert.rejects(() => appendCloudGuess(db, "a", invalid, now), CloudConflict);
  }
  await assert.rejects(() => appendCloudGuess(db, "a", [...first, "unknown"], now));
  assert.equal((await cloudGame(db, "a", now)).rows.length, 1);
  const results = await Promise.allSettled([
    appendCloudGuess(db, "a", [...first, wrong(now)[1]], now),
    appendCloudGuess(db, "a", [...first, wrong(now)[2]], now),
  ]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  const rejected = results.find(r => r.status === "rejected");
  assert.ok(rejected.reason instanceof CloudConflict);
  assert.equal(rejected.reason.result.rows.length, 2);
  const game = await cloudGame(db, "a", now);
  const wonGuesses = [...game.rows.map(r => r.character.id), correct(now)];
  await appendCloudGuess(db, "a", wonGuesses, now);
  await assert.rejects(() => appendCloudGuess(db, "a", [correct(now)], now), CloudConflict);
  assert.deepEqual((await cloudGame(db, "a", now)).rows.map(r => r.character.id), wonGuesses);
});

test("import recomputes results, preserves cloud progress, rejects invalid dates and stays outside ranking", async t => {
  const db = database(t); await profile(db, "a", 1);
  const later = new Date("2026-10-08T12:00:00Z");
  await appendCloudGuess(db, "a", [wrong(later)[0]], later);
  const record = (date, guesses) => ({ date, id: "ma1:" + date, guesses, won: true, finished: true });
  await importHistory(db, "a", {
    "2026-10-07": record("2026-10-07", [wrong(now)[0]]),
    "2026-10-08": record("2026-10-08", [correct(later)]),
    "2026-10-09": record("2026-10-09", ["madoka"]),
    "2026-02-30": record("2026-02-30", ["madoka"]),
    "invalid": record("invalid", ["madoka"]),
  }, later);
  const imported = await dailyRecord(db, "a", "2026-10-07");
  assert.equal(imported.won, 0); assert.equal(imported.finished, 0); assert.equal(imported.rank_eligible, 0);
  assert.deepEqual(JSON.parse((await dailyRecord(db, "a", "2026-10-08")).guesses), [wrong(later)[0]]);
  assert.equal(await dailyRecord(db, "a", "2026-10-09"), null);
  assert.equal(Object.keys(await cloudHistory(db, "a")).length, 2);
  await appendCloudGuess(db, "a", [wrong(now)[0], correct(now)], now);
  assert.equal((await cloudStats(db, "a", "2026-10-08")).wins, 1);
  assert.deepEqual(await leaderboard(db, "a", "all", "2026-10-08"), []);
  await importHistory(db, "a", { "2026-10-07": record("2026-10-07", [correct(now)]) }, later);
  assert.equal(JSON.parse((await dailyRecord(db, "a", "2026-10-07")).guesses).length, 2);
});

test("ranking respects opt-in, real completed games, ties, fewer guesses and private identifiers", async t => {
  const db = database(t);
  for (const id of ["a", "b", "c", "d", "e"]) await profile(db, id, id === "b" ? 0 : 1);
  await appendCloudGuess(db, "a", [wrong(now)[0]], now);
  await appendCloudGuess(db, "a", [wrong(now)[0], correct(now)], now);
  await appendCloudGuess(db, "b", [correct(now)], now);
  await appendCloudGuess(db, "c", [correct(now)], now);
  await appendCloudGuess(db, "d", [wrong(now)[0]], now);
  await appendCloudGuess(db, "d", [wrong(now)[0], correct(now)], now);
  await appendCloudGuess(db, "e", [wrong(now)[0]], now); // Unfinished, excluded.
  const daily = await leaderboard(db, "a", "today", "2026-10-07");
  assert.deepEqual(daily.map(r => [r.nickname, r.position, r.attempts, r.me]), [["Player-c", 1, 1, false], ["Player-a", 2, 2, true], ["Player-d", 2, 2, false]]);
  assert.ok(daily.every(r => !('id' in r) && !('google_sub' in r) && !('email' in r)));
  assert.deepEqual(await leaderboard(db, "a", "today", "2026-10-08"), []);
  await db.prepare("UPDATE profiles SET ranked = 0 WHERE id = 'a'").run();
  assert.ok((await leaderboard(db, "a", "all")).every(r => r.nickname !== "Player-a"));
});

test("Google identity restores the same account across devices, hashes sessions and consumes each nonce once", async t => {
  const db = database(t);
  async function challenge(expiry = +now + 600000) {
    const value = randomToken(); await db.prepare("INSERT INTO auth_challenges (hash, expires_at) VALUES (?, ?)").bind(await tokenHash(value), expiry).run(); return value;
  }
  const nonce = await challenge(), first = await completeGoogleIdentity(db, "google-user-a", nonce, +now);
  await assert.rejects(() => completeGoogleIdentity(db, "google-user-a", nonce, +now));
  const second = await completeGoogleIdentity(db, "google-user-a", await challenge(), +now);
  const other = await completeGoogleIdentity(db, "google-user-b", await challenge(), +now);
  assert.equal(first.user.id, second.user.id); assert.notEqual(first.session, second.session);
  assert.notEqual(first.user.id, other.user.id);
  assert.equal((await sessionUser(db, second.session, +now)).id, first.user.id);
  assert.equal(await sessionUser(db, first.session, +now + 30 * 86400000), null);
  assert.equal(await sessionUser(db, "forged-session", +now), null);
  assert.equal(await db.prepare("SELECT hash FROM sessions WHERE hash = ?").bind(first.session).first(), null);
  await assert.rejects(async () => completeGoogleIdentity(db, "google-user-c", await challenge(+now - 1), +now));
  const publicUser = await sessionUser(db, first.session, +now);
  assert.ok(!('google_sub' in publicUser) && !('email' in publicUser));
});

test("deleting one profile cascades its sessions, games, favorites and notes without changing another account", async t => {
  const db = database(t); await profile(db, "a"); await profile(db, "b");
  for (const id of ["a", "b"]) {
    await appendCloudGuess(db, id, [correct(now)], now);
    await db.prepare("INSERT INTO sessions (hash, user_id, expires_at) VALUES (?, ?, ?)").bind(id, id, +now + 1000).run();
    await db.prepare("INSERT INTO favorites (user_id, kind, item_id, created_at) VALUES (?, 'character', 'homura', ?)").bind(id, +now).run();
    await db.prepare("INSERT INTO character_notes (user_id, character_id, kioku, portrait, notes, updated_at) VALUES (?, 'homura', 'Kioku', 'Portrait', ?, ?)").bind(id, "private-" + id, +now).run();
  }
  await db.prepare("DELETE FROM profiles WHERE id = ?").bind("a").run();
  for (const table of ["sessions", "daily_games", "favorites", "character_notes"]) {
    assert.equal((await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE user_id = 'a'`).first()).n, 0);
    assert.equal((await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE user_id = 'b'`).first()).n, 1);
  }
  assert.equal((await db.prepare("SELECT notes FROM character_notes WHERE user_id = 'b'").first()).notes, "private-b");
});

test("Google credentials require a valid RSA signature, audience, nonce, issuer, lifetime and verified email", async () => {
  const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const key = { ...await crypto.subtle.exportKey("jwk", pair.publicKey), kid: "test-key", alg: "RS256" };
  const encode = object => Buffer.from(JSON.stringify(object)).toString("base64url");
  const claims = { iss: "https://accounts.google.com", sub: "google-verified", aud: "test-client", nonce: "test-nonce", iat: Math.floor(+now/1000), exp: Math.floor(+now/1000)+600, email_verified: true };
  async function signed(overrides = {}, header = {}) {
    const content = encode({ alg: "RS256", kid: "test-key", ...header }) + "." + encode({ ...claims, ...overrides });
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(content));
    return content + "." + Buffer.from(signature).toString("base64url");
  }
  const token = await signed();
  assert.equal(await verifyGoogleCredential(token, "test-client", "test-nonce", [key], +now), "google-verified");
  for (const invalid of [{ aud: "another-site" }, { nonce: "wrong-nonce" }, { iss: "https://attacker.example" }, { exp: claims.iat - 1 }, { iat: claims.iat + 1000 }, { email_verified: false }, { sub: "" }]) {
    await assert.rejects(() => signed(invalid).then(t => verifyGoogleCredential(t, "test-client", "test-nonce", [key], +now)));
  }
  await assert.rejects(() => signed({}, { alg: "none" }).then(t => verifyGoogleCredential(t, "test-client", "test-nonce", [key], +now)));
  await assert.rejects(() => verifyGoogleCredential(token, "test-client", "test-nonce", [], +now), /UNKNOWN_KEY/);
  const parts = token.split("."); parts[1] = encode({ ...claims, sub: "forged" });
  await assert.rejects(() => verifyGoogleCredential(parts.join("."), "test-client", "test-nonce", [key], +now));
});

test("auth diagnostics never reveal a credential or private claims in unexpected errors", () => {
  for (const value of [new Error("private-token.jwt.signature"), new Error("email=user@example.com nonce=private"), "private credential", { message: "MISSING_NONCE_COOKIE" }]) {
    assert.equal(authFailureCode(value), "UNEXPECTED");
  }
  assert.equal(authFailureCode(new Error("MISSING_NONCE_COOKIE")), "MISSING_NONCE_COOKIE");
});

test("navigation, content, account screens and game text are complete in all nine locales", () => {
  function translated(value) { assert.ok(typeof value === "string" && value.trim().length > 0); assert.ok(!value.includes("undefined")); }
  for (const lang of languages) {
    for (const dictionary of [words, portalCopy, gameCopy, accountCopy]) {
      assert.deepEqual(Object.keys(dictionary[lang]).sort(), Object.keys(dictionary.en).sort());
      for (const value of Object.values(dictionary[lang])) Array.isArray(value) ? value.forEach(translated) : translated(value);
    }
    for (const c of characters) translated(c.description[lang]);
    for (const g of guides) { translated(g.title[lang]); translated(g.summary[lang]); translated(g.category[lang]); for (const s of g.sections) { translated(s.title[lang]); translated(s.text[lang]); } }
    for (const n of news) { translated(n.title[lang]); translated(n.text[lang]); }
    translated(dateLabel("2026-10-07", lang));
  }
});
