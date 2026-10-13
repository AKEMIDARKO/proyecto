export function randomToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join(""); }
export async function tokenHash(value: string) { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, "0")).join(""); }
function decode(value: string) { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)); }
function decodeJson(value: string): Record<string, unknown> { return JSON.parse(new TextDecoder().decode(decode(value))); }
export type GoogleKey = JsonWebKey & { kid?: string; alg?: string };

// Log only fixed diagnostic codes, never Google's token, claims or error text.
const authFailureCodes = new Set([
  "FORBIDDEN", "INVALID_CREDENTIAL", "GOOGLE_UNAVAILABLE", "DATABASE_UNAVAILABLE", "UNKNOWN_KEY",
  "MISSING_CLIENT_ID", "MISSING_NONCE_COOKIE", "INVALID_NONCE_COOKIE", "EXPIRED_CHALLENGE",
  "INVALID_TOKEN_FORMAT", "INVALID_ALGORITHM", "INVALID_SIGNATURE", "INVALID_ISSUER",
  "INVALID_AUDIENCE", "INVALID_NONCE", "EXPIRED_CREDENTIAL", "INVALID_ISSUED_AT",
  "INVALID_SUBJECT", "UNVERIFIED_EMAIL",
]);
export function authFailureCode(error: unknown): string {
  return error instanceof Error && authFailureCodes.has(error.message) ? error.message : "UNEXPECTED";
}

export async function verifyGoogleCredential(token: string, audience: string, nonce: string, keys: GoogleKey[], now = Date.now()): Promise<string> {
  if (token.length > 16384 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw new Error("INVALID_TOKEN_FORMAT");
  const [a, b, signature] = token.split(".");
  const header = decodeJson(a), claims = decodeJson(b);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("INVALID_ALGORITHM");
  const key = keys.find(k => k.kid === header.kid && k.kty === "RSA" && (!k.alg || k.alg === "RS256"));
  if (!key) throw new Error("UNKNOWN_KEY");
  const publicKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, decode(signature), new TextEncoder().encode(a + "." + b))) throw new Error("INVALID_SIGNATURE");
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") throw new Error("INVALID_ISSUER");
  if (claims.aud !== audience) throw new Error("INVALID_AUDIENCE");
  if (claims.nonce !== nonce) throw new Error("INVALID_NONCE");
  if (typeof claims.exp !== "number" || claims.exp * 1000 <= now) throw new Error("EXPIRED_CREDENTIAL");
  if (typeof claims.iat !== "number" || claims.iat * 1000 > now + 60000) throw new Error("INVALID_ISSUED_AT");
  if (typeof claims.sub !== "string" || claims.sub.length < 1 || claims.sub.length > 255) throw new Error("INVALID_SUBJECT");
  if (claims.email_verified !== true) throw new Error("UNVERIFIED_EMAIL");
  return claims.sub;
}
