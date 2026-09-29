import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function ScreenHeader({ title, subtitle, right, compact = false }: { title: string; subtitle?: string; right?: ReactNode; compact?: boolean }) {
  return <header className={`safe-top px-3.5 ${compact ? 'pb-1.5' : 'pb-3'}`}>
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <motion.h1
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${compact ? 'text-[25px]' : 'text-[29px]'} font-[900] leading-none tracking-[-.055em]`}
        >
          {title}
        </motion.h1>
        {subtitle && <div className="mt-1 text-[11.5px] font-semibold text-[var(--muted)]">{subtitle}</div>}
      </div>
      {right && <div className="flex gap-1.5">{right}</div>}
    </div>
  </header>
}
