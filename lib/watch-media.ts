export function watchMedia(query: MediaQueryList, listener: () => void): () => void {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }
  query.addListener(listener);
  return () => query.removeListener(listener);
}
