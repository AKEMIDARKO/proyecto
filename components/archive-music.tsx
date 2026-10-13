"use client";
import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, Disc3, Headphones, Music2, Play, Radio } from 'lucide-react';
import type { Lang } from '@/lib/locales';
import { musicLibraryCopy } from '@/lib/music-library-copy';
import { defaultLibrary, musicLinks, parseLibraryPreferences, type MusicCollection, type MusicPlatform } from '@/lib/music-library';

const preferenceKey = 'magia-music-library-v1';
export default function ArchiveMusic({ lang }: { lang: Lang }) {
  const w = musicLibraryCopy[lang];
  const [preferences, setPreferences] = useState(defaultLibrary);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { setPreferences(parseLibraryPreferences(localStorage.getItem(preferenceKey))); } catch { /* Preferences are optional. */ } }, []);
  const choose = (platform: MusicPlatform, collection: MusicCollection) => {
    if (platform === preferences.platform && collection === preferences.collection) return;
    setLoaded(false);
    const next = { platform, collection };
    setPreferences(next);
    try { localStorage.setItem(preferenceKey, JSON.stringify(next)); } catch { /* Playback does not require storage. */ }
  };
  return <details className="archive-music-shell">
    <summary><Music2 size={17} aria-hidden="true" /><span>{w.title}</span><span className="music-summary-artist">HOMULILLY</span><ChevronDown size={16} aria-hidden="true" /></summary>
    <div className="archive-music-panel">
      <div className="music-library">
        <div className="music-library-heading"><span className="music-heading-gem" aria-hidden="true">✧</span><div><p className="eyebrow">HOMULILLY</p><h2>{w.title}</h2><p>{w.soundtrackNote}</p></div></div>
        <section aria-labelledby="music-platforms"><h3 id="music-platforms"><span>01</span>{w.platforms}</h3><div className="music-platforms" role="group" aria-label={w.platforms}>
          <button type="button" className="music-platform" aria-pressed={preferences.platform === 'youtube'} onClick={() => choose('youtube', 'soundtrack')}><Play size={17} aria-hidden="true" /><span>YouTube Music</span></button>
          <button type="button" className="music-platform" aria-pressed={preferences.platform === 'spotify'} onClick={() => choose('spotify', 'soundtrack')}><Radio size={17} aria-hidden="true" /><span>Spotify</span></button>
          <button type="button" className="music-platform" disabled><Music2 size={17} aria-hidden="true" /><span>Apple Music<small>{w.soon}</small></span></button>
          <button type="button" className="music-platform" disabled><Headphones size={17} aria-hidden="true" /><span>Amazon Music<small>{w.soon}</small></span></button>
        </div></section>
        <section aria-labelledby="music-songs"><h3 id="music-songs"><span>02</span>{w.songs}</h3><div className="music-collections" role="group" aria-label={w.songs}>
          <div className="music-collection"><Disc3 size={21} aria-hidden="true" /><span><strong>{w.soundtrack}</strong><small>{preferences.platform === 'youtube' ? 'YouTube Music' : 'Spotify'}</small></span></div>
          {preferences.platform === 'spotify' && <p className="music-player-note">{w.chooseSong}</p>}
        </div></section>
      </div>
      <section className="music-player" aria-labelledby="music-player-title"><h3 id="music-player-title"><span>03</span>{w.player}</h3>
        {preferences.platform === 'spotify' ? <>
          {loaded ? <iframe className="music-spotify-embed" src={musicLinks.spotifyEmbed} title={w.playerLabel} width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /> : <div className="music-player-placeholder"><div className="music-player-cover" aria-hidden="true"><span>✧</span><Disc3 size={36} /></div><h4>{w.soundtrack}</h4><button type="button" className="button button-rose" onClick={() => setLoaded(true)}><Play size={17} aria-hidden="true" />{w.load}</button></div>}
          <p className="music-player-note">{loaded ? w.chooseSong : w.externalNote}</p><a className="music-external" href={musicLinks.spotify} target="_blank" rel="noopener noreferrer">{w.openSpotify}<ArrowUpRight size={16} aria-hidden="true" /></a>
        </> : <><div className="music-player-placeholder"><div className="music-player-cover" aria-hidden="true"><span>✧</span><Play size={36} /></div><h4>{w.soundtrack}</h4><p>{w.youtubeNote}</p><a className="button button-rose" href={musicLinks.youtube} target="_blank" rel="noopener noreferrer">{w.openYouTube}<ArrowUpRight size={16} aria-hidden="true" /></a></div></>}
      </section>
    </div>
  </details>;
}
