import type { Profile } from '../../types'

export function VerifiedBadge({ profile, size = 19 }: { profile?: Profile | null; size?: number }) {
  if (!profile?.verified) return null
  const filter = profile.verificationStyle === 'gold'
    ? 'sepia(1) saturate(4) hue-rotate(350deg) brightness(1.15)'
    : profile.verificationStyle === 'green'
      ? 'sepia(1) saturate(5) hue-rotate(72deg) brightness(.92)'
      : undefined
  return <img className="verified-img" src="./assets/verified-badge.png" width={size} height={size} style={{ width: size, height: size, filter }} alt="Verified" />
}
