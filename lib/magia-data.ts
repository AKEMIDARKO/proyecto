import type { Lang } from "./locales";
import { localeNames } from "./locales.ts";
import { addLanguages } from "./i18n.ts";
import { wordRows } from "./extra-words.ts";
import { localized } from "./extra-content.ts";
import { communityGuides } from './community-guides.ts';
export type { Lang } from "./locales";
export type LocalText = Record<Lang, string>;
export const origin = "https://magia-archive.laescuelavt.chatgpt.site";
export const checked = "2026-10-07";
export const official = "https://madoka-exedra.com/en/";
export const faq = "https://faq.games.madoka-exedra.com/hc/en-us";

const baseWords = {
  es: {
    home: "Inicio", characters: "Personajes", guides: "Guías", news: "Novedades",
    creator: "Homulilly", menu: "Menú", language: "Idioma", all: "Ver todos",
    homeTitle: "Magia Archive", homeIntro: "Guías de Magia Exedra, personajes y un reto diario del universo Madoka.",
    featured: "GUÍA PARA EMPEZAR", heroTitle: "Tus primeros pasos entre recuerdos",
    heroText: "Una pequeña guía para conocer el juego, orientarte y empezar a tu ritmo.",
    readGuide: "Leer la guía", minutes: "min de lectura", latest: "Desde Japón",
    newsLink: "Ver novedades", collection: "El archivo de personajes", collectionSub: "Vuelve a encontrarte con tus chicas mágicas.",
    originLabel: "Serie de origen", filter: "Todas las series", search: "Buscar un personaje…",
    searchLabel: "Buscar personajes", characterIntro: "Conoce a las protagonistas de Madoka Magica y Magia Record.",
    noResults: "No encontramos ese personaje.", reset: "Limpiar búsqueda",
    guidesIntro: "Explicaciones sencillas para disfrutar del juego a tu ritmo.",
    author: "Un proyecto de Homulilly", fan: "Archivo fan independiente",
    creatorIntro: "Música, magia y un lugar al que volver.",
    creatorText: "Soy Homulilly, VSinger y creadora de contenido. Este archivo nace de mi cariño por Madoka y de las ganas de compartir ese universo con La Escuela.",
    creatorNote: "Entre covers en español, música y juegos, siempre hay un nuevo recuerdo que compartir.",
    creatorCard: "Más allá del juego", creatorCardTitle: "La voz detrás del archivo",
    creatorCardText: "Covers, música y comunidad con Homulilly.", meet: "Conoce a Homulilly",
    creatorTopics: ["Covers en español", "Música y anime", "La Escuela"],
    profile: "Presentación del personaje", introProfile: "Ficha introductoria",
    keylightTitle: "Un personaje, diferentes recuerdos",
    keylightText: "Un mismo personaje puede aparecer en distintas versiones o Kioku. Para consultar habilidades, comprueba siempre el nombre completo de la versión que tienes.",
    source: "Fuente oficial", sources: "Fuentes y revisión", revised: "Revisado el",
    sourceText: "Esta ficha presenta al personaje. Sus distintas versiones del juego se revisarán por separado.",
    newsTitle: "Novedades del universo Exedra", newsIntro: "Una selección de anuncios publicados en la web oficial japonesa.",
    regional: "Estos anuncios corresponden a Japón. Consulta los avisos de tu juego para comprobar su disponibilidad en la versión global.",
    published: "Publicado el", officialNews: "Leer el anuncio oficial", japan: "JAPÓN",
    officialSite: "Web oficial", help: "Ayuda oficial", disclaimer: "Magia Archive es un proyecto de fans, sin afiliación con Aniplex ni con los desarrolladores del juego.",
    footerArt: "Ilustraciones y recursos visuales: ©2024 Magica Quartet/Aniplex, Magia Exedra Project · ©Magica Quartet/Aniplex・WR.",
    articleLabel: "GUÍA", backGuides: "Todas las guías", moreGuides: "Sigue explorando",
    contents: "En esta guía", homeCrumb: "Inicio", archiveCount: "6 fichas introductorias",
    smallFeature: "PARA NUEVOS JUGADORES", smallTitle: "Antes de gastar tus tiradas",
    smallText: "Qué mirar en los detalles de cada banner.", viewArchive: "Explorar personajes",
    about: "Sobre el archivo", editorial: "Cómo cuidamos el contenido",
    editorialText: "Las fichas enlazan a sus fuentes. Las recomendaciones se distinguen de los datos oficiales. Las traducciones al español son propias del archivo.",
    beta: "Primera edición",
  },
  en: {
    home: "Home", characters: "Characters", guides: "Guides", news: "Updates",
    creator: "Homulilly", menu: "Menu", language: "Language", all: "View all",
    homeTitle: "Magia Archive", homeIntro: "Magia Exedra guides, characters and a daily puzzle from the Madoka universe.",
    featured: "BEGINNER'S GUIDE", heroTitle: "Your first steps through memories",
    heroText: "A short guide to finding your way around the game and starting at your own pace.",
    readGuide: "Read the guide", minutes: "min read", latest: "From Japan",
    newsLink: "View updates", collection: "The character archive", collectionSub: "Meet your magical girls again.",
    originLabel: "Original series", filter: "All series", search: "Search for a character…",
    searchLabel: "Search characters", characterIntro: "Meet the heroines of Madoka Magica and Magia Record.",
    noResults: "We couldn't find that character.", reset: "Clear search",
    guidesIntro: "Simple explanations to enjoy the game at your own pace.",
    author: "A project by Homulilly", fan: "Independent fan archive",
    creatorIntro: "Music, magic and a place to come back to.",
    creatorText: "I'm Homulilly, a VSinger and content creator. This archive grew out of my love for Madoka and my wish to share that universe with La Escuela.",
    creatorNote: "Between Spanish covers, music and games, there is always a new memory to share.",
    creatorCard: "Beyond the game", creatorCardTitle: "The voice behind the archive",
    creatorCardText: "Covers, music and community with Homulilly.", meet: "Meet Homulilly",
    creatorTopics: ["Spanish covers", "Music and anime", "La Escuela"],
    profile: "Character introduction", introProfile: "Introductory profile",
    keylightTitle: "One character, different memories",
    keylightText: "The same character can appear in different versions, or Kioku. When checking skills, always look at the full name of the version you own.",
    source: "Official source", sources: "Sources and review", revised: "Reviewed on",
    sourceText: "This profile introduces the character. Their individual in-game versions will be reviewed separately.",
    newsTitle: "Updates from the Exedra universe", newsIntro: "Selected announcements from the official Japanese website.",
    regional: "These announcements are for Japan. Check your in-game notices for availability in the global version.",
    published: "Published on", officialNews: "Read the official announcement", japan: "JAPAN",
    officialSite: "Official website", help: "Official help", disclaimer: "Magia Archive is a fan project, unaffiliated with Aniplex or the game's developers.",
    footerArt: "Artwork and visual assets: ©2024 Magica Quartet/Aniplex, Magia Exedra Project · ©Magica Quartet/Aniplex・WR.",
    articleLabel: "GUIDE", backGuides: "All guides", moreGuides: "Keep exploring",
    contents: "In this guide", homeCrumb: "Home", archiveCount: "6 introductory profiles",
    smallFeature: "FOR NEW PLAYERS", smallTitle: "Before spending your summons",
    smallText: "What to check in each banner's details.", viewArchive: "Explore characters",
    about: "About the archive", editorial: "How we look after our content",
    editorialText: "Profiles link to their sources. Recommendations are distinguished from official facts. Spanish translations are the archive's own.",
    beta: "First edition",
  },
  ja: {
    home: "ホーム", characters: "キャラクター", guides: "ガイド", news: "ニュース",
    creator: "Homulilly", menu: "メニュー", language: "言語", all: "すべて見る",
    homeTitle: "Magia Archive", homeIntro: "マギアエクセドラのガイド、キャラクター紹介、まどかの世界を楽しむ毎日のクイズ。",
    featured: "はじめての方へ", heroTitle: "記憶の世界への第一歩",
    heroText: "ゲームを知り、自分のペースで始めるための短いガイド。",
    readGuide: "ガイドを読む", minutes: "分", latest: "日本のニュース",
    newsLink: "ニュースを見る", collection: "キャラクターアーカイブ", collectionSub: "魔法少女たちに、もう一度会いに。",
    originLabel: "登場作品", filter: "すべての作品", search: "キャラクターを検索…",
    searchLabel: "キャラクター検索", characterIntro: "まどか☆マギカとマギアレコードの主人公たちを紹介します。",
    noResults: "キャラクターが見つかりませんでした。", reset: "検索をクリア",
    guidesIntro: "自分のペースでゲームを楽しむための、わかりやすい説明。",
    author: "Homulillyのプロジェクト", fan: "非公式ファンアーカイブ",
    creatorIntro: "音楽と魔法、そして帰ってこられる場所。",
    creatorText: "Homulillyです。VSingerとして音楽やコンテンツを届けています。このアーカイブは、まどかへの愛と、その世界をLa Escuelaのみんなと共有したいという思いから生まれました。",
    creatorNote: "スペイン語のカバー、音楽、ゲームを通して、新しい思い出を一緒に。",
    creatorCard: "ゲームの、その先へ", creatorCardTitle: "アーカイブを届ける声",
    creatorCardText: "Homulillyと楽しむカバー、音楽、コミュニティ。", meet: "Homulillyについて",
    creatorTopics: ["スペイン語のカバー", "音楽とアニメ", "La Escuela"],
    profile: "キャラクター紹介", introProfile: "紹介プロフィール",
    keylightTitle: "一人のキャラクター、さまざまな記憶",
    keylightText: "同じキャラクターでも、異なるバージョンやKiokuが登場します。スキルを確認するときは、所持しているバージョンの正式名称を見てください。",
    source: "公式情報", sources: "出典と確認", revised: "確認日",
    sourceText: "このページはキャラクターの紹介です。ゲーム内の各バージョンは別々に確認していきます。",
    newsTitle: "エクセドラの世界のニュース", newsIntro: "日本公式サイトのお知らせから選んで紹介します。",
    regional: "これらは日本向けのお知らせです。グローバル版の実施状況は、プレイしているゲーム内お知らせをご確認ください。",
    published: "公開日", officialNews: "公式のお知らせを読む", japan: "日本",
    officialSite: "公式サイト", help: "公式ヘルプ", disclaimer: "Magia Archiveはファンによる非公式プロジェクトです。アニプレックスおよびゲームの開発元とは関係ありません。",
    footerArt: "イラスト・ビジュアル素材：©2024 Magica Quartet/Aniplex, Magia Exedra Project · ©Magica Quartet/Aniplex・WR.",
    articleLabel: "ガイド", backGuides: "ガイド一覧", moreGuides: "もっと見る",
    contents: "このガイドの内容", homeCrumb: "ホーム", archiveCount: "6人の紹介プロフィール",
    smallFeature: "新しいプレイヤーへ", smallTitle: "ガチャを引く前に",
    smallText: "ガチャの詳細で確認したいこと。", viewArchive: "キャラクターを見る",
    about: "アーカイブについて", editorial: "コンテンツの方針",
    editorialText: "プロフィールには出典へのリンクを掲載しています。おすすめと公式の情報を区別し、各言語の文章は当アーカイブで作成しています。",
    beta: "初版",
  },
};

