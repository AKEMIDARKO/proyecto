import { addLanguages } from "./i18n.ts";
import { gameRows } from "./extra-game.ts";
const baseCopy = {
  es: {
    title: "Madokadle", subtitle: "Adivina al personaje del universo Madoka", daily: "Diaria", practice: "Práctica", today: "Personaje de hoy", practiceTitle: "Un recuerdo para practicar",
    intro: "Seis intentos. Cada personaje que pruebes te dará nuevas pistas.", pick: "Elige un personaje", search: "Busca por nombre…", empty: "No encontramos ese nombre.", guess: "Probar", checking: "Comprobando…", loading: "Preparando el recuerdo…", retry: "Reintentar",
    match: "Coincide", close: "Misma familia de armas", miss: "No coincide", character: "Personaje", debut: "Obra de debut", hair: "Cabello / pelaje", weapon: "Arma habitual", medium: "Medio de debut", results: "Tus intentos", attempts: "Intentos",
    won: "¡Has recuperado el recuerdo!", lost: "Este recuerdo se nos ha escapado", answer: "El personaje era", source: "Ver la fuente", share: "Copiar resultado", copied: "¡Resultado copiado!", fallback: "Selecciona y copia este texto:", next: "Siguiente personaje", another: "Otra partida", practiceNote: "La práctica no cuenta para las estadísticas diarias.",
    stats: "Tus estadísticas diarias", played: "Partidas", wins: "Victorias", streak: "Racha actual", best: "Mejor racha", days: "días", saved: "El progreso se guarda solo en este navegador. No necesitas cuenta.", unsaved: "Este navegador no permite guardar el progreso. Puedes jugar mientras mantengas abierta la página.",
    rules: "Cómo se juega", rule1: "Elige un nombre de la lista y pulsa Probar. Dispones de seis intentos y no puedes repetir un personaje.", rule2: "Verde y ✓: el dato coincide. Dorado y ≈: el arma es distinta, pero de la misma familia. Oscuro y ×: el dato no coincide.", rule3: "Las pistas usan la primera obra del personaje, su cabello o pelaje en tonos generales y su arma habitual. El blanco incluye el plateado; las armas se agrupan por tipo. Homura se clasifica por sus armas de fuego.", rule4: "El reto diario cambia a las 00:00 UTC y es el mismo en todos los idiomas. La práctica te permite iniciar tantas partidas como quieras.",
    universe: "Todo un universo de recuerdos", universeText: "22 personajes de Madoka Magica, Rebellion, Magia Record, Oriko, Kazumi, Tart y Suzune Magica. Las pistas describen a los personajes de sus historias.",
    scroll: "Desliza la tabla para ver todas las pistas.", loadError: "No hemos podido cargar la partida. Inténtalo de nuevo.", guessError: "No hemos podido comprobar el intento. No se ha gastado: vuelve a probar.", dayChanged: "Ya hay un nuevo personaje. Estamos preparando el reto de hoy.", resultLabel: "Resultado sin revelar el personaje", classic: "CLÁSICO", hint: "El verde puede coincidir en varios personajes: sigue cruzando las pistas.",
  },
  en: {
    title: "Madokadle", subtitle: "Guess the character from the Madoka universe", daily: "Daily", practice: "Practice", today: "Today's character", practiceTitle: "A memory to practise",
    intro: "Six guesses. Each character you try reveals new clues.", pick: "Choose a character", search: "Search by name…", empty: "We couldn't find that name.", guess: "Guess", checking: "Checking…", loading: "Preparing the memory…", retry: "Try again",
    match: "Matches", close: "Same weapon family", miss: "Does not match", character: "Character", debut: "Debut story", hair: "Hair / fur", weapon: "Usual weapon", medium: "Debut medium", results: "Your guesses", attempts: "Guesses",
    won: "You've recovered the memory!", lost: "This memory slipped away", answer: "The character was", source: "View the source", share: "Copy result", copied: "Result copied!", fallback: "Select and copy this text:", next: "Next character", another: "Another round", practiceNote: "Practice does not count towards daily statistics.",
    stats: "Your daily statistics", played: "Played", wins: "Wins", streak: "Current streak", best: "Best streak", days: "days", saved: "Progress is saved only in this browser. No account needed.", unsaved: "This browser cannot save progress. You can play while this page stays open.",
    rules: "How to play", rule1: "Choose a name from the list and press Guess. You have six attempts and cannot repeat a character.", rule2: "Green and ✓: the fact matches. Gold and ≈: a different weapon from the same family. Dark and ×: the fact does not match.", rule3: "Clues use the character's first story, broad hair or fur colours, and usual weapon. White includes silver, and weapons are grouped by type. Homura is classified by her firearms.", rule4: "The daily puzzle changes at 00:00 UTC and is the same in all languages. You can start as many practice rounds as you like.",
    universe: "A whole universe of memories", universeText: "22 characters from Madoka Magica, Rebellion, Magia Record, Oriko, Kazumi, Tart and Suzune Magica. Clues describe the characters from their stories.",
    scroll: "Swipe the table to see every clue.", loadError: "We couldn't load the puzzle. Please try again.", guessError: "We couldn't check your guess. It has not been used: please try again.", dayChanged: "A new character is ready. Loading today's puzzle.", resultLabel: "Result without revealing the character", classic: "CLASSIC", hint: "A green clue can match several characters: keep combining the clues.",
  },
  ja: {
    title: "Madokadle", subtitle: "まどかの世界のキャラクターを当てよう", daily: "毎日のクイズ", practice: "練習", today: "今日のキャラクター", practiceTitle: "練習のための記憶",
    intro: "チャンスは6回。答えるたびに、新しい手がかりが見つかります。", pick: "キャラクターを選ぶ", search: "名前で検索…", empty: "名前が見つかりません。", guess: "答える", checking: "確認中…", loading: "記憶を準備しています…", retry: "再試行",
    match: "一致", close: "同じ武器の系統", miss: "不一致", character: "キャラクター", debut: "初登場作品", hair: "髪・毛色", weapon: "通常の武器", medium: "初登場の媒体", results: "回答履歴", attempts: "回答回数",
    won: "記憶を取り戻しました！", lost: "この記憶には届きませんでした", answer: "正解のキャラクター", source: "出典を見る", share: "結果をコピー", copied: "コピーしました！", fallback: "この文章を選んでコピーしてください：", next: "次のキャラクター", another: "もう一度遊ぶ", practiceNote: "練習は毎日の成績に含まれません。",
    stats: "毎日の成績", played: "挑戦", wins: "正解", streak: "現在の連続正解", best: "最高の連続正解", days: "日", saved: "進行状況はこのブラウザーだけに保存されます。アカウントは不要です。", unsaved: "このブラウザーでは進行状況を保存できません。ページを開いている間は遊べます。",
    rules: "遊び方", rule1: "一覧から名前を選び、「答える」を押します。回答は6回まで。同じキャラクターは選べません。", rule2: "緑と✓は一致。金と≈は、武器は違っても同じ系統。暗い色と×は不一致です。", rule3: "初登場作品、大まかな髪・毛色、通常の武器を手がかりにしています。白には銀色も含み、武器は種類ごとに分類しています。ほむらは銃火器で分類します。", rule4: "毎日のクイズはUTCの午前0時に更新され、すべての言語で共通です。練習は何度でも新しい問題で遊べます。",
    universe: "さまざまな作品の記憶", universeText: "まどか☆マギカ、叛逆の物語、マギアレコード、おりこ、かずみ、たると、すずね☆マギカの22人が登場。それぞれの物語のキャラクターが手がかりです。",
    scroll: "表を横に動かすと、すべての手がかりが見られます。", loadError: "クイズを読み込めませんでした。もう一度お試しください。", guessError: "回答を確認できませんでした。回数は消費していません。もう一度お試しください。", dayChanged: "新しいキャラクターが登場しました。今日のクイズを準備しています。", resultLabel: "正解を伏せた結果", classic: "クラシック", hint: "緑の手がかりは、複数のキャラクターに当てはまることがあります。組み合わせて考えましょう。",
  },
};
export const gameCopy = addLanguages(baseCopy, gameRows);
