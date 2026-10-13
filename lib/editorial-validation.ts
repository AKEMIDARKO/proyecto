import { z } from 'zod';
import { languages } from './locales';
import { communityLinks, petitionTitle } from './community-data';
const localized=(max:number)=>z.object(Object.fromEntries(languages.map(lang=>[lang,z.string().trim().min(2).max(max)])) as Record<typeof languages[number],z.ZodString>).strict();
const slug=z.string().regex(/^[a-z0-9][a-z0-9-]{1,90}$/);
export function allowedNewsSource(value:string) {
  try {
    const u=new URL(value);
    return /^\d+$/.test(u.searchParams.get('id')??'') && u.protocol==='https:' && !u.username && !u.password && !u.port && !u.hash && (
      (u.hostname==='madoka-exedra.com' && /^\/(en\/)?news\//.test(u.pathname)) ||
      (u.hostname==='www.madoka-magica.com' && /^\/(wr\/|tv\/|tv2011\/|rebellion\/|zenkouhen\/)?news\//.test(u.pathname)) ||
      (u.hostname==='anime.magireco.com' && /^\/news\//.test(u.pathname))
    );
  } catch{return false;}
}
export const articleInput=z.object({
  id:slug,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>!Number.isNaN(Date.parse(value))&&value<=new Date().toISOString().slice(0,10),'Future/invalid publication date'),
  category:z.enum(['anime','exedra']),region:z.enum(['JP','ES','global']),source:z.string().url().refine(allowedNewsSource,'Official news source required'),
  title:localized(240),text:localized(700),
  image:z.enum(['/assets/hero.webp','/assets/news/sorana.webp','/assets/news/homura-anniversary.webp','/assets/news/magia-day.webp','/assets/anime/original.webp','/assets/anime/rising.webp','/assets/anime/record.webp','/assets/anime/rebellion.webp','/assets/anime/recap.webp']),
  sections:z.array(z.object({id:slug,title:localized(160),text:localized(1800)}).strict()).min(2).max(5),
}).strict().refine(a=>new Set(a.sections.map(s=>s.id)).size===a.sections.length,'Duplicate section id');
export function parsePetition(html:string):{count:number;goal:number|null}|null {
  // Next.js can embed escaped JSON. Read a small, named public counter only.
  const decoded=html.replaceAll('\\"','"');
  const matches=[...decoded.matchAll(/"signatureCount"\s*:\s*\{[^{}]{0,200}?"displayed"\s*:\s*(\d+)[^{}]{0,200}?\}/g)];
  const counts=new Set(matches.map(m=>Number(m[1])));
  if(counts.size!==1)return null;
  const count=[...counts][0];
  if(!Number.isSafeInteger(count)||count<0||count>100_000_000)return null;
  const goalMatch=matches[0][0].match(/"goal"\s*:\s*(\d+)/);
  const goal=goalMatch?Number(goalMatch[1]):null;
  return {count,goal:goal&&Number.isSafeInteger(goal)&&goal>=count?goal:null};
}

export const petitionObservation=z.object({
  source:z.literal(communityLinks.petition),
  observedAt:z.string().datetime().refine(value=>{
    const age=Date.now()-Date.parse(value);
    return age>=-60_000&&age<=30*60_000;
  },'A fresh public source observation is required'),
  evidence:z.string().trim().min(70).max(8000),
}).strict();

export function parsePetitionObservation(evidence:string):{count:number;goal:null}|null {
  // A public page excerpt supplied by the authenticated editor, never a guess.
  const normalized=evidence.normalize('NFKC');
  if(!/Homulilly\s+VT/i.test(normalized)||!normalized.includes(petitionTitle))return null;
  const lines=normalized.split('\n').map(line=>line.trim().replace(/^#{1,6}\s*/, '')).filter(Boolean);
  const counts=new Set<number>();
  for(let i=0;i<lines.length-1;i++) {
    if(lines[i+1]!=='Firmas verificadas'||!/^\d+(?:[., ]\d{3})*$/.test(lines[i]))continue;
    counts.add(Number(lines[i].replace(/[., ]/g,'')));
  }
  if(counts.size!==1)return null;
  const count=[...counts][0];
  return Number.isSafeInteger(count)&&count>=0&&count<=100_000_000?{count,goal:null}:null;
}
