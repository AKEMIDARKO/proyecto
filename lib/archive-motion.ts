import { watchMedia } from './watch-media.ts';

export function backdropOffset(scroll: number, pointerX = 0, pointerY = 0, modest = false) {
  const finite = (value: number) => Number.isFinite(value) ? value : 0;
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, finite(value)));
  const position = Math.max(0, finite(scroll));
  return { scroll: position * (modest ? .13 : .22), background: Math.min(modest ? 96 : 180, position * (modest ? .09 : .16)), art: Math.min(26, position * .045), x: modest ? 0 : clamp(pointerX, 1) * 12, y: modest ? 0 : clamp(pointerY, 1) * 8 };
}

export function enhanceDisclosures(root: Document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Map<HTMLDetailsElement, { animation: Animation; finish: () => void; open: boolean; overflow: string }>();
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || reduced.matches || document.hidden) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const target = event.target instanceof Element ? event.target : null;
    const summary = target?.closest('summary');
    const details = summary?.parentElement;
    if (!summary || !(details instanceof HTMLDetailsElement) || typeof details.animate !== 'function' || summary !== details.querySelector(':scope > summary')) return;
    if (target?.closest('a,button,input,select,textarea')) return;
    const previous = pending.get(details), open = !(previous?.open ?? details.open);
    const height = details.getBoundingClientRect().height;
    previous?.animation.cancel(); pending.delete(details);
    event.preventDefault();
    const overflow = previous?.overflow ?? details.style.overflow;
    details.open = true;
    const styles = getComputedStyle(details);
    const fullHeight = details.scrollHeight + parseFloat(styles.borderTopWidth || '0') + parseFloat(styles.borderBottomWidth || '0');
    const summaryHeight = summary.getBoundingClientRect().bottom - details.getBoundingClientRect().top + parseFloat(styles.paddingBottom || '0') + parseFloat(styles.borderBottomWidth || '0');
    details.style.overflow = 'hidden';
    const animation = details.animate([{ height: `${height}px` }, { height: `${open ? fullHeight : summaryHeight}px` }], { duration: 440, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'both' });
    const finish = () => {
      if (pending.get(details)?.animation !== animation) return;
      details.open = open;
      details.style.overflow = overflow;
      pending.delete(details); animation.cancel();
    };
    pending.set(details, { animation, finish, open, overflow });
    void animation.finished.then(finish).catch(() => {});
  };
  const stop = () => { for (const item of [...pending.values()]) item.finish(); };
  const preference = watchMedia(reduced, () => { if (reduced.matches) stop(); });
  const visibility = () => { if (document.hidden) stop(); };
  root.addEventListener('click', click);
  root.addEventListener('visibilitychange', visibility);
  return () => { root.removeEventListener('click', click); root.removeEventListener('visibilitychange', visibility); preference(); stop(); };
}
