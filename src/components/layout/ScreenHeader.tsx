import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function ScreenHeader({ title, subtitle, right, compact = false }: { title: string; subtitle?: string; right?: ReactNode; compact?: boolean }) {
  return <header className={`safe-top px-3.5 ${compact ? 'pb-1.5' : 'pb-2.5'}`}>
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${compact ? 'text-[24px]' : 'text-[28px]'} font-[900] leading-none tracking-[-.055em]`}
        >
          {title}
        </motion.h1>
        {subtitle && <div className="mt-1 text-[11px] font-semibold text-[var(--muted)]">{subtitle}</div>}
      </div>
      {right && <div className="flex gap-1.5">{right}</div>}
    </div>
  </header>
}
