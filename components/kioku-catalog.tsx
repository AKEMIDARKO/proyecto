"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { Gem, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dateLabel, words, type Lang } from "@/lib/magia-data";
import { kiokuCopy } from "@/lib/kioku-copy";
import { defaultFilters, elements, filterKiokus, groupKiokus, kiokuName, kiokuVersion, rarities, roles, sortOrders, type Kioku, type SortOrder } from "@/lib/kioku-catalog";
import SourcePanel from "./source-panel";
import { KiokuStars } from './game-icon';
import { useKiokus } from './kioku-context';

export function KiokuCard({ unit, lang }: { unit: Kioku; lang: Lang }) {
  const copy = kiokuCopy[lang];
  const elementIcon=unit.element==='Flame'?'fire':unit.element.toLowerCase();
  return <a className="kioku-card" data-rarity={unit.rarity} href={`/${lang}/kioku/${unit.id}/`} style={{ "--kioku-color": unit.color } as CSSProperties}>
    <div className="kioku-card-art"><img src={unit.image} alt="" loading="lazy" width={600} height={369} /><span className="kioku-rarity" aria-label={unit.rarity + " " + copy.stars}><KiokuStars rarity={unit.rarity} /></span></div>
    <div className="kioku-card-copy"><div className="kioku-tags"><span><img className="element-icon" src={'/assets/game-ui/element-'+elementIcon+'.webp'} alt="" aria-hidden="true" width={20} height={20} />{copy[unit.element]}</span><span>{copy[unit.role]}</span></div><h3>{kiokuName(unit, lang)}</h3><p className="kioku-version" lang={lang === "ja" ? "ja" : "en"}>{kiokuVersion(unit, lang)}</p><div className="kioku-card-bottom">{unit.releaseDate ? <time dateTime={unit.releaseDate}>{dateLabel(unit.releaseDate, lang)}</time> : <span>{copy.unknownDate}</span>}</div></div>
  </a>;
}

export default function KiokuCatalog({ lang }: { lang: Lang }) {
  const kiokus=useKiokus();
  const copy = kiokuCopy[lang], w = words[lang];
  const [filters, setFilters] = useState(defaultFilters), [order, setOrder] = useState<SortOrder>("dateDesc");
  const filtered = useMemo(() => filterKiokus(kiokus, filters), [kiokus,filters]);
  const groups = useMemo(() => groupKiokus(filtered, order, lang), [filtered, order, lang]);
  const active = filters.query.trim() || filters.rarity !== "all" || filters.element !== "all" || filters.role !== "all";
  function filter(key: keyof typeof filters, value: string) { setFilters(previous => ({ ...previous, [key]: value })); }
  return <>
    <div className="page-heading"><p className="eyebrow"><Gem size={14} aria-hidden="true" /> MAGIA EXEDRA · KIOKU</p><h1>{w.characters}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{copy.intro}</p></div>
    <div className="kioku-toolbar">
      <div className="kioku-search"><label htmlFor="kioku-search">{copy.searchLabel}</label><div className="search-field"><Search size={18} aria-hidden="true" /><Input id="kioku-search" value={filters.query} onChange={event => filter("query", event.target.value)} placeholder={copy.search} /></div></div>
      <div className="kioku-filters">{[{ key: "element" as const, all: "allElements", values: elements }, { key: "role" as const, all: "allRoles", values: roles }].map(item => <div className="kioku-filter" key={item.key}><label id={"label-" + item.key}>{copy[item.key]}</label><Select value={filters[item.key]} onValueChange={value => filter(item.key, value)}><SelectTrigger aria-labelledby={"label-" + item.key}><SelectValue /></SelectTrigger><SelectContent position="popper" align="start" className="archive-select-menu"><SelectItem value="all">{copy[item.all]}</SelectItem>{item.values.map(value => <SelectItem key={value} value={value}>{copy[value]}</SelectItem>)}</SelectContent></Select></div>)}
        <div className="kioku-filter kioku-sort"><label id="label-sort">{copy.sort}</label><Select value={order} onValueChange={value => setOrder(value as SortOrder)}><SelectTrigger aria-labelledby="label-sort"><SelectValue /></SelectTrigger><SelectContent position="popper" align="start" className="archive-select-menu">{sortOrders.map(value => <SelectItem key={value} value={value}>{copy[value]}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="kioku-rarity-filters" role="group" aria-label={copy.rarity}><button type="button" aria-pressed={filters.rarity === "all"} onClick={() => filter("rarity", "all")}>{copy.allRarities}<span>{kiokus.length}</span></button>{rarities.map(rarity => <button type="button" key={rarity} aria-pressed={filters.rarity === String(rarity)} onClick={() => filter("rarity", String(rarity))}><span aria-hidden="true">{"★".repeat(rarity)}</span><span className="sr-only">{rarity} {copy.stars}</span><span>{kiokus.filter(unit => unit.rarity === rarity).length}</span></button>)}</div>
    </div>
    <div className="kioku-results"><p role="status">{filtered.length} / {kiokus.length} {copy.results}</p>{active && <button type="button" className="text-link" onClick={() => setFilters(defaultFilters)}>{copy.clearFilters}</button>}</div>
    {groups.length ? groups.map(group => <section key={group.rarity} className="kioku-rarity-section" aria-labelledby={"rarity-" + group.rarity}><div className="kioku-group-heading"><h2 id={"rarity-" + group.rarity}><span aria-hidden="true">{"★".repeat(group.rarity)}</span>{group.rarity} {copy.stars}</h2><p>{group.units.length} {copy.results}</p></div><div className="kioku-grid">{group.units.map(unit => <KiokuCard key={unit.id} unit={unit} lang={lang} />)}</div></section>) : <div className="empty-state"><Search size={30} aria-hidden="true" /><h2>{w.noResults}</h2><button type="button" className="button button-outline" onClick={() => setFilters(defaultFilters)}>{copy.clearFilters}</button></div>}
    <div className="inline-note"><Info size={18} aria-hidden="true" /><div><p>{copy.datesNote}</p>{kiokus.some(unit => !unit.releaseDate) && <p>{copy.unlistedDates}</p>}</div></div>
    <SourcePanel lang={lang} sources={[{ title: copy.catalogSource, url: "https://wiki.puella-magi.net/Category:Magia_Exedra_Kioku_by_ID" }]} />
  </>;
}
