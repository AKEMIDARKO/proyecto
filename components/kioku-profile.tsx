import { Gem, Info, NotebookPen } from "lucide-react";
import { characters, dateLabel, words, type Lang } from "@/lib/magia-data";
import { portalCopy } from "@/lib/portal-copy";
import { kiokuCopy } from "@/lib/kioku-copy";
import { kiokuName, kiokuVersion, sortKiokus, type Kioku } from "@/lib/kioku-catalog";
import { KiokuCard } from "./kioku-catalog";
import FavoriteButton from "./favorite-button";
import SourcePanel from "./source-panel";
import { KiokuStars } from './game-icon';
import { useKiokus } from './kioku-context';

export default function KiokuProfile({ unit, lang }: { unit: Kioku; lang: Lang }) {
  const kiokus=useKiokus();
  const copy = kiokuCopy[lang], w = words[lang], base = `/${lang}/`;
  const versions = sortKiokus(kiokus.filter(item => item.family === unit.family && item.id !== unit.id), "dateDesc", lang);
  const introduction = characters.find(character => character.name === unit.family);
  return <>
    <nav className="breadcrumb" aria-label={portalCopy[lang].breadcrumb}><a href={base}>{w.home}</a><span>/</span><a href={base + "characters/"}>{w.characters}</a><span>/</span><span>{kiokuName(unit, lang)}</span></nav>
    <article className="kioku-profile">
      <header className="kioku-profile-header"><div className="kioku-profile-art" data-rarity={unit.rarity}><img src={unit.image} alt={kiokuName(unit, lang) + " · " + kiokuVersion(unit, lang)} width={600} height={369} /><span className="kioku-rarity" aria-label={unit.rarity + " " + copy.stars}><KiokuStars rarity={unit.rarity} /></span></div><div className="kioku-profile-title"><p className="eyebrow">MAGIA EXEDRA · KIOKU</p><h1>{kiokuName(unit, lang)}</h1><p className="kioku-profile-version" lang={lang === "ja" ? "ja" : "en"}>{kiokuVersion(unit, lang)}</p><p className="kioku-alternate-name" lang={lang === "ja" ? "en" : "ja"}>{lang === "ja" ? unit.name + " · " + unit.kioku : unit.japanese + " · " + unit.kiokuJapanese}</p><div className="kioku-tags"><span><Gem size={14} aria-hidden="true" />{copy[unit.element]}</span><span>{copy[unit.role]}</span><span>{unit.rarity} {copy.stars}</span></div><dl className="kioku-facts"><div><dt>{copy.origin}</dt><dd>{unit.series}</dd></div><div><dt>{copy.release}</dt><dd>{unit.releaseDate ? <time dateTime={unit.releaseDate}>{dateLabel(unit.releaseDate, lang)}</time> : copy.unknownDate}</dd></div></dl><FavoriteButton lang={lang} kind="kioku" itemId={unit.id} /></div></header>
      <div className="kioku-profile-body"><div className="kioku-profile-main">
        <section className="kioku-panel"><h2>{copy.stats}</h2><table className="kioku-stats"><caption className="sr-only">{kiokuName(unit, lang)} · {copy.stats}</caption><thead><tr><th scope="col">{copy.stats}</th><th scope="col">{copy.base}</th><th scope="col">{copy.max}</th></tr></thead><tbody>{(["hp", "atk", "def"] as const).map(stat => <tr key={stat}><th scope="row">{copy[stat]} <small>{stat.toUpperCase()}</small></th><td>{unit.stats.base[stat].toLocaleString(lang)}</td><td>{unit.stats.max[stat].toLocaleString(lang)}</td></tr>)}<tr><th scope="row">{copy.speed} <small>SPD</small></th><td colSpan={2}>{unit.speed}</td></tr></tbody></table><p className="kioku-explanation">{copy.statsNote}</p></section>
        <section className="kioku-panel kioku-skills"><h2>{copy.skills}</h2><p className="kioku-explanation">{copy.skillsNote}</p>{unit.rarity === 3 && <p className="kioku-no-special">{copy.noSpecial}</p>}<div className="kioku-skill-list">{unit.skills.map(skill => <section key={skill.kind} className="kioku-skill"><p className="kioku-skill-type">{copy[skill.kind]}</p><h3 lang={lang === "ja" && skill.japanese ? "ja" : skill.name ? "en" : lang}>{(lang === "ja" ? skill.japanese : skill.name) || copy[skill.kind]}</h3>{skill.kind === "special" && <p className="kioku-cost">{copy.cost}: {skill.bpCost !== null ? skill.bpCost + " BP" : skill.cost + " MP"}</p>}{skill.damage.length > 0 && <ul className="kioku-damage">{skill.damage.map((damage, index) => <li key={index}><span>{copy[damage.target]}</span><strong>{damage.low === damage.high ? damage.low : damage.low + "–" + damage.high}%</strong><span>{copy.damage}</span></li>)}</ul>}{skill.features.length > 0 && <ul className="kioku-effect-tags">{skill.features.map(feature => <li key={feature}>{copy[feature === "speed" ? "speedUp" : feature]}</li>)}</ul>}<a className="text-link" href={unit.source} target="_blank" rel="noopener noreferrer">{copy.effectDetails}</a></section>)}</div></section>
      </div><aside className="kioku-profile-sidebar"><section className="kioku-panel"><p className="eyebrow">{copy[unit.role]}</p><h2>{copy.roleHelp}</h2><p>{copy[unit.role + "Help"]}</p></section><section className="kioku-panel"><NotebookPen size={25} aria-hidden="true" /><h2>{copy.notebook}</h2><a className="button button-outline" href={base + "profile/?kioku=" + unit.id + "#notebook"}>{w.profile}</a></section>{introduction && <a className="text-link" href={base + "characters/" + introduction.id + "/"}>{copy.introProfiles}: {lang === "ja" ? introduction.japanese : introduction.name}</a>}</aside></div>
      <div className="inline-note"><Info size={18} aria-hidden="true" /><p>{copy.datesNote}</p></div><SourcePanel lang={lang} sources={[{ title: copy.dataSource, url: unit.source }, ...(unit.releaseSource ? [{ title: copy.releaseSource, url: unit.releaseSource }] : [])]} /><a className="button button-outline" href={base + "characters/"}>{copy.back}</a>
    </article>
    {versions.length > 0 && <section className="archive-section"><div className="section-heading"><h2>{copy.related}</h2></div><div className="kioku-grid">{versions.map(item => <KiokuCard key={item.id} unit={item} lang={lang} />)}</div></section>}
  </>;
}
