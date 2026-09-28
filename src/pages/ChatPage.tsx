import { ArrowLeft, Info, Palette, Send, Sparkles } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { MessageBubble } from '../components/chat/MessageBubble'
import { useAppStore } from '../stores/app-store'

export function ChatPage({ chatId, onBack, onProfile }: { chatId: string; onBack: () => void; onProfile: (id: string) => void }) {
  const { data, sendMessage, reactMessage } = useAppStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [silent, setSilent] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  if (!data) return null
  const chat = data.chats.find(item => item.id === chatId)
  if (!chat) return null
  const messages = data.messagesByChat[chat.id] || []
  const otherId = chat.kind === 'direct' ? chat.memberIds.find(id => id !== data.me.id) : null
  const other = otherId ? data.profiles[otherId] : null
  const title = chat.kind === 'group' ? chat.name || 'Group' : other?.name || 'LINK chat'
  const subtitle = chat.kind === 'group' ? `${chat.memberIds.length} members` : other?.presenceMode === 'online' && other.presenceVisible ? 'Active now' : other?.username || 'LINK'
  const canSend = Boolean(text.trim() && chat.keyBase64 && !busy)

  const send = async () => {
    if (!canSend) return
    setBusy(true)
    try { await sendMessage(chat, text, null, silent); setText(''); requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' })) }
    finally { setBusy(false) }
  }

  return <section className="fixed inset-0 z-40 mx-auto flex max-w-[520px] flex-col bg-[var(--bg)]">
    <header className="no-header-blur safe-top flex items-center gap-3 border-b border-[var(--hairline)] px-4 pb-3 pt-2">
      <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-solid)]"><ArrowLeft size={23} /></button>
      <button onClick={() => otherId && onProfile(otherId)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><Avatar profile={other} size={43} showPresence={chat.kind === 'direct'} /><div className="min-w-0"><div className="flex items-center gap-1.5"><span className="truncate text-[17px] font-[850]">{title}</span>{other && <VerifiedBadge profile={other} size={17} />}</div><div className="truncate text-[12px] font-medium text-[var(--muted)]">{subtitle}</div></div></button>
      <button className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-soft)]"><Palette size={19} /></button>
      <button className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-soft)]"><Info size={20} /></button>
    </header>

    <div className="app-scroll flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto mb-5 w-fit rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-[11px] font-bold text-[var(--muted)]">Today · Encrypted</div>
      {messages.map(message => <MessageBubble key={message.id} message={message} mine={message.senderId === data.me.id} sender={data.profiles[message.senderId]} onDoubleTap={() => void reactMessage(message.id, data.settings.doubleTapEmoji)} />)}
      <div ref={endRef} />
    </div>

    <div className="border-t border-[var(--hairline)] bg-[var(--bg)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="mb-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {[null, 10, 3600, 604800].map(value => <button key={String(value)} onClick={() => setSilent(value)} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${silent === value ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--surface-soft)] text-[var(--muted)]'}`}>{value === null ? 'Normal' : value === 10 ? 'Silent 10s' : value === 3600 ? 'Silent 1h' : 'Silent 7d'}</button>)}
      </div>
      <div className="flex items-end gap-2"><button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles size={18} /></button><div className="flex min-h-11 flex-1 items-center rounded-[22px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-4 py-2"><textarea rows={1} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} className="max-h-28 min-h-[24px] w-full resize-none bg-transparent text-[16px] leading-6 outline-none" placeholder={chat.keyBase64 ? 'Message' : 'Encryption key unavailable'} /></div><motion.button whileTap={{ scale: .9 }} disabled={!canSend} onClick={() => void send()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0a84ff] text-white disabled:opacity-35"><Send size={19} /></motion.button></div>
    </div>
  </section>
}
