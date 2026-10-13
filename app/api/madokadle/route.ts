import { NextResponse } from "next/server";
import { evaluate, makePuzzle } from "@/lib/madokadle-engine";
import type { GameMode } from "@/lib/madokadle-types";
import type { GameResult } from "@/lib/madokadle-types";
import { getRawDb } from "@/db";
import { accountUser, requireSameOrigin } from "@/lib/account-auth";
import { appendCloudGuess, cloudGame, cloudStats, CloudConflict, dailyRecord } from "@/lib/account-store";

const headers = { "Cache-Control": "private, no-store, max-age=0" };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

async function accountResult(result: GameResult, userId: string): Promise<GameResult> {
  const db = getRawDb();
  const [stats, saved] = await Promise.all([cloudStats(db, userId, result.puzzle.date), dailyRecord(db, userId, result.puzzle.date)]);
  return { ...result, account: { cloud: true, stats, rankEligible: !saved || !!saved.rank_eligible } };
}

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode") === "practice" ? "practice" : "daily";
  try {
    const user = mode === "daily" ? await accountUser(request) : null;
    return reply(user ? await accountResult(await cloudGame(getRawDb(), user.id), user.id) : evaluate(makePuzzle(mode), []));
  } catch { return reply({ error: "UNAVAILABLE" }, 503); }
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 4096) return reply({ error: "INVALID_REQUEST" }, 400);
  let raw: unknown;
  try {
    const content = await request.text();
    if (content.length > 4096) return reply({ error: "INVALID_REQUEST" }, 400);
    raw = JSON.parse(content);
  } catch { return reply({ error: "INVALID_REQUEST" }, 400); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return reply({ error: "INVALID_REQUEST" }, 400);
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.guesses) || body.guesses.length > 6 || body.guesses.some((g: unknown) => typeof g !== "string") || (body.mode !== "daily" && body.mode !== "practice")) return reply({ error: "INVALID_REQUEST" }, 400);
  const mode: GameMode = body.mode;
  if (mode === "practice" && (typeof body.seed !== "string" || !/^[a-f0-9-]{36}$/i.test(body.seed))) return reply({ error: "INVALID_REQUEST" }, 400);
  const now = new Date();
  const puzzle = makePuzzle(mode, mode === "practice" ? body.seed as string : null, now);
  if (body.id !== puzzle.id) return reply({ error: "DAY_CHANGED" }, 409);
  let result: GameResult;
  try { result = evaluate(puzzle, body.guesses); }
  catch { return reply({ error: "INVALID_GUESSES" }, 400); }
  try {
    const user = mode === "daily" ? await accountUser(request) : null;
    if (!user) return reply(result);
    requireSameOrigin(request);
    try { return reply(await accountResult(await appendCloudGuess(getRawDb(), user.id, body.guesses as string[], now), user.id)); }
    catch (e) {
      if (e instanceof CloudConflict) return reply({ error: "PROGRESS_CHANGED", current: await accountResult(e.result, user.id) }, 409);
      throw e;
    }
  } catch (e) { return reply({ error: e instanceof Error && e.message === "FORBIDDEN" ? "FORBIDDEN" : "UNAVAILABLE" }, e instanceof Error && e.message === "FORBIDDEN" ? 403 : 503); }
}
