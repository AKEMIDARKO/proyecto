"use client";
import { Backpack, Calculator, Trophy, ChartNoAxesColumnIncreasing } from 'lucide-react';
import { toolsCopy, toolKey } from '@/lib/tools-copy';
import type { Lang } from '@/lib/locales';
import { MyCharacters, AscensionCalculator } from './growth-tools';
import AchievementTracker from './achievement-tracker';
import CharacterRanking from './character-ranking';
import { SupportPage, FaqPage } from './support-pages';
const pages=[{path:'my-characters',key:'myCharacters',intro:'myIntro',icon:Backpack},{path:'ascension-calculator',key:'calculator',intro:'calcIntro',icon:Calculator},{path:'achievements',key:'achievements',intro:'achievementIntro',icon:Trophy},{path:'ranking',key:'ranking',intro:'rankIntro',icon:ChartNoAxesColumnIncreasing}];
const intros:Record<string,string>={tools:'toolsIntro','my-characters':'myIntro','ascension-calculator':'calcIntro',achievements:'achievementIntro',ranking:'rankIntro','bug-tracker':'bugsIntro',faq:'faqIntro',contact:'contactIntro'};
export default function ToolsPages({lang,path}:{lang:Lang;path:string}){
  const t=toolsCopy[lang];return <div className="tools-page"><nav className="database-tabs tool-tabs" aria-label={t.tools}><a href={`/${lang}/tools/`} className={path==='tools'?'active':''}>{t.tools}</a>{pages.map(p=><a href={`/${lang}/${p.path}/`} key={p.path} className={path===p.path?'active':''} aria-current={path===p.path?'page':undefined}>{t[p.key]}</a>)}</nav><div className="page-heading"><p className="eyebrow">MAGIA ARCHIVE · MAGIA EXEDRA</p><h1>{t[toolKey[path]]}</h1><p>{t[intros[path]]}</p></div>{path==='tools'&&<div className="tools-hub">{pages.map(({path,key,intro,icon:Icon})=><a className="tool-card" key={path} href={`/${lang}/${path}/`}><Icon size={36} aria-hidden="true"/><h2>{t[key]}</h2><p>{t[intro]}</p><span className="text-link">{t.more} →</span></a>)}</div>}{path==='my-characters'&&<MyCharacters lang={lang}/>}{path==='ascension-calculator'&&<AscensionCalculator lang={lang}/>}{path==='achievements'&&<AchievementTracker lang={lang}/>}{path==='ranking'&&<CharacterRanking lang={lang}/>}{path==='bug-tracker'&&<SupportPage lang={lang} kind="bug"/>}{path==='contact'&&<SupportPage lang={lang} kind="contact"/>}{path==='faq'&&<FaqPage lang={lang}/>}</div>;
}
