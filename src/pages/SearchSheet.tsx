import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Sheet } from '../components/ui/Sheet'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { useAppStore } from '../stores/app-store'

export function SearchSheet({ open, onClose, onProfile }: { open: boolean; onClose: () => void; onProfile: (id: string) => void }) {
  const { data } = useAppStore(); const [q,setQ]=useState('')
  const results = useMemo(() => data ? Object.values(data.profiles).filter(p => p.id !== data.me.id && `${p.name} ${p.username}`.toLowerCase().includes(q.toLowerCase())).slice(0,30) : [], [data,q])
  return <Sheet open={open} title="Search LINK" onClose={onClose} full><label className="sticky top-0 z-10 mb-2 flex h-12 items-center gap-2.5 rounded-[18px] bg-[var(--surface-soft)] px-4"><Search size={19} className="text-[var(--muted)]"/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Name or @username"/></label><div className="pb-8">{q && results.map(p=><button key={p.id} onClick={()=>{onClose();onProfile(p.id)}} className="flex w-full items-center gap-3 border-b border-[var(--hairline)] py-3 text-left"><Avatar profile={p} size={46}/><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><span className="truncate font-extrabold">{p.name}</span><VerifiedBadge profile={p} size={15}/></div><div className="text-[13px] text-[var(--muted)]">{p.username}</div></div></button>)}</div></Sheet>
}
