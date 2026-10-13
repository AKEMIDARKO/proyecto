"use client";

import { startTransition, useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isLang, type Lang } from '@/lib/locales';
import { archiveDestination } from '@/lib/archive-navigation';
import { backdropOffset, enhanceDisclosures } from '@/lib/archive-motion';
import { watchMedia } from '@/lib/watch-media';
import ArchiveMusic from './archive-music';

export default function ArchiveExperience({ children, lang }: { children: ReactNode; lang: Lang }) {
  const router = useRouter(), pathname = usePathname(), locale = pathname?.split('/')[1];
  const language = isLang(locale) ? locale : lang;
  const previousPath = useRef(pathname);

  useEffect(() => enhanceDisclosures(document), [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)'), fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }).connection;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const modest = !fine.matches || (typeof memory === 'number' && memory <= 4);
    const root = document.documentElement;
    root.dataset.archiveQuality = modest ? 'modest' : 'full';
    let frame = 0, x = 0, y = 0;
    const clear = () => { cancelAnimationFrame(frame); frame = 0; root.dataset.archiveMotion = 'off'; for (const name of ['--archive-scroll','--archive-background','--archive-art','--archive-x','--archive-y']) root.style.removeProperty(name); };
    const update = () => {
      frame = 0;
      if (reduced.matches || connection?.saveData || document.hidden) { clear(); return; }
      const offset = backdropOffset(window.scrollY, x, y, modest);
      root.style.setProperty('--archive-scroll', `${offset.scroll}px`);
      root.style.setProperty('--archive-background', `${offset.background}px`);
      root.style.setProperty('--archive-art', `${offset.art}px`);
      root.style.setProperty('--archive-x', `${offset.x}px`);
      root.style.setProperty('--archive-y', `${offset.y}px`);
      root.dataset.archiveMotion = 'on';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointer = (event: PointerEvent) => { if (!fine.matches || event.pointerType === 'touch') return; x = event.clientX / Math.max(1, window.innerWidth) * 2 - 1; y = event.clientY / Math.max(1, window.innerHeight) * 2 - 1; schedule(); };
    const reset = () => { x = 0; y = 0; schedule(); };
    const visibility = () => document.hidden ? clear() : schedule();
    const stopReduced = watchMedia(reduced, () => reduced.matches ? clear() : schedule());
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    if (!modest) window.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('pointerleave', reset); document.addEventListener('visibilitychange', visibility);
    schedule();
    return () => { clear(); delete root.dataset.archiveQuality; stopReduced(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', reset); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    const navigate = (destination: string) => startTransition(() => {
      try { router.push(destination); }
      catch { window.location.assign(destination); }
    });
    const follow = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link) return;
      const destination = archiveDestination(link.href, window.location.href, { button: event.button, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, altKey: event.altKey, defaultPrevented: event.defaultPrevented, target: link.getAttribute('target'), download: link.hasAttribute('download'), external: link.relList.contains('external') });
      if (!destination) return;
      // Existing editors retain their native unsaved-change prompt.
      if (!window.dispatchEvent(new Event('beforeunload', { cancelable: true }))) return;
      event.preventDefault();
      navigate(destination);
    };
    const languageChange = (event: Event) => {
      const destination = archiveDestination((event as CustomEvent<string>).detail, window.location.href);
      if (!destination || !window.dispatchEvent(new Event('beforeunload', { cancelable: true }))) return;
      event.preventDefault(); navigate(destination);
    };
    document.addEventListener('click', follow);
    window.addEventListener('magia:navigate', languageChange);
    return () => { document.removeEventListener('click', follow); window.removeEventListener('magia:navigate', languageChange); };
  }, [router]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const main = document.getElementById('main');
    if (previousPath.current !== pathname) main?.focus({ preventScroll: true });
    previousPath.current = pathname;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced.matches || connection?.saveData || !('IntersectionObserver' in window)) return;
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (reduced.matches || document.hidden) continue;
        const animation = entry.target.animate?.([{ opacity: .35, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 580, easing: 'cubic-bezier(.2,.7,.2,1)' });
        if (animation) { animations.add(animation); void animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation)); }
      }
    }, { rootMargin: '0px 0px -20px 0px' });
    const frame = requestAnimationFrame(() => {
      const entry = main?.animate?.([{ opacity: .7, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
      if (entry) { animations.add(entry); void entry.finished.then(() => animations.delete(entry)).catch(() => animations.delete(entry)); }
      document.querySelectorAll('#main > .archive-section, #main > .guide-section, #main > .headline-grid, #main > .madokadle-banner, #main > .home-explore, #main > .universe-home').forEach(element => observer.observe(element));
    });
    const stop = () => { if (reduced.matches || document.hidden) for (const animation of animations) animation.cancel(); };
    const stopReduced = watchMedia(reduced, stop); document.addEventListener('visibilitychange', stop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); for (const animation of animations) animation.cancel(); stopReduced(); document.removeEventListener('visibilitychange', stop); };
  }, [pathname]);

  return <>
    <ArchiveMusic lang={language} />
    {children}
  </>;
}
