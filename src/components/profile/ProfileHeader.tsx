import { Share2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Highlight, Profile } from '../../types'
import { Avatar } from '../ui/Avatar'
import { VerifiedBadge } from '../ui/VerifiedBadge'

export function ProfileHeader({ profile, postsCount, linksCount, highlights, self, connected, onEdit, onShare, onPulse, onMessage, onLink, onFavorite, favorite }: {
  profile: Profile
  postsCount: number
  linksCount: number
  highlights: Highlight[]
  self?: boolean
  connected?: boolean
  favorite?: boolean
  onEdit?: () => void
  onShare?: () => void
  onPulse?: () => void
  onMessage?: () => void
  onLink?: () => void
  onFavorite?: () => void
}) {
  const plan = profile.plan || 'free'

  return <div className="px-3.5">
    <div className="flex items-center gap-3.5 pt-0.5">
      <Avatar profile={profile} size={70} />
      <div className="grid flex-1 grid-cols-3 gap-1 text-center">
        <Stat value={postsCount} label="Posts" />
        <Stat value={linksCount} label={self ? 'LINKs' : connected ? 'Linked' : 'LINKs'} />
        <Stat value={highlights.length} label="Highlights" />
      </div>
    </div>

    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <h2 className="truncate text-[20px] font-[900] leading-none tracking-[-.035em]">{profile.name}</h2>
          <VerifiedBadge profile={profile} size={16} />
        </div>
        {plan !== 'free' && <span className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-[.11em] text-white ${plan === 'pro' ? 'bg-[#242429]' : 'bg-[linear-gradient(135deg,#7c5cff,#bd5cff)]'}`}>
          LINK {plan.toUpperCase()}
        </span>}
      </div>

      <div className="mt-1 text-[13px] font-semibold text-[var(--muted)]">{profile.username}</div>
      {profile.bio && <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-[1.38]">{profile.bio}</p>}
      {profile.status && <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-2.5 py-1.5 text-[11px] font-bold">
        <span className="h-2 w-2 rounded-full" style={{ background: profile.statusColor }} />
        <span className="truncate">{profile.status}</span>
      </div>}
    </div>

    <div className="mt-3.5 grid grid-cols-[1fr_1fr_auto] gap-1.5">
      {self ? <>
        <Action primary onClick={onEdit}>Edit profile</Action>
        <Action onClick={onShare}>Share profile</Action>
        <motion.button whileTap={{ scale: .94 }} onClick={onPulse} className="grid h-[38px] w-10 place-items-center rounded-[13px] bg-[var(--surface-soft)]"><Sparkles size={17} /></motion.button>
      </> : <>
        <Action primary onClick={onMessage}>Message</Action>
        <Action onClick={onLink}>{connected ? 'LINKED' : 'LINK'}</Action>
        <motion.button whileTap={{ scale: .94 }} onClick={onFavorite} className={`grid h-[38px] w-10 place-items-center rounded-[13px] ${favorite ? 'bg-[color-mix(in_srgb,var(--link-accent)_14%,var(--surface-solid))] text-[var(--link-accent)]' : 'bg-[var(--surface-soft)]'}`}>
          <Share2 size={16} className={favorite ? 'rotate-[-20deg]' : ''} />
        </motion.button>
      </>}
    </div>

    {highlights.length > 0 && <div className="mt-4 flex gap-3.5 overflow-x-auto pb-1 hide-scrollbar">
      {highlights.map(highlight => <div key={highlight.id} className="w-[56px] shrink-0 text-center">
        <div className="mx-auto grid h-[50px] w-[50px] place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] text-[20px]">{highlight.coverEmoji || '✨'}</div>
        <div className="mt-1 truncate text-[9.5px] font-bold">{highlight.title}</div>
      </div>)}
    </div>}
  </div>
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return <div>
    <div className="text-[17.5px] font-[900] leading-none tracking-[-.03em]">{value}</div>
    <div className="mt-1 text-[10.5px] font-semibold text-[var(--muted)]">{label}</div>
  </div>
}

function Action({ children, primary, onClick }: { children: string; primary?: boolean; onClick?: () => void }) {
  return <motion.button
    whileTap={{ scale: .97 }}
    onClick={onClick}
    className={`h-[38px] rounded-[13px] px-2 text-[12.5px] font-[850] ${primary ? 'bg-[#0a84ff] text-white' : 'bg-[var(--surface-soft)] text-[var(--text)]'}`}
  >
    {children}
  </motion.button>
}
