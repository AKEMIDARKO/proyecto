import { getRawDb } from "@/db";
import { clientId, googleLogin, requireSameOrigin, secureCookie, SESSION_COOKIE, NONCE_COOKIE } from "@/lib/account-auth";
import { authFailureCode, randomToken, tokenHash } from "@/lib/auth-crypto";
const headers = { "Cache-Control": "private, no-store" };
export async function GET() {
  const id = clientId();
  if (!id) return Response.json({ enabled: false }, { headers });
  try {
    const nonce = randomToken();
    const db = getRawDb();
    await db.batch([
      db.prepare("INSERT INTO auth_challenges (hash, expires_at) VALUES (?, ?)").bind(await tokenHash(nonce), Date.now() + 10 * 60000),
      db.prepare("DELETE FROM auth_challenges WHERE expires_at <= ?").bind(Date.now()),
    ]);
    return Response.json({ enabled: true, clientId: id, nonce }, { headers: { ...headers, "Set-Cookie": secureCookie(NONCE_COOKIE, nonce, 600) } });
  } catch (error) {
    console.error("MAGIA_GOOGLE_CONFIG_FAILED", authFailureCode(error));
    return Response.json({ error: "UNAVAILABLE" }, { status: 503, headers });
  }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const text = await request.text();
    if (text.length > 18000) throw new Error("INVALID_CREDENTIAL");
    const body = JSON.parse(text) as { credential?: unknown };
    if (!body || typeof body.credential !== "string") throw new Error("INVALID_CREDENTIAL");
    const { session } = await googleLogin(request, body.credential);
    const response = Response.json({ signedIn: true }, { headers });
    response.headers.append("Set-Cookie", secureCookie(SESSION_COOKIE, session, 30 * 86400));
    response.headers.append("Set-Cookie", secureCookie(NONCE_COOKIE, "", 0));
    return response;
  } catch (e) {
    console.error("MAGIA_GOOGLE_SIGN_IN_FAILED", authFailureCode(e));
    const message = e instanceof Error ? e.message : "UNAVAILABLE";
    return Response.json({ error: message === "FORBIDDEN" ? "FORBIDDEN" : "SIGN_IN_FAILED" }, { status: message === "FORBIDDEN" ? 403 : 400, headers });
  }
}
