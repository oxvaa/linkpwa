import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Sheet({ open, title, onClose, children, full = false }: { open: boolean; title?: string; onClose: () => void; children: ReactNode; full?: boolean }) {
  return <AnimatePresence>
    {open && <>
      <motion.button aria-label="Close" className="fixed inset-0 z-40 bg-black/28" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.section
        className={`settings-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[520px] flex-col overflow-hidden ${full ? 'top-[max(10px,env(safe-area-inset-top))]' : 'max-h-[88dvh]'}`}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
      >
        <div className="flex items-center gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1 text-[22px] font-[850] tracking-[-.03em]">{title}</div>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-solid)]"><X size={22} /></button>
        </div>
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))]">{children}</div>
      </motion.section>
    </>}
  </AnimatePresence>
}
