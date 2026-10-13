import { rows } from './i18n.ts';
import { languages,type Lang } from './locales.ts';
import catalog from './item-catalog.json' with {type:'json'};
import { kiokuCopy } from './kioku-copy.ts';
const translations=rows(`
currencies~Monedas y medallas~Currencies and medals~通貨・メダル~Waluty i medale~Monnaies et médailles~Valute e medaglie~Währungen und Medaillen~货币与奖章~貨幣與獎章
tickets~Llaves y entradas~Keys and tickets~キー・チケット~Klucze i bilety~Clés et tickets~Chiavi e biglietti~Schlüssel und Tickets~钥匙与票券~鑰匙與票券
consumables~Consumibles~Consumables~消費アイテム~Materiały zużywalne~Consommables~Consumabili~Verbrauchsgegenstände~消耗品~消耗品
rewards~Trofeos~Trophies~トロフィー~Trofea~Trophées~Trofei~Trophäen~奖杯~獎盃
materials~Materiales de mejora~Upgrade materials~育成素材~Materiały rozwoju~Matériaux d'amélioration~Materiali di miglioramento~Verbesserungsmaterialien~培养素材~培養素材
intro~66 objetos documentados: consulta su uso, nombre japonés y fuente. Los objetos de eventos pueden cambiar según la versión del juego.~66 documented items: purpose, Japanese name and source. Event items can vary by game version.~確認済み66アイテム。用途・日本語名・出典。イベント品はバージョンで異なる場合があります。~66 przedmiotów: zastosowanie, nazwa japońska i źródło. Wydarzenia zależą od wersji.~66 objets documentés : utilité, nom japonais et source. Les événements varient selon la version.~66 oggetti: uso, nome giapponese e fonte. Eventi variabili per versione.~66 belegte Gegenstände: Zweck, japanischer Name und Quelle. Events können je nach Version abweichen.~66项已核实道具：用途、日文名和来源；活动道具可能因游戏版本而异。~66項已核實道具：用途、日文名和來源；活動道具可能因遊戲版本而異。
stone~Piedra~Stone~ストーン~Kamień~Pierre~Pietra~Stein~石~石
gem~Gema~Gem~ジェム~Klejnot~Gemme~Gemma~Edelstein~宝石~寶石
orb~Orbe~Orb~オーブ~Kula~Orbe~Sfera~Kugel~宝珠~寶珠
core~Núcleo~Core~コア~Rdzeń~Noyau~Nucleo~Kern~核心~核心
prism~Prisma~Prism~プリズム~Pryzmat~Prisme~Prisma~Prisma~棱镜~稜鏡
small~Pequeño~Small~小~Mały~Petit~Piccolo~Klein~小~小
medium~Mediano~Medium~中~Średni~Moyen~Medio~Mittel~中~中
large~Grande~Large~大~Duży~Grand~Grande~Groß~大~大
magica-stone~Piedra de Magica~Magica Stone~マギカストーン~Kamień Magica~Pierre de Magica~Pietra Magica~Magica-Stein~魔法石~魔法石
aq-chip~Chip A-Q~A-Q Chip~A-Qチップ~Chip A-Q~Puce A-Q~Chip A-Q~A-Q-Chip~A-Q芯片~A-Q晶片
kioku-medal~Medalla Kioku~Kioku Medal~キオクメダル~Medal Kioku~Médaille Kioku~Medaglia Kioku~Kioku-Medaille~记忆奖章~記憶獎章
remain-medal~Medalla Remain~Remain Medal~リメインメダル~Medal Remain~Médaille Remain~Medaglia Remain~Remain-Medaille~余忆奖章~餘憶獎章
arena-medal~Medalla de combate~Match Medal~対戦メダル~Medal walki~Médaille de combat~Medaglia battaglia~Kampfmedaille~对战奖章~對戰獎章
archive-medal~Medalla de archivo~Archive Medal~アーカイブメダル~Medal archiwum~Médaille d'archive~Medaglia archivio~Archivmedaille~档案奖章~檔案獎章
memorial-medal~Medalla memorial~Memorial Medal~メモリアルメダル~Medal wspomnień~Médaille mémorielle~Medaglia memoriale~Erinnerungsmedaille~纪念奖章~紀念獎章
exchange~Medalla de intercambio de Kioku~Kioku exchange medal~キオク交換メダル~Medal wymiany Kioku~Médaille d'échange Kioku~Medaglia scambio Kioku~Kioku-Tauschmedaille~记忆兑换奖章~記憶兌換獎章
magia-key~Llave de Magia~Magia Key~マギアキー~Klucz Magia~Clé de Magia~Chiave Magia~Magia-Schlüssel~Magia钥匙~Magia鑰匙
guaranteed~Garantizado~Guaranteed~確定~Gwarantowane~Garanti~Garantito~Garantiert~必出~必出
wishlist~Lista de deseos~Wishlist~ウィッシュリスト~Lista życzeń~Liste de souhaits~Lista desideri~Wunschliste~心愿单~心願單
fragment~Fragmento~Fragment~かけら~Fragment~Fragment~Frammento~Fragment~碎片~碎片
memory-ticket~Billete de recuerdos~Memory Ticket~記憶の切符~Bilet wspomnień~Ticket de mémoire~Biglietto ricordo~Erinnerungsticket~记忆票券~記憶票券
style-ticket~Entrada de estilo~Style Ticket~スタイルチケット~Bilet stylu~Ticket de style~Biglietto stile~Stilticket~造型票券~造型票券
crystalis-skip-ticket~Entrada de Crystalis~Crystalis Ticket~能力晶花チケット~Bilet Crystalis~Ticket Crystalis~Biglietto Crystalis~Crystalis-Ticket~能力晶花票券~能力晶花票券
magical-cube~Cubo mágico~Magical Cube~マジカルキューブ~Magiczny sześcian~Cube magique~Cubo magico~Magischer Würfel~魔法方块~魔法方塊
magical-ring~Anillo mágico~Magical Ring~マジカルリング~Magiczny pierścień~Anneau magique~Anello magico~Magischer Ring~魔法戒指~魔法戒指
paint-drop~Gota de pintura~Paint Drop~ペイントドロップ~Kropla farby~Goutte de peinture~Goccia colore~Farbtropfen~颜料滴~顏料滴
open-vase~Jarrón de apertura~Open Vase~オープンヴェイス~Otwierająca waza~Vase d'ouverture~Vaso apertura~Öffnungsvase~开放花瓶~開放花瓶
drop-lock~Bloqueo de gotas~Drop Lock~ドロップロック~Blokada kropli~Verrou de goutte~Blocco gocce~Tropfensperre~锁定滴~鎖定滴
enhance-glow~Brillo de mejora~Enhance Glow~エンハンスグロウ~Blask rozwoju~Lueur d'amélioration~Bagliore crescita~Verbesserungsglanz~强化辉光~強化輝光
heart-sand~Arena del corazón~Heart Sand~こころの砂~Piasek serca~Sable du cœur~Sabbia del cuore~Herzenssand~心之沙~心之沙
magia-book~Libro de Magia~Magia Book~マギアブック~Księga Magia~Livre de Magia~Libro Magia~Magia-Buch~Magia之书~Magia之書
magical-palette~Paleta mágica~Magical Palette~マジカルパレット~Magiczna paleta~Palette magique~Tavolozza magica~Magische Palette~魔法调色盘~魔法調色盤
kioku-crystal~Cristal Kioku~Kioku Crystal~キオククリスタル~Kryształ Kioku~Cristal Kioku~Cristallo Kioku~Kioku-Kristall~记忆水晶~記憶水晶
trophy-bronze~Trofeo de bronce~Bronze Trophy~ブロンズトロフィー~Brązowe trofeum~Trophée de bronze~Trofeo bronzo~Bronzetrophäe~铜奖杯~銅獎盃
trophy-silver~Trofeo de plata~Silver Trophy~シルバートロフィー~Srebrne trofeum~Trophée d'argent~Trofeo argento~Silbertrophäe~银奖杯~銀獎盃
trophy-gold~Trofeo de oro~Gold Trophy~ゴールドトロフィー~Złote trofeum~Trophée d'or~Trofeo oro~Goldtrophäe~金奖杯~金獎盃
trophy-platinum~Trofeo de platino~Platinum Trophy~プラチナトロフィー~Platynowe trofeum~Trophée de platine~Trofeo platino~Platintrophäe~白金奖杯~白金獎盃
useCurrency~Moneda o medalla para intercambiar recursos en la tienda correspondiente.~Currency or medal exchanged for resources in its shop.~対応するショップで交換に使う通貨・メダル。~Waluta lub medal do wymiany w sklepie.~Monnaie ou médaille à échanger en boutique.~Valuta o medaglia da scambiare nel negozio.~Währung oder Medaille zum Tauschen im jeweiligen Laden.~在对应商店兑换资源的货币或奖章。~在對應商店兌換資源的貨幣或獎章。
useStone~Se usa para invocaciones y para ciertas recuperaciones de energía o de la Caja de Magia.~Used for Fate Weave and certain energy or Magia Box refills.~ガチャや一部のスタミナ・マギアボックス回復に使用。~Do przywołań i wybranych odnowień energii lub skrzyni.~Utilisée pour invocations et certaines recharges.~Per evocazioni e alcune ricariche energia o Magia Box.~Für Beschwörungen und bestimmte Energie- oder Boxauffüllungen.~用于召唤及部分体力或Magia宝箱补充。~用於召喚及部分體力或Magia寶箱補充。
useAq~Moneda para mejoras de los Kioku, incluido el desbloqueo mágico.~Upgrade currency for Kioku, including Magic Unlock.~魔力解放などキオクの育成に使用する通貨。~Waluta rozwoju Kioku, w tym magii.~Monnaie d'amélioration des Kioku, dont la magie.~Valuta per migliorare Kioku e sblocco magico.~Währung für Kioku-Verbesserungen und Magiefreischaltung.~记忆培养与魔力解放所用货币。~記憶培養與魔力解放所用貨幣。
useMagic~Material de desbloqueo mágico. La variante de prisma se comparte entre elementos; las demás corresponden a su elemento.~Magic Unlock material. Prism is shared across elements; other variants match their element.~魔力解放素材。プリズムは全属性共通、他は属性別。~Materiał magii. Pryzmat wspólny, pozostałe zgodne z żywiołem.~Matériau magique : prisme commun, autres variantes par élément.~Materiale magico: prisma comune, altre varianti per elemento.~Magiefreischaltung: Prisma ist gemeinsam, andere sind elementspezifisch.~魔力解放素材，棱镜通用，其他对应各属性。~魔力解放素材，稜鏡通用，其他對應各屬性。
useKey~Permite invocar Kioku en el banner correspondiente. Respeta la rareza y las condiciones indicadas en el juego.~Summons Kioku on its matching banner. Check the rarity and conditions shown in game.~対応ガチャでキオクを召喚。レア度・条件はゲーム内を確認。~Przywołuje Kioku w odpowiednim bannerze. Sprawdź warunki.~Invoque des Kioku sur le portail correspondant. Vérifiez les conditions.~Evoca Kioku nel banner relativo. Controlla condizioni e rarità.~Beschwört Kioku im passenden Banner. Prüfe Bedingungen und Seltenheit.~在对应卡池召唤记忆，请确认稀有度与条件。~在對應卡池召喚記憶，請確認稀有度與條件。
useMemory~Desbloquea un evento antiguo en el Archivo.~Unlocks a past event in the Archive.~アーカイブの過去イベントを解放。~Odblokowuje dawne wydarzenie w archiwum.~Débloque un ancien événement de l'Archive.~Sblocca un evento passato nell'Archivio.~Schaltet ein vergangenes Archiv-Event frei.~解锁档案中的往期活动。~解鎖檔案中的往期活動。
useCube~Recupera QP para las misiones de mejora.~Restores QP for Upgrade Quests.~強化クエスト用QPを回復。~Odnawia QP zadań ulepszania.~Restaure les QP pour l'amélioration.~Ripristina QP per miglioramento.~Stellt QP für Verbesserungsquests wieder her.~恢复强化任务所需QP。~恢復強化任務所需QP。
useRing~Recupera LP para participar en incursiones de enlace.~Restores LP for Link Raids.~リンクレイド用LPを回復。~Odnawia LP do Link Raid.~Restaure les LP des raids liés.~Ripristina LP per Link Raid.~Stellt LP für Link-Raids wieder her.~恢复联动突袭所需LP。~恢復連動突襲所需LP。
usePaint~Vuelve a sortear los efectos de mejora de una habilidad Crystalis.~Rerolls the boost effects of a Crystalis ability.~晶花アビリティのブースト効果を再抽選。~Losuje ponownie efekty wzmocnienia Crystalis.~Relance les bonus d'une compétence Crystalis.~Riassegna bonus di un'abilità Crystalis.~Würfelt Verstärkungen einer Crystalis-Fähigkeit neu.~重新抽取能力晶花的强化效果。~重新抽取能力晶花的強化效果。
useVase~Amplía las ranuras disponibles para habilidades Crystalis.~Unlocks additional Crystalis ability slots.~晶花アビリティの装備枠を拡張。~Rozszerza miejsca umiejętności Crystalis.~Ouvre des emplacements Crystalis.~Sblocca slot aggiuntivi Crystalis.~Schaltet weitere Crystalis-Plätze frei.~解锁更多能力晶花装备栏位。~解鎖更多能力晶花裝備欄位。
useLock~Fija un efecto de mejora de Crystalis durante una nueva tirada.~Locks a Crystalis boost while rerolling.~再抽選時に晶花ブースト効果を固定。~Blokuje bonus Crystalis przy losowaniu.~Verrouille un bonus Crystalis lors d'une relance.~Blocca un bonus Crystalis durante un nuovo tiro.~Fixiert einen Crystalis-Bonus beim Neuwürfeln.~重新抽取时锁定能力晶花的强化效果。~重新抽取時鎖定能力晶花的強化效果。
useGlow~Experiencia para subir el nivel de los Kioku.~Experience for leveling Kioku.~キオクのレベルアップ用経験値。~Doświadczenie poziomu Kioku.~Expérience pour les Kioku.~Esperienza per i Kioku.~Erfahrung für Kioku-Level.~提升记忆等级的经验。~提升記憶等級的經驗。
useHeart~Experiencia del vínculo de la chica mágica, compartido por sus distintas versiones de Kioku.~Heartphial experience shared by a magical girl's Kioku versions.~同じ魔法少女のキオクで共有するこころの器経験値。~Doświadczenie Heartphial wspólne dla wersji dziewczyny.~Expérience Heartphial partagée entre versions.~Esperienza Heartphial condivisa tra versioni.~Heartphial-Erfahrung für alle Versionen einer Magical Girl.~同一魔法少女各版本共享的心之容器经验。~同一魔法少女各版本共享的心之容器經驗。
useBook~Mejora el nivel de habilidad especial de los Kioku. Cada nivel puede pedir distintos tamaños.~Upgrades Kioku special skills. Each level may require different sizes.~必殺技Lvを強化。レベルにより必要サイズが異なる。~Ulepsza specjalne umiejętności Kioku. Rozmiary zależą od poziomu.~Améliore la compétence spéciale ; tailles selon le niveau.~Migliora abilità speciali; dimensioni secondo il livello.~Verbessert Spezialfähigkeiten; Größen variieren nach Level.~强化必杀技，各等级所需尺寸不同。~強化必殺技，各等級所需尺寸不同。
usePalette~Mejora las habilidades de los retratos. Cada nivel puede pedir distintos tamaños.~Upgrades portrait abilities. Each level may require different sizes.~ポートレイトのアビリティ強化。必要サイズはレベル別。~Ulepsza umiejętności portretów. Rozmiary zależą od poziomu.~Améliore les portraits ; tailles selon le niveau.~Migliora ritratti; dimensioni secondo il livello.~Verbessert Porträtfähigkeiten; Größen variieren.~强化肖像技能，各等级所需尺寸不同。~強化肖像技能，各等級所需尺寸不同。
useCrystal~Un cristal permite subir una ascensión de un Kioku de tres, cuatro o cinco estrellas.~One crystal grants one ascension for a three-, four- or five-star Kioku.~クリスタル1個で★3～★5キオクを1段階限界突破。~Kryształ daje jeden awans Kioku ★3, ★4 lub ★5.~Un cristal donne une ascension à un Kioku ★3, ★4 ou ★5.~Un cristallo dà un'ascensione a Kioku ★3, ★4 o ★5.~Ein Kristall gewährt einen Aufstieg für Kioku mit drei bis fünf Sternen.~一个水晶可使三星至五星记忆突破一次。~一個水晶可使三星至五星記憶突破一次。
useFragment~Reúne los fragmentos para canjear el objeto completo correspondiente.~Collect fragments to exchange for the corresponding complete item.~かけらを集めて対応するアイテムに交換。~Zbierz fragmenty i wymień na przedmiot.~Réunissez les fragments pour l'objet complet.~Raccogli frammenti per l'oggetto completo.~Sammle Fragmente zum Tausch gegen den vollständigen Gegenstand.~收集碎片以兑换对应完整道具。~收集碎片以兌換對應完整道具。
useTrophy~Recompensa de clasificación de Score Attack.~Score Attack ranking reward.~スコアアタックのランキング報酬。~Nagroda rankingu Score Attack.~Récompense du classement Score Attack.~Premio classifica Score Attack.~Belohnung der Score-Attack-Rangliste.~分数挑战排名奖励。~分數挑戰排名獎勵。
useStyle~Permite intercambiar estilos para los personajes.~Used to exchange for character styles.~キャラクターのスタイル交換に使用。~Do wymiany stylów postaci.~Permet d'échanger des styles de personnages.~Permette di scambiare stili dei personaggi.~Zum Tauschen von Charakterstilen.~用于兑换角色造型。~用於兌換角色造型。
useSkip~Permite completar varias misiones Crystalis mediante el sistema de salto.~Completes multiple Crystalis quests through the skip system.~能力晶花クエストのまとめて挑戦に使用。~Do pomijania wielu zadań Crystalis.~Permet de sauter plusieurs quêtes Crystalis.~Completa più missioni Crystalis con salto.~Zum Überspringen mehrerer Crystalis-Quests.~用于批量跳过能力晶花任务。~用於批量跳過能力晶花任務。
sourceDetail~Nombre y obtención en la fuente japonesa~Japanese source name and acquisition~日本語の名称と入手方法~Nazwa i zdobywanie w japońskim źródle~Nom et obtention dans la source japonaise~Nome e ottenimento nella fonte giapponese~Japanischer Name und Erwerb aus der Quelle~日文来源名称与获取方式~日文來源名稱與獲取方式
sharedIcon~La fuente usa este mismo icono para la variante normal y la del Exedra Pass.~The source uses this same icon for the regular and Exedra Pass variants.~出典では通常版とエクセドラパス版に同じ画像を使用。~Źródło używa tej samej ikony dla zwykłej i Pass.~Même icône dans la source pour les versions normale et Pass.~La fonte usa la stessa icona per normale e Pass.~Die Quelle verwendet dasselbe Symbol für normale und Pass-Variante.~来源对普通版和Exedra Pass版使用相同图标。~來源對普通版和Exedra Pass版使用相同圖示。
`);
export const itemsCopy=Object.fromEntries(languages.map((lang,i)=>[lang,Object.fromEntries(Object.entries(translations).map(([key,v])=>{if(v.length!==9||!v[i])throw Error('Missing item '+key+'/'+lang);return[key,v[i]];}))])) as Record<Lang,Record<string,string>>;
export type GameItem=typeof catalog.items[number];
export const gameItems=catalog.items;
export const itemCategories=['materials','currencies','tickets','consumables','rewards'] as const;
export function itemName(item:GameItem,lang:Lang):string{
  if(lang==='ja')return item.japanese;
  const d=itemsCopy[lang],id=item.id;
  const magic=id.match(/^(stone|gem|orb|core)-(prism|flame|aqua|forest|light|dark|void)$/);
  if(magic)return d[magic[1]]+' · '+(magic[2]==='prism'?d.prism:kiokuCopy[lang][magic[2][0].toUpperCase()+magic[2].slice(1)]);
  if(id.startsWith('kioku-exchange'))return d.exchange+' · ★'+(id.includes('4star')?'4':'5');
  if(id.startsWith('magia-key'))return d['magia-key']+(id.includes('fragment')?' · '+d.fragment:'')+(id.includes('5star')?' · ★5':'')+(id.includes('4star')?' · ★4+':'')+(id.includes('wishlist')?' · '+d.wishlist:'')+(id.includes('pass')?' · Exedra Pass':'');
  if(id==='kioku-crystal-fragment')return d['kioku-crystal']+' · '+d.fragment;
  if(item.size){const base=id.startsWith('heart')?'heart-sand':id.startsWith('magia-book')?'magia-book':'magical-palette';return d[base]+' · '+d[String(item.size).toLowerCase()];}
  return d[id]||item.japanese;
}
export function itemPurpose(item:GameItem,lang:Lang):string{
  const id=item.id,d=itemsCopy[lang];const keys:Record<string,string>={'magica-stone':'useStone','aq-chip':'useAq','memory-ticket':'useMemory','magical-cube':'useCube','magical-ring':'useRing','paint-drop':'usePaint','open-vase':'useVase','drop-lock':'useLock','enhance-glow':'useGlow','kioku-crystal':'useCrystal','style-ticket':'useStyle','crystalis-skip-ticket':'useSkip'};
  const key=keys[id]||(id.includes('fragment')?'useFragment':id.startsWith('magia-key')?'useKey':id.startsWith('heart-sand')?'useHeart':id.startsWith('magia-book')?'useBook':id.startsWith('magical-palette')?'usePalette':item.category==='rewards'?'useTrophy':item.category==='materials'?'useMagic':'useCurrency');return d[key];
}
