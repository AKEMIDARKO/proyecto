import type { Metadata } from "next";
import "./globals.css";
import "./game-ui.css";
import "./expansion.css";
import "./theme-palette.css";
import "./audit-fixes.css";
import "./magic-preview.css";
import "./archive-atmosphere.css";
import { headers } from "next/headers";
import { isLang } from "@/lib/locales";
import ArchiveExperience from "@/components/archive-experience";

export const metadata: Metadata = {
  title: { default: "Magia Archive — Guías de Magia Exedra", template: "%s | Magia Archive" },
  description: "Guías de Magia Exedra, personajes, novedades y Madokadle: el juego diario del universo Madoka, en nueve idiomas.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requested = (await headers()).get("x-magia-language");
  const language = isLang(requested) ? requested : "es";
  return <html lang={language} data-theme="dark" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('magia-theme');if(t==='light'){document.documentElement.dataset.theme='light';document.documentElement.classList.remove('dark')}}catch(e){}" }} /></head><body><ArchiveExperience lang={language}>{children}</ArchiveExperience></body></html>;
}
