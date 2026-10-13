import { accountCopy } from "@/lib/account-copy";
import type { Lang } from "@/lib/locales";
import { expansionCopy } from '@/lib/expansion-copy';
import { faqData } from '@/lib/faq-data';
export default function AccountPrivacy({ lang }: { lang: Lang }) {
  const w = accountCopy[lang];
  return <article className="about-page privacy-page"><p className="eyebrow">MAGIA ARCHIVE</p><h1>{w.privacy}</h1><p>{w.privacyIntro}</p>{["privacyWhat", "privacyRanking", "privacyCookies", "privacyDelete", "privacyGoogle"].map(key => <section key={key}><h2>{w[key]}</h2><p>{w[key + "Text"]}</p></section>)}<section><h2>{expansionCopy[lang].myLists}</h2><p>{expansionCopy[lang].privateLists}</p></section><section><h2>{faqData[lang].find(e=>e.id==='private')!.question}</h2><p>{faqData[lang].find(e=>e.id==='private')!.answer}</p><p>{faqData[lang].find(e=>e.id==='delete')!.answer}</p></section><div className="account-card-actions"><a className="text-link" href={`/${lang}/profile/`}>{w.profile}</a><a className="text-link" href={`/${lang}/homulilly/`}>Homulilly</a><a className="text-link" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google · {w.privacy}</a></div></article>;
}
