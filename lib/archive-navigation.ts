import { isLang } from './locales.ts';

export type NavigationClick = { button?: number; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean; defaultPrevented?: boolean; target?: string | null; download?: boolean; external?: boolean };

// Preserve native anchors, keyboard shortcuts, downloads and in-page scrolling.
export function archiveDestination(href: string, current: string, click: NavigationClick = {}): string | null {
  if (click.defaultPrevented || (click.button ?? 0) !== 0 || click.ctrlKey || click.metaKey || click.shiftKey || click.altKey || click.download || click.external || (click.target && click.target !== '_self')) return null;
  try {
    const base = new URL(current), destination = new URL(href, base);
    if (destination.origin !== base.origin || !['http:', 'https:'].includes(destination.protocol) || !isLang(destination.pathname.split('/')[1])) return null;
    if (destination.pathname === base.pathname) return null;
    return destination.pathname + destination.search + destination.hash;
  } catch { return null; }
}

export function parallaxOffset(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }, viewportHeight: number) {
  const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));
  return { x: clamp((clientX - rect.left - rect.width / 2) / Math.max(1, rect.width) * 8, 4), y: clamp((clientY - rect.top - rect.height / 2) / Math.max(1, rect.height) * 6, 3), depth: clamp((viewportHeight / 2 - rect.top - rect.height / 2) * .045, 16) };
}
