"use client";
import { useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/locales';
import { magicCopy } from '@/lib/magic-copy';
import { visualPolicy, type VisualPolicy } from '@/lib/visual-policy';
import { parallaxOffset } from '@/lib/archive-navigation';
import { watchMedia } from '@/lib/watch-media';

export default function MagicExperience({lang,fallbackSrc='/assets/prototype/lumen.svg'}:{lang:Lang;fallbackSrc?:string}) {
  const w=magicCopy[lang],canvas=useRef<HTMLCanvasElement>(null),scene=useRef<HTMLDivElement>(null),renderer=useRef<{greet():void;setPaused(value:boolean):void;dispose():void}|null>(null);
  const [policy,setPolicy]=useState<VisualPolicy>(visualPolicy({reducedMotion:true})),[paused,setPaused]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),coarse=window.matchMedia('(pointer: coarse)');
    const connection=(navigator as Navigator & { connection?: EventTarget & {saveData?:boolean}; deviceMemory?:number }).connection;
    const update=()=>{const next=visualPolicy({reducedMotion:reduced.matches,coarse:coarse.matches,saveData:connection?.saveData,memory:(navigator as Navigator & {deviceMemory?:number}).deviceMemory});setPolicy(current=>Object.keys(next).every(key=>current[key as keyof VisualPolicy]===next[key as keyof VisualPolicy])?current:next);};
    update();const stopReduced=watchMedia(reduced,update),stopCoarse=watchMedia(coarse,update);connection?.addEventListener?.('change',update);
    return()=>{stopReduced();stopCoarse();connection?.removeEventListener?.('change',update);};
  },[]);
  useEffect(()=>{
    let alive=true;
    const element=canvas.current;
    const fallback=()=>setReady(false);
    element?.addEventListener('webglcontextlost',fallback);
    if(policy.motion&&canvas.current)void import('@/lib/lumen-renderer').then(module=>{
      if(!alive||!canvas.current)return;renderer.current=module.mountLumen(canvas.current,policy);setReady(!!renderer.current);
    }).catch(()=>{if(alive)setReady(false);});
    else queueMicrotask(()=>{if(alive)setReady(false);});
    return()=>{alive=false;renderer.current?.dispose();renderer.current=null;element?.removeEventListener('webglcontextlost',fallback);};
  },[policy]);
  useEffect(()=>{renderer.current?.setPaused(paused);},[paused,ready]);
  useEffect(()=>{
    const element=scene.current;if(!element||typeof IntersectionObserver==='undefined')return;
    let visible=true;
    const sync=()=>element.style.setProperty('--magic-play',visible&&!document.hidden&&!paused?'running':'paused');
    const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync();});
    observer.observe(element);document.addEventListener('visibilitychange',sync);sync();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);element.style.removeProperty('--magic-play');};
  },[paused]);
  useEffect(()=>{
    const element=scene.current;if(!element||!policy.parallax||paused)return;
    let frame=0,pointer:{x:number;y:number}|null=null;
    const commit=()=>{frame=0;const rect=element.getBoundingClientRect();if(rect.bottom<0||rect.top>window.innerHeight||document.hidden)return;const m=parallaxOffset(pointer?.x??rect.left+rect.width/2,pointer?.y??rect.top+rect.height/2,rect,window.innerHeight);element.style.setProperty('--magic-x',m.x+'px');element.style.setProperty('--magic-y',m.y+'px');element.style.setProperty('--magic-depth',m.depth+'px');};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(commit);};
    const move=(event:PointerEvent)=>{pointer={x:event.clientX,y:event.clientY};schedule();};
    const leave=()=>{pointer=null;schedule();};
    element.addEventListener('pointermove',move,{passive:true});element.addEventListener('pointerleave',leave);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});schedule();
    return()=>{cancelAnimationFrame(frame);element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);element.style.removeProperty('--magic-x');element.style.removeProperty('--magic-y');element.style.removeProperty('--magic-depth');};
  },[policy.parallax,paused]);
  return <section className="magic-demo" aria-label={w.character} data-motion={policy.motion&&!paused?'on':'off'}>
    <div className="magic-stage" ref={scene}>
      <div className="magic-layer magic-layer-back" aria-hidden="true"/>
      <div className="magic-layer magic-layer-rings" aria-hidden="true"/><div className="magic-layer magic-layer-front" aria-hidden="true">✦<span>✧</span></div>
      <div className="magic-sparks" aria-hidden="true">{Array.from({length:policy.particles},(_,i)=><span key={i} style={{left:(13+i*11)+'%',top:(20+(i*19)%65)+'%',animationDelay:(i*-.7)+'s'}}/>)}</div>
      <div className="magic-character" role="img" aria-label={w.character}><img className={'magic-fallback'+(ready?' is-hidden':'')} src={fallbackSrc} width={420} height={360} alt=""/><canvas ref={canvas} className={ready?'':'is-hidden'} width={420} height={360} aria-hidden="true"/></div>
      <div className="magic-stage-copy"><p className="eyebrow">LUMEN · {w.title}</p><div className="magic-controls"><button className="button button-outline" type="button" disabled={!ready||paused} onClick={()=>renderer.current?.greet()}>{w.greet}</button>{policy.motion?<button className="button button-outline" type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?w.enable:w.pause}</button>:<span>{w.still}</span>}</div></div>
    </div>
  </section>;
}
