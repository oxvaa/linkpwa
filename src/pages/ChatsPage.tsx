import { Archive, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { useAppStore } from '../stores/app-store'
import { timeAgo } from '../lib/format'

export function ChatsPage({ onOpenChat }: { onOpenChat: (chatId: string) => void }) {
  const { data } = useAppStore()
  const [query, setQuery] = useState('')
  const chats = useMemo(() => data ? data.chats.filter(chat => !chat.archived && (!query.trim() || chatLabel(chat, data.me.id, data.profiles).toLowerCase().includes(query.toLowerCase()))) : [], [data, query])
  if (!data) return null

  return <div className="pb-32">
    <ScreenHeader title="Chats" subtitle="Encrypted conversations" />
    <div className="px-5"><label className="flex h-12 items-center gap-2.5 rounded-[18px] bg-[var(--surface-soft)] px-4"><Search size={19} className="text-[var(--muted)]" /><input className="min-w-0 flex-1 bg-transparent outline-none" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search chats" /></label></div>
    <div className="mt-5">
      {chats.length ? chats.map(chat => {
        const otherId = chat.kind === 'direct' ? chat.memberIds.find(id => id !== data.me.id) : null
        const other = otherId ? data.profiles[otherId] : null
        const label = chatLabel(chat, data.me.id, data.profiles)
        return <button key={chat.id} onClick={() => onOpenChat(chat.id)} className="flex w-full items-center gap-3 border-b border-[var(--hairline)] px-5 py-3.5 text-left">
          {chat.kind === 'direct' ? <Avatar profile={other} size={54} /> : <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-[linear-gradient(145deg,var(--link-accent),#5ac8fa)] text-[20px] font-black text-white">{label.slice(0,1).toUpperCase()}</div>}
          <div className="min-w-0 flex-1"><div className="flex items-center gap-1"><span className="truncate text-[16px] font-[850]">{label}</span>{other && <VerifiedBadge profile={other} size={16} />}<span className="ml-auto text-[11px] text-[var(--muted)]">{chat.lastMessage ? timeAgo(chat.lastMessage.createdAt) : ''}</span></div><div className="mt-1 truncate text-[13px] text-[var(--muted)]">{chat.lastMessage?.text || (chat.kind === 'group' ? `${chat.memberIds.length} members` : 'Start a conversation')}</div></div>
        </button>
      }) : <div className="px-7 py-20 text-center"><Archive className="mx-auto text-[var(--muted)]" /><h2 className="mt-4 text-[20px] font-black">No chats yet</h2><p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">Open a LINK profile and tap Message.</p></div>}
    </div>
  </div>
}

function chatLabel(chat: any, meId: string, profiles: Record<string, any>) {
  if (chat.kind === 'group') return chat.name || 'Group'
  const other = chat.memberIds.find((id: string) => id !== meId)
  return profiles[other]?.name || 'LINK chat'
}
