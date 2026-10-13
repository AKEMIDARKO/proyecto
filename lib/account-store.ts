import { evaluate, makePuzzle } from "./madokadle-engine.ts";
import { dailyStatistics, type History } from "./madokadle-history.ts";
import type { GameResult } from "./madokadle-types";
export type DailyRecord = { puzzle_id: string; guesses: string; won: number; finished: number; revision: number; rank_eligible: number };
export async function cloudHistory(db: D1Database, userId: string): Promise<History> {
  const rows = await db.prepare("SELECT date, puzzle_id, guesses, won, finished FROM daily_games WHERE user_id = ? ORDER BY date DESC LIMIT 2000").bind(userId).all<{ date: string; puzzle_id: string; guesses: string; won: number; finished: number }>();
  return Object.fromEntries(rows.results.map(r => [r.date, { id: r.puzzle_id, date: r.date, guesses: JSON.parse(r.guesses), won: !!r.won, finished: !!r.finished }]));
}
export async function cloudStats(db: D1Database, userId: string, date = new Date().toISOString().slice(0, 10)) { return dailyStatistics(await cloudHistory(db, userId), date); }
export async function dailyRecord(db: D1Database, userId: string, date: string) {
  return db.prepare("SELECT puzzle_id, guesses, won, finished, revision, rank_eligible FROM daily_games WHERE user_id = ? AND date = ?").bind(userId, date).first<DailyRecord>();
}
export async function cloudGame(db: D1Database, userId: string, now = new Date()): Promise<GameResult> {
  const puzzle = makePuzzle("daily", null, now), saved = await dailyRecord(db, userId, puzzle.date);
  return evaluate(puzzle, saved?.puzzle_id === puzzle.id ? JSON.parse(saved.guesses) : []);
}
export class CloudConflict extends Error {
  result: GameResult;
  constructor(result: GameResult) { super("PROGRESS_CHANGED"); this.result = result; }
}
export async function appendCloudGuess(db: D1Database, userId: string, guesses: string[], now = new Date()): Promise<GameResult> {
  const puzzle = makePuzzle("daily", null, now);
  await db.prepare("INSERT INTO daily_games (user_id, date, puzzle_id, guesses, won, finished, revision, updated_at, rank_eligible) VALUES (?, ?, ?, '[]', 0, 0, 0, ?, 1) ON CONFLICT(user_id, date) DO NOTHING").bind(userId, puzzle.date, puzzle.id, now.getTime()).run();
  const saved = await dailyRecord(db, userId, puzzle.date);
  const before: string[] = saved ? JSON.parse(saved.guesses) : [];
  const current = evaluate(puzzle, before);
  if (guesses.length === before.length && guesses.every((g, i) => before[i] === g)) return current;
  if (!saved || saved.puzzle_id !== puzzle.id || saved.finished || guesses.length !== before.length + 1 || !before.every((g, i) => guesses[i] === g)) throw new CloudConflict(current);
  const next = evaluate(puzzle, guesses);
  const updated = await db.prepare("UPDATE daily_games SET guesses = ?, won = ?, finished = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND date = ? AND revision = ? AND finished = 0").bind(JSON.stringify(guesses), Number(next.won), Number(next.finished), now.getTime(), userId, puzzle.date, saved.revision).run();
  if (updated.meta.changes !== 1) throw new CloudConflict(await cloudGame(db, userId, now));
  return next;
}
export async function importHistory(db: D1Database, userId: string, history: History, now = new Date()) {
  const today = now.toISOString().slice(0, 10), statements: D1PreparedStatement[] = [];
  for (const saved of Object.values(history).slice(-400)) {
    if (saved.date < "2026-10-07" || saved.date > today || !/^\d{4}-\d{2}-\d{2}$/.test(saved.date)) continue;
    const date = new Date(saved.date + "T12:00:00Z"); if (!Number.isFinite(+date) || date.toISOString().slice(0,10) !== saved.date) continue;
    const puzzle = makePuzzle("daily", null, date); if (puzzle.id !== saved.id || !saved.guesses.length) continue;
    let game: GameResult; try { game = evaluate(puzzle, saved.guesses); } catch { continue; }
    statements.push(db.prepare("INSERT INTO daily_games (user_id, date, puzzle_id, guesses, won, finished, revision, updated_at, rank_eligible) SELECT ?, ?, ?, ?, ?, ?, 0, ?, 0 WHERE EXISTS (SELECT 1 FROM profiles WHERE id = ? AND imported = 0) ON CONFLICT(user_id, date) DO NOTHING").bind(userId, saved.date, puzzle.id, JSON.stringify(saved.guesses), Number(game.won), Number(game.finished), +now, userId));
  }
  statements.push(db.prepare("UPDATE profiles SET imported = 1 WHERE id = ?").bind(userId));
  await db.batch(statements);
}
export async function leaderboard(db: D1Database, currentUserId: string | null, period: string, date = new Date().toISOString().slice(0, 10)) {
  const scores = await db.prepare(`WITH scores AS (
    SELECT user_id, SUM(won) AS wins, COUNT(*) AS played, SUM(json_array_length(guesses)) AS attempts
    FROM daily_games WHERE finished = 1 AND rank_eligible = 1 AND (? = 'all' OR date = ?) GROUP BY user_id
  ), ranked AS (
    SELECT p.id, p.nickname, s.wins, s.played, s.attempts,
    DENSE_RANK() OVER (ORDER BY s.wins DESC, s.attempts ASC) AS position
    FROM scores s JOIN profiles p ON p.id = s.user_id WHERE p.ranked = 1
  ) SELECT * FROM ranked ORDER BY position, nickname, id LIMIT 50`).bind(period === "all" ? "all" : "today", date).all<{id:string;nickname:string;wins:number;played:number;attempts:number;position:number}>();
  return scores.results.map(({ id, ...r }) => ({ ...r, me: id === currentUserId }));
}
