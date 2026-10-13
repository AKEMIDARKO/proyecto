import type { Lang } from "./magia-data";
import type { GameMode, GameOption, GameResult, Puzzle, Trait } from "./madokadle-types";

import { extraOrder } from "./i18n.ts";
import { clueRows } from "./extra-game.ts";
const text = (es: string, en: string, ja: string): Record<Lang, string> => {
  const row = clueRows[en];
  if (!row || row.length !== extraOrder.length || row.some(v => !v)) throw new Error("Missing clue translation: " + en);
  return { es, en, ja, ...Object.fromEntries(extraOrder.map((lang, i) => [lang, row[i]])) } as Record<Lang, string>;
};
const mainSource = "https://www.madoka-magica.com/tv/character/";
const recordSource = "https://magireco.com/character/";
const rebellionSource = "https://www.madoka-magica.com/rebellion/character/";
const orikoSource = "https://yenpress.com/titles/9780316254281-puella-magi-oriko-magica-vol-1";
const tartSource = "https://yenpress.com/titles/9780316383141-puella-magi-tart-magica-vol-1";

type Entry = GameOption & { debut: string; hair: string; weapon: string; weaponFamily: string; medium: string; source: string };
function entry(id: string, name: string, japanese: string, debut: string, hair: string, weapon: string, weaponFamily: string, medium: string, source: string, aliases: string[] = []): Entry {
  return { id, name, japanese, debut, hair, weapon, weaponFamily, medium, source, aliases };
}

// The pool describes the original characters, not Exedra Kioku or combat stats.
// Hair is grouped into broad visual shades; weapons describe the usual magical-girl form.
export const pool: Entry[] = [
  entry("madoka", "Madoka Kaname", "鹿目まどか", "madoka", "pink", "bow", "ranged", "anime", mainSource, ["Kaname Madoka"]),
  entry("homura", "Homura Akemi", "暁美ほむら", "madoka", "black", "firearms", "ranged", "anime", mainSource, ["Akemi Homura"]),
  entry("mami", "Mami Tomoe", "巴マミ", "madoka", "blonde", "muskets", "ranged", "anime", mainSource, ["Tomoe Mami"]),
  entry("sayaka", "Sayaka Miki", "美樹さやか", "madoka", "blue", "sword", "blade", "anime", mainSource, ["Miki Sayaka"]),
  entry("kyoko", "Kyoko Sakura", "佐倉杏子", "madoka", "red", "spear", "pole", "anime", mainSource, ["Kyouko", "Sakura Kyoko"]),
  entry("kyubey", "Kyubey", "キュゥべえ", "madoka", "white", "none", "none", "anime", mainSource, ["Kyuubey", "QB"]),
  entry("nagisa", "Nagisa Momoe", "百江なぎさ", "rebellion", "white", "trumpet", "other", "film", rebellionSource, ["Momoe Nagisa"]),
  entry("iroha", "Iroha Tamaki", "環いろは", "record", "pink", "crossbow", "ranged", "game", recordSource, ["Tamaki Iroha"]),
  entry("yachiyo", "Yachiyo Nanami", "七海やちよ", "record", "blue", "spear", "pole", "game", recordSource, ["Nanami Yachiyo"]),
  entry("tsuruno", "Tsuruno Yui", "由比鶴乃", "record", "brown", "fans", "other", "game", recordSource, ["Yui Tsuruno"]),
  entry("felicia", "Felicia Mitsuki", "深月フェリシア", "record", "blonde", "hammer", "blunt", "game", recordSource, ["Mitsuki Felicia"]),
  entry("sana", "Sana Futaba", "二葉さな", "record", "green", "shield", "defense", "game", recordSource, ["Futaba Sana"]),
  entry("momoko", "Momoko Togame", "十咎ももこ", "record", "blonde", "sword", "blade", "game", recordSource, ["Togame Momoko"]),
  entry("rena", "Rena Minami", "水波レナ", "record", "blue", "trident", "pole", "game", recordSource, ["Minami Rena"]),
  entry("kaede", "Kaede Akino", "秋野かえで", "record", "brown", "staff", "magic", "game", recordSource, ["Akino Kaede"]),
  entry("oriko", "Oriko Mikuni", "美国織莉子", "oriko", "white", "orbs", "magic", "manga", orikoSource, ["Mikuni Oriko"]),
  entry("kirika", "Kirika Kure", "呉キリカ", "oriko", "black", "claws", "blade", "manga", orikoSource, ["Kure Kirika"]),
  entry("yuma", "Yuma Chitose", "千歳ゆま", "oriko", "green", "hammer", "blunt", "manga", orikoSource, ["Chitose Yuma"]),
  entry("kazumi", "Kazumi", "かずみ", "kazumi", "black", "staff", "magic", "manga", "https://yenpress.com/titles/9780316250962-puella-magi-kazumi-magica-vol-1"),
  entry("tart", "Tart / Darc", "タルト", "tart", "blonde", "sword", "blade", "manga", tartSource, ["Darc", "Tart", "Jeanne d'Arc"]),
  entry("liz", "Liz Hawkwood", "リズ・ホークウッド", "tart", "black", "daggers", "blade", "manga", tartSource, ["Riz Hawkwood", "Riz", "Liz"]),
  entry("suzune", "Suzune Amano", "天乃鈴音", "suzune", "white", "sword", "blade", "manga", "https://yenpress.com/titles/9780316348850-puella-magi-suzune-magica-vol-1", ["Amano Suzune"]),
];

