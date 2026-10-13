export default function ArchiveBackdrop() {
  return <div className="archive-atmosphere" aria-hidden="true"><div className="archive-exedra-background" /><div className="archive-depth archive-depth-far" /><div className="archive-depth archive-depth-orbit" /><div className="archive-depth archive-depth-near"><span>✦</span><span>✧</span><span>✧</span></div><div className="archive-dust">{Array.from({ length: 8 }, (_, index) => <span key={index} style={{ left: `${9 + index * 12}%`, top: `${100 + index % 4 * 165}px`, animationDelay: `${index * -1.7}s` }} />)}</div></div>;
}
