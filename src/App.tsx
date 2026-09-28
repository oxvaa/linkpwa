import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TabKey } from './types'
import { useAppStore } from './stores/app-store'
import { AuthPage } from './pages/AuthPage'
import { FeedPage } from './pages/FeedPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ChatsPage } from './pages/ChatsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatPage } from './pages/ChatPage'
import { BottomNav } from './components/layout/BottomNav'
import { SettingsSheet } from './pages/SettingsSheet'
import { CreateSheet } from './pages/CreateSheet'
import { SearchSheet } from './pages/SearchSheet'
import { ActivitySheet } from './pages/ActivitySheet'
import { UserProfileSheet } from './pages/UserProfileSheet'
import { Toast } from './components/ui/Toast'

export default function App() {
  const store = useAppStore()
  const [tab, setTab] = useState<TabKey>('feed')
  const [chatId, setChatId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)

  const unreadActivity = useMemo(() => store.data?.notifications.filter(item => !item.read).length || 0, [store.data])
  const unreadChats = 0

  if (!store.authReady) return <BootScreen text="Opening LINK…" />
  if (!store.session) return <AuthPage />
  if (!store.data) return <BootScreen text={store.error || 'Syncing LINK…'} />

  const changeTab = (next: TabKey) => {
    if (next === 'create') { setCreateOpen(true); return }
    setTab(next)
  }
  const openProfile = (id: string) => {
    if (id === store.data?.me.id) setTab('profile')
    else setProfileId(id)
  }

  return <div className="relative min-h-[100dvh] bg-[var(--bg)] text-[var(--text)]">
    <AnimatePresence mode="wait" initial={false}>
      <motion.main key={tab} initial={{ opacity: 0, x: 7 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: .16 }}>
        {tab === 'feed' && <FeedPage onSearch={() => setSearchOpen(true)} onActivity={() => setActivityOpen(true)} onProfile={openProfile} onCreateMoment={() => setCreateOpen(true)} onCreateNote={() => setCreateOpen(true)} />}
        {tab === 'discover' && <DiscoverPage onProfile={openProfile} />}
        {tab === 'chats' && <ChatsPage onOpenChat={setChatId} />}
        {tab === 'profile' && <ProfilePage onSettings={() => setSettingsOpen(true)} onSearch={() => setSearchOpen(true)} onProfile={openProfile} />}
      </motion.main>
    </AnimatePresence>

    <BottomNav active={tab} onChange={changeTab} activityCount={unreadActivity} chatCount={unreadChats} />
    {chatId && <ChatPage chatId={chatId} onBack={() => setChatId(null)} onProfile={openProfile} />}
    <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} onOpenChat={setChatId} />
    <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} onEditProfile={() => { setSettingsOpen(false); setTab('profile') }} />
    <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} onProfile={openProfile} />
    <ActivitySheet open={activityOpen} onClose={() => setActivityOpen(false)} onProfile={openProfile} />
    <UserProfileSheet profileId={profileId} onClose={() => setProfileId(null)} onOpenChat={setChatId} />
    <Toast message={store.toast} />
  </div>
}

function BootScreen({ text }: { text: string }) {
  return <div className="safe-top flex min-h-[100dvh] items-center justify-center bg-[var(--bg)] px-6"><div className="text-center"><motion.div animate={{ scale: [1,1.05,1], opacity: [.75,1,.75] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[44px] font-black tracking-[-.075em]">LINK</motion.div><div className="mt-3 text-[13px] font-bold text-[var(--muted)]">{text}</div></div></div>
}
