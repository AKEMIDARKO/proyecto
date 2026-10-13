import { addLanguages } from "./i18n.ts";
import { portalRows } from "./extra-words.ts";

const baseCopy = {
  es: {
    skip: "Saltar al contenido", breadcrumb: "Ruta de navegación", explore: "Explorar", archive: "Archivo",
    magical: "CHICAS MÁGICAS", pace: "EMPIEZA POR AQUÍ", characterCount: "personajes",
    daily: "EL RETO DIARIO", gameTitle: "¿A quién esconden los recuerdos?",
    gameText: "Adivina un personaje del universo Madoka con pistas de su obra, cabello y arma.",
    play: "Jugar a Madokadle", game: "Madokadle", gameIntro: "Un personaje, seis intentos. Un nuevo recuerdo cada día.",
    characterShortcut: "Conoce a las protagonistas", guideShortcut: "Empieza y resuelve tus dudas",
    newsShortcut: "Anuncios oficiales de Japón", gameShortcut: "Pon a prueba lo que sabes",
    recent: "Novedades de Exedra", notice: "Selección de anuncios · Japón", essential: "Guías para empezar",
    guidesSub: "Las respuestas a mano, antes de gastar recursos.", next: "Siguiente reto", seeNews: "Leer las novedades",
    introduction: "Presentación", selected: "En el archivo", profile: "Ficha", seo: "Magia Archive — Guías de Magia Exedra",
  },
  en: {
    skip: "Skip to content", breadcrumb: "Breadcrumb", explore: "Explore", archive: "Archive",
    magical: "MAGICAL GIRLS", pace: "START HERE", characterCount: "characters",
    daily: "THE DAILY PUZZLE", gameTitle: "Who is hiding in the memories?",
    gameText: "Guess a character from the Madoka universe using their story, hair and weapon as clues.",
    play: "Play Madokadle", game: "Madokadle", gameIntro: "One character, six guesses. A new memory every day.",
    characterShortcut: "Meet the heroines", guideShortcut: "Get started and find answers",
    newsShortcut: "Official announcements from Japan", gameShortcut: "Test your knowledge",
    recent: "Exedra updates", notice: "Selected announcements · Japan", essential: "Getting started guides",
    guidesSub: "Find your answers before spending resources.", next: "Next puzzle", seeNews: "Read the updates",
    introduction: "Introduction", selected: "In the archive", profile: "Profile", seo: "Magia Archive — Magia Exedra Guides",
  },
  ja: {
    skip: "本文へ移動", breadcrumb: "パンくずリスト", explore: "探す", archive: "アーカイブ",
    magical: "魔法少女たち", pace: "まずはここから", characterCount: "人",
    daily: "毎日のクイズ", gameTitle: "記憶の中にいるのは、誰？",
    gameText: "登場作品、髪の色、武器を手がかりに、まどかの世界のキャラクターを当てよう。",
    play: "Madokadleで遊ぶ", game: "Madokadle", gameIntro: "一人のキャラクターを、6回以内に。毎日、新しい記憶を。",
    characterShortcut: "主人公たちを知る", guideShortcut: "はじめ方と疑問の答え", newsShortcut: "日本公式のお知らせ", gameShortcut: "知識を試そう",
    recent: "エクセドラのニュース", notice: "選んで紹介するお知らせ・日本", essential: "はじめての方へのガイド",
    guidesSub: "素材を使う前に、知りたいことを確認。", next: "次のクイズ", seeNews: "ニュースを読む",
    introduction: "紹介", selected: "アーカイブの内容", profile: "プロフィール", seo: "Magia Archive — マギアエクセドラ攻略ガイド",
  },
};
export const portalCopy = addLanguages(baseCopy, portalRows);
