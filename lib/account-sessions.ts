import { randomToken, tokenHash } from "./auth-crypto.ts";
export type AccountUser = { id: string; nickname: string; ranked: number; imported: number };

export async function sessionUser(db: D1Database, value: string, now = Date.now()): Promise<AccountUser | null> {
  if (!/^[a-f0-9]{64}$/.test(value)) return null;
  return db.prepare("SELECT p.id, p.nickname, p.ranked, p.imported FROM profiles p JOIN sessions s ON p.id = s.user_id WHERE s.hash = ? AND s.expires_at > ?").bind(await tokenHash(value), now).first<AccountUser>();
}

// The caller must first verify Google's signature, audience, issuer and nonce.
export async function completeGoogleIdentity(db: D1Database, sub: string, nonce: string, now = Date.now()) {
  const challenge = await db.prepare("DELETE FROM auth_challenges WHERE hash = ? AND expires_at > ? RETURNING hash").bind(await tokenHash(nonce), now).first();
  if (!challenge) throw new Error("EXPIRED_CHALLENGE");
  const userId = crypto.randomUUID();
  await db.prepare("INSERT INTO profiles (id, google_sub, nickname, ranked, created_at, imported) VALUES (?, ?, ?, 0, ?, 0) ON CONFLICT(google_sub) DO NOTHING").bind(userId, sub, "Magia-" + userId.slice(0, 8), now).run();
  const user = await db.prepare("SELECT id, nickname, ranked, imported FROM profiles WHERE google_sub = ?").bind(sub).first<AccountUser>();
  if (!user) throw new Error("DATABASE_UNAVAILABLE");
  const session = randomToken();
  await db.batch([
    db.prepare("INSERT INTO sessions (hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await tokenHash(session), user.id, now + 30 * 86400000),
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
    db.prepare("DELETE FROM auth_challenges WHERE expires_at <= ?").bind(now),
  ]);
  return { user, session };
}
