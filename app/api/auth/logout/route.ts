import { getRawDb } from "@/db";
import { cookie, requireSameOrigin, secureCookie, SESSION_COOKIE } from "@/lib/account-auth";
import { tokenHash } from "@/lib/auth-crypto";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request); const value = cookie(request, SESSION_COOKIE);
    if (value) await getRawDb().prepare("DELETE FROM sessions WHERE hash = ?").bind(await tokenHash(value)).run();
    return Response.json({ signedIn: false }, { headers: { "Cache-Control": "no-store", "Set-Cookie": secureCookie(SESSION_COOKIE, "", 0) } });
  } catch { return Response.json({ error: "UNAVAILABLE" }, { status: 400 }); }
}
