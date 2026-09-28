import { motion } from 'framer-motion'
import type { Message, Profile } from '../../types'
import { clock } from '../../lib/format'

export function MessageBubble({ message, mine, sender, onDoubleTap }: { message: Message; mine: boolean; sender?: Profile; onDoubleTap?: () => void }) {
  if (message.deletedAt) return null
  return <motion.div initial={{ opacity: 0, y: 5, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`mb-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
    <button onDoubleClick={onDoubleTap} onTouchEnd={event => {
      const element = event.currentTarget as HTMLButtonElement & { _lastTap?: number }
      const now = Date.now()
      if (element._lastTap && now - element._lastTap < 310) onDoubleTap?.()
      element._lastTap = now
    }} className={`max-w-[82%] px-4 py-2.5 text-left ${mine ? 'message-out' : 'message-in'}`}>
      {!mine && sender && <div className="mb-1 text-[11px] font-extrabold opacity-60">{sender.name}</div>}
      <div className="whitespace-pre-wrap break-words text-[16px] leading-[1.33]">{message.text}</div>
      <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/65' : 'text-[var(--muted)]'}`}>{message.editedAt && <span>Edited ·</span>}<span>{clock(message.createdAt)}</span></div>
      {message.reaction && <span className="absolute -bottom-2 right-2 rounded-full border-2 border-[var(--bg)] bg-[var(--surface-solid)] px-1.5 py-0.5 text-[13px] shadow-sm">{message.reaction}</span>}
    </button>
  </motion.div>
}