export const words = addLanguages(baseWords, wordRows);

export const characters = [
  { id: "madoka", name: "Madoka Kaname", japanese: "鹿目まどか", series: "Madoka Magica", color: "#df93b7", image: "/assets/madoka.webp", position: "16% 50%",
    description: localized({ es: "Madoka cursa segundo de secundaria y comparte una vida cotidiana feliz con su familia y sus amigas. Aunque es algo tímida, su carácter cariñoso la lleva a preocuparse por las personas que la rodean.", en: "Madoka is a second-year middle-school student who enjoys everyday life with her family and friends. She can be shy, but her caring personality leads her to look after the people around her.", ja: "まどかは、家族や友人に囲まれて幸せな毎日を送る中学二年生。少し内気ですが、心優しく、周りの人を大切にしています。" }, 0), source: "https://madoka-exedra.com/en/character/?id=01" },
  { id: "homura", name: "Homura Akemi", japanese: "暁美ほむら", series: "Madoka Magica", color: "#a995da", image: "/assets/homura.webp", position: "68% 50%",
    description: localized({ es: "Homura llega al colegio de Madoka como una misteriosa estudiante transferida. Su actitud hacia Mami y Sayaka resulta distante, mientras que con Madoka muestra preocupación y le ofrece consejos.", en: "Homura arrives at Madoka's school as a mysterious transfer student. She seems distant towards Mami and Sayaka, while showing concern for Madoka and offering her advice.", ja: "まどかの学校に転校してきた謎めいた少女。マミやさやかには距離を置く一方、まどかを気にかけ、助言を与えます。" }, 1), source: "https://madoka-exedra.com/en/character/?id=03" },
  { id: "mami", name: "Mami Tomoe", japanese: "巴マミ", series: "Madoka Magica", color: "#d6b875", image: "/assets/mami.webp", position: "96% 50%",
    description: localized({ es: "Mami es una chica mágica experimentada que ya luchaba contra las brujas antes de conocer a Madoka y sus amigas. Al descubrir su potencial, decide acompañar a Madoka y Sayaka y enseñarles ese mundo.", en: "Mami is an experienced magical girl who was fighting witches before meeting Madoka and her friends. After learning about their potential, she decides to guide Madoka and Sayaka through that world.", ja: "まどかたちと出会う前から魔女と戦っていた、経験豊かな魔法少女。まどかとさやかの素質を知り、二人を導きます。" }, 2), source: "https://madoka-exedra.com/en/character/?id=04" },
  { id: "sayaka", name: "Sayaka Miki", japanese: "美樹さやか", series: "Madoka Magica", color: "#7cb8de", image: "/assets/sayaka.webp", position: "56% 50%",
    description: localized({ es: "Sayaka es enérgica y tiene un fuerte sentido de la justicia. Admira a Mami por proteger a otras personas y desea emplear su magia para ayudar a los demás.", en: "Sayaka is energetic and has a strong sense of justice. She admires Mami for protecting people and wants to use her own magic to help others.", ja: "元気で正義感の強い少女。人を守るマミに憧れ、自分の魔法で誰かの力になりたいと願っています。" }, 3), source: "https://madoka-exedra.com/en/character/?id=07" },
  { id: "kyoko", name: "Kyoko Sakura", japanese: "佐倉杏子", series: "Madoka Magica", color: "#da858f", image: "/assets/kyoko.webp", position: "61% 50%",
    description: localized({ es: "Kyoko llega a Mitakihara tras un incidente, con la intención de ocupar ese territorio. Su forma de actuar choca con la de Sayaka, aunque sus motivos para formular un deseo terminan acercándolas.", en: "Kyoko comes to Mitakihara after an incident, seeking to claim the area. Her approach clashes with Sayaka's, although the reasons behind their wishes eventually bring them closer.", ja: "ある出来事のあと、縄張りを求めて見滝原へやってきた魔法少女。さやかとは考え方が異なりますが、願いに込めた思いを通じて距離が縮まります。" }, 4), source: "https://madoka-exedra.com/en/character/?id=06" },
  { id: "iroha", name: "Iroha Tamaki", japanese: "環いろは", series: "Magia Record", color: "#e1a3b4", image: "/assets/iroha.webp", position: "83% 50%",
    description: localized({ es: "Iroha viaja a Kamihama para entender unos sueños extraños. Es amable y suele preocuparse mucho por los demás. Aunque normalmente es reservada y no se le da bien la tecnología, muestra determinación cuando hace falta.", en: "Iroha travels to Kamihama to understand strange dreams. She is kind and often worries about other people. Usually reserved and awkward with technology, she shows determination when it matters.", ja: "不思議な夢の意味を知るため、神浜へ向かういろは。優しく、周囲を気遣う少女です。控えめで機械は苦手ですが、大切な場面では強い意志を見せます。" }, 5), source: "https://madoka-exedra.com/en/character/?id=02" },
];

