"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { accountCopy } from "@/lib/account-copy";
import { AccountError, getAccount, saveAccount, type Favorite } from "@/lib/account-client";
import type { Lang } from "@/lib/locales";
export default function FavoriteButton({ lang, kind, itemId }: { lang: Lang; kind: Favorite["kind"]; itemId: string }) {
  const w = accountCopy[lang];
  const [signedIn, setSignedIn] = useState(false), [saved, setSaved] = useState(false), [busy, setBusy] = useState(true), [error, setError] = useState(false), [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true; setBusy(true); setError(false);
    getAccount().then(data => { if (alive) { setSignedIn(!!data.user); setSaved(data.favorites.some(f => f.kind === kind && f.itemId === itemId)); } }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [kind, itemId, revision]);
  async function toggle() {
    setBusy(true); setError(false);
    try { await saveAccount({ action: "favorite", kind, itemId, saved: !saved }); setSaved(!saved); }
    catch (e) { if (e instanceof AccountError && e.code === "SIGN_IN_REQUIRED") setSignedIn(false); else setError(true); }
    finally { setBusy(false); }
  }
  return <div className="favorite-control">{error ? <div className="account-error" role="alert"><p>{w.error}</p><button className="text-link" onClick={() => setRevision(r => r + 1)}>{w.retry}</button></div> : signedIn || busy ? <button className="button button-outline" disabled={busy} aria-pressed={saved} onClick={toggle}><Heart size={17} aria-hidden="true" fill={saved ? "currentColor" : "none"} />{busy ? w.loading : saved ? w.removeFavorite : w.addFavorite}</button> : <a className="button button-outline" href={`/${lang}/profile/`}><Heart size={17} aria-hidden="true" />{w.signInToSave}</a>}</div>;
}
