import { BookOpen } from "lucide-react";
import { checked, dateLabel, words, type Lang } from "@/lib/magia-data";

export default function SourcePanel({ lang, sources, checkedAt = checked }: { checkedAt?: string; lang: Lang; sources: { title: string; url: string }[] }) {
  const w = words[lang];
  return <div className="source-panel"><h2><BookOpen size={18} aria-hidden="true" />{w.sources}</h2><p>{w.revised} <time dateTime={checkedAt}>{dateLabel(checkedAt, lang)}</time></p><ul>{sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul></div>;
}
