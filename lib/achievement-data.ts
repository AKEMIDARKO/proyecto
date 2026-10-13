import snapshot from './steam-achievements.json' with {type:'json'};
import { rows } from './i18n.ts';
import { languages,type Lang } from './locales.ts';
const translations=rows(`
tutorial~Completa el tutorial.~Clear the tutorial.~チュートリアルをクリア。~Ukończ samouczek.~Terminez le tutoriel.~Completa il tutorial.~Schließe das Tutorial ab.~完成教程。~完成教學。
player~Alcanza el nivel de jugador 100.~Reach player level 100.~プレイヤーLv100に到達。~Osiągnij poziom gracza100.~Atteignez le niveau joueur100.~Raggiungi livello giocatore100.~Erreiche Spieler-Level100.~达到玩家等级100。~達到玩家等級100。
magic~Alcanza el desbloqueo mágico 120 con cualquier Kioku.~Reach Magic Unlock120 with any Kioku.~いずれかのキオクの魔力解放120。~Osiągnij magię120 z dowolnym Kioku.~Atteignez magie120 avec un Kioku.~Raggiungi magia120 con un Kioku.~Erreiche Magie120 mit einem Kioku.~任意记忆魔力解放达到120。~任意記憶魔力解放達到120。
power~Alcanza una potencia máxima de equipo de 50 000.~Reach a highest party power of50,000.~最高パーティ戦力50,000に到達。~Osiągnij maksymalną siłę drużyny50 000.~Atteignez une puissance d'équipe50 000.~Raggiungi potenza squadra50.000.~Erreiche höchste Teamstärke50.000.~队伍最高战力达到50,000。~隊伍最高戰力達到50,000。
pictura~Alcanza el rango 100 de Puella Pictura.~Reach Puella Pictura rank100.~ピュエラピクトゥーラRank100。~Osiągnij rangę Puella Pictura100.~Atteignez le rang Puella Pictura100.~Raggiungi rango Puella Pictura100.~Erreiche Puella-Pictura-Rang100.~Puella Pictura达到100级。~Puella Pictura達到100級。
heart~Alcanza el vínculo 50 con cualquier chica mágica.~Reach Heartphial50 with any magical girl.~いずれかの魔法少女のこころの器Lv50。~Osiągnij Heartphial50 z dowolną dziewczyną.~Atteignez Heartphial50 avec une fille magique.~Raggiungi Heartphial50 con una ragazza.~Erreiche Heartphial50 mit einer Magical Girl.~任意魔法少女心之容器达到50。~任意魔法少女心之容器達到50。
clear~Completa~Clear~クリア~Ukończ~Terminez~Completa~Schließe ab~完成~完成
standard~Estándar~Standard~メイン~Standard~Standard~Standard~Standard~标准~標準
battler~Batalla~Battler~バトル~Bitwa~Bataille~Battaglia~Kampf~战斗~戰鬥
nightmare~Pesadilla~Nightmare~ナイトメア~Koszmar~Cauchemar~Incubo~Albtraum~噩梦~夢魘
rose~Bruja del jardín de rosas~Rose Garden Witch~薔薇園の魔女~Wiedźma różanego ogrodu~Sorcière du jardin de roses~Strega del giardino di rose~Rosengartenhexe~蔷薇园魔女~薔薇園魔女
darkness~Bruja de la oscuridad~Darkness Witch~暗闇の魔女~Wiedźma ciemności~Sorcière des ténèbres~Strega oscurità~Dunkelheitshexe~黑暗魔女~黑暗魔女
dessert~Bruja de los dulces~Dessert Witch~お菓子の魔女~Wiedźma słodyczy~Sorcière des desserts~Strega dolci~Süßigkeitenhexe~糖果魔女~糖果魔女
box~Bruja de la caja~Box Witch~ハコの魔女~Wiedźma pudełka~Sorcière des boîtes~Strega scatole~Kistenhexe~箱之魔女~箱之魔女
graffiti~Bruja del grafiti~Graffiti Witch~落書きの魔女~Wiedźma graffiti~Sorcière des graffitis~Strega graffiti~Graffitihexe~涂鸦魔女~塗鴉魔女
silver~Bruja de plata~Silver Witch~銀の魔女~Srebrna wiedźma~Sorcière d'argent~Strega argento~Silberhexe~银之魔女~銀之魔女
shadow~Bruja de las sombras~Shadow Witch~影の魔女~Wiedźma cieni~Sorcière des ombres~Strega ombre~Schattenhexe~影之魔女~影之魔女
dog~Bruja del perro~Dog Witch~犬の魔女~Wiedźma psa~Sorcière du chien~Strega cane~Hundehexe~犬之魔女~犬之魔女
mermaid~Bruja de la sirena~Mermaid Witch~人魚の魔女~Wiedźma syreny~Sorcière sirène~Strega sirena~Meerjungfrauenhexe~人鱼魔女~人魚魔女
artist~Bruja del artista~Artist Witch~芸術家の魔女~Wiedźma artysty~Sorcière artiste~Strega artista~Künstlerhexe~艺术家魔女~藝術家魔女
chairperson~Bruja de la presidenta~Chairperson Witch~委員長の魔女~Wiedźma przewodniczącej~Sorcière présidente~Strega presidentessa~Vorsitzendenhexe~委员长魔女~委員長魔女
sandbox~Bruja del arenero~Sandbox Witch~砂場の魔女~Wiedźma piaskownicy~Sorcière du bac à sable~Strega sabbiera~Sandkastenhexe~沙场魔女~沙場魔女
rumor~Rumor del caballo plebeyo~Rumor of the Commoner's Horse~マチビト馬のウワサ~Pogłoska konia zwykłego człowieka~Rumeur du cheval du roturier~Voce del cavallo del popolano~Gerücht vom Pferd des einfachen Mannes~等待之马的谣言~等待之馬的謠言
birdcage~Bruja de la jaula~Birdcage Witch~鳥かごの魔女~Wiedźma klatki~Sorcière de la cage~Strega gabbia~Vogelkäfighexe~鸟笼魔女~鳥籠魔女
stagecraft~Bruja del decorado~Stagecraft Witch~舞台装置の魔女~Wiedźma scenografii~Sorcière de scène~Strega scenografia~Bühnenhexe~舞台装置魔女~舞台裝置魔女
needle~Bruja de las agujas~Needle Witch~針の魔女~Wiedźma igły~Sorcière des aiguilles~Strega aghi~Nadelhexe~针之魔女~針之魔女
`);
const copy=Object.fromEntries(languages.map((lang,i)=>[lang,Object.fromEntries(Object.entries(translations).map(([key,v])=>{if(v.length!==9||!v[i])throw Error('Missing achievement '+key);return[key,v[i]];}))])) as Record<Lang,Record<string,string>>;
export const steamAchievements=snapshot.achievements;
export const steamAchievementSource=snapshot.source;
export function achievementDescription(a:typeof steamAchievements[number],lang:Lang){
  const d=copy[lang],special:Record<string,string>={'tutorial-ace':'tutorial','all-grown-up':'player','power-unlocked':'magic','strength-in-numbers':'power','so-many-memories':'pictura','hearts-in-sync':'heart'};
  if(special[a.id])return d[special[a.id]];
  const key=a.id.startsWith('rose-')?'rose':a.id.startsWith('rumor-')?'rumor':a.id.split('-')[0],mode=a.id.split('-').at(-1)!;
  const part=a.id.includes('part-ii')?' II':a.id.includes('part-i')?' I':'';
  return `${d.clear} · ${d[key]}${part} · ${d[mode]}`;
}
