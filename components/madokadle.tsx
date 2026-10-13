"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Check, ChevronsUpDown, Copy, Gamepad2, Loader2, Sparkles, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DailyClock from "./daily-clock";
import { gameCopy } from "@/lib/madokadle-copy";
import type { Lang } from "@/lib/magia-data";
import type { GameMode, GameOption, GameResult, Match, Puzzle, Trait } from "@/lib/madokadle-types";

import { parseHistory, dailyStatistics as statistics, type Saved, type Statistics } from "@/lib/madokadle-history";
import { accountCopy } from "@/lib/account-copy";
import { LOCAL_HISTORY_KEY } from "@/lib/account-client";

const KEY = LOCAL_HISTORY_KEY;
const zeroStats = { played: 0, wins: 0, current: 0, best: 0 };
const name = (c: GameOption, lang: Lang) => lang === "ja" ? c.japanese : c.name;

function readHistory() { return parseHistory(localStorage.getItem(KEY)); }

class PuzzleError extends Error { constructor(public code: string, public current?: GameResult) { super(code); } }
async function responseData(response: Response): Promise<GameResult> {
  const body = await response.json() as GameResult & { error?: string; current?: GameResult };
  if (!response.ok) throw new PuzzleError(body.error || "NETWORK", body.current);
  return body;
}
function post(puzzle: Puzzle, guesses: string[]) {
  return fetch("/api/madokadle", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify({ id: puzzle.id, mode: puzzle.mode, seed: puzzle.seed, guesses }) }).then(responseData);
}

