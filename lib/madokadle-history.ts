export type Saved = { id: string; date: string; guesses: string[]; won: boolean; finished: boolean };
export type History = Record<string, Saved>;
export type Statistics = { played: number; wins: number; current: number; best: number };
const dayIndex = (date: string) => Math.floor(Date.parse(date + "T00:00:00Z") / 86400000);

export function parseHistory(raw: string | null): History {
  if (!raw) return {};
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const result: History = {};
  for (const [date, record] of Object.entries(parsed).slice(-400)) {
    const r = record as Saved;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(dayIndex(date)) && r && r.date === date && typeof r.id === "string" && Array.isArray(r.guesses) && r.guesses.length <= 6 && r.guesses.every(g => typeof g === "string") && typeof r.won === "boolean" && typeof r.finished === "boolean") result[date] = r;
  }
  return result;
}

export function dailyStatistics(history: History, today: string): Statistics {
  const completed = Object.values(history).filter(g => g.finished && dayIndex(g.date) <= dayIndex(today)).sort((a, b) => a.date.localeCompare(b.date));
  let run = 0, best = 0, previous = -Infinity;
  for (const g of completed) {
    const day = dayIndex(g.date);
    run = g.won ? (day === previous + 1 ? run + 1 : 1) : 0;
    previous = day;
    best = Math.max(best, run);
  }
  const last = completed.at(-1);
  return { played: completed.length, wins: completed.filter(g => g.won).length, current: last && dayIndex(last.date) >= dayIndex(today) - 1 ? run : 0, best };
}