export type Guide = { id: string; title: LocalText; summary: LocalText; image: string; position?: string; minutes: number; reviewedAt?: string; category: LocalText; sections: { title: LocalText; text: LocalText }[]; sources: { title: string; url: string }[] };
export const guides: Guide[] = [
  ...communityGuides,
  { id: "first-steps", title: localized({ es: "Tus primeros pasos en Magia Exedra", en: "Your first steps in Magia Exedra", ja: "マギアエクセドラのはじめ方" }, 6),
    summary: localized({ es: "Dónde empezar, cómo encontrar ayuda y qué revisar antes de gastar recursos.", en: "Where to start, how to find help and what to check before spending resources.", ja: "最初に進めること、ヘルプの場所、素材を使う前に確認したいこと。" }, 7),
    category: localized({ es: "Primeros pasos", en: "Getting started", ja: "はじめての方へ" }, 8), image: "/assets/hero.webp", minutes: 3,
    sections: [
      { title: localized({ es: "1. Sitúate en el universo Exedra", en: "1. Find your place in Exedra", ja: "1. エクセドラの世界を知る" }, 9), text: localized({ es: "Magia Exedra reúne a chicas mágicas de Madoka Magica, Magia Record y otras historias. Sus recuerdos dan forma a un RPG en el que recorres laberintos de brujas y formas tu equipo. Sigue el tutorial para familiarizarte con sus pantallas antes de planificar mejoras.", en: "Magia Exedra brings together magical girls from Madoka Magica, Magia Record and other stories. Their memories shape an RPG where you explore Witch Labyrinths and form your team. Follow the tutorial to become familiar with its screens before planning upgrades.", ja: "マギアエクセドラには「魔法少女まどか☆マギカ」「マギアレコード」などの魔法少女が登場します。記憶をたどり、魔女の結界を探索しながらチームを編成するRPGです。育成を考える前に、チュートリアルで各画面に慣れていきましょう。" }, 10) },
      { title: localized({ es: "2. Guarda una ruta hacia la ayuda", en: "2. Know where to find Help", ja: "2. ヘルプの場所を覚える" }, 11), text: localized({ es: "La ayuda está dentro del juego: abre Menu, en la parte superior derecha, y después Help. El soporte oficial remite a esa pantalla para explicar el combate, los roles, las mejoras y los términos. El icono puede no aparecer mientras lees una historia.", en: "Help is inside the game: open Menu in the upper right, then Help. Official support points to this screen for explanations of combat, roles, training and terminology. The icon may be hidden while you are reading a story.", ja: "ゲーム画面の右上にあるMenuを開き、Helpを選びます。公式サポートは、バトル、ロール、育成、用語の説明をこの画面で確認するよう案内しています。ストーリー中はメニューが表示されない場合があります。" }, 12) },
      { title: localized({ es: "3. Identifica lo que vas a mejorar", en: "3. Identify what you are upgrading", ja: "3. 育成する対象を確認する" }, 13), text: localized({ es: "En los apartados de mejoras encontrarás Kioku, Portraits y Heartphials. Consulta la ayuda de cada sistema antes de usar materiales. Como consejo para empezar, elige una mejora con un objetivo concreto y revisa su coste en la pantalla de confirmación.", en: "Training includes Kioku, Portraits and Heartphials. Read the Help for each system before using materials. As a starting recommendation, choose an upgrade with a clear purpose and check its cost on the confirmation screen.", ja: "育成にはKioku、Portraits、Heartphialsなどのシステムがあります。素材を使う前に、それぞれのヘルプを確認しましょう。はじめのうちは目的を一つ決め、確認画面で必要な素材を確かめることをおすすめします。" }, 14) },
      { title: localized({ es: "4. Lee el banner antes de invocar", en: "4. Read the banner before summoning", ja: "4. ガチャの詳細を読む" }, 15), text: localized({ es: "Como recomendación del archivo, revisa las fechas, la moneda necesaria, las probabilidades y las condiciones que aparecen en los detalles del banner. Si ves un contador o una recompensa por invocaciones, lee qué se conserva y qué caduca antes de gastar.", en: "As an archive recommendation, check the dates, required currency, rates and conditions shown in the banner details. If you see a counter or a summon reward, read what carries over and what expires before spending.", ja: "当アーカイブでは、ガチャの期間、必要な通貨、提供割合、個別の条件を確認してから引くことをおすすめしています。回数に応じた報酬やカウンターがある場合は、引き継ぎと有効期限の説明も読みましょう。" }, 16) },
      { title: localized({ es: "5. Comprueba de qué versión es un anuncio", en: "5. Check which version an announcement belongs to", ja: "5. お知らせの対象版を確認する" }, 17), text: localized({ es: "Leer una noticia traducida no cambia la versión a la que pertenece. En este archivo los anuncios japoneses se identifican como Japón. Para tus eventos y recompensas, comprueba los avisos de tu propio juego.", en: "Reading a translated announcement does not change which version it belongs to. This archive labels Japanese announcements as Japan. Check your own in-game notices for your events and rewards.", ja: "翻訳されたお知らせでも、対象となるゲームの版は変わりません。当アーカイブの日本向けのお知らせには「日本」と表示しています。自分のイベントや報酬については、プレイ中のゲーム内お知らせを確認してください。" }, 18) },
    ],
    sources: [
      { title: "Aniplex · Magia Exedra en Steam", url: "https://store.steampowered.com/app/2987800/Madoka_Magica_Magia_Exedra/" },
      { title: "Official Help · Battles", url: faq + "/articles/43581008714137-I-want-to-know-basic-battle-info-like-how-combat-and-roles-work" },
      { title: "Official Help · Training", url: faq + "/articles/43580972909209-I-want-to-know-about-training-Kioku-Portraits-and-Heartphials" },
    ],
  },
  { id: "summon-details", title: localized({ es: "Antes de gastar tus tiradas", en: "Before spending your summons", ja: "ガチャを引く前に" }, 19),
    summary: localized({ es: "Una lista sencilla para leer las condiciones de cada banner.", en: "A short checklist for reading each banner's conditions.", ja: "それぞれのガチャの条件を確認するための、短いチェックリスト。" }, 20),
    category: localized({ es: "Invocaciones", en: "Summoning", ja: "ガチャ" }, 21), image: "/assets/homura.webp", position: "68% 50%", minutes: 2,
    sections: [
      { title: localized({ es: "1. Empieza por los detalles", en: "1. Start with the details", ja: "1. 詳細から確認する" }, 22), text: localized({ es: "Esta guía es una recomendación de lectura, no una tabla de probabilidades. Abre la información del banner y comprueba qué versiones están destacadas, qué moneda utiliza y cuándo termina. Revisa el horario mostrado en tu versión del juego.", en: "This guide is a reading recommendation, not a table of rates. Open the banner information and check which versions are featured, which currency it uses and when it ends. Check the time displayed in your version of the game.", ja: "このガイドは確認方法の提案であり、提供割合の一覧ではありません。ガチャの詳細を開き、ピックアップ対象、必要な通貨、終了日時を確認しましょう。時刻は自分がプレイする版の表示を見てください。" }, 23) },
      { title: localized({ es: "2. Distingue las distintas condiciones", en: "2. Separate the different conditions", ja: "2. 条件を分けて考える" }, 24), text: localized({ es: "La probabilidad de una rareza, la de una versión destacada y las recompensas de un contador son cosas distintas. Si no entiendes una de esas condiciones, consulta la ayuda o el texto completo antes de decidir. No calcules una garantía a partir de otro banner.", en: "The rate for a rarity, the rate for a featured version and a counter's rewards are different things. If one of those conditions is unclear, read the Help or the full description before deciding. Do not infer a guarantee from a different banner.", ja: "レアリティの提供割合、ピックアップ対象の提供割合、回数に応じた報酬は、それぞれ別の条件です。不明な点はヘルプや詳細説明を読んでから判断しましょう。別のガチャの条件から保証を推測しないようにしてください。" }, 25) },
      { title: localized({ es: "3. Comprueba los contadores", en: "3. Check the counters", ja: "3. カウンターの条件を確認する" }, 26), text: localized({ es: "Si un banner muestra puntos o progreso, busca su explicación. Comprueba cómo se obtienen, para qué sirven y si tienen fecha de caducidad. Conserva una captura del texto si necesitas revisarlo con calma.", en: "If a banner displays points or progress, find the explanation. Check how they are earned, what they can be used for and whether they expire. Keep a screenshot of the text if you need time to review it.", ja: "ポイントや進行度が表示されている場合は、その説明を読みましょう。獲得方法、使い道、有効期限を確認します。落ち着いて読み返したい場合は、説明文のスクリーンショットを残しておくと便利です。" }, 27) },
      { title: localized({ es: "4. Decide antes de pulsar", en: "4. Decide before tapping", ja: "4. 引く前に使う量を決める" }, 28), text: localized({ es: "Como consejo del archivo, fija cuánto quieres utilizar antes de empezar y comprueba el coste que aparece en la confirmación. Puedes guardar tus recursos y volver cuando tengas una decisión clara.", en: "As an archive recommendation, decide how much you want to use before starting and check the cost on the confirmation screen. You can keep your resources and return when you have a clear decision.", ja: "当アーカイブでは、使う量を先に決め、確認画面の費用を見てから引くことをおすすめしています。迷っているときは素材を取っておき、判断がついてから戻ることもできます。" }, 29) },
    ], sources: [{ title: "Official Help · Functions and terms", url: faq + "/articles/43580892035737-I-want-to-know-more-about-in-game-functions-and-terms" }],
  },
  { id: "game-help", title: localized({ es: "Dónde encontrar las respuestas del juego", en: "Where to find the game's answers", ja: "ゲームの疑問を調べるには" }, 30),
    summary: localized({ es: "La ruta hacia las explicaciones de combate, mejoras y términos.", en: "How to find explanations of combat, training and terminology.", ja: "バトル、育成、用語の説明を見つける方法。" }, 31),
    category: localized({ es: "Ayuda del juego", en: "Game Help", ja: "ゲームのヘルプ" }, 32), image: "/assets/gameplay.webp", minutes: 2,
    sections: [
      { title: localized({ es: "1. Abre Menu y después Help", en: "1. Open Menu, then Help", ja: "1. MenuからHelpを開く" }, 33), text: localized({ es: "Desde una pantalla del juego, toca el icono de Menu situado arriba a la derecha y selecciona Help. Es la ruta indicada por el soporte oficial. Durante las historias el icono puede estar oculto; vuelve a una pantalla del juego para buscarlo.", en: "From an in-game screen, tap the Menu icon in the upper right and select Help. This is the route provided by official support. The icon may be hidden during stories; return to an in-game screen to find it.", ja: "ゲーム画面の右上にあるMenuを押し、Helpを選びます。公式サポートが案内している手順です。ストーリー中にメニューが見えない場合は、ゲーム画面に戻ってから探してください。" }, 34) },
      { title: localized({ es: "2. Busca el sistema que necesitas", en: "2. Find the system you need", ja: "2. 知りたいシステムを探す" }, 35), text: localized({ es: "Para las dudas sobre combate y roles, consulta la sección correspondiente de Help. Para las mejoras, busca las explicaciones de Kioku, Portraits y Heartphials. La FAQ de la web remite al juego para estos detalles.", en: "For questions about combat and roles, check the relevant Help section. For training, look for Kioku, Portraits and Heartphials. The website's FAQ directs you to in-game Help for these details.", ja: "バトルやロールの疑問は、Helpの該当項目を確認します。育成についてはKioku、Portraits、Heartphialsの説明を探してください。ウェブのFAQでも、詳しい内容はゲーム内ヘルプで確認するよう案内しています。" }, 36) },
      { title: localized({ es: "3. Distingue una duda de un problema técnico", en: "3. Separate a question from a technical issue", ja: "3. 疑問と不具合を区別する" }, 37), text: localized({ es: "Si el juego se cierra, se bloquea o no funciona correctamente, el soporte recomienda reiniciar el juego y el dispositivo, borrar la caché y usar una conexión estable. Si el problema continúa, utiliza el formulario de contacto del soporte oficial.", en: "If the app crashes, freezes or does not work properly, support recommends restarting the app and your device, clearing the cache and using a stable connection. If the problem continues, use the official support contact form.", ja: "アプリが落ちる、固まる、正常に動かない場合、公式サポートはゲームと端末の再起動、キャッシュの削除、安定した通信環境での利用を案内しています。改善しない場合は、公式サポートのお問い合わせフォームをご利用ください。" }, 38) },
    ], sources: [
      { title: "Official Help · Battles", url: faq + "/articles/43581008714137-I-want-to-know-basic-battle-info-like-how-combat-and-roles-work" },
      { title: "Official Help · Training", url: faq + "/articles/43580972909209-I-want-to-know-about-training-Kioku-Portraits-and-Heartphials" },
      { title: "Official FAQ", url: faq },
    ],
  },
];

export { news } from "./news-data.ts";

export function dateLabel(date: string, lang: Lang) {
  return new Intl.DateTimeFormat(localeNames[lang], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date.includes("T") ? date : date + "T12:00:00Z"));
}
