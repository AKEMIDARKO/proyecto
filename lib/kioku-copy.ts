import { rows } from "./i18n.ts";
import { languages, type Lang } from "./locales.ts";

const translations = rows(`
intro~Explora los Kioku del juego por rareza, elemento y rol. Cada versión tiene su propia ficha.~Explore the game's Kioku by rarity, element and role. Each version has its own profile.~レアリティ・属性・役割でキオクを探せます。それぞれのバージョンに個別の詳細ページがあります。~Przeglądaj Kioku według rzadkości, żywiołu i roli. Każda wersja ma własny profil.~Explorez les Kioku par rareté, élément et rôle. Chaque version possède sa propre fiche.~Esplora i Kioku per rarità, elemento e ruolo. Ogni versione ha la propria scheda.~Entdecke Kioku nach Seltenheit, Element und Rolle. Jede Version hat ein eigenes Profil.~按稀有度、属性和定位浏览记忆。每个版本都有独立资料页。~按稀有度、屬性和定位瀏覽記憶。每個版本都有獨立資料頁。
search~Nombre de personaje o de Kioku…~Character or Kioku name…~キャラクター名・キオク名…~Nazwa postaci lub Kioku…~Nom du personnage ou du Kioku…~Nome del personaggio o del Kioku…~Charakter- oder Kioku-Name…~角色或记忆名称…~角色或記憶名稱…
searchLabel~Buscar personajes y Kioku~Search characters and Kioku~キャラクター・キオクを検索~Szukaj postaci i Kioku~Rechercher un personnage ou un Kioku~Cerca personaggi e Kioku~Charaktere und Kioku suchen~搜索角色与记忆~搜尋角色與記憶
rarity~Rareza~Rarity~レアリティ~Rzadkość~Rareté~Rarità~Seltenheit~稀有度~稀有度
stars~estrellas~stars~つ星~gwiazdek~étoiles~stelle~Sterne~星~星
allRarities~Todas las rarezas~All rarities~すべてのレアリティ~Wszystkie rzadkości~Toutes les raretés~Tutte le rarità~Alle Seltenheiten~全部稀有度~全部稀有度
element~Elemento~Element~属性~Żywioł~Élément~Elemento~Element~属性~屬性
allElements~Todos los elementos~All elements~すべての属性~Wszystkie żywioły~Tous les éléments~Tutti gli elementi~Alle Elemente~全部属性~全部屬性
role~Rol~Role~役割~Rola~Rôle~Ruolo~Rolle~定位~定位
allRoles~Todos los roles~All roles~すべての役割~Wszystkie role~Tous les rôles~Tutti i ruoli~Alle Rollen~全部定位~全部定位
sort~Ordenar dentro de cada rareza~Sort within each rarity~レアリティ内の並び順~Sortuj w obrębie rzadkości~Trier dans chaque rareté~Ordina in ogni rarità~Innerhalb jeder Seltenheit sortieren~各稀有度内排序~各稀有度內排序
nameAsc~Nombre: A–Z~Name: A–Z~名前：昇順~Nazwa: A–Z~Nom : A–Z~Nome: A–Z~Name: A–Z~名称：升序~名稱：升序
nameDesc~Nombre: Z–A~Name: Z–A~名前：降順~Nazwa: Z–A~Nom : Z–A~Nome: Z–A~Name: Z–A~名称：降序~名稱：降序
dateDesc~Más recientes primero~Newest first~新しい順~Od najnowszych~Les plus récents~Prima i più recenti~Neueste zuerst~最新优先~最新優先
dateAsc~Más antiguos primero~Oldest first~古い順~Od najstarszych~Les plus anciens~Prima i più vecchi~Älteste zuerst~最早优先~最早優先
attackDesc~Ataque máximo: mayor a menor~Max attack: high to low~最大攻撃力：高い順~Maks. atak: malejąco~Attaque max. : décroissante~Attacco max: decrescente~Max. Angriff: absteigend~最高攻击：降序~最高攻擊：降序
attackAsc~Ataque máximo: menor a mayor~Max attack: low to high~最大攻撃力：低い順~Maks. atak: rosnąco~Attaque max. : croissante~Attacco max: crescente~Max. Angriff: aufsteigend~最高攻击：升序~最高攻擊：升序
speedDesc~Velocidad: mayor a menor~Speed: high to low~スピード：高い順~Szybkość: malejąco~Vitesse : décroissante~Velocità: decrescente~Geschwindigkeit: absteigend~速度：降序~速度：降序
speedAsc~Velocidad: menor a mayor~Speed: low to high~スピード：低い順~Szybkość: rosnąco~Vitesse : croissante~Velocità: crescente~Geschwindigkeit: aufsteigend~速度：升序~速度：升序
results~Kioku~Kioku~キオク~Kioku~Kioku~Kioku~Kioku~记忆~記憶
version~Versión de Kioku~Kioku version~キオク~Wersja Kioku~Version du Kioku~Versione Kioku~Kioku-Version~记忆版本~記憶版本
profile~Ver ficha~View profile~詳細を見る~Zobacz profil~Voir la fiche~Vedi scheda~Profil ansehen~查看资料~查看資料
origin~Universo de origen~Original universe~出典~Uniwersum~Univers d’origine~Universo d’origine~Ursprungsuniversum~原作世界~原作世界
release~Fecha de estreno documentada~Documented release date~資料に基づく実装日~Udokumentowana data wydania~Date de sortie documentée~Data di uscita documentata~Dokumentiertes Erscheinungsdatum~有据可查的实装日期~有據可查的實裝日期
unknownDate~Fecha pendiente de confirmar~Date awaiting confirmation~日付確認中~Data do potwierdzenia~Date à confirmer~Data da confermare~Datum noch zu bestätigen~日期待确认~日期待確認
datesNote~Las fechas siguen las fuentes enlazadas y pueden corresponder a Japón o a la versión global. El catálogo incluye colaboraciones y versiones del mismo personaje.~Dates follow the linked sources and may refer to Japan or the global release. The catalog includes collaborations and different versions of the same character.~日付はリンク先の資料に基づき、日本版またはグローバル版のものです。コラボと同一キャラクターの別バージョンも含みます。~Daty pochodzą z podanych źródeł i mogą dotyczyć Japonii lub wersji globalnej. Katalog obejmuje współprace i różne wersje tej samej postaci.~Les dates suivent les sources citées et peuvent concerner le Japon ou la version mondiale. Le catalogue inclut les collaborations et les différentes versions d’un personnage.~Le date seguono le fonti e possono riferirsi al Giappone o alla versione globale. Il catalogo include collaborazioni e versioni dello stesso personaggio.~Die Daten stammen aus den verlinkten Quellen und können Japan oder die globale Version betreffen. Enthalten sind Kooperationen und mehrere Versionen desselben Charakters.~日期依据所列来源，可能对应日服或国际服。目录包含联动及同一角色的不同版本。~日期依據所列來源，可能對應日服或國際服。目錄包含聯動及同一角色的不同版本。
stats~Estadísticas~Stats~ステータス~Statystyki~Statistiques~Statistiche~Werte~数值~數值
base~Iniciales~Base~初期~Początkowe~Initiales~Iniziali~Basis~初始~初始
max~Máximas~Maximum~最大~Maksymalne~Maximales~Massime~Maximum~最高~最高
hp~Vida~HP~HP~HP~PV~PV~LP~生命~生命
atk~Ataque~Attack~攻撃力~Atak~Attaque~Attacco~Angriff~攻击~攻擊
def~Defensa~Defense~防御力~Obrona~Défense~Difesa~Verteidigung~防御~防禦
speed~Velocidad~Speed~スピード~Szybkość~Vitesse~Velocità~Geschwindigkeit~速度~速度
statsNote~Valores máximos con ascensión, nivel y nivel de magia al máximo. Los equipos y efectos de combate pueden modificarlos.~Maximum values include max ascension, level and magic level. Equipment and battle effects can change them.~最大値は限界突破・レベル・魔力解放を最大まで育成した場合の値です。装備や戦闘中の効果で変動します。~Wartości maksymalne obejmują pełne wzniesienie, poziom i poziom magii. Ekwipunek i efekty walki mogą je zmieniać.~Les valeurs maximales incluent l’ascension, le niveau et le niveau de magie au maximum. L’équipement et les effets en combat peuvent les modifier.~Valori massimi con ascensione, livello e livello magia al massimo. Equipaggiamento ed effetti di battaglia possono modificarli.~Maximalwerte gelten bei maximalem Aufstieg, Level und Magielevel. Ausrüstung und Kampfeffekte können sie verändern.~最高值包含满突破、满等级和满魔力等级。装备与战斗效果可能改变数值。~最高值包含滿突破、滿等級和滿魔力等級。裝備與戰鬥效果可能改變數值。
roleHelp~Su papel en el equipo~Their place in the team~チームでの役割~Rola w drużynie~Son rôle dans l’équipe~Il suo ruolo nella squadra~Rolle im Team~队伍中的职责~隊伍中的職責
skills~Resumen del kit~Kit overview~スキル概要~Przegląd umiejętności~Aperçu des compétences~Panoramica abilità~Fähigkeiten im Überblick~技能概览~技能概覽
special~Ataque especial~Special attack~必殺技~Atak specjalny~Attaque spéciale~Attacco speciale~Spezialangriff~必杀技~必殺技
battle~Habilidad de combate~Battle skill~戦闘スキル~Umiejętność bojowa~Compétence de combat~Abilità di battaglia~Kampffähigkeit~战斗技能~戰鬥技能
basic~Ataque básico~Basic attack~通常攻撃~Atak podstawowy~Attaque de base~Attacco base~Basisangriff~普通攻击~普通攻擊
ability~Habilidad pasiva~Ability~アビリティ~Zdolność pasywna~Capacité passive~Abilità passiva~Passive Fähigkeit~被动能力~被動能力
support~Habilidad de apoyo~Support ability~サポートアビリティ~Zdolność wsparcia~Capacité de soutien~Abilità di supporto~Unterstützungsfähigkeit~支援能力~支援能力
damage~Daño de referencia~Reference damage~ダメージ目安~Obrażenia referencyjne~Dégâts de référence~Danno di riferimento~Referenzschaden~参考伤害~參考傷害
single~Un enemigo~One enemy~敵単体~Jeden przeciwnik~Un ennemi~Un nemico~Ein Gegner~单个敌人~單個敵人
all~Todos los enemigos~All enemies~敵全体~Wszyscy przeciwnicy~Tous les ennemis~Tutti i nemici~Alle Gegner~所有敌人~所有敵人
random~Enemigos aleatorios~Random enemies~ランダムな敵~Losowi przeciwnicy~Ennemis aléatoires~Nemici casuali~Zufällige Gegner~随机敌人~隨機敵人
skillsNote~Resumen de funciones y daño base entre nivel 1 y 10. Los nombres se conservan como aparecen en las fuentes del juego. No incluye todas las condiciones, acumulaciones o mejoras EX: consulta el desglose enlazado para el detalle.~Summary of effects and base damage from level 1 to 10. Names retain the wording used by the game sources. It does not cover every condition, stack or EX upgrade: see the linked breakdown for details.~レベル1〜10の基本ダメージと効果の概要です。名称はゲーム資料の表記を使用しています。条件・重複・EX強化のすべては含みません。詳細はリンク先の解説をご覧ください。~Skrót efektów i obrażeń bazowych na poziomach 1–10. Nazwy zachowano zgodnie ze źródłami gry. Nie obejmuje wszystkich warunków, kumulacji ani ulepszeń EX; szczegóły znajdziesz w źródle.~Résumé des effets et dégâts de base aux niveaux 1 à 10. Les noms reprennent les sources du jeu. Toutes les conditions, cumuls et améliorations EX ne sont pas inclus : consultez la source pour le détail.~Riassunto di effetti e danno base dal livello 1 al 10. I nomi seguono le fonti del gioco. Non include tutte le condizioni, accumuli o migliorie EX: consulta la fonte per i dettagli.~Übersicht über Effekte und Grundschaden von Level 1 bis 10. Namen folgen den Spielquellen. Nicht alle Bedingungen, Stapel und EX-Verbesserungen sind enthalten; Details findest du in der verlinkten Quelle.~概述效果与1至10级基础伤害。名称沿用游戏资料的原文。未涵盖全部条件、叠加或EX强化，完整说明见所列来源。~概述效果與1至10級基礎傷害。名稱沿用遊戲資料的原文。未涵蓋全部條件、疊加或EX強化，完整說明見所列來源。
related~Otras versiones del personaje~Other versions of this character~同じキャラクターの別キオク~Inne wersje tej postaci~Autres versions du personnage~Altre versioni del personaggio~Weitere Versionen dieses Charakters~此角色的其他版本~此角色的其他版本
back~Volver al catálogo~Back to catalog~一覧に戻る~Wróć do katalogu~Retour au catalogue~Torna al catalogo~Zurück zum Katalog~返回目录~返回目錄
dataSource~Estadísticas y habilidades · Puella Magi Wiki~Stats and skills · Puella Magi Wiki~ステータス・スキル · Puella Magi Wiki~Statystyki i umiejętności · Puella Magi Wiki~Statistiques et compétences · Puella Magi Wiki~Statistiche e abilità · Puella Magi Wiki~Werte und Fähigkeiten · Puella Magi Wiki~数值与技能 · Puella Magi Wiki~數值與技能 · Puella Magi Wiki
releaseSource~Fuente de la fecha de estreno~Release date source~実装日の出典~Źródło daty wydania~Source de la date de sortie~Fonte della data di uscita~Quelle des Erscheinungsdatums~实装日期来源~實裝日期來源
notebook~Guardar mi equipo y notas~Save my team and notes~編成・メモを保存~Zapisz drużynę i notatki~Enregistrer mon équipe et mes notes~Salva squadra e note~Team und Notizen speichern~保存配队与笔记~儲存配隊與筆記
Flame~Fuego~Flame~火~Ogień~Feu~Fuoco~Feuer~火~火
Aqua~Agua~Aqua~水~Woda~Eau~Acqua~Wasser~水~水
Forest~Bosque~Forest~木~Las~Forêt~Foresta~Wald~木~木
Light~Luz~Light~光~Światło~Lumière~Luce~Licht~光~光
Dark~Oscuridad~Dark~闇~Mrok~Ténèbres~Oscurità~Dunkelheit~暗~暗
Void~Vacío~Void~無~Pustka~Néant~Vuoto~Leere~无~無
Attacker~Atacante~Attacker~アタッカー~Atakujący~Attaquant~Attaccante~Angreifer~输出~輸出
Breaker~Rompedor~Breaker~ブレイカー~Przełamujący~Briseur~Breaker~Brecher~击破~擊破
Buffer~Potenciador~Buffer~バッファー~Wzmacniający~Renfort~Potenziatore~Verstärker~增益~增益
Debuffer~Debilitador~Debuffer~デバッファー~Osłabiający~Affaiblisseur~Indebolente~Schwächer~削弱~削弱
Healer~Sanador~Healer~ヒーラー~Uzdrowiciel~Soigneur~Curatore~Heiler~治疗~治療
Defender~Defensor~Defender~ディフェンダー~Obrońca~Défenseur~Difensore~Verteidiger~防护~防護
AttackerHelp~Su función es hacer daño. Combínalo con personajes que rompan la defensa enemiga y mejoren su ataque.~Their job is dealing damage. Pair them with allies who break enemies and boost their attack.~ダメージを与える役割です。敵をブレイクする仲間や攻撃を強化する仲間と組み合わせましょう。~Zadaje obrażenia. Łącz z sojusznikami przełamującymi przeciwników i wzmacniającymi atak.~Son rôle est d’infliger des dégâts. Associez-le à des alliés qui brisent les ennemis et renforcent son attaque.~Il suo compito è infliggere danni. Abbinalo ad alleati che causano break e potenziano l’attacco.~Verursacht Schaden. Kombiniere diesen Kioku mit Verbündeten, die Gegner brechen und den Angriff erhöhen.~负责造成伤害。可搭配击破敌人、提升攻击的队友。~負責造成傷害。可搭配擊破敵人、提升攻擊的隊友。
BreakerHelp~Ayuda a vaciar la barra de ruptura del enemigo. Prepara la oportunidad para que tus atacantes hagan más daño.~Helps deplete the enemy's break gauge, setting up opportunities for your attackers to deal more damage.~敵のブレイクゲージを削り、アタッカーがダメージを与える機会を作ります。~Pomaga opróżnić pasek przełamania, tworząc okazję dla atakujących do zadania większych obrażeń.~Aide à vider la jauge de rupture ennemie pour permettre aux attaquants d’infliger davantage de dégâts.~Aiuta a svuotare la barra break del nemico, creando occasioni per gli attaccanti.~Leert die Break-Leiste der Gegner und schafft Gelegenheiten für die Angreifer.~帮助削减敌人的击破槽，为输出创造更好的时机。~幫助削減敵人的擊破槽，為輸出創造更好的時機。
BufferHelp~Mejora al equipo con efectos de apoyo. Elige aliados que aprovechen las mejoras de esta versión concreta.~Strengthens the team with support effects. Choose allies who benefit from this version's particular buffs.~支援効果でチームを強化します。このキオクの強化内容と相性のよい仲間を選びましょう。~Wzmacnia drużynę. Wybierz sojuszników, którzy skorzystają z efektów tej wersji.~Renforce l’équipe. Choisissez des alliés qui profitent des bonus de cette version.~Potenzia la squadra. Scegli alleati che sfruttano i bonus di questa versione.~Stärkt das Team. Wähle Verbündete, die von den Effekten dieser Version profitieren.~通过支援效果强化队伍，搭配能发挥此版本增益的队友。~透過支援效果強化隊伍，搭配能發揮此版本增益的隊友。
DebufferHelp~Reduce la eficacia de los enemigos. Sus efectos ayudan al equipo a sobrevivir o a causar más daño.~Weakens enemies. Their effects help the team survive or deal more damage.~敵を弱体化します。チームの生存やダメージ向上を助ける役割です。~Osłabia przeciwników, pomagając drużynie przetrwać lub zadawać więcej obrażeń.~Affaiblit les ennemis pour aider l’équipe à survivre ou à infliger plus de dégâts.~Indebolisce i nemici per aiutare la squadra a sopravvivere o fare più danni.~Schwächt Gegner und hilft dem Team zu überleben oder mehr Schaden zu verursachen.~削弱敌人，帮助队伍生存或造成更多伤害。~削弱敵人，幫助隊伍生存或造成更多傷害。
HealerHelp~Recupera la vida del equipo. Es útil cuando necesitas mantener a tus personajes en combate durante más turnos.~Restores the team's HP. Useful when you need your characters to stay in battle for more turns.~仲間のHPを回復します。長い戦闘でチームを維持するのに役立ちます。~Przywraca HP drużyny. Przydaje się w dłuższych walkach.~Restaure les PV de l’équipe, utile pour tenir lors des combats plus longs.~Recupera i PV della squadra, utile per affrontare battaglie più lunghe.~Stellt die LP des Teams wieder her und hilft in längeren Kämpfen.~恢复队伍生命，适合需要持续作战的场合。~恢復隊伍生命，適合需要持續作戰的場合。
DefenderHelp~Protege al equipo y reduce la presión de los ataques enemigos. Revisa cómo funciona la protección de este Kioku.~Protects the team and eases enemy attack pressure. Check how this Kioku's protection works.~敵の攻撃からチームを守ります。このキオクの防御効果を確認して編成しましょう。~Chroni drużynę przed atakami. Sprawdź, jak działa ochrona tego Kioku.~Protège l’équipe des attaques. Vérifiez le fonctionnement de la protection de ce Kioku.~Protegge la squadra dagli attacchi. Controlla come funziona la protezione di questo Kioku.~Schützt das Team vor Angriffen. Prüfe, wie der Schutz dieses Kioku funktioniert.~保护队伍，减轻敌人攻击的压力。请留意此记忆防护效果的具体条件。~保護隊伍，減輕敵人攻擊的壓力。請留意此記憶防護效果的具體條件。
heal~Recuperación de vida~HP recovery~HP回復~Regeneracja HP~Récupération de PV~Recupero PV~LP-Heilung~生命恢复~生命恢復
mp~Recuperación de MP~MP recovery~MP回復~Regeneracja MP~Récupération de MP~Recupero MP~MP-Erholung~MP恢复~MP恢復
bp~Generación de BP~BP generation~BP獲得~Generowanie BP~Gain de BP~Generazione BP~BP-Erzeugung~BP获取~BP獲取
shield~Escudo~Shield~バリア~Tarcza~Bouclier~Scudo~Schild~护盾~護盾
break~Mejora de ruptura~Break boost~ブレイク強化~Wzmocnienie przełamania~Bonus de rupture~Potenziamento break~Break-Verstärkung~击破强化~擊破強化
attackBuff~Mejora de ataque~Attack boost~攻撃力アップ~Wzmocnienie ataku~Bonus d’attaque~Potenziamento attacco~Angriffsverstärkung~攻击强化~攻擊強化
defenseDown~Reducción de defensa~Defense reduction~防御力ダウン~Obniżenie obrony~Baisse de défense~Riduzione difesa~Verteidigungssenkung~防御降低~防禦降低
speedUp~Mejora de velocidad~Speed boost~スピードアップ~Wzmocnienie szybkości~Bonus de vitesse~Potenziamento velocità~Geschwindigkeitsbonus~速度强化~速度強化
followUp~Ataque adicional~Follow-up attack~追撃~Dodatkowy atak~Attaque de suivi~Attacco aggiuntivo~Folgeangriff~追加攻击~追加攻擊
cleanse~Eliminación de efectos negativos~Debuff removal~弱体効果解除~Usuwanie osłabień~Suppression des malus~Rimozione effetti negativi~Entfernung von Schwächungen~负面效果解除~負面效果解除
field~Campo elemental~Elemental field~属性フィールド~Pole żywiołu~Champ élémentaire~Campo elementale~Elementarfeld~属性领域~屬性領域
effectDetails~Ver el desglose de efectos~View effect breakdown~効果の詳細を見る~Zobacz szczegóły efektów~Voir le détail des effets~Vedi i dettagli degli effetti~Effektdetails ansehen~查看效果详情~查看效果詳情
introProfiles~Perfiles de los personajes~Character introductions~キャラクター紹介~Wprowadzenie do postaci~Présentation des personnages~Introduzioni ai personaggi~Charaktervorstellungen~角色介绍~角色介紹
latest~Kioku recientes~Recent Kioku~最近のキオク~Najnowsze Kioku~Kioku récents~Kioku recenti~Aktuelle Kioku~近期记忆~近期記憶
summary~Kioku de {stars} estrellas · {element} · {role}. Estadísticas, habilidades y otras versiones de {name}.~{stars}-star Kioku · {element} · {role}. Stats, skills and other versions of {name}.~★{stars}キオク · {element} · {role}。{name}のステータス・スキル・別バージョン。~Kioku {stars}★ · {element} · {role}. Statystyki, umiejętności i inne wersje: {name}.~Kioku {stars}★ · {element} · {role}. Statistiques, compétences et autres versions de {name}.~Kioku {stars}★ · {element} · {role}. Statistiche, abilità e altre versioni di {name}.~{stars}-Sterne-Kioku · {element} · {role}. Werte, Fähigkeiten und weitere Versionen von {name}.~{stars}星记忆 · {element} · {role}。{name}的数值、技能与其他版本。~{stars}星記憶 · {element} · {role}。{name}的數值、技能與其他版本。
cost~Coste~Cost~消費~Koszt~Coût~Costo~Kosten~消耗~消耗
catalogSource~Catálogo de Kioku · Puella Magi Wiki~Kioku catalog · Puella Magi Wiki~キオク一覧 · Puella Magi Wiki~Katalog Kioku · Puella Magi Wiki~Catalogue des Kioku · Puella Magi Wiki~Catalogo Kioku · Puella Magi Wiki~Kioku-Katalog · Puella Magi Wiki~记忆目录 · Puella Magi Wiki~記憶目錄 · Puella Magi Wiki
clearFilters~Quitar filtros~Clear filters~条件をリセット~Wyczyść filtry~Effacer les filtres~Rimuovi filtri~Filter zurücksetzen~清除筛选~清除篩選
activeFilters~Filtros activos~Active filters~適用中の条件~Aktywne filtry~Filtres actifs~Filtri attivi~Aktive Filter~当前筛选~目前篩選
noSpecial~Los Kioku de 3 estrellas no tienen ataque especial.~Three-star Kioku have no special attack.~★3キオクには必殺技がありません。~Kioku 3★ nie mają ataku specjalnego.~Les Kioku 3★ n’ont pas d’attaque spéciale.~I Kioku 3★ non hanno un attacco speciale.~3-Sterne-Kioku haben keinen Spezialangriff.~3星记忆没有必杀技。~3星記憶沒有必殺技。
unlistedDates~Las fechas sin confirmar aparecen al final de las dos ordenaciones por fecha.~Unconfirmed dates appear last in both date orders.~日付未確認のキオクはどちらの日付順でも末尾に表示します。~Niepotwierdzone daty są na końcu w obu kolejnościach dat.~Les dates non confirmées apparaissent à la fin dans les deux tris par date.~Le date non confermate appaiono alla fine in entrambi gli ordini.~Unbestätigte Daten stehen in beiden Datumssortierungen am Ende.~日期未确认的记忆在两种日期排序中均置于末尾。~日期未確認的記憶在兩種日期排序中均置於末尾。
`);

for (const [key, values] of Object.entries(translations)) {
  if (values.length !== languages.length || values.some(value => !value.trim())) throw new Error("Missing Kioku translation: " + key);
}
export const kiokuCopy: Record<Lang, Record<string, string>> = Object.fromEntries(languages.map((lang, index) => [lang, Object.fromEntries(Object.entries(translations).map(([key, values]) => [key, values[index]]))])) as Record<Lang, Record<string, string>>;
