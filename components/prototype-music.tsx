"use client";
import { useEffect, useRef, useState } from 'react';
import { magicCopy } from '@/lib/magic-copy';
import { defaultMusic, parseMusicPreferences } from '@/lib/music-preferences';
import type { Lang } from '@/lib/locales';
const key='magia-music-preview-v1';
const defaultTracks=['/assets/prototype/violet.mp3','/assets/prototype/constellations.mp3'];
export default function PrototypeMusic({lang,tracks=defaultTracks}:{lang:Lang;tracks?:string[]}) {
  const w=magicCopy[lang],audio=useRef<HTMLAudioElement>(null),preferences=useRef({...defaultMusic}),lastSaved=useRef(0),advance=useRef(false);
  const [track,setTrack]=useState(0),[error,setError]=useState(false);
  useEffect(()=>{
    try{preferences.current=parseMusicPreferences(localStorage.getItem(key));setTrack(preferences.current.track);}catch{/* Playback remains available with storage disabled. */}
    const element=audio.current;
    const persist=()=>{if(!element)return;preferences.current={...preferences.current,position:element.currentTime||0,volume:element.volume};try{localStorage.setItem(key,JSON.stringify(preferences.current));}catch{/* Optional persistence. */}};
    const time=()=>{if(Date.now()-lastSaved.current>2000){persist();lastSaved.current=Date.now();}};
    element?.addEventListener('timeupdate',time);element?.addEventListener('volumechange',persist);element?.addEventListener('pause',persist);window.addEventListener('pagehide',persist);
    return()=>{persist();element?.pause();element?.removeEventListener('timeupdate',time);element?.removeEventListener('volumechange',persist);element?.removeEventListener('pause',persist);window.removeEventListener('pagehide',persist);};
  },[]);
  useEffect(()=>{if(advance.current&&audio.current){advance.current=false;void audio.current.play().catch(()=>setError(true));}},[track]);
  const change=(index:number)=>{if(index===track)return;advance.current=advance.current||!!(audio.current&&!audio.current.paused);audio.current?.pause();preferences.current={...preferences.current,track:index,position:0};try{localStorage.setItem(key,JSON.stringify(preferences.current));}catch{}setTrack(index);setError(false);};
  return <div className="magic-music"><label><span>{w.playlist}</span><select value={track} onChange={event=>change(Number(event.target.value))}><option value={0}>{w.a}</option><option value={1}>{w.b}</option></select></label><audio ref={audio} src={tracks[track]} controls preload="none" aria-label={track===0?w.a:w.b} onLoadedMetadata={()=>{const element=audio.current;if(element){element.volume=preferences.current.volume;element.currentTime=Math.min(preferences.current.position,Math.max(0,element.duration-.1));}}} onPlay={()=>setError(false)} onEnded={()=>{advance.current=true;change((track+1)%tracks.length);}} onError={()=>setError(true)}/>{error&&<p role="alert">{w.error}</p>}</div>;
}
