import test from "node:test";
import assert from "node:assert/strict";
import { makePuzzle, evaluate, answerFor, pool } from "../lib/madokadle-engine.ts";
import { parseHistory, dailyStatistics } from "../lib/madokadle-history.ts";
import { languages } from "../lib/locales.ts";

const now = new Date("2026-10-07T12:00:00Z");
test("daily puzzles are shared and change exactly at UTC midnight", () => {
  const first = makePuzzle("daily", null, now);
  assert.equal(first.id, makePuzzle("daily", null, new Date("2026-10-07T23:59:59Z")).id);
  assert.equal(first.nextAt, "2026-10-08T00:00:00.000Z");
  assert.notEqual(first.id, makePuzzle("daily", null, new Date("2026-10-08T00:00:00Z")).id);
  assert.equal(answerFor(first).id, answerFor(makePuzzle("daily", null, now)).id);
  const cycle = Array.from({ length: pool.length }, (_, d) => answerFor(makePuzzle("daily", null, new Date(+now + d * 86400000))).id);
  assert.equal(new Set(cycle).size, pool.length);
});
test("a puzzle never reveals its answer before success or six wrong guesses", () => {
  const puzzle = makePuzzle("daily", null, now);
  const answer = answerFor(puzzle);
  assert.equal(evaluate(puzzle, []).answer, null);
  const wrong = pool.filter(c => c.id !== answer.id).slice(0, 6).map(c => c.id);
  for (let count = 1; count < 6; count++) {
    const result = evaluate(puzzle, wrong.slice(0, count));
    assert.equal(result.answer, null);
    assert.equal(result.finished, false);
  }
  const lost = evaluate(puzzle, wrong);
  assert.equal(lost.finished, true); assert.equal(lost.won, false); assert.equal(lost.answer.id, answer.id);
  const won = evaluate(puzzle, [wrong[0], answer.id]);
  assert.equal(won.finished, true); assert.equal(won.won, true); assert.ok(won.rows.at(-1).cells.every(c => c.match === "match"));
  assert.deepEqual(evaluate(puzzle, [wrong[0], answer.id]), won, "saved guesses can be replayed after refresh");
});
test("related ranged weapons get a partial match and bad guesses are rejected", () => {
  const puzzle = makePuzzle("daily", null, now);
  assert.equal(answerFor(puzzle).id, "iroha");
  assert.equal(evaluate(puzzle, ["madoka"]).rows[0].cells.find(c => c.trait === "weapon").match, "close");
  assert.throws(() => evaluate(puzzle, ["madoka", "madoka"]));
  assert.throws(() => evaluate(puzzle, ["unknown"]));
  assert.throws(() => evaluate(puzzle, ["iroha", "madoka"]));
  assert.throws(() => evaluate(puzzle, pool.slice(0, 7).map(c => c.id)));
});
test("practice rounds are repeatable for their own seed and separate from daily", () => {
  const seed = "00000000-0000-4000-8000-000000000001";
  const a = makePuzzle("practice", seed, now);
  assert.equal(a.id, makePuzzle("practice", seed, now).id);
  assert.equal(answerFor(a).id, answerFor(makePuzzle("practice", seed, now)).id);
  assert.notEqual(a.id, makePuzzle("daily", null, now).id);
  assert.notEqual(makePuzzle("practice", null, now).id, makePuzzle("practice", null, now).id);
});
test("all choices and clue values have all nine languages", () => {
  assert.equal(new Set(pool.map(c => c.id)).size, 22);
  for (const c of pool) {
    assert.ok(c.name); assert.ok(c.japanese); assert.match(c.source, /^https:\/\//);
    for (const cell of evaluate(makePuzzle("daily", null, now), [c.id]).rows[0].cells) {
      for (const lang of languages) assert.ok(cell.value[lang]);
    }
  }
});
const saved = (date, won = true, finished = true) => ({ id: "ma1:" + date, date, guesses: ["madoka"], won, finished });
test("browser history handles invalid data, unfinished rounds and broken streaks", () => {
  assert.deepEqual(parseHistory("broken JSON"), {});
  assert.deepEqual(parseHistory("[]"), {});
  assert.deepEqual(parseHistory(JSON.stringify({ bad: { guesses: [] } })), {});
  const h = Object.fromEntries(["2026-10-03", "2026-10-04", "2026-10-06"].map(date => [date, saved(date)]));
  assert.deepEqual(dailyStatistics(h, "2026-10-07"), { played: 3, wins: 3, current: 1, best: 2 });
  h["2026-10-07"] = saved("2026-10-07", false, false);
  assert.equal(dailyStatistics(h, "2026-10-07").current, 1);
  h["2026-10-07"] = saved("2026-10-07", false);
  assert.deepEqual(dailyStatistics(h, "2026-10-07"), { played: 4, wins: 3, current: 0, best: 2 });
  assert.equal(dailyStatistics({ "2026-10-04": saved("2026-10-04") }, "2026-10-07").current, 0);
});
