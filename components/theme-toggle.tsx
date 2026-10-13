"use client";
import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { expansionCopy } from '@/lib/expansion-copy';
import { watchMedia } from '@/lib/watch-media';
import type { Lang } from '@/lib/locales';
type Transition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };

export default function ThemeToggle({ lang }: { lang: Lang }) {
  const [theme, setTheme] = useState('dark');
  const desired = useRef('dark'), sequence = useRef(0), transition = useRef<Transition | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; document.documentElement.classList.remove('theme-changing','theme-fallback'); };
  function apply(next: string, persist = true) {
    const root = document.documentElement;
    root.dataset.theme = next; root.classList.toggle('dark', next === 'dark'); desired.current = next; setTheme(next);
    if (persist) try { localStorage.setItem('magia-theme', next); } catch { /* Appearance works without storage. */ }
  }
  useEffect(() => {
    desired.current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'; setTheme(desired.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => { transition.current?.skipTransition(); clear(); };
    const stopReduced = watchMedia(reduced, () => { if (reduced.matches) stop(); });
    const sync = (event: StorageEvent) => { if (event.key === 'magia-theme') { sequence.current++; stop(); apply(event.newValue === 'light' ? 'light' : 'dark', false); } };
    window.addEventListener('storage', sync);
    return () => { sequence.current++; stop(); stopReduced(); window.removeEventListener('storage', sync); };
  }, []);
  function change() {
    const root = document.documentElement, next = desired.current === 'light' ? 'dark' : 'light', currentSequence = ++sequence.current;
    desired.current = next; transition.current?.skipTransition(); clear();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { apply(next); return; }
    root.classList.add('theme-changing');
    const finish = () => { if (sequence.current === currentSequence) { transition.current = null; clear(); } };
    const fallback = () => { if (sequence.current === currentSequence) { root.classList.add('theme-fallback'); apply(next); timer.current = setTimeout(finish, 700); } };
    const start = (document as Document & { startViewTransition?: (update: () => void) => Transition }).startViewTransition;
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (!start || device.connection?.saveData || (device.deviceMemory !== undefined && device.deviceMemory <= 4)) { fallback(); return; }
    try {
      const current = start.call(document, () => { if (sequence.current === currentSequence) apply(next); });
      transition.current = current;
      void current.ready.catch(() => { if (sequence.current === currentSequence) { transition.current = null; fallback(); } });
      const complete = () => { if (transition.current === current) finish(); };
      void current.finished.then(complete).catch(complete);
    } catch { fallback(); }
  }
  const label = expansionCopy[lang][theme === 'dark' ? 'light' : 'dark'];
  return <button type="button" className="icon-button theme-toggle" onClick={change} aria-label={label} title={label}><span key={theme} className="theme-toggle-glyph">{theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</span></button>;
}
