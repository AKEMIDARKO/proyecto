import type { History, Statistics } from "./madokadle-history";
export const LOCAL_HISTORY_KEY = "magia-archive-madokadle-v1";
export type Favorite = { kind: "character" | "guide" | "kioku"; itemId: string };
export type CharacterNote = { characterId: string; kioku: string; portrait: string; notes: string };
export type AccountData = {
  user: { nickname: string; ranked: boolean; imported: boolean } | null;
  favorites: Favorite[]; notes: CharacterNote[]; history: History; stats: Statistics;
};
export const emptyAccount: AccountData = { user: null, favorites: [], notes: [], history: {}, stats: { played: 0, wins: 0, current: 0, best: 0 } };
export class AccountError extends Error { constructor(public code: string) { super(code); } }
export async function accountResponse<T>(response: Response): Promise<T> {
  const body = await response.json() as { error?: string };
  if (!response.ok) throw new AccountError(body.error || "UNAVAILABLE");
  return body as T;
}
export async function getAccount(): Promise<AccountData> {
  const data = await fetch("/api/account", { cache: "no-store" }).then(accountResponse<Partial<AccountData>>);
  return { ...emptyAccount, ...data };
}
export async function saveAccount(body: Record<string, unknown>) {
  return fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(accountResponse);
}
