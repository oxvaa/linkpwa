import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export function IconButton({ icon: Icon, onClick, label, size = 40, className = '' }: { icon: LucideIcon; onClick?: () => void; label: string; size?: number; className?: string }) {
  return <motion.button whileTap={{ scale: .93 }} onClick={onClick} aria-label={label} className={`grid shrink-0 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--surface-solid)] text-[var(--text)] shadow-sm ${className}`} style={{ width: size, height: size }}>
    <Icon size={size * .46} strokeWidth={2.05} />
  </motion.button>
}
