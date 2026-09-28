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

  return <div className="pb-28">
    <ScreenHeader title="Discover" subtitle="People, artists and LINKs" />
    <div className="px-4"><label className="flex h-[42px] items-center gap-2 rounded-[15px] bg-[var(--surface-soft)] px-3.5"><Search size={17} className="text-[var(--muted)]" /><input value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Search LINK" /></label></div>

    {incoming.length > 0 && <section className="mt-5 px-4"><h2 className="mb-2 text-[16px] font-black tracking-[-.02em]">LINK requests</h2><div className="ios-card overflow-hidden">{incoming.map(request => {
      const profile = data.profiles[request.fromId]
      if (!profile) return null
      return <div key={request.id} className="flex items-center gap-2.5 border-b border-[var(--hairline)] px-3.5 py-2.5 last:border-b-0"><Avatar profile={profile} size={40} /><button onClick={() => onProfile(profile.id)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-1"><span className="truncate text-[13.5px] font-extrabold">{profile.name}</span><VerifiedBadge profile={profile} size={13} /></div><div className="text-[11.5px] text-[var(--muted)]">{profile.username}</div></button><button onClick={() => void answerLinkRequest(request.id, 'declined')} className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1.5 text-[10.5px] font-extrabold">Decline</button><button onClick={() => void answerLinkRequest(request.id, 'accepted')} className="rounded-full bg-[#0a84ff] px-2.5 py-1.5 text-[10.5px] font-extrabold text-white">Accept</button></div>
    })}</div></section>}

    <section className="mt-5"><div className="mb-1.5 flex items-center justify-between px-4"><h2 className="text-[16px] font-black tracking-[-.02em]">People on LINK</h2><span className="text-[11px] font-bold text-[var(--muted)]">{profiles.length}</span></div>
      <div>{profiles.map(profile => {
        const connected = data.connectedIds.includes(profile.id)
        const pending = data.requests.some(request => request.fromId === data.me.id && request.toId === profile.id)
        return <div key={profile.id} className="flex items-center gap-2.5 border-b border-[var(--hairline)] px-4 py-3"><button onClick={() => onProfile(profile.id)}><Avatar profile={profile} size={42} /></button><button onClick={() => onProfile(profile.id)} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-1"><span className="truncate text-[14.5px] font-extrabold">{profile.name}</span><VerifiedBadge profile={profile} size={14} /></div><div className="truncate text-[11.5px] text-[var(--muted)]">{profile.username}{profile.accountType === 'artist' ? ' · Artist' : ''}</div></button>{connected ? <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1.5 text-[10.5px] font-extrabold">LINKED</span> : <button disabled={pending} onClick={() => void sendLinkRequest(profile.id)} className="grid h-9 min-w-9 place-items-center rounded-full bg-[var(--surface-soft)] px-2.5 text-[10.5px] font-extrabold disabled:opacity-45">{pending ? 'Sent' : <UserPlus size={16} />}</button>}</div>
      })}</div>
    </section>
  </div>
}
