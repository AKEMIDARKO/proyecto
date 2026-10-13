"use client";
import { useKiokus } from './kioku-context';

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BookOpen, Gamepad2, Heart, Loader2, LogOut, NotebookPen, Trophy, UserRound } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { characters, words, type Lang } from "@/lib/magia-data";
import { accountCopy } from "@/lib/account-copy";
import { AccountError, accountResponse, emptyAccount, getAccount, LOCAL_HISTORY_KEY, saveAccount, type AccountData, type CharacterNote } from "@/lib/account-client";
import { parseHistory, type History } from "@/lib/madokadle-history";
import { gameCopy } from "@/lib/madokadle-copy";
import GoogleSignIn from "./google-sign-in";
import { kiokuLabel, sortKiokus } from "@/lib/kioku-catalog";
import { kiokuCopy } from "@/lib/kioku-copy";
import { defaultNoteKioku, favoriteItem, noteCharacterLabel } from "@/lib/account-items";
import { expansionCopy } from '@/lib/expansion-copy';

export function AccountNavigation({ lang, active }: { lang: Lang; active: "profile" | "leaderboard" }) {
  const w = accountCopy[lang];
  return <nav className="profile-tabs" aria-label={w.account}>{(["profile", "leaderboard"] as const).map(route => <a key={route} className={route === active ? "active" : ""} aria-current={route === active ? "page" : undefined} href={`/${lang}/${route}/`}>{route === "profile" ? <UserRound size={17} aria-hidden="true" /> : <Trophy size={17} aria-hidden="true" />}{w[route]}</a>)}<a href={`/${lang}/tierlists/create/`}>{expansionCopy[lang].myLists}</a></nav>;
}

function NotesEditor({ lang, notes, busy, onSave }: { lang: Lang; notes: CharacterNote[]; busy: boolean; onSave: (body: Record<string, unknown>) => Promise<boolean> }) {
  const kiokus=useKiokus();
  const w = accountCopy[lang], initial = notes[0];
  const [characterId, setCharacterId] = useState(initial?.characterId || characters[0].id);
  const [kioku, setKioku] = useState(initial?.kioku || ""), [portrait, setPortrait] = useState(initial?.portrait || ""), [text, setText] = useState(initial?.notes || "");
  function choose(id: string) {
    const saved = notes.find(n => n.characterId === id);
    setCharacterId(id); setKioku(saved?.kioku ?? defaultNoteKioku(id, lang,kiokus)); setPortrait(saved?.portrait || ""); setText(saved?.notes || "");
  }
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("kioku");
    if (requested && kiokus.some(unit => unit.id === requested)) {
      const saved = notes.find(note => note.characterId === requested);
      setCharacterId(requested); setKioku(saved?.kioku ?? defaultNoteKioku(requested, lang,kiokus)); setPortrait(saved?.portrait || ""); setText(saved?.notes || "");
    }
    // Read the incoming profile link once; later selections and edits belong to the user.
  }, []);
  async function submit(event: FormEvent) { event.preventDefault(); await onSave({ action: "note", characterId, kioku, portrait, notes: text }); }
  async function remove() { if (await onSave({ action: "delete-note", characterId })) { setKioku(""); setPortrait(""); setText(""); } }
  return <section className="account-card notebook-card" id="notebook"><h2><NotebookPen size={21} aria-hidden="true" />{w.notes}</h2><p>{w.notesIntro}</p>
    {notes.length ? <div className="notebook-entries">{notes.map(n => <button type="button" disabled={busy} className={characterId === n.characterId ? "active" : ""} key={n.characterId} onClick={() => choose(n.characterId)}>{noteCharacterLabel(n.characterId, lang,kiokus)}</button>)}</div> : <p className="account-empty">{w.emptyNotes}</p>}
    <form className="account-form" onSubmit={submit}>
      <label htmlFor="note-character">{w.chooseCharacter}</label><select id="note-character" value={characterId} onChange={e => choose(e.target.value)} disabled={busy}><optgroup label={kiokuCopy[lang].introProfiles}>{characters.map(c => <option value={c.id} key={c.id}>{lang === "ja" ? c.japanese : c.name}</option>)}</optgroup>{[5, 4, 3].map(rarity => <optgroup key={rarity} label={rarity + " " + kiokuCopy[lang].stars}>{sortKiokus(kiokus.filter(unit => unit.rarity === rarity), "nameAsc", lang).map(unit => <option value={unit.id} key={unit.id}>{kiokuLabel(unit, lang)}</option>)}</optgroup>)}</select>
      <div className="notebook-fields"><div><label htmlFor="note-kioku">{w.kioku}</label><input id="note-kioku" value={kioku} onChange={e => setKioku(e.target.value)} maxLength={120} disabled={busy} /></div><div><label htmlFor="note-portrait">{w.portrait}</label><input id="note-portrait" value={portrait} onChange={e => setPortrait(e.target.value)} maxLength={120} disabled={busy} /></div></div>
      <label htmlFor="note-text">{w.note}</label><textarea id="note-text" value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={5} disabled={busy} />
      <div className="account-card-actions"><button className="button button-rose" type="submit" disabled={busy}>{busy ? w.saving : w.save}</button>{notes.some(n => n.characterId === characterId) && <button type="button" className="text-link" onClick={remove} disabled={busy}>{w.clearNote}</button>}</div>
    </form>
  </section>;
}

