import { Coffee, Heart, Users, PenLine } from 'lucide-react';
import { communityLinks, communityCopy, initialPetition, type PetitionSnapshot } from '@/lib/community-data';
import { localeNames, type Lang } from '@/lib/locales';

export function CommunityCards({ lang, petition = initialPetition }: { lang: Lang; petition?: PetitionSnapshot }) {
  const c = communityCopy[lang];
  return <div className="community-grid">
    <section className="community-card petition-card" id="petition"><p className="eyebrow"><PenLine size={17} aria-hidden="true" /> CHANGE.ORG · ESPAÑA</p><h2>{c.petition}</h2><p>{c.petitionText}</p><div className="petition-count"><strong>{new Intl.NumberFormat(localeNames[lang]).format(petition.count)}</strong><span>{c.signatures}</span></div><p className="count-date">{c.lastCount} · <time dateTime={petition.checkedAt}>{new Intl.DateTimeFormat(localeNames[lang], { dateStyle: 'medium', timeZone: 'Europe/Madrid' }).format(new Date(petition.checkedAt))}</time></p><p className="support-small">{c.countNote}</p><a className="button button-rose" href={communityLinks.petition} target="_blank" rel="noopener noreferrer">{c.sign}</a></section>
    <section className="community-card" id="community"><p className="eyebrow"><Users size={17} aria-hidden="true" /> X · @madoka_exedraES</p><h2>{c.spanishCommunity}</h2><p>{c.communityText}</p><a className="button button-outline" href={communityLinks.x} target="_blank" rel="noopener noreferrer">{c.follow}</a><p className="support-small">{c.fanNote}</p></section>
    <section className="community-card kofi-card" id="support"><p className="eyebrow"><Coffee size={18} aria-hidden="true" /> HOMULILLY · KO-FI</p><h2>{c.support}</h2><p>{c.supportText}</p><a className="button button-rose" href={communityLinks.kofi} target="_blank" rel="noopener noreferrer"><Heart size={17} aria-hidden="true" />{c.kofi}</a><p className="support-small">{c.voluntary}</p></section>
  </div>;
}
export default function CommunityPage({lang,petition}:{lang:Lang;petition?:PetitionSnapshot}) {
  const c=communityCopy[lang];
  return <><div className="page-heading"><p className="eyebrow">MAGIA ARCHIVE · HOMULILLY</p><h1>{c.community}<span className="heading-star" aria-hidden="true">✧</span></h1><p>{c.communityIntro}</p></div><CommunityCards lang={lang} petition={petition}/></>;
}
