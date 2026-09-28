import { AnimatePresence, motion } from 'framer-motion'

export function Toast({ message }: { message: string | null }) {
  return <AnimatePresence>{message && <motion.div initial={{ opacity: 0, y: 14, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .96 }} className="fixed bottom-[calc(104px+env(safe-area-inset-bottom))] left-1/2 z-[90] -translate-x-1/2 rounded-full bg-black/88 px-4 py-2.5 text-sm font-bold text-white shadow-xl dark:bg-white/90 dark:text-black">{message}</motion.div>}</AnimatePresence>
}
