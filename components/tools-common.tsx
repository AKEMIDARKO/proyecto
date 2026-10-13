"use client";
import { useKiokus } from './kioku-context';

import { useCallback, useEffect, useState } from 'react';
import { getAccount, accountResponse, AccountError, type AccountData } from '@/lib/account-client';
import { toolsCopy } from '@/lib/tools-copy';
import { accountCopy } from '@/lib/account-copy';
import { kiokuLabel, type Kioku } from '@/lib/kioku-catalog';
import { kiokuCopy } from '@/lib/kioku-copy';
import { portraits, portraitName } from '@/lib/portrait-data';
import type { Lang } from '@/lib/locales';
import GoogleSignIn from './google-sign-in';

export async function toolFetch<T>(url:string,body?:unknown,method='POST'):Promise<T> {
  return fetch(url,body===undefined?{cache:'no-store'}:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(accountResponse<T>);
}
export function useToolAccount(){
  const [user,setUser]=useState<AccountData['user']>(null),[ready,setReady]=useState(false),[error,setError]=useState(false);
  const reload=useCallback(async()=>{setReady(false);setError(false);try{setUser((await getAccount()).user);}catch{setError(true);}finally{setReady(true);}},[]);
  useEffect(()=>{void reload();},[reload]);
  return{user,ready,error,reload};
}
export function errorKey(error:unknown,kind='general'){return error instanceof AccountError?({CONFLICT:'conflict',LIMIT_REACHED:'limit',INVALID_REQUEST:kind==='goal'?'invalidGoal':'error',SIGN_IN_REQUIRED:'signIn'}[error.code]||'error'):'error';}
export function ToolStatus({lang,status,busy=false}:{lang:Lang;status:string;busy?:boolean}){
  return (status||busy)?<p className={'tool-status'+(['error','conflict','loadError','invalidGoal','limit'].includes(status)?' tool-error':'')} role={['error','conflict','loadError','invalidGoal','limit'].includes(status)?'alert':'status'}>{busy?accountCopy[lang].saving:toolsCopy[lang][status]}</p>:null;
}
export function ToolAuth({lang,account}:{lang:Lang;account:ReturnType<typeof useToolAccount>}){
  const t=toolsCopy[lang];
  if(!account.ready)return <p className="tool-status" role="status">{accountCopy[lang].loading}</p>;
  if(account.error)return <div className="tool-login"><p role="alert">{t.loadError}</p><button type="button" className="button button-outline" onClick={()=>void account.reload()}>{t.reload}</button></div>;
  if(account.user)return <p className="tool-account"><a href={`/${lang}/profile/`}>{accountCopy[lang].profile} · {account.user.nickname}</a></p>;
  return <aside className="tool-login"><p>{t.signIn}</p><GoogleSignIn lang={lang} onSignedIn={()=>void account.reload()} /></aside>;
}
export function KiokuSelect({lang,value,onChange,optional=false,disabled=false,units:provided}:{lang:Lang;value:string;onChange:(id:string)=>void;optional?:boolean;disabled?:boolean;units?:readonly Kioku[]}){
  const catalog=useKiokus(),units=provided??catalog;
  return <label className="tool-field"><span>{toolsCopy[lang].selectKioku}</span><select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{optional&&<option value="">{toolsCopy[lang].all}</option>}{units.map(unit=><option key={unit.id} value={unit.id}>★{unit.rarity} · {kiokuLabel(unit,lang)}</option>)}</select></label>;
}
export function PortraitSelect({lang,value,onChange}:{lang:Lang;value:string;onChange:(id:string)=>void}){
  return <label className="tool-field"><span>{accountCopy[lang].portrait}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">—</option>{portraits.map(p=><option key={p.id} value={p.id}>★{p.rarity} · {portraitName(p,lang)}</option>)}</select></label>;
}
export function UnitIdentity({unit,lang}:{unit:Kioku;lang:Lang}){
  const k=kiokuCopy[lang];return <div className="tool-unit"><a href={`/${lang}/kioku/${unit.id}/`}><img src={unit.image} width={90} height={90} alt={kiokuLabel(unit,lang)} loading="lazy" /></a><div><h2><a href={`/${lang}/kioku/${unit.id}/`}>{kiokuLabel(unit,lang)}</a></h2><p>★{unit.rarity} · {k[unit.element]} · {k[unit.role]}</p></div></div>;
}
export function NumericField({label,value,onChange,min=0,max=1000000000}:{label:string;value:number;onChange:(n:number)=>void;min?:number;max?:number}){
  return <label className="tool-field"><span>{label}</span><input type="number" inputMode="numeric" min={min} max={max} step={1} value={value} onChange={e=>onChange(Math.max(min,Math.min(max,Math.trunc(Number(e.target.value)||0))))} /></label>;
}
