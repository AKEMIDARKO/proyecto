import { ArrowUpRight, Camera, Headphones, Link2, Music2, Play, Radio } from "lucide-react";
import { creatorCopy, creatorLinks } from "@/lib/creator-links";
import type { Lang } from "@/lib/locales";

export default function CreatorSocials({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const copy = creatorCopy[lang];
  return <nav className={compact ? "creator-socials-compact" : "creator-socials-grid"} aria-label={copy.socials}>{creatorLinks.map(link => {
    const Icon = link.id.startsWith("youtube") ? Play : link.id === "instagram" ? Camera : link.id === "twitch" ? Radio : link.id === "spotify" ? Headphones : link.id === "links" ? Link2 : Music2;
    const label = copy[link.label] || link.label;
    return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform + " · " + label + " · " + link.handle}>{link.id === "x" ? <span className="social-x" aria-hidden="true">𝕏</span> : <Icon size={compact ? 16 : 22} aria-hidden="true" />}<span>{compact ? link.id === "youtubeExtras" ? "YouTube · Homulilly 2" : link.platform : <><strong>{link.platform}</strong><small>{label !== link.platform ? label : link.handle}</small></>}</span>{!compact && <ArrowUpRight size={16} className="social-arrow" aria-hidden="true" />}</a>;
  })}</nav>;
}
