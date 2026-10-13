import { env } from "cloudflare:workers";
import { getRawDb } from "@/db";
import { verifyGoogleCredential, type GoogleKey } from "./auth-crypto";
import { completeGoogleIdentity, sessionUser, type AccountUser } from "./account-sessions";
export const SESSION_COOKIE = "__Host-magia_session", NONCE_COOKIE = "__Host-magia_nonce";
export function cookie(request: Request, name: string) { return request.headers.get("cookie")?.split(";").map(s => s.trim()).find(s => s.startsWith(name + "="))?.slice(name.length + 1) || ""; }
export function secureCookie(name: string, value: string, maxAge: number) { return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`; }
export function clientId() { return env.GOOGLE_CLIENT_ID?.trim() || ""; }
export function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new Error("FORBIDDEN");
}
export async function accountUser(request: Request): Promise<AccountUser | null> {
  const value = cookie(request, SESSION_COOKIE);
  if (!/^[a-f0-9]{64}$/.test(value)) return null;
  return sessionUser(getRawDb(), value);
}
let jwks: { keys: GoogleKey[]; expires: number } | null = null;
async function googleKeys(refresh = false) {
  if (!refresh && jwks && jwks.expires > Date.now()) return jwks.keys;
  // workerd supports "manual"; reject redirects through the status check below.
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { redirect: "manual" });
  if (!response.ok) throw new Error("GOOGLE_UNAVAILABLE");
  const body = await response.json() as { keys?: GoogleKey[] };
  if (!Array.isArray(body.keys)) throw new Error("GOOGLE_UNAVAILABLE");
  jwks = { keys: body.keys, expires: Date.now() + 10 * 60 * 1000 }; return jwks.keys;
}
export async function googleLogin(request: Request, credential: string) {
  const id = clientId(), nonce = cookie(request, NONCE_COOKIE);
  if (!id) throw new Error("MISSING_CLIENT_ID");
  if (!nonce) throw new Error("MISSING_NONCE_COOKIE");
  if (!/^[a-f0-9]{64}$/.test(nonce)) throw new Error("INVALID_NONCE_COOKIE");
  let sub: string;
  try { sub = await verifyGoogleCredential(credential, id, nonce, await googleKeys()); }
  catch (e) { if (!(e instanceof Error) || e.message !== "UNKNOWN_KEY") throw e; sub = await verifyGoogleCredential(credential, id, nonce, await googleKeys(true)); }
  return completeGoogleIdentity(getRawDb(), sub, nonce);
}
