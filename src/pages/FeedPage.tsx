import { Bell, Search, Sparkles } from 'lucide-react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { IconButton } from '../components/ui/IconButton'
import { Avatar } from '../components/ui/Avatar'
import { PostCard } from '../components/profile/PostCard'
import { useAppStore } from '../stores/app-store'

export function FeedPage({ onSearch, onActivity, onProfile, onCreateMoment, onCreateNote }: { onSearch: () => void; onActivity: () => void; onProfile: (id: string) => void; onCreateMoment: () => void; onCreateNote: () => void }) {
  const { data, likePost, bookmarkPost } = useAppStore()
  if (!data) return null
  const unread = data.notifications.filter(item => !item.read).length
  const visiblePosts = data.posts.filter(post => !data.blocked.includes(post.authorId) && !post.parentId)
  const notes = data.notes.slice(0, 8)
  const momentsByOwner = Array.from(new Map(data.moments.map(moment => [moment.ownerId, moment])).values()).slice(0, 10)

  return <div className="pb-32">
    <ScreenHeader title="LINK" subtitle="ONE · Live from LINK Production" right={<>
      <IconButton icon={Search} label="Search" onClick={onSearch} />
      <div className="relative"><IconButton icon={Bell} label="Activity" onClick={onActivity} />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-[var(--bg)] bg-red-500 px-1 text-[10px] font-black leading-4 text-white">{unread}</span>}</div>
    </>} />

    <section className="mb-2 overflow-hidden">
      <div className="hide-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
        <button onClick={onCreateMoment} className="w-[72px] shrink-0 text-center"><div className="relative mx-auto"><Avatar profile={data.me} size={62} /><span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full border-2 border-[var(--bg)] bg-[#0a84ff] text-[14px] font-black text-white">+</span></div><div className="mt-1.5 truncate text-[11px] font-bold text-[var(--muted)]">Your moment</div></button>
        {momentsByOwner.filter(moment => moment.ownerId !== data.me.id).map(moment => {
          const profile = data.profiles[moment.ownerId]
          if (!profile) return null
          return <button key={moment.id} onClick={() => onProfile(moment.ownerId)} className="w-[72px] shrink-0 text-center"><div className="mx-auto rounded-full bg-[linear-gradient(135deg,#ff2d55,#ff9f0a,#7c5cff)] p-[2px]"><div className="rounded-full bg-[var(--bg)] p-[2px]"><Avatar profile={profile} size={56} showPresence={false} /></div></div><div className="mt-1.5 truncate text-[11px] font-bold">{profile.name}</div></button>
        })}
      </div>
    </section>

    <section className="hide-scrollbar flex gap-2.5 overflow-x-auto px-5 py-2">
      <button onClick={onCreateNote} className="flex min-w-[168px] items-center gap-2 rounded-[22px] border border-dashed border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-3 text-left"><div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles size={17} /></div><div><div className="text-[12px] font-extrabold">Add a Note</div><div className="text-[11px] text-[var(--muted)]">24 hours</div></div></button>
      {notes.map(note => {
        const profile = data.profiles[note.ownerId]
        if (!profile) return null
        return <button key={note.id} onClick={() => onProfile(note.ownerId)} className="min-w-[190px] rounded-[22px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-3 text-left"><div className="flex items-center gap-2"><Avatar profile={profile} size={28} /><div className="truncate text-[12px] font-extrabold">{profile.name}</div></div><div className="mt-2 line-clamp-2 text-[13px] leading-[1.3]">{note.emoji ? `${note.emoji} ` : ''}{note.text}</div></button>
      })}
    </section>

    <div className="mt-3 border-t border-[var(--hairline)]">
      {visiblePosts.length ? visiblePosts.map(post => <PostCard key={post.id} post={post} author={data.profiles[post.authorId]} onProfile={() => onProfile(post.authorId)} onLike={() => void likePost(post)} onBookmark={() => void bookmarkPost(post)} />) : <EmptyFeed />}
    </div>
  </div>
}

function EmptyFeed() {
  return <div className="px-7 py-20 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles /></div><h2 className="mt-4 text-[20px] font-black">Your feed is ready</h2><p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">LINK people or create the first post. Demo accounts are not used in PWA 3.0.</p></div>
}