const traits = {
  debut: {
    madoka: text("Madoka Magica", "Madoka Magica", "まどか☆マギカ"),
    rebellion: text("Rebellion", "Rebellion", "叛逆の物語"),
    record: text("Magia Record", "Magia Record", "マギアレコード"),
    oriko: text("Oriko Magica", "Oriko Magica", "おりこ☆マギカ"),
    kazumi: text("Kazumi Magica", "Kazumi Magica", "かずみ☆マギカ"),
    tart: text("Tart Magica", "Tart Magica", "たると☆マギカ"),
    suzune: text("Suzune Magica", "Suzune Magica", "すずね☆マギカ"),
  },
  hair: {
    pink: text("Rosa", "Pink", "ピンク"), black: text("Negro", "Black", "黒"), blonde: text("Rubio", "Blonde", "金"), blue: text("Azul", "Blue", "青"),
    red: text("Rojo", "Red", "赤"), white: text("Blanco / plateado", "White / silver", "白・銀"), brown: text("Castaño", "Brown", "茶"), green: text("Verde", "Green", "緑"),
  },
  weapon: {
    bow: text("Arco", "Bow", "弓"), firearms: text("Armas de fuego", "Firearms", "銃火器"), muskets: text("Mosquetes", "Muskets", "マスケット銃"),
    sword: text("Espada", "Sword", "剣"), spear: text("Lanza", "Spear", "槍"), none: text("Ninguna", "None", "なし"), trumpet: text("Trompeta", "Trumpet", "ラッパ"),
    crossbow: text("Ballesta", "Crossbow", "クロスボウ"), fans: text("Abanicos", "Fans", "扇"), hammer: text("Martillo", "Hammer", "ハンマー"),
    shield: text("Escudo", "Shield", "盾"), trident: text("Tridente", "Trident", "三叉槍"), staff: text("Bastón mágico", "Magic staff", "魔法の杖"),
    orbs: text("Orbes", "Orbs", "魔法の球"), claws: text("Garras", "Claws", "爪"), daggers: text("Dagas", "Daggers", "短剣"),
  },
  medium: { anime: text("Anime de TV", "TV anime", "TVアニメ"), film: text("Película", "Film", "映画"), game: text("Videojuego", "Video game", "ゲーム"), manga: text("Manga", "Manga", "漫画") },
} satisfies Record<Trait, Record<string, Record<Lang, string>>>;

export const MAX_GUESSES = 6;
const EPOCH = Date.UTC(2026, 9, 7);
const VERSION = "ma1";
// Stable order for this edition: existing daily answers cannot change during a refresh.
const dailyOrder = [7, 3, 19, 1, 11, 21, 4, 15, 9, 6, 13, 20, 0, 17, 12, 18, 8, 16, 2, 14, 10, 5];
function hash(input: string) { let h = 2166136261; for (const c of input) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

export function makePuzzle(mode: GameMode, seed: string | null = null, now = new Date()): Puzzle {
  const date = now.toISOString().slice(0, 10);
  const day = Math.floor((Date.parse(date + "T00:00:00Z") - EPOCH) / 86400000);
  if (mode === "practice" && !seed) seed = crypto.randomUUID();
  return { id: mode === "daily" ? VERSION + ":" + date : VERSION + ":practice:" + seed, date, mode, seed, number: day + 1,
    nextAt: new Date(Date.parse(date + "T00:00:00Z") + 86400000).toISOString(), maxGuesses: MAX_GUESSES,
    options: pool.map(({ id, name, japanese, aliases }) => ({ id, name, japanese, aliases })) };
}

export function answerFor(puzzle: Puzzle): Entry {
  const day = Math.floor((Date.parse(puzzle.date + "T00:00:00Z") - EPOCH) / 86400000);
  const index = puzzle.mode === "practice" ? hash(puzzle.seed || "") % pool.length : dailyOrder[((day % dailyOrder.length) + dailyOrder.length) % dailyOrder.length];
  return pool[index];
}

export function evaluate(puzzle: Puzzle, guesses: string[]): GameResult {
  if (guesses.length > MAX_GUESSES || new Set(guesses).size !== guesses.length || guesses.some(id => !pool.some(c => c.id === id))) throw new Error("INVALID_GUESSES");
  const target = answerFor(puzzle);
  const winIndex = guesses.indexOf(target.id);
  if (winIndex >= 0 && winIndex !== guesses.length - 1) throw new Error("FINISHED");
  const rows = guesses.map(id => {
    const c = pool.find(c => c.id === id)!;
    return { character: { id: c.id, name: c.name, japanese: c.japanese, aliases: c.aliases }, correct: c.id === target.id,
      cells: (["debut", "hair", "weapon", "medium"] as Trait[]).map(trait => ({ trait, value: (traits[trait] as Record<string, Record<Lang, string>>)[c[trait]],
        match: c[trait] === target[trait] ? "match" as const : trait === "weapon" && c.weaponFamily === target.weaponFamily ? "close" as const : "miss" as const })) };
  });
  const won = winIndex >= 0;
  const finished = won || guesses.length === MAX_GUESSES;
  return { puzzle, rows, won, finished, answer: finished ? { id: target.id, name: target.name, japanese: target.japanese, aliases: target.aliases, source: target.source } : null };
}
