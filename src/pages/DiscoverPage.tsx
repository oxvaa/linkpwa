import { Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { useAppStore } from '../stores/app-store'

export function DiscoverPage({ onProfile }: { onProfile: (id: string) => void }) {
  const { data, sendLinkRequest, answerLinkRequest } = useAppStore()
  const [query, setQuery] = useState('')
  const profiles = useMemo(() => data ? Object.values(data.profiles).filter(profile => profile.id !== data.me.id && !data.blocked.includes(profile.id) && (!query.trim() || `${profile.name} ${profile.username}`.toLowerCase().includes(query.toLowerCase()))).slice(0, 40) : [], [data, query])
  if (!data) return null
  const incoming = data.requests.filter(request => request.toId === data.me.id)

  return <div className="pb-32">
    <ScreenHeader title="Discover" subtitle="People, artists and LINKs" />
    <div className="px-5">
      <label className="flex h-12 items-center gap-2.5 rounded-[18px] bg-[var(--surface-soft)] px-4"><Search size={19} className="text-[var(--muted)]" /><input value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search LINK" /></label>
    </div>

    {incoming.length > 0 && <section className="mt-6 px-5"><h2 className="mb-2 text-[18px] font-black tracking-[-.02em]">LINK requests</h2><div className="ios-card overflow-hidden">{incoming.map(request => {
      const profile = data.profiles[request.fromId]
      if (!profile) return null
      return <div key={request.id} className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 last:border-b-0"><Avatar profile={profile} size={44} /><button onClick={() => onProfile(profile.id)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-1"><span className="truncate font-extrabold">{profile.name}</span><VerifiedBadge profile={profile} size={15} /></div><div className="text-[13px] text-[var(--muted)]">{profile.username}</div></button><button onClick={() => void answerLinkRequest(request.id, 'declined')} className="rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[12px] font-extrabold">Decline</button><button onClick={() => void answerLinkRequest(request.id, 'accepted')} className="rounded-full bg-[#0a84ff] px-3 py-2 text-[12px] font-extrabold text-white">Accept</button></div>
    })}</div></section>}

    <section className="mt-7"><div className="mb-2 flex items-center justify-between px-5"><h2 className="text-[18px] font-black tracking-[-.02em]">People on LINK</h2><span className="text-[12px] font-bold text-[var(--muted)]">{profiles.length}</span></div>
      <div>{profiles.map(profile => {
        const connected = data.connectedIds.includes(profile.id)
        const pending = data.requests.some(request => request.fromId === data.me.id && request.toId === profile.id)
        return <div key={profile.id} className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-3.5"><button onClick={() => onProfile(profile.id)}><Avatar profile={profile} size={48} /></button><button onClick={() => onProfile(profile.id)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-1"><span className="truncate text-[16px] font-extrabold">{profile.name}</span><VerifiedBadge profile={profile} size={16} /></div><div className="truncate text-[13px] text-[var(--muted)]">{profile.username}{profile.accountType === 'artist' ? ' · Artist' : ''}</div></button>{connected ? <span className="rounded-full bg-[var(--surface-soft)] px-3 py-2 text-[12px] font-extrabold">LINKED</span> : <button disabled={pending} onClick={() => void sendLinkRequest(profile.id)} className="grid h-10 min-w-10 place-items-center rounded-full bg-[var(--surface-soft)] px-3 text-[12px] font-extrabold disabled:opacity-45">{pending ? 'Sent' : <UserPlus size={18} />}</button>}</div>
      })}</div>
    </section>
  </div>
}
