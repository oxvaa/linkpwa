import { Bell, Heart, Link2, MessageCircle } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { Avatar } from '../components/ui/Avatar'
import { useAppStore } from '../stores/app-store'
import { timeAgo } from '../lib/format'

export function ActivitySheet({ open, onClose, onProfile }: { open: boolean; onClose: () => void; onProfile: (id: string) => void }) {
  const { data, readActivity } = useAppStore()
  if (!data) return null
  return <Sheet open={open} title="Activity" onClose={() => { void readActivity(); onClose() }} full>
    <div className="pb-8">{data.notifications.length ? data.notifications.map(item => { const actor = item.actorId ? data.profiles[item.actorId] : null; const Icon = item.type.includes('like') ? Heart : item.type.includes('link') ? Link2 : item.type.includes('message') ? MessageCircle : Bell; return <button key={item.id} onClick={() => { if (actor) { onClose(); onProfile(actor.id) } }} className="flex w-full items-center gap-3 border-b border-[var(--hairline)] px-1 py-4 text-left"><div className="relative">{actor ? <Avatar profile={actor} size={46}/> : <div className="grid h-[46px] w-[46px] place-items-center rounded-full bg-[var(--surface-soft)]"><Icon size={20}/></div>}{!item.read && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--bg)] bg-[#0a84ff]" />}</div><div className="min-w-0 flex-1"><div className="text-[14px] font-extrabold">{item.title}</div><div className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{item.body}</div></div><span className="text-[11px] text-[var(--muted)]">{timeAgo(item.createdAt)}</span></button> }) : <div className="py-20 text-center text-[var(--muted)]">No activity yet.</div>}</div>
  </Sheet>
}
