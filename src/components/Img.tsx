import { useEffect, useState } from 'react';

const fallback = (emoji: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#ffedd5'/><stop offset='1' stop-color='#fdba74'/></linearGradient></defs><rect width='800' height='500' fill='url(#g)'/><text x='50%' y='52%' font-size='150' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`,
  )}`;

interface Props { src: string; alt: string; emoji?: string; className?: string }

/** Image with a graceful emoji fallback when the photo cannot be loaded (offline, blocked, etc). */
export default function Img({ src, alt, emoji = '🍽️', className }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  return (
    <img
      className={className}
      src={failed ? fallback(emoji) : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
