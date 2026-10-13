"use client";
import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountCopy } from "@/lib/account-copy";
import { accountResponse } from "@/lib/account-client";
import type { Lang } from "@/lib/locales";
import { AccountNavigation } from "./account-profile";
type Entry = { nickname: string; wins: number; played: number; attempts: number; position: number; me: boolean };
export default function Leaderboard({ lang }: { lang: Lang }) {
  const w = accountCopy[lang];
  const [period, setPeriod] = useState("today"), [entries, setEntries] = useState<Entry[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(false), [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true; setLoading(true); setError(false);
    fetch("/api/leaderboard?period=" + period, { cache: "no-store" }).then(accountResponse<{ entries: Entry[] }>).then(data => { if (alive) setEntries(data.entries); }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [period, revision]);
  return <div className="leaderboard-page"><div className="page-heading"><p className="eyebrow"><Trophy size={14} aria-hidden="true" /> MADOKADLE</p><h1>{w.leaderboard}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{w.leaderboardIntro}</p></div><AccountNavigation lang={lang} active="leaderboard" />
    <div className="ranking-layout"><section className="account-card ranking-card"><Tabs value={period} onValueChange={setPeriod}><TabsList className="game-tabs"><TabsTrigger value="today">{w.today}</TabsTrigger><TabsTrigger value="all">{w.all}</TabsTrigger></TabsList></Tabs>
      {loading ? <p className="account-status" role="status"><Loader2 size={18} className="spin" aria-hidden="true" />{w.loading}</p> : error ? <div className="account-error" role="alert"><p>{w.error}</p><button className="text-link" onClick={() => setRevision(r => r + 1)}>{w.retry}</button></div> : entries.length ? <div className="ranking-table-wrap" tabIndex={0} role="region" aria-label={w.leaderboard}><table className="ranking-table"><caption className="sr-only">{w.leaderboard}</caption><thead><tr><th scope="col">{w.position}</th><th scope="col">{w.player}</th><th scope="col">{w.wins}</th><th scope="col">{w.played}</th><th scope="col">{w.attempts}</th></tr></thead><tbody>{entries.map((e, i) => <tr key={i} className={e.me ? "ranking-me" : ""}><td>{e.position === 1 ? <Trophy size={17} aria-hidden="true" /> : null}{e.position}</td><th scope="row">{e.nickname}{e.me && <small>{w.you}</small>}</th><td>{e.wins}</td><td>{e.played}</td><td>{e.attempts}</td></tr>)}</tbody></table></div> : <div className="ranking-empty"><Trophy size={35} aria-hidden="true" /><p>{w.emptyRanking}</p><a className="button button-rose" href={`/${lang}/madokadle/`}>{w.play}</a></div>}
    </section><aside className="account-card ranking-rules"><h2>{w.leaderboard}</h2><p>{w.rankRules}</p><p>{w.rankSteps}</p><a className="button button-outline" href={`/${lang}/profile/`}>{w.profile}</a></aside></div>
  </div>;
}
