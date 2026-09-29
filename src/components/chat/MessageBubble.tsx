import { motion } from 'framer-motion'
import type { Message, Profile } from '../../types'
import { clock } from '../../lib/format'

export function MessageBubble({
  message,
  mine,
  sender,
  showSender = false,
  outgoingBackground,
  outgoingTextColor = '#fff',
  seen = false,
  onDoubleTap,
}: {
  message: Message
  mine: boolean
  sender?: Profile
  showSender?: boolean
  outgoingBackground?: string
  outgoingTextColor?: string
  seen?: boolean
  onDoubleTap?: () => void
}) {
  if (message.deletedAt) return null

  return <motion.div
    initial={{ opacity: 0, y: 2, scale: .99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`mb-1 flex ${mine ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
      <button
        onDoubleClick={onDoubleTap}
        onTouchEnd={event => {
          const element = event.currentTarget as HTMLButtonElement & { _lastTap?: number }
          const now = Date.now()
          if (element._lastTap && now - element._lastTap < 310) onDoubleTap?.()
          element._lastTap = now
        }}
        className={`relative rounded-[18px] px-3 py-1.5 text-left ${mine ? 'message-out' : 'message-in'}`}
        style={mine && outgoingBackground ? { background: outgoingBackground, color: outgoingTextColor } : undefined}
      >
        {!mine && showSender && sender && <div className="mb-0.5 text-[9px] font-extrabold opacity-55">{sender.name}</div>}

        <div className="whitespace-pre-wrap break-words text-[14px] leading-[1.3]">{message.text}</div>

        <div
          className={`mt-0.5 flex items-center justify-end gap-1 text-[8px] ${mine ? '' : 'text-[var(--muted)]'}`}
          style={mine ? { color: `${outgoingTextColor}A8` } : undefined}
        >
          {message.editedAt && <span>Edited ·</span>}
          <span>{clock(message.createdAt)}</span>
        </div>

        {message.reaction && <span className="absolute -bottom-2 right-2 rounded-full border-2 border-[var(--bg)] bg-[var(--surface-solid)] px-1.5 py-0.5 text-[11px] shadow-sm">
          {message.reaction}
        </span>}
      </button>

      {mine && seen && <div className="mr-1 mt-0.5 text-[9px] font-semibold text-[var(--muted)]">Seen</div>}
    </div>
  </motion.div>
}
