import { getRawDb } from "@/db";
import { accountUser, requireSameOrigin, secureCookie, SESSION_COOKIE } from "@/lib/account-auth";
import { cloudHistory, importHistory } from "@/lib/account-store";
import { parseHistory, dailyStatistics } from "@/lib/madokadle-history";
import { isFavoriteItem, isNoteCharacter } from "@/lib/account-items";
import { readKiokus } from '@/lib/kioku-store';
const headers = { "Cache-Control": "private, no-store" };
const reply = (value: unknown, status = 200) => Response.json(value, { status, headers });
export async function GET(request: Request) {
  try {
    const user = await accountUser(request); if (!user) return reply({ user: null });
    const db = getRawDb();
    const [favorites, notes, history] = await Promise.all([
      db.prepare("SELECT kind, item_id AS itemId FROM favorites WHERE user_id = ? ORDER BY created_at DESC").bind(user.id).all(),
      db.prepare("SELECT character_id AS characterId, kioku, portrait, notes FROM character_notes WHERE user_id = ? ORDER BY updated_at DESC").bind(user.id).all(),
      cloudHistory(db, user.id),
    ]);
    return reply({ user: { nickname: user.nickname, ranked: !!user.ranked, imported: !!user.imported }, favorites: favorites.results, notes: notes.results, history, stats: dailyStatistics(history, new Date().toISOString().slice(0, 10)) });
  } catch { return reply({ error: "UNAVAILABLE" }, 503); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request); const user = await accountUser(request); if (!user) return reply({ error: "SIGN_IN_REQUIRED" }, 401);
    const text = await request.text(); if (text.length > 100000) return reply({ error: "INVALID_REQUEST" }, 400);
    let raw: unknown; try { raw = JSON.parse(text); } catch { return reply({ error: "INVALID_REQUEST" }, 400); }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return reply({ error: "INVALID_REQUEST" }, 400);
    const body = raw as Record<string, unknown>; const db = getRawDb();
    if (body.action === "profile") {
      const nickname = typeof body.nickname === "string" ? body.nickname.normalize("NFKC").trim() : "";
      if (nickname.length < 2 || nickname.length > 24 || !/^[\p{L}\p{N} _.-]+$/u.test(nickname) || typeof body.ranked !== "boolean") return reply({ error: "INVALID_NICKNAME" }, 400);
      await db.prepare("UPDATE profiles SET nickname = ?, ranked = ? WHERE id = ?").bind(nickname, Number(body.ranked), user.id).run();
    } else if (body.action === "favorite") {
      const valid = isFavoriteItem(body.kind, body.itemId,await readKiokus(db));
      if (!valid || typeof body.saved !== "boolean") return reply({ error: "INVALID_REQUEST" }, 400);
      if (body.saved) await db.prepare("INSERT INTO favorites (user_id, kind, item_id, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, kind, item_id) DO NOTHING").bind(user.id, body.kind, body.itemId, Date.now()).run();
      else await db.prepare("DELETE FROM favorites WHERE user_id = ? AND kind = ? AND item_id = ?").bind(user.id, body.kind, body.itemId).run();
    } else if (body.action === "note" || body.action === "delete-note") {
      if (!isNoteCharacter(body.characterId,await readKiokus(db))) return reply({ error: "INVALID_REQUEST" }, 400);
      if (body.action === "delete-note") await db.prepare("DELETE FROM character_notes WHERE user_id = ? AND character_id = ?").bind(user.id, body.characterId).run();
      else {
        if ([body.kioku, body.portrait, body.notes].some(x => typeof x !== "string") || String(body.kioku).length > 120 || String(body.portrait).length > 120 || String(body.notes).length > 2000) return reply({ error: "INVALID_REQUEST" }, 400);
        await db.prepare("INSERT INTO character_notes (user_id, character_id, kioku, portrait, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, character_id) DO UPDATE SET kioku = excluded.kioku, portrait = excluded.portrait, notes = excluded.notes, updated_at = excluded.updated_at").bind(user.id, body.characterId, body.kioku, body.portrait, body.notes, Date.now()).run();
      }
    } else if (body.action === "import") {
      if (!user.imported) await importHistory(db, user.id, parseHistory(JSON.stringify(body.history)));
    } else return reply({ error: "INVALID_REQUEST" }, 400);
    return reply({ saved: true });
  } catch (e) { return reply({ error: e instanceof Error && e.message === "FORBIDDEN" ? "FORBIDDEN" : "UNAVAILABLE" }, e instanceof Error && e.message === "FORBIDDEN" ? 403 : 503); }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request); const user = await accountUser(request); if (!user) return reply({ error: "SIGN_IN_REQUIRED" }, 401);
    await getRawDb().prepare("DELETE FROM profiles WHERE id = ?").bind(user.id).run();
    const response = reply({ deleted: true }); response.headers.set("Set-Cookie", secureCookie(SESSION_COOKIE, "", 0)); return response;
  } catch (e) { return reply({ error: e instanceof Error && e.message === "FORBIDDEN" ? "FORBIDDEN" : "UNAVAILABLE" }, e instanceof Error && e.message === "FORBIDDEN" ? 403 : 503); }
}
