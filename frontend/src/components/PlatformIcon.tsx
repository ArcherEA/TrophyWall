// Platform logo files live in public/ and are referenced through BASE_URL so they
// resolve on both the dev root and the GitHub Pages subpath.
const ICON_FILE: Record<string, string> = {
  STEAM: 'steam.jpg',
  GENSHIN: 'GI.jpg',
  HSR: 'HSR.jpg',
  ZZZ: 'ZZZ.jpg',
};

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const file = ICON_FILE[platform];
  if (!file) return null;
  // header logos are few and above the fold — load eagerly so they always render
  return <img src={`${import.meta.env.BASE_URL}${file}`} alt={platform} className={className} />;
}
