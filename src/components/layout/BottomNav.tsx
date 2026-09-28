import { Compass, MessageCircle, Plus, UserRound, Rows3 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TabKey } from '../../types'

const tabs = [
  { key: 'feed' as const, label: 'Feed', icon: Rows3 },
  { key: 'discover' as const, label: 'Discover', icon: Compass },
  { key: 'create' as const, label: 'Create', icon: Plus },
  { key: 'chats' as const, label: 'Chats', icon: MessageCircle },
  { key: 'profile' as const, label: 'Profile', icon: UserRound },
]

export function BottomNav({ active, onChange, activityCount = 0, chatCount = 0 }: { active: TabKey; onChange: (tab: TabKey) => void; activityCount?: number; chatCount?: number }) {
  return <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] px-4 pb-[max(10px,env(safe-area-inset-bottom))]">
    <nav className="bottom-nav pointer-events-auto grid h-[84px] grid-cols-5 items-center rounded-[32px] px-1.5">
      {tabs.map(({ key, label, icon: Icon }) => {
        if (key === 'create') return <div className="grid place-items-center" key={key}><motion.button whileTap={{ scale: .9 }} onClick={() => onChange(key)} className="grid h-14 w-14 place-items-center rounded-[20px] bg-[#111114] text-white shadow-lg dark:bg-white dark:text-black"><Icon size={29} strokeWidth={2.2} /></motion.button></div>
        const selected = active === key
        const count = key === 'discover' ? activityCount : key === 'chats' ? chatCount : 0
        return <button key={key} onClick={() => onChange(key)} className={`relative flex h-[70px] flex-col items-center justify-center gap-1 rounded-[25px] transition ${selected ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)]'}`}>
          <div className="relative"><Icon size={23} strokeWidth={selected ? 2.4 : 2} />{count > 0 && <span className="absolute -right-3 -top-2 grid min-w-5 place-items-center rounded-full border-2 border-[var(--surface-solid)] bg-red-500 px-1 text-[10px] font-black leading-4 text-white">{count > 99 ? '99+' : count}</span>}</div>
          <span className="text-[11px] font-[800]">{label}</span>
        </button>
      })}
    </nav>
  </div>
}