export default function Madokadle({ lang }: { lang: Lang }) {
  const w = gameCopy[lang];
  const account = accountCopy[lang];
  const [mode, setMode] = useState<GameMode>("daily");
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [selected, setSelected] = useState("");
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<"loadError" | "guessError" | "dayChanged" | "cloudConflict" | null>(null);
  const [stats, setStats] = useState<Statistics>(zeroStats);
  const [canSave, setCanSave] = useState(true);
  const [cloud, setCloud] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState("");
  const pickerId = useId();
  const request = useRef(0);
  const practice = useRef<GameResult | null>(null);
  const rollover = useRef("");

  function accept(next: GameResult) {
    setResult(next); setSelected(""); setCopied(false); setShareFallback("");
    if (next.puzzle.mode === "practice") { practice.current = next; return; }
    setCloud(!!next.account?.cloud);
    if (next.account?.cloud) { setStats(next.account.stats); setCanSave(true); return; }
    try {
      const history = readHistory();
      history[next.puzzle.date] = { id: next.puzzle.id, date: next.puzzle.date, guesses: next.rows.map(r => r.character.id), won: next.won, finished: next.finished };
      const kept = Object.fromEntries(Object.entries(history).sort(([a], [b]) => a.localeCompare(b)).slice(-400));
      localStorage.setItem(KEY, JSON.stringify(kept));
      setStats(statistics(kept, next.puzzle.date));
      setCanSave(true);
    } catch { setCanSave(false); }
  }

  useEffect(() => {
    const seq = ++request.current;
    setBusy(true); setError(null); setSelected(""); setPicker(false);
    if (mode === "practice" && practice.current) { accept(practice.current); setBusy(false); return; }
    let alive = true;
    (async () => {
      try {
        let next = await fetch("/api/madokadle?mode=" + mode, { cache: "no-store" }).then(responseData);
        if (mode === "daily" && !next.account?.cloud) {
          let saved: Saved | undefined;
          try { saved = readHistory()[next.puzzle.date]; } catch { setCanSave(false); }
          if (saved?.id === next.puzzle.id && saved.guesses.length) {
            try { next = await post(next.puzzle, saved.guesses); }
            catch (e) { if (!(e instanceof PuzzleError) || e.code !== "INVALID_GUESSES") throw e; }
          }
        }
        if (alive && request.current === seq) accept(next);
      } catch { if (alive && request.current === seq) { setResult(null); setError("loadError"); } }
      finally { if (alive && request.current === seq) setBusy(false); }
    })();
    return () => { alive = false; };
    // Puzzle data has every supported language; changing language keeps the same game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, revision]);

  useEffect(() => {
    if (mode !== "daily" || !result) return;
    const interval = window.setInterval(() => {
      if (Date.now() >= Date.parse(result.puzzle.nextAt) && rollover.current !== result.puzzle.id) {
        rollover.current = result.puzzle.id;
        setRevision(r => r + 1);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [mode, result]);

  async function guess() {
    if (!result || !selected || busy || result.finished) return;
    const seq = ++request.current;
    setBusy(true); setError(null);
    try {
      const next = await post(result.puzzle, [...result.rows.map(r => r.character.id), selected]);
      if (request.current === seq) accept(next);
    } catch (e) {
      if (request.current === seq) {
        if (e instanceof PuzzleError && e.code === "DAY_CHANGED") { setError("dayChanged"); setRevision(r => r + 1); }
        else if (e instanceof PuzzleError && e.code === "PROGRESS_CHANGED" && e.current) { accept(e.current); setError("cloudConflict"); }
        else setError("guessError");
      }
    } finally { if (request.current === seq) setBusy(false); }
  }

  async function share() {
    if (!result?.finished) return;
    const icons: Record<Match, string> = { match: "🟩", close: "🟨", miss: "⬛" };
    const label = mode === "daily" ? "#" + result.puzzle.number : w.practice;
    const text = "Madokadle " + label + " " + (result.won ? result.rows.length : "X") + "/6\n" + result.rows.map(r => r.cells.map(c => icons[c.match]).join("")).join("\n") + "\n" + window.location.origin + "/" + lang + "/madokadle/";
    try { await navigator.clipboard.writeText(text); setCopied(true); setShareFallback(""); }
    catch { setShareFallback(text); }
  }

  const used = new Set(result?.rows.map(r => r.character.id));
  const choice = result?.puzzle.options.find(c => c.id === selected);
  const columns: Trait[] = ["debut", "hair", "weapon", "medium"];
  const symbols: Record<Match, string> = { match: "✓", close: "≈", miss: "×" };
  const last = result?.rows.at(-1);

  return <div className="madokadle-page">
    <div className="game-heading"><p className="eyebrow"><Gamepad2 size={16} aria-hidden="true" /> PUELLA MAGI MADOKA MAGICA · {w.classic}</p><h1>Madokadle<span aria-hidden="true">✧</span></h1><p>{w.subtitle}</p></div>
    <div className="game-layout">
      <section className="game-board" aria-label={w.title}>
        <Tabs value={mode} onValueChange={value => setMode(value as GameMode)}>
        <div className="game-mode-row"><TabsList className="game-tabs"><TabsTrigger value="daily" disabled={busy}>{w.daily}</TabsTrigger><TabsTrigger value="practice" disabled={busy}>{w.practice}</TabsTrigger></TabsList><span className="game-edition">{mode === "daily" ? "#" + (result?.puzzle.number || "1") : "∞"}</span></div>
        <TabsContent value={mode}>
        <div className="game-prompt"><h2>{mode === "daily" ? w.today : w.practiceTitle}</h2><p>{w.intro}</p></div>
        <div className="guess-controls">
          <Popover open={picker} onOpenChange={setPicker}><PopoverTrigger asChild><button className="character-picker" aria-haspopup="dialog" aria-expanded={picker} aria-controls={picker ? pickerId : undefined} aria-label={w.pick} disabled={busy || !result || result.finished}><span>{choice ? name(choice, lang) : w.pick}</span><ChevronsUpDown size={17} aria-hidden="true" /></button></PopoverTrigger><PopoverContent id={pickerId} className="character-picker-panel" align="start"><Command><CommandInput placeholder={w.search} aria-label={w.search} /><CommandList><CommandEmpty>{w.empty}</CommandEmpty><CommandGroup>{result?.puzzle.options.map(c => <CommandItem key={c.id} value={c.name + " " + c.japanese + " " + c.aliases.join(" ")} disabled={used.has(c.id)} onSelect={() => { setSelected(c.id); setPicker(false); }}><div><strong>{name(c, lang)}</strong><small>{lang === "ja" ? c.name : c.japanese}</small></div>{used.has(c.id) && <Check size={16} aria-hidden="true" />}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
          <button className="button button-rose guess-button" onClick={guess} disabled={!selected || busy || !result || result.finished}>{busy ? <Loader2 className="spin" size={17} aria-hidden="true" /> : null}{busy && result ? w.checking : w.guess}</button>
        </div>
        <div className="game-progress"><span>{w.attempts} <strong>{result?.rows.length || 0} / 6</strong></span><div aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span className={i < (result?.rows.length || 0) ? "used" : ""} key={i} />)}</div></div>
        {busy && !result && <p className="game-loading" role="status">{w.loading}</p>}
        {error && <div className="game-error" role="alert"><p>{error === "cloudConflict" ? account.cloudConflict : error === "guessError" && cloud ? account.cloudGuessError : w[error]}</p>{error === "loadError" && <button className="text-link" onClick={() => setRevision(r => r + 1)}>{w.retry}</button>}</div>}
        <div className="game-legend"><span className="legend-match">✓ {w.match}</span><span className="legend-close">≈ {w.close}</span><span>× {w.miss}</span></div>
        {!!result?.rows.length && <><p className="game-scroll-hint">{w.scroll}</p><div className="guess-table-wrap" tabIndex={0} role="region" aria-label={w.results}><table className="guess-table"><caption className="sr-only">{w.results}</caption><thead><tr><th scope="col">{w.character}</th>{columns.map(t => <th scope="col" key={t}>{w[t]}</th>)}</tr></thead><tbody>{result.rows.map(row => <tr key={row.character.id}><th scope="row"><span>{name(row.character, lang)}</span><small>{lang === "ja" ? row.character.name : row.character.japanese}</small></th>{row.cells.map(cell => <td className={"cell-" + cell.match} key={cell.trait}><span className="cell-symbol" aria-hidden="true">{symbols[cell.match]}</span><span>{cell.value[lang]}</span><span className="sr-only"> · {w[cell.match]}</span></td>)}</tr>)}</tbody></table></div></>}
        <p className="sr-only" aria-live="polite">{last ? name(last.character, lang) + ": " + last.cells.map(c => w[c.trait] + " " + w[c.match]).join(". ") : ""}</p>
        {result?.finished && result.answer && <div className={"game-result " + (result.won ? "won" : "lost")} role="status"><Trophy size={27} aria-hidden="true" /><div><h2>{result.won ? w.won : w.lost}</h2><p>{w.answer}: <strong>{name(result.answer, lang)}</strong></p><a className="text-link" href={result.answer.source} target="_blank" rel="noopener noreferrer">{w.source}</a></div><button className="button button-outline" onClick={share}><Copy size={16} aria-hidden="true" />{copied ? w.copied : w.share}</button></div>}
        {shareFallback && <div className="share-fallback"><label htmlFor="share-result">{w.fallback}</label><textarea id="share-result" value={shareFallback} readOnly rows={7} aria-label={w.resultLabel} onFocus={e => e.currentTarget.select()} /></div>}
        {mode === "daily" && result && <div className="next-puzzle"><span>{w.next}</span><DailyClock lang={lang} nextAt={result.puzzle.nextAt} /><small>00:00 UTC</small></div>}
        {mode === "practice" && <div className="practice-footer"><p>{w.practiceNote}</p><button className="button button-outline" disabled={busy} onClick={() => { practice.current = null; setResult(null); setRevision(r => r + 1); }}>{w.another}</button></div>}
        {!result?.finished && !!result?.rows.length && <p className="game-tip">{w.hint}</p>}
        </TabsContent>
        </Tabs>
      </section>
      <aside className="game-sidebar"><section className="game-statistics"><h2><Trophy size={18} aria-hidden="true" />{w.stats}</h2><div className="game-stat-grid">{[{n:stats.played,label:w.played},{n:stats.wins,label:w.wins},{n:stats.current,label:w.streak},{n:stats.best,label:w.best}].map(item => <div key={item.label}><strong>{item.n}</strong><span>{item.label}</span></div>)}</div><p>{cloud ? account.cloudSaved : canSave ? w.saved : w.unsaved}</p><div className="game-account-links"><a className="text-link" href={`/${lang}/profile/`}>{account.profile}</a><a className="text-link" href={`/${lang}/leaderboard/`}><Trophy size={15} aria-hidden="true" />{account.viewRanking}</a><small>{account.rankSteps}</small></div></section>
        <section className="game-universe"><Sparkles size={24} aria-hidden="true" /><h2>{w.universe}</h2><p>{w.universeText}</p><div className="universe-works"><span>Madoka Magica</span><span>Rebellion</span><span>Magia Record</span><span>Oriko</span><span>Kazumi</span><span>Tart</span><span>Suzune</span></div></section>
        <Accordion type="single" collapsible defaultValue="rules" className="game-rules"><AccordionItem value="rules"><AccordionTrigger>{w.rules}</AccordionTrigger><AccordionContent><ol><li>{w.rule1}</li><li>{w.rule2}</li><li>{w.rule3}</li><li>{w.rule4}</li></ol></AccordionContent></AccordionItem></Accordion>
      </aside>
    </div>
  </div>;
}
