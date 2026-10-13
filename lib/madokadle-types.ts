import type { Lang } from "./magia-data";
import type { Statistics } from "./madokadle-history";
export type GameMode = "daily" | "practice";
export type Trait = "debut" | "hair" | "weapon" | "medium";
export type Match = "match" | "close" | "miss";
export type GameOption = { id: string; name: string; japanese: string; aliases: string[] };
export type GuessResult = { character: GameOption; cells: { trait: Trait; value: Record<Lang, string>; match: Match }[]; correct: boolean };
export type Puzzle = { id: string; date: string; mode: GameMode; seed: string | null; number: number; nextAt: string; maxGuesses: number; options: GameOption[] };
export type GameResult = { puzzle: Puzzle; rows: GuessResult[]; won: boolean; finished: boolean; answer: (GameOption & { source: string }) | null; account?: { cloud: boolean; stats: Statistics; rankEligible: boolean } };
