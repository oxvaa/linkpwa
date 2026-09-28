import { initials } from '../../lib/format'
import type { Profile } from '../../types'

export function Avatar({ profile, size = 48, showPresence = true, className = '' }: { profile?: Profile | null; size?: number; showPresence?: boolean; className?: string }) {
  const online = Boolean(profile?.presenceVisible && profile?.presenceMode === 'online')
  return <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
    <div className="profile-avatar-glow grid h-full w-full place-items-center overflow-hidden rounded-full border border-black/5 bg-[linear-gradient(145deg,var(--link-accent),#a78bfa)] text-white" style={{ fontSize: size * .33, fontWeight: 850 }}>
      {profile?.avatarUrl ? <img className="h-full w-full object-cover" src={profile.avatarUrl} alt="" /> : initials(profile?.name)}
    </div>
    {showPresence && online && <span className="absolute bottom-[2%] right-[2%] block rounded-full border-[2.5px] border-[var(--bg)] bg-[#30d158]" style={{ width: Math.max(10, size * .23), height: Math.max(10, size * .23) }} />}
  </div>
}
