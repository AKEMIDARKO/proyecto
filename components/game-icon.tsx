type IconName = 'kioku' | 'book' | 'archive' | 'play';

export default function GameIcon({ name, className = '' }: { name: IconName; className?: string }) {
  return <img className={'game-ui-icon ' + className} src={'/assets/game-ui/icon-' + name + '.webp'} alt="" aria-hidden="true" width={80} height={80} />;
}

export function KiokuStars({ rarity }: { rarity: 3 | 4 | 5 }) {
  const color = rarity === 5 ? 'gold' : rarity === 4 ? 'violet' : 'blue';
  return <span className="game-ui-stars" aria-hidden="true">{Array.from({ length: rarity }, (_, index) => <img key={index} src={'/assets/game-ui/star-' + color + '.webp'} alt="" width={22} height={22} />)}</span>;
}
