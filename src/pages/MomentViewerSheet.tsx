import { Clock3 } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { Sheet } from '../components/ui/Sheet'
import { useAppStore } from '../stores/app-store'
import { timeAgo } from '../lib/format'

export function MomentViewerSheet({ momentId, onClose, onProfile }: { momentId: string | null; onClose: () => void; onProfile: (id: string) => void }) {
  const { data } = useAppStore()
  if (!data || !momentId) return null
  const moment = data.moments.find(item => item.id === momentId)
  if (!moment) return null
  const owner = data.profiles[moment.ownerId]

  return <Sheet open title="Moment" onClose={onClose} full>
    <div className="pb-6">
      <button onClick={() => { if (!owner) return; onClose(); requestAnimationFrame(() => onProfile(owner.id)) }} className="mb-3 flex w-full items-center gap-2.5 text-left">
        <Avatar profile={owner} size={36} />
        <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-[850]">{owner?.name || 'LINK user'}</div><div className="truncate text-[11px] text-[var(--muted)]">{owner?.username || ''} · {timeAgo(moment.createdAt)}</div></div>
        <Clock3 size={15} className="text-[var(--muted)]" />
      </button>

      <div className="overflow-hidden rounded-[22px] border border-[var(--hairline)] bg-black">
        {moment.imageUrl ? <img src={moment.imageUrl} alt="Moment" className="max-h-[68dvh] min-h-[360px] w-full object-contain" /> : <div className="grid min-h-[420px] place-items-center bg-[linear-gradient(145deg,var(--link-accent),#ff2d55)] text-6xl">{moment.emoji || '✨'}</div>}
      </div>
      {moment.caption && <div className="mt-3 whitespace-pre-wrap px-1 text-[14px] leading-[1.45]">{moment.caption}</div>}
      <div className="mt-2 px-1 text-[10.5px] font-semibold text-[var(--muted)]">Moments disappear after 24 hours.</div>
    </div>
  </Sheet>
}
