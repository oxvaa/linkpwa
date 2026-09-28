import { Bell, ExternalLink, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { IconButton } from '../components/ui/IconButton'
import { Avatar } from '../components/ui/Avatar'
import { MarkdownText } from '../components/ui/MarkdownText'
import { PostCard } from '../components/profile/PostCard'
import { useAppStore } from '../stores/app-store'
import { timeAgo } from '../lib/format'

export function FeedPage({ onSearch, onActivity, onProfile, onCreateMoment, onCreateNote, onOpenMoment, onOpenPost }: { onSearch: () => void; onActivity: () => void; onProfile: (id: string) => void; onCreateMoment: () => void; onCreateNote: () => void; onOpenMoment: (momentId: string) => void; onOpenPost: (postId: string) => void }) {
  const { data, likePost, bookmarkPost, repostPost } = useAppStore()
  if (!data) return null
  const unread = data.notifications.filter(item => !item.read).length
  const visiblePosts = data.posts.filter(post => !data.blocked.includes(post.authorId) && !post.parentId)
  const notes = data.notes.slice(0, 8)
  const momentsByOwner = Array.from(new Map(data.moments.map(moment => [moment.ownerId, moment])).values()).slice(0, 10)
  const postMap = new Map(data.posts.map(post => [post.id, post]))
  const pulse = data.linkNow.filter(item => data.profiles[item.userId] && !data.blocked.includes(item.userId)).slice(0, 12)
  const official = data.officialAnnouncements.slice(0, 3)

  return <div className="pb-28">
    <ScreenHeader title="LINK" subtitle="ONE · Live from LINK Production" right={<>
      <IconButton icon={Search} label="Search" onClick={onSearch} />
      <div className="relative"><IconButton icon={Bell} label="Activity" onClick={onActivity} />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full border-2 border-[var(--bg)] bg-red-500 px-1 text-[9px] font-black leading-[14px] text-white">{unread}</span>}</div>
    </>} />

    <section className="mb-1 overflow-hidden">
      <div className="hide-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1.5">
        <button onClick={onCreateMoment} className="w-[62px] shrink-0 text-center"><div className="relative mx-auto"><Avatar profile={data.me} size={52} /><span className="absolute bottom-0 right-0 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-[var(--bg)] bg-[#0a84ff] text-[12px] font-black text-white">+</span></div><div className="mt-1 truncate text-[10px] font-bold text-[var(--muted)]">Your moment</div></button>
        {momentsByOwner.filter(moment => moment.ownerId !== data.me.id).map(moment => {
          const profile = data.profiles[moment.ownerId]
          if (!profile) return null
          return <button key={moment.id} onClick={() => onOpenMoment(moment.id)} className="w-[62px] shrink-0 text-center"><div className="mx-auto rounded-full bg-[linear-gradient(135deg,#ff2d55,#ff9f0a,#7c5cff)] p-[2px]"><div className="rounded-full bg-[var(--bg)] p-[2px]"><Avatar profile={profile} size={46} showPresence={false} /></div></div><div className="mt-1 truncate text-[10px] font-bold">{profile.name}</div></button>
        })}
      </div>
    </section>

    {pulse.length > 0 && <section className="pb-1 pt-1">
      <div className="mb-1.5 flex items-center justify-between px-4"><div className="text-[12px] font-black">LINK Pulse</div><div className="text-[9.5px] font-bold text-[var(--muted)]">Right now</div></div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-1.5">{pulse.map(item => { const profile = data.profiles[item.userId]; return <button key={item.userId} onClick={() => onProfile(item.userId)} className="flex min-w-[180px] max-w-[220px] items-center gap-2 rounded-[17px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-2.5 py-2 text-left"><Avatar profile={profile} size={30}/><div className="min-w-0 flex-1"><div className="truncate text-[11.5px] font-extrabold">{item.userId === data.me.id ? 'You' : profile.name}</div><div className="truncate text-[11px] text-[var(--muted)]">{item.text}</div></div><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} /></button> })}</div>
    </section>}

    <section className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
      <button onClick={onCreateNote} className="flex min-w-[145px] items-center gap-2 rounded-[18px] border border-dashed border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-2.5 text-left"><div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles size={15} /></div><div><div className="text-[11.5px] font-extrabold">Add a Note</div><div className="text-[10px] text-[var(--muted)]">24 hours</div></div></button>
      {notes.map(note => {
        const profile = data.profiles[note.ownerId]
        if (!profile) return null
        return <button key={note.id} onClick={() => onProfile(note.ownerId)} className="min-w-[165px] rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3 py-2.5 text-left"><div className="flex items-center gap-2"><Avatar profile={profile} size={24} /><div className="truncate text-[11.5px] font-extrabold">{profile.name}</div></div><div className="mt-1.5 line-clamp-2 text-[12px] leading-[1.3]">{note.emoji ? `${note.emoji} ` : ''}{note.text}</div></button>
      })}
    </section>

    <div className="mt-2 border-t border-[var(--hairline)]">
      {official.map(item => <article key={item.id} className="border-b border-[var(--hairline)] px-4 py-3.5">
        <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#111114] text-[11px] font-black text-white">LINK</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="text-[14px] font-[850]">LINK Official</span><ShieldCheck size={14} className="text-[#f5b942]" /></div><div className="text-[10.5px] text-[var(--muted)]">Official · {timeAgo(item.createdAt)}</div></div></div>
        {item.title && item.title !== 'LINK Official' && <div className="mt-2.5 text-[15px] font-black"><MarkdownText text={item.title}/></div>}
        <div className="mt-1.5 text-[14px] leading-[1.42]"><MarkdownText text={item.body}/></div>
        {item.actionUrl && <a href={item.actionUrl} target="_blank" rel="noreferrer" className="mt-2.5 flex h-9 items-center justify-between rounded-[13px] bg-[var(--surface-soft)] px-3 text-[12px] font-extrabold"><span>{item.actionLabel || 'Open'}</span><ExternalLink size={14}/></a>}
      </article>)}

      {visiblePosts.length ? visiblePosts.map(post => {
        const refId = post.repostOfId || post.quoteOfId
        const referencedPost = refId ? postMap.get(refId) : undefined
        return <PostCard
          key={post.id}
          post={post}
          author={data.profiles[post.authorId]}
          referencedPost={referencedPost}
          referencedAuthor={referencedPost ? data.profiles[referencedPost.authorId] : undefined}
          onProfile={() => onProfile(post.authorId)}
          onLike={() => void likePost(post)}
          onBookmark={() => void bookmarkPost(post)}
          onReply={() => onOpenPost(post.id)}
          onRepost={() => void repostPost(post)}
          onOpen={() => onOpenPost(post.id)}
          onOpenReferenced={referencedPost ? () => onOpenPost(referencedPost.id) : undefined}
        />
      }) : official.length === 0 ? <EmptyFeed /> : null}
    </div>
  </div>
}

function EmptyFeed() {
  return <div className="px-7 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-soft)]"><Sparkles size={20} /></div><h2 className="mt-3 text-[18px] font-black">Your feed is ready</h2><p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">LINK people or create the first post.</p></div>
}
