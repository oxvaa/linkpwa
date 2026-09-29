import { ArrowLeft, Check, Info, Lock, Palette, Send, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { MessageBubble } from '../components/chat/MessageBubble'
import { useAppStore } from '../stores/app-store'
import { supabase } from '../lib/supabase'
import { decryptMessage } from '../lib/crypto'
import { toMs } from '../lib/format'
import type { Message } from '../types'

type ThemeLevel = 'free' | 'plus' | 'pro'

type ChatThemePreset = {
  id: string
  label: string
  level: ThemeLevel
  background: string
  preview: string
}

const CHAT_THEMES: ChatThemePreset[] = [
  { id: 'default', label: 'LINK Blue', level: 'free', background: 'linear-gradient(145deg,#0A84FF,#168CFF)', preview: '#0A84FF' },
  { id: 'red', label: 'Red', level: 'free', background: 'linear-gradient(145deg,#FF3B30,#FF5A52)', preview: '#FF3B30' },
  { id: 'green', label: 'Green', level: 'plus', background: 'linear-gradient(145deg,#22C55E,#34C759)', preview: '#34C759' },
  { id: 'race-green', label: 'Race Green', level: 'plus', background: 'linear-gradient(145deg,#0C7A43,#16A765)', preview: '#0C7A43' },
  { id: 'lime-green', label: 'Lime', level: 'plus', background: 'linear-gradient(145deg,#84CC16,#A3E635)', preview: '#84CC16' },
  { id: 'bright-red', label: 'Bright Red', level: 'plus', background: 'linear-gradient(145deg,#FF1F3D,#FF375F)', preview: '#FF1F3D' },
  { id: 'yellow', label: 'Yellow', level: 'plus', background: 'linear-gradient(145deg,#FFB800,#FFD60A)', preview: '#FFB800' },
  { id: 'cyan-green', label: 'Cyan Green', level: 'pro', background: 'linear-gradient(145deg,#00C7BE,#34C759)', preview: '#00C7BE' },
  { id: 'cyan-blue', label: 'Cyan Blue', level: 'pro', background: 'linear-gradient(145deg,#00C7BE,#0A84FF)', preview: '#00C7BE' },
  { id: 'sunset', label: 'Sunset', level: 'pro', background: 'linear-gradient(145deg,#FF9F0A,#FF375F)', preview: '#FF7A18' },
  { id: 'blue-purple', label: 'Blue Purple', level: 'pro', background: 'linear-gradient(145deg,#0A84FF,#8B5CF6)', preview: '#6C63FF' },
  { id: 'gold', label: 'Gold', level: 'pro', background: 'linear-gradient(145deg,#B8860B,#F5C451)', preview: '#D4A72C' },
  { id: 'monochromatic', label: 'Mono', level: 'pro', background: 'linear-gradient(145deg,#16161A,#3A3A3C)', preview: '#2C2C2E' },
  { id: 'sky-blue-classic', label: 'Sky Blue', level: 'pro', background: 'linear-gradient(145deg,#36A7FF,#64D2FF)', preview: '#36A7FF' },
  { id: 'rose-pink', label: 'Rose Pink', level: 'pro', background: 'linear-gradient(145deg,#FF6B9D,#FF8FB7)', preview: '#FF6B9D' },
  { id: 'hot-pink', label: 'Hot Pink', level: 'pro', background: 'linear-gradient(145deg,#FF2D9B,#FF4DB8)', preview: '#FF2D9B' },
  { id: 'glamorous-pink', label: 'Glam Pink', level: 'pro', background: 'linear-gradient(145deg,#D946EF,#FF4DB8)', preview: '#E83DCF' },
]

const PLAN_RANK: Record<ThemeLevel, number> = { free: 0, plus: 1, pro: 2 }

export function ChatPage({ chatId, onBack, onProfile }: { chatId: string; onBack: () => void; onProfile: (id: string) => void }) {
  const { data, sendMessage, reactMessage, refresh, notify } = useAppStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [silent, setSilent] = useState<number | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const [themeId, setThemeId] = useState('default')
  const [liveMessages, setLiveMessages] = useState<Message[]>([])
  const [seenByOther, setSeenByOther] = useState<Set<string>>(new Set())
  const listRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const markedReceiptIds = useRef<Set<string>>(new Set())

  const chat = data?.chats.find(item => item.id === chatId)
  const uid = data?.me.id || ''
  const storeMessages = chat && data ? data.messagesByChat[chat.id] || [] : []
  const otherId = chat?.kind === 'direct' ? chat.memberIds.find(id => id !== uid) : null
  const other = otherId && data ? data.profiles[otherId] : null
  const title = chat?.kind === 'group' ? chat.name || 'Group' : other?.name || 'LINK chat'
  const subtitle = chat?.kind === 'group'
    ? `${chat.memberIds.length} members`
    : other?.presenceMode === 'online' && other.presenceVisible
      ? 'Active now'
      : other?.username || 'LINK'

  const activeTheme = useMemo(
    () => CHAT_THEMES.find(item => item.id === themeId) || CHAT_THEMES[0],
    [themeId],
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      const node = listRef.current
      if (node) node.scrollTo({ top: node.scrollHeight, behavior })
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: 'end', behavior }))
    })
  }, [])

  const loadMessages = useCallback(async () => {
    if (!chat?.id || !chat.keyBase64 || !uid) return

    const { data: rows, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('[LINK chat sync]', error.message)
      return
    }

    const ordered = [...(rows || [])].reverse()
    const ids = ordered.map(row => row.id)

    const reactionMap = new Map<string, string>()
    if (ids.length) {
      const { data: reactionRows } = await supabase
        .from('message_reactions')
        .select('message_id,emoji,created_at')
        .in('message_id', ids)
        .order('created_at', { ascending: false })

      for (const row of reactionRows || []) {
        if (!reactionMap.has(row.message_id)) reactionMap.set(row.message_id, row.emoji)
      }
    }

    const nextMessages: Message[] = []
    for (const row of ordered) {
      let body = row.text_preview || 'Encrypted message'
      if (row.cipher && chat.keyBase64) {
        try {
          const decrypted = await decryptMessage(row.cipher, chat.keyBase64)
          body = String(decrypted.text || body)
        } catch {
          body = 'Unable to decrypt this message'
        }
      }

      nextMessages.push({
        id: row.id,
        chatId: row.chat_id,
        senderId: row.sender_id,
        type: row.type || 'text',
        text: body,
        createdAt: toMs(row.created_at) || Date.now(),
        editedAt: toMs(row.edited_at),
        deletedAt: toMs(row.deleted_at),
        replyTo: row.reply_to || null,
        expiresAt: toMs(row.expires_at),
        viewOnce: Boolean(row.view_once),
        reaction: reactionMap.get(row.id) || null,
      })
    }

    setLiveMessages(nextMessages)

    const ownIds = nextMessages.filter(message => message.senderId === uid).map(message => message.id)
    if (!ownIds.length) {
      setSeenByOther(new Set())
      return
    }

    const { data: receipts } = await supabase
      .from('message_receipts')
      .select('message_id,user_id,seen_at,read_at')
      .in('message_id', ownIds)

    setSeenByOther(new Set(
      (receipts || [])
        .filter(row => row.user_id !== uid && Boolean(row.seen_at || row.read_at))
        .map(row => row.message_id),
    ))
  }, [chat?.id, chat?.keyBase64, uid])

  useEffect(() => {
    markedReceiptIds.current.clear()
    setSeenByOther(new Set())
    setThemeId(chat?.themeId || 'default')
    setLiveMessages(storeMessages)
    if (chat?.id) void loadMessages()
  }, [chatId]) // intentionally reset once per opened chat

  useEffect(() => {
    if (!chat?.id || !uid) return

    const scheduleReload = () => {
      window.setTimeout(() => void loadMessages(), 45)
    }

    const channel = supabase
      .channel(`link-pwa32-chat:${chat.id}:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_receipts' }, scheduleReload)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chats', filter: `id=eq.${chat.id}` }, () => {
        void refresh(true)
      })
      .subscribe()

    // Realtime is primary; this is only a quiet safety net for iOS/PWA resume edge cases.
    const fallback = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadMessages()
    }, 5000)

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadMessages()
        scrollToBottom('auto')
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(fallback)
      document.removeEventListener('visibilitychange', onVisible)
      void supabase.removeChannel(channel)
    }
  }, [chat?.id, uid, loadMessages, refresh, scrollToBottom])

  useEffect(() => {
    if (!chat?.id || !uid || !liveMessages.length) return

    const freshIncoming = liveMessages
      .filter(message => message.senderId !== uid && !message.deletedAt && !markedReceiptIds.current.has(message.id))
      .slice(-40)

    if (!freshIncoming.length) return

    const now = new Date().toISOString()
    const rows = freshIncoming.map(message => ({
      message_id: message.id,
      user_id: uid,
      delivered_at: now,
      ...(data?.settings.readReceipts ? { seen_at: now, read_at: now } : {}),
    }))

    void supabase
      .from('message_receipts')
      .upsert(rows, { onConflict: 'message_id,user_id' })
      .then(({ error }) => {
        if (error) {
          console.warn('[LINK receipts]', error.message)
          return
        }
        freshIncoming.forEach(message => markedReceiptIds.current.add(message.id))
      })
  }, [chat?.id, uid, liveMessages, data?.settings.readReceipts])

  const lastMessageId = liveMessages.at(-1)?.id
  useLayoutEffect(() => {
    if (!chat?.id) return
    scrollToBottom('auto')
  }, [chat?.id, lastMessageId, scrollToBottom])

  if (!data || !chat) return null

  const canSend = Boolean(text.trim() && chat.keyBase64 && !busy)
  const latestOwn = [...liveMessages].reverse().find(message => message.senderId === uid)
  const plan = data.entitlements.plan || 'free'

  const send = async () => {
    if (!canSend) return

    const clean = text.trim()
    const tempId = `local-${crypto.randomUUID()}`
    const tempMessage: Message = {
      id: tempId,
      chatId: chat.id,
      senderId: uid,
      type: 'text',
      text: clean,
      createdAt: Date.now(),
      editedAt: null,
      deletedAt: null,
      replyTo: null,
      expiresAt: silent ? Date.now() + silent * 1000 : null,
      viewOnce: false,
      reaction: null,
    }

    setText('')
    setLiveMessages(current => [...current, tempMessage])
    scrollToBottom('smooth')
    setBusy(true)

    try {
      await sendMessage(chat, clean, null, silent)
      await loadMessages()
      scrollToBottom('smooth')
    } catch (cause) {
      setLiveMessages(current => current.filter(message => message.id !== tempId))
      setText(clean)
      notify(cause instanceof Error ? cause.message : 'Message could not be sent.')
    } finally {
      setBusy(false)
    }
  }

  const applyTheme = async (preset: ChatThemePreset) => {
    if (PLAN_RANK[plan] < PLAN_RANK[preset.level]) {
      notify(preset.level === 'pro' ? 'This chat theme requires LINK Pro.' : 'This chat theme requires LINK Plus.')
      return
    }

    const previous = themeId
    setThemeId(preset.id)

    const patch = chat.kind === 'group'
      ? { group_theme_id: preset.id, theme_scope: 'messages', updated_at: new Date().toISOString() }
      : { theme_id: preset.id, theme_scope: 'messages', updated_at: new Date().toISOString() }

    const { error } = await supabase.from('chats').update(patch).eq('id', chat.id)
    if (error) {
      setThemeId(previous)
      notify(error.message)
      return
    }

    setThemeOpen(false)
    await refresh(true)
    notify('Chat color updated')
  }

  return <section className="fixed inset-0 z-40 mx-auto flex max-w-[480px] flex-col bg-[var(--bg)]">
    <header className="no-header-blur safe-top flex items-center gap-2 border-b border-[var(--hairline)] px-3 pb-2 pt-1">
      <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-solid)]"><ArrowLeft size={19} /></button>

      <button onClick={() => otherId && onProfile(otherId)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Avatar profile={other} size={35} showPresence={chat.kind === 'direct'} />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-[850]">{title}</span>
            {other && <VerifiedBadge profile={other} size={14} />}
          </div>
          <div className="truncate text-[10.5px] font-medium text-[var(--muted)]">{subtitle}</div>
        </div>
      </button>

      <button
        onClick={() => setThemeOpen(true)}
        className="grid h-8.5 w-8.5 place-items-center rounded-full border border-[var(--hairline)]"
        style={{ background: activeTheme.preview }}
        aria-label="Chat color"
      >
        <Palette size={16} className="text-white drop-shadow" />
      </button>
      <button className="grid h-8.5 w-8.5 place-items-center rounded-full bg-[var(--surface-soft)]"><Info size={17} /></button>
    </header>

    <div ref={listRef} className="app-scroll flex-1 overflow-y-auto px-3 py-2.5">
      <div className="mx-auto mb-3 w-fit rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[9.5px] font-bold text-[var(--muted)]">Encrypted</div>

      {liveMessages.map(message => <MessageBubble
        key={message.id}
        message={message}
        mine={message.senderId === uid}
        sender={data.profiles[message.senderId]}
        showSender={chat.kind === 'group'}
        outgoingBackground={activeTheme.background}
        seen={message.id === latestOwn?.id && seenByOther.has(message.id)}
        onDoubleTap={() => void reactMessage(message.id, data.settings.doubleTapEmoji)}
      />)}
      <div ref={endRef} />
    </div>

    <div className="border-t border-[var(--hairline)] bg-[var(--bg)] px-2.5 pb-[max(7px,env(safe-area-inset-bottom))] pt-1.5">
      <div className="mb-1 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
        {[null, 10, 3600, 604800].map(value => <button
          key={String(value)}
          onClick={() => setSilent(value)}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold ${silent === value ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--surface-soft)] text-[var(--muted)]'}`}
        >
          {value === null ? 'Normal' : value === 10 ? '10s' : value === 3600 ? '1h' : '7d'}
        </button>)}
      </div>

      <div className="flex items-end gap-1.5">
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles size={16} /></button>
        <div className="flex min-h-9 flex-1 items-center rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-1">
          <textarea
            rows={1}
            value={text}
            onFocus={() => window.setTimeout(() => scrollToBottom('smooth'), 120)}
            onChange={event => setText(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
            className="max-h-24 min-h-[22px] w-full resize-none bg-transparent text-[14px] leading-[22px] outline-none"
            placeholder={chat.keyBase64 ? 'Message' : 'Encryption key unavailable'}
          />
        </div>
        <motion.button
          whileTap={{ scale: .9 }}
          disabled={!canSend}
          onClick={() => void send()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white disabled:opacity-35"
          style={{ background: activeTheme.background }}
        >
          <Send size={17} />
        </motion.button>
      </div>
    </div>

    {themeOpen && <ThemePicker
      current={themeId}
      plan={plan}
      onClose={() => setThemeOpen(false)}
      onSelect={preset => void applyTheme(preset)}
    />}
  </section>
}

function ThemePicker({ current, plan, onClose, onSelect }: {
  current: string
  plan: ThemeLevel
  onClose: () => void
  onSelect: (preset: ChatThemePreset) => void
}) {
  return <div className="fixed inset-0 z-[70] flex items-end justify-center">
    <button className="absolute inset-0 bg-black/25" aria-label="Close theme picker" onClick={onClose} />
    <section className="relative z-10 w-full max-w-[480px] rounded-t-[26px] border border-[var(--hairline)] bg-[var(--bg)] px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
      <div className="mb-3 flex items-center">
        <div>
          <div className="text-[17px] font-[900] tracking-[-.03em]">Chat color</div>
          <div className="text-[10.5px] text-[var(--muted)]">Synced for this conversation</div>
        </div>
        <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-soft)]"><X size={16} /></button>
      </div>

      <div className="grid max-h-[52dvh] grid-cols-4 gap-2 overflow-y-auto pb-1">
        {CHAT_THEMES.map(preset => {
          const locked = PLAN_RANK[plan] < PLAN_RANK[preset.level]
          const selected = current === preset.id
          return <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`relative rounded-[16px] border p-2 text-left ${selected ? 'border-[var(--text)]' : 'border-[var(--hairline)]'} bg-[var(--surface-solid)]`}
          >
            <div className="relative h-10 rounded-[12px]" style={{ background: preset.background }}>
              {selected && <span className="absolute inset-0 grid place-items-center text-white"><Check size={18} strokeWidth={3} /></span>}
              {locked && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white"><Lock size={10} /></span>}
            </div>
            <div className="mt-1.5 truncate text-[9.5px] font-extrabold">{preset.label}</div>
            <div className="text-[8px] uppercase tracking-[.08em] text-[var(--muted)]">{preset.level}</div>
          </button>
        })}
      </div>
    </section>
  </div>
}
