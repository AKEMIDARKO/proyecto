"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { accountCopy } from "@/lib/account-copy";
import { localeNames, type Lang } from "@/lib/locales";
import { accountResponse } from "@/lib/account-client";

type GoogleIdentity = {
  initialize(config: { client_id: string; nonce: string; ux_mode: "popup"; auto_select: boolean; callback: (response: { credential: string }) => void }): void;
  renderButton(element: HTMLElement, config: { type: string; theme: string; size: string; shape: string; text: string; width: string; locale: string }): void;
  disableAutoSelect(): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } } } }
let library: Promise<void> | null = null;
function loadLibrary(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (library) return library;
  library = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => { script.remove(); library = null; reject(new Error("GOOGLE_UNAVAILABLE")); }, 15000);
    script.src = "https://accounts.google.com/gsi/client"; script.async = true;
    script.onload = () => { window.clearTimeout(timer); resolve(); };
    script.onerror = () => { window.clearTimeout(timer); script.remove(); library = null; reject(new Error("GOOGLE_UNAVAILABLE")); };
    document.head.appendChild(script);
  });
  return library;
}

export default function GoogleSignIn({ lang, onSignedIn }: { lang: Lang; onSignedIn: () => void }) {
  const w = accountCopy[lang], button = useRef<HTMLDivElement>(null), callback = useRef(onSignedIn);
  const [status, setStatus] = useState<"loading" | "ready" | "pending" | "signing" | "error">("loading");
  const [revision, setRevision] = useState(0);
  callback.current = onSignedIn;
  useEffect(() => {
    let alive = true, submitting = false;
    setStatus("loading");
    (async () => {
      try {
        const config = await fetch("/api/auth/google", { cache: "no-store" }).then(accountResponse<{ enabled: boolean; clientId?: string; nonce?: string }>);
        if (!alive) return;
        if (!config.enabled) { setStatus("pending"); return; }
        if (!config.clientId || !config.nonce) throw new Error("GOOGLE_UNAVAILABLE");
        await loadLibrary();
        if (!alive || !button.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: config.clientId, nonce: config.nonce, ux_mode: "popup", auto_select: false, callback: async ({ credential }) => {
          if (!alive || submitting) return;
          submitting = true; setStatus("signing");
          try {
            await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) }).then(accountResponse);
            if (alive) callback.current();
          } catch { if (alive) setStatus("error"); }
          finally { submitting = false; }
        } });
        button.current.replaceChildren();
        window.google.accounts.id.renderButton(button.current, { type: "standard", theme: "filled_black", size: "large", shape: "rectangular", text: "continue_with", width: String(Math.max(200, Math.min(320, button.current.clientWidth))), locale: localeNames[lang] });
        setStatus("ready");
      } catch { if (alive) setStatus("error"); }
    })();
    return () => { alive = false; button.current?.replaceChildren(); };
  }, [lang, revision]);
  return <div className="google-sign-in">
    <div ref={button} className="google-button" style={{ display: status === "ready" ? "block" : "none" }} />
    {(status === "loading" || status === "signing") && <p className="account-status" role="status"><Loader2 className="spin" size={18} aria-hidden="true" />{status === "signing" ? w.googleConnecting : w.loading}</p>}
    {status === "pending" && <p className="google-pending" role="status">{w.googlePending}</p>}
    {status === "error" && <div className="account-error" role="alert"><p>{w.googleError}</p><button className="text-link" onClick={() => setRevision(n => n + 1)}>{w.retry}</button></div>}
  </div>;
}
