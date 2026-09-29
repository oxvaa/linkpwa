import { ArrowLeft, Check, Info, Lock, Palette, Send, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '../components/ui/Avatar'
import { VerifiedBadge } from '../components/ui/VerifiedBadge'
import { MessageBubble } from '../components/chat/MessageBubble'
import { useAppStore } from '../stores/app-store'
import { supabase } from '../lib/supabase'
import { decryptMessage } from '../lib/crypto'
import { reactToMessage, sendEncryptedMessage } from '../lib/api'
import { toMs } from '../lib/format'
import type { Message } from '../types'

type ThemeLevel = 'free' | 'plus' | 'pro'

type ChatThemePreset = {
  id: string
  label: string
  level: ThemeLevel
  colors: string[]
  textColor: string
}

const CHAT_THEMES: ChatThemePreset[] = [
  { id: 'default', label: 'Default', level: 'free', colors: ['#007AFF'], textColor: '#FFFFFF' },
  { id: 'red', label: 'Red', level: 'free', colors: ['#FF3B30'], textColor: '#FFFFFF' },

  { id: 'green', label: 'Green', level: 'plus', colors: ['#34C759'], textColor: '#FFFFFF' },
  { id: 'race_green', label: 'Race Green', level: 'plus', colors: ['#0C7C4A'], textColor: '#FFFFFF' },
  { id: 'lime_green', label: 'Lime Green', level: 'plus', colors: ['#A8E900'], textColor: '#102000' },
  { id: 'bright_red', label: 'Bright Red', level: 'plus', colors: ['#FF1744'], textColor: '#FFFFFF' },
  { id: 'yellow', label: 'Yellow', level: 'plus', colors: ['#FFD60A'], textColor: '#1B1600' },

  { id: 'cyan_green', label: 'Cyan Green', level: 'pro', colors: ['#00C7BE'], textColor: '#FFFFFF' },
  { id: 'cyan_blue', label: 'Cyan Blue', level: 'pro', colors: ['#00A9FF'], textColor: '#FFFFFF' },
  { id: 'sunset', label: 'Sunset', level: 'pro', colors: ['#FF2D55', '#FF9F0A'], textColor: '#FFFFFF' },
  { id: 'blue_purple', label: 'Blue & Purple', level: 'pro', colors: ['#0A84FF', '#AF52DE'], textColor: '#FFFFFF' },
  { id: 'gold', label: 'Gold', level: 'pro', colors: ['#E0B83D', '#B88713'], textColor: '#1F1600' },
  { id: 'monochromatic', label: 'Monochromatic', level: 'pro', colors: ['#111111', '#6E6E73'], textColor: '#FFFFFF' },
  { id: 'sky_blue', label: 'Sky Blue', level: 'pro', colors: ['#5AC8FA'], textColor: '#062538' },
  { id: 'rose_pink', label: 'Rose Pink', level: 'pro', colors: ['#FF6482'], textColor: '#FFFFFF' },
  { id: 'hot_pink', label: 'Hot Pink', level: 'pro', colors: ['#FF2D95'], textColor: '#FFFFFF' },
  { id: 'glamorous_pink', label: 'Glamurous Pink', level: 'pro', colors: ['#FF2D95', '#BF5AF2', '#FF375F'], textColor: '#FFFFFF' },
]

const PLAN_RANK: Record<ThemeLevel, number> = { free: 0, plus: 1, pro: 2 }

function themeBackground(theme: ChatThemePreset) {
  return theme.colors.length > 1
    ? `linear-gradient(135deg,${theme.colors.join(',')})`
    : theme.colors[0]
}

export function ChatPage({ chatId, onBack, onProfile }: { chatId: string; onBack: () => void; onProfile: (id: string) => void }) {
  const { data, refresh, notify } = useAppStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [silent, setSilent] = useState<number | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const [themeId, setThemeId] = useState('default')
  const [messages, setMessages] = useState<Message[]>([])
  const [seenByOther, setSeenByOther] = useState<Set<string>>(new Set())
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const receiptMarked = useRef<Set<string>>(new Set())
  const reloadTimer = useRef<number | null>(null)

  const chat = data?.chats.find(item => item.id === chatId)
  const uid = data?.me.id || ''
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

  const scrollBottom = useCallback(() => {
    const run = () => {
      const node = listRef.current
      if (!node) return
      node.scrollTop = node.scrollHeight
    }
    requestAnimationFrame(() => {
      run()
      requestAnimationFrame(run)
    })
  }, [])

  const loadTheme = useCallback(async () => {
    if (!chat?.id) return
    const { data: row } = await supabase
      .from('chats')
      .select('kind,theme_id,group_theme_id')
      .eq('id', chat.id)
      .maybeSingle()

    if (!row) {
      setThemeId(chat.themeId || 'default')
      return
    }

    // IMPORTANT: direct chats use theme_id. group_theme_id is usually "default"
    // even on direct chats, so using group_theme_id first made colors look broken.
    setThemeId(
      row.kind === 'group'
        ? row.group_theme_id || row.theme_id || 'default'
        : row.theme_id || 'default',
    )
  }, [chat?.id, chat?.themeId])

  const loadMessages = useCallback(async () => {
    if (!chat?.id || !uid) return

    const { data: rows, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.warn('[LINK chat]', error.message)
      return
    }

    const ordered = [...(rows || [])].reverse()
    const ids = ordered.map(row => row.id)

    const reactions = new Map<string, string>()
    if (ids.length) {
      const { data: reactionRows } = await supabase
        .from('message_reactions')
        .select('message_id,emoji,created_at')
        .in('message_id', ids)
        .order('created_at', { ascending: false })

      for (const row of reactionRows || []) {
        if (!reactions.has(row.message_id)) reactions.set(row.message_id, row.emoji)
      }
    }

    const next: Message[] = []
    for (const row of ordered) {
      let body = row.text_preview || 'Encrypted message'

      // Do not skip loading the whole chat just because the key is temporarily missing.
      if (row.cipher && chat.keyBase64) {
        try {
          const decrypted = await decryptMessage(row.cipher, chat.keyBase64)
          body = String(decrypted.text || body)
        } catch {
          body = 'Unable to decrypt this message'
        }
      }

      next.push({
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
        reaction: reactions.get(row.id) || null,
      })
    }

    setMessages(next)

    const ownIds = next.filter(message => message.senderId === uid).map(message => message.id)
    if (!ownIds.length) {
      setSeenByOther(new Set())
      return
    }

    const { data: receiptRows } = await supabase
      .from('message_receipts')
      .select('message_id,user_id,seen_at,read_at')
      .in('message_id', ownIds)

    setSeenByOther(new Set(
      (receiptRows || [])
        .filter(row => row.user_id !== uid && Boolean(row.seen_at || row.read_at))
        .map(row => row.message_id),
    ))
  }, [chat?.id, chat?.keyBase64, uid])

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) window.clearTimeout(reloadTimer.current)
    reloadTimer.current = window.setTimeout(() => void loadMessages(), 70)
  }, [loadMessages])

  useEffect(() => {
    if (!chat?.id) return
    receiptMarked.current.clear()
    setMessages(data?.messagesByChat[chat.id] || [])
    void loadTheme()
    void loadMessages()
  }, [chatId]) // reset only when switching conversation

  useEffect(() => {
    if (!chat?.id || !uid) return

    const channel = supabase
      .channel(`link-pwa-chat:${chat.id}:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` }, scheduleReload)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chats', filter: `id=eq.${chat.id}` }, () => {
        void loadTheme()
      })
      .subscribe()

    // Realtime is primary. This small fallback fixes iOS/PWA resume cases.
    const fallback = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadMessages()
    }, 2500)

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return
      void loadMessages()
      void loadTheme()
      scrollBottom()
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (reloadTimer.current) window.clearTimeout(reloadTimer.current)
      window.clearInterval(fallback)
      document.removeEventListener('visibilitychange', onVisibility)
      void supabase.removeChannel(channel)
    }
  }, [chat?.id, uid, scheduleReload, loadMessages, loadTheme, scrollBottom])

  useEffect(() => {
    const visual = window.visualViewport
    if (!visual) return

    const update = () => {
      setViewportHeight(visual.height)
      window.setTimeout(scrollBottom, 30)
    }

    update()
    visual.addEventListener('resize', update)
    visual.addEventListener('scroll', update)

    return () => {
      visual.removeEventListener('resize', update)
      visual.removeEventListener('scroll', update)
    }
  }, [scrollBottom])

  useEffect(() => {
    if (!chat?.id || !uid || !messages.length) return

    const incoming = messages
      .filter(message =>
        message.senderId !== uid &&
        !message.deletedAt &&
        !receiptMarked.current.has(message.id),
      )
      .slice(-40)

    if (!incoming.length) return

    const now = new Date().toISOString()
    const rows = incoming.map(message => ({
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
        incoming.forEach(message => receiptMarked.current.add(message.id))
      })
  }, [chat?.id, uid, messages, data?.settings.readReceipts])

  const lastMessageId = messages.at(-1)?.id
  useLayoutEffect(() => {
    if (!chat?.id) return
    scrollBottom()
  }, [chat?.id, lastMessageId, viewportHeight, scrollBottom])

  if (!data || !chat) return null

  const canSend = Boolean(text.trim() && chat.keyBase64 && !busy)
  const latestOwn = [...messages].reverse().find(message => message.senderId === uid)
  const plan = data.entitlements.plan || 'free'

  const send = async () => {
    if (!canSend) return

    const clean = text.trim()
    const optimistic: Message = {
      id: `local-${crypto.randomUUID()}`,
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
    setMessages(current => [...current, optimistic])
    setBusy(true)
    scrollBottom()

    try {
      // Send directly. Do not refresh/bootstrap the entire app for one message.
      await sendEncryptedMessage(uid, chat, clean, null, silent)
      await loadMessages()
      scrollBottom()
    } catch (cause) {
      setMessages(current => current.filter(message => message.id !== optimistic.id))
      setText(clean)
      notify(cause instanceof Error ? cause.message : 'Message could not be sent.')
    } finally {
      setBusy(false)
    }
  }

  const react = async (messageId: string) => {
    try {
      await reactToMessage(uid, messageId, data.settings.doubleTapEmoji)
      await loadMessages()
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : 'Reaction could not be saved.')
    }
  }

  const applyTheme = async (preset: ChatThemePreset) => {
    if (PLAN_RANK[plan] < PLAN_RANK[preset.level]) {
      notify(preset.level === 'pro' ? 'Requires LINK Pro.' : 'Requires LINK Plus.')
      return
    }

    const before = themeId
    setThemeId(preset.id)

    const patch = chat.kind === 'group'
      ? { group_theme_id: preset.id, theme_scope: 'messages', updated_at: new Date().toISOString() }
      : { theme_id: preset.id, theme_scope: 'messages', updated_at: new Date().toISOString() }

    const { error } = await supabase.from('chats').update(patch).eq('id', chat.id)

    if (error) {
      setThemeId(before)
      notify(error.message)
      return
    }

    setThemeOpen(false)
    await loadTheme()
    // quiet refresh keeps Chats list current, but is not required for the chat itself
    void refresh(true)
  }

  const shellStyle = viewportHeight
    ? { height: `${viewportHeight}px` }
    : { height: '100dvh' }

  return <section
    className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[480px] flex-col overflow-hidden bg-[var(--bg)]"
    style={shellStyle}
  >
    <header className="no-header-blur safe-top flex shrink-0 items-center gap-2 border-b border-[var(--hairline)] px-3 pb-2 pt-1">
      <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-solid)]">
        <ArrowLeft size={19} />
      </button>

      <button onClick={() => otherId && onProfile(otherId)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Avatar profile={other} size={34} showPresence={chat.kind === 'direct'} />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate text-[13.5px] font-[850]">{title}</span>
            {other && <VerifiedBadge profile={other} size={13} />}
          </div>
          <div className="truncate text-[10px] font-medium text-[var(--muted)]">{subtitle}</div>
        </div>
      </button>

      <button
        onClick={() => setThemeOpen(true)}
        className="grid h-8 w-8 place-items-center rounded-full border border-[var(--hairline)]"
        style={{ background: themeBackground(activeTheme) }}
        aria-label="Chat color"
      >
        <Palette size={15} style={{ color: activeTheme.textColor }} />
      </button>

      <button className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-soft)]">
        <Info size={16} />
      </button>
    </header>

    <div ref={listRef} className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
      <div className="mx-auto mb-2.5 w-fit rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-[9px] font-bold text-[var(--muted)]">
        Encrypted
      </div>

      {messages.map(message => <MessageBubble
        key={message.id}
        message={message}
        mine={message.senderId === uid}
        sender={data.profiles[message.senderId]}
        showSender={chat.kind === 'group'}
        outgoingBackground={themeBackground(activeTheme)}
        outgoingTextColor={activeTheme.textColor}
        seen={message.id === latestOwn?.id && seenByOther.has(message.id)}
        onDoubleTap={() => void react(message.id)}
      />)}
    </div>

    <div className="shrink-0 border-t border-[var(--hairline)] bg-[var(--bg)] px-2.5 pb-[max(7px,env(safe-area-inset-bottom))] pt-1.5">
      <div className="mb-1 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
        {[null, 10, 3600, 604800].map(value => <button
          key={String(value)}
          onClick={() => setSilent(value)}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold ${silent === value ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--surface-soft)] text-[var(--muted)]'}`}
        >
          {value === null ? 'Normal' : value === 10 ? '10s' : value === 3600 ? '1h' : '7d'}
        </button>)}
      </div>

      <div className="flex items-end gap-1.5">
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)]">
          <Sparkles size={15} />
        </button>

        <div className="flex min-h-9 flex-1 items-center rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-1">
          <textarea
            rows={1}
            value={text}
            onFocus={() => window.setTimeout(scrollBottom, 80)}
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
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full disabled:opacity-35"
          style={{ background: themeBackground(activeTheme), color: activeTheme.textColor }}
        >
          <Send size={16} />
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
    <button className="absolute inset-0 bg-black/25" aria-label="Close chat color" onClick={onClose} />

    <section className="relative z-10 w-full max-w-[480px] rounded-t-[24px] border border-[var(--hairline)] bg-[var(--bg)] px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
      <div className="mb-3 flex items-center">
        <div>
          <div className="text-[16px] font-[900] tracking-[-.03em]">Chat color</div>
          <div className="text-[10px] text-[var(--muted)]">Same themes as LINK Expo</div>
        </div>

        <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-soft)]">
          <X size={15} />
        </button>
      </div>

      <div className="grid max-h-[50dvh] grid-cols-4 gap-2 overflow-y-auto">
        {CHAT_THEMES.map(preset => {
          const locked = PLAN_RANK[plan] < PLAN_RANK[preset.level]
          const selected = current === preset.id

          return <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`rounded-[15px] border p-1.5 text-left ${selected ? 'border-[var(--text)]' : 'border-[var(--hairline)]'} bg-[var(--surface-solid)]`}
          >
            <div className="relative h-9 rounded-[11px]" style={{ background: themeBackground(preset) }}>
              {selected && <span className="absolute inset-0 grid place-items-center" style={{ color: preset.textColor }}>
                <Check size={17} strokeWidth={3} />
              </span>}
              {locked && <span className="absolute right-1 top-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-black/55 text-white">
                <Lock size={9} />
              </span>}
            </div>
            <div className="mt-1.5 truncate text-[9px] font-extrabold">{preset.label}</div>
          </button>
        })}
      </div>
    </section>
  </div>
}