export default function AccountProfile({ lang }: { lang: Lang }) {
  const kiokus=useKiokus();
  const w = accountCopy[lang], g = gameCopy[lang], base = `/${lang}/`;
  const [data, setData] = useState<AccountData | null>(null), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [nickname, setNickname] = useState(""), [ranked, setRanked] = useState(false);
  const [local, setLocal] = useState<History>({}), [deleteOpen, setDeleteOpen] = useState(false);
  const load = useCallback(async () => {
    const next = await getAccount(); setData(next); setNickname(next.user?.nickname || ""); setRanked(!!next.user?.ranked);
  }, []);
  useEffect(() => {
    let alive = true;
    getAccount().then(next => { if (alive) { setData(next); setNickname(next.user?.nickname || ""); setRanked(!!next.user?.ranked); } }).catch(() => { if (alive) setError("error"); }).finally(() => { if (alive) setLoading(false); });
    try { setLocal(parseHistory(localStorage.getItem(LOCAL_HISTORY_KEY))); } catch { /* Local storage is optional. */ }
    return () => { alive = false; };
  }, []);
  async function refresh() { setLoading(true); setError(""); try { await load(); } catch { setError("error"); } finally { setLoading(false); } }
  async function mutate(body: Record<string, unknown>): Promise<boolean> {
    if (busy) return false;
    setBusy(true); setError(""); setNotice("");
    try { await saveAccount(body); await load(); setNotice("saved"); return true; }
    catch (e) {
      if (e instanceof AccountError && e.code === "SIGN_IN_REQUIRED") setData(emptyAccount);
      setError(e instanceof AccountError && e.code === "INVALID_NICKNAME" ? "nicknameHint" : "error"); return false;
    } finally { setBusy(false); }
  }
  async function closeAccount(remove = false) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await fetch(remove ? "/api/account" : "/api/auth/logout", { method: remove ? "DELETE" : "POST" }).then(accountResponse);
      window.google?.accounts.id.disableAutoSelect(); setDeleteOpen(false); setData(emptyAccount);
    } catch { setError("error"); } finally { setBusy(false); }
  }
  return <div className="profile-page">
    <div className="page-heading"><p className="eyebrow"><UserRound size={14} aria-hidden="true" /> MAGIA ARCHIVE</p><h1>{w.profile}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{w.profileIntro}</p></div>
    <AccountNavigation lang={lang} active="profile" />
    {loading && <p className="account-status" role="status"><Loader2 className="spin" size={18} aria-hidden="true" />{w.loading}</p>}
    {error && <div className="account-error" role="alert"><p>{w[error]}</p>{!data && <button className="text-link" onClick={refresh}>{w.retry}</button>}</div>}
    {notice && <p className="account-notice" role="status">{w[notice]}</p>}
    {!loading && data && !data.user && <div className="profile-welcome"><section className="account-card login-card"><span className="profile-emblem" aria-hidden="true"><BookOpen size={38} /><span>✦</span></span><h2>{w.loginHeadline}</h2><p>{w.loginText}</p><GoogleSignIn lang={lang} onSignedIn={refresh} /><a className="text-link privacy-link" href={base + "privacy/"}>{w.privacy}</a></section><div className="profile-benefits">{[{ icon: Gamepad2, title: w.accountGame, text: w.dailyBenefit }, { icon: Heart, title: w.favorites, text: w.favoritesIntro }, { icon: NotebookPen, title: w.notes, text: w.notesIntro }].map(item => <div className="profile-benefit" key={item.title}><item.icon size={25} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.text}</p></div></div>)}<a className="button button-outline" href={base + "madokadle/"}>{w.play}</a></div></div>}
    {!loading && data?.user && <div className="profile-layout"><div className="profile-primary">
      <section className="account-card"><h2><UserRound size={21} aria-hidden="true" />{w.account}</h2><form className="account-form" onSubmit={e => { e.preventDefault(); void mutate({ action: "profile", nickname, ranked }); }}>
        <label htmlFor="profile-nickname">{w.nickname}</label><input id="profile-nickname" value={nickname} onChange={e => setNickname(e.target.value)} minLength={2} maxLength={24} required disabled={busy} aria-describedby="nickname-help" autoComplete="nickname" /><p className="field-help" id="nickname-help">{w.nicknameHint}</p>
        <label className="ranking-checkbox"><input type="checkbox" checked={ranked} onChange={e => setRanked(e.target.checked)} disabled={busy} /><span>{w.ranked}<small>{w.rankedHint}</small></span></label><button type="submit" className="button button-rose" disabled={busy}>{busy ? w.saving : w.save}</button>
      </form></section>
      <section className="account-card"><h2><Heart size={21} aria-hidden="true" />{w.favorites}</h2><p>{w.favoritesIntro}</p>{data.favorites.length ? <ul className="saved-favorites">{data.favorites.map(f => {
        const item = favoriteItem(f, lang,kiokus);
        if (!item) return null;
        const title = item.title;
        return <li key={f.kind + f.itemId}><a href={item.href}><img className={f.kind === "kioku" ? "saved-kioku-art" : undefined} src={item.image} width={56} height={62} alt="" /><span><small>{w[f.kind]}</small><strong>{title}</strong></span></a><button className="text-link" disabled={busy} onClick={() => void mutate({ action: "favorite", kind: f.kind, itemId: f.itemId, saved: false })} aria-label={w.removeFavorite + ": " + title}>{w.remove}</button></li>;
      })}</ul> : <p className="account-empty">{w.emptyFavorites}</p>}<div className="account-card-actions"><a className="text-link" href={base + "characters/"}>{words[lang].characters}</a><a className="text-link" href={base + "guides/"}>{words[lang].guides}</a></div></section>
      <NotesEditor lang={lang} notes={data.notes} busy={busy} onSave={mutate} />
    </div><aside className="profile-sidebar">
      <section className="account-card game-statistics"><h2><Trophy size={20} aria-hidden="true" />{g.stats}</h2><div className="game-stat-grid">{[{ n: data.stats.played, label: g.played }, { n: data.stats.wins, label: g.wins }, { n: data.stats.current, label: g.streak }, { n: data.stats.best, label: g.best }].map(s => <div key={s.label}><strong>{s.n}</strong><span>{s.label}</span></div>)}</div><a className="button button-rose" href={base + "madokadle/"}>{w.play}</a><a className="text-link" href={base + "leaderboard/"}>{w.viewRanking}</a></section>
      {!data.user.imported && Object.values(local).some(r => r.guesses.length) && <section className="account-card"><h2>{w.importTitle}</h2><p>{w.importText}</p><button className="button button-outline" onClick={() => void mutate({ action: "import", history: local })} disabled={busy}>{w.importAction}</button></section>}
      <section className="account-card profile-session"><a className="text-link" href={base + "privacy/"}>{w.privacy}</a><button className="button button-outline" onClick={() => void closeAccount()} disabled={busy}><LogOut size={17} aria-hidden="true" />{w.logout}</button>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogTrigger asChild><button className="delete-profile" disabled={busy}>{w.deleteAccount}</button></AlertDialogTrigger><AlertDialogContent className="account-delete-dialog"><AlertDialogHeader><AlertDialogTitle>{w.deleteTitle}</AlertDialogTitle><AlertDialogDescription>{w.deleteText}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>{w.cancel}</AlertDialogCancel><button className="button button-rose" disabled={busy} onClick={() => void closeAccount(true)}>{busy ? w.saving : w.confirmDelete}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </section>
    </aside></div>}
  </div>;
}
