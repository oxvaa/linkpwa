import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import type { Post, Profile } from '../../types'
import { timeAgo } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { VerifiedBadge } from '../ui/VerifiedBadge'
import { MarkdownText } from '../ui/MarkdownText'

export function PostCard({
  post,
  author,
  referencedPost,
  referencedAuthor,
  onProfile,
  onLike,
  onBookmark,
  onReply,
  onRepost,
  onOpen,
  onOpenReferenced,
  replyCount = post.replyCount || 0,
  detail = false,
}: {
  post: Post
  author?: Profile
  referencedPost?: Post
  referencedAuthor?: Profile
  onProfile?: () => void
  onLike?: () => void
  onBookmark?: () => void
  onReply?: () => void
  onRepost?: () => void
  onOpen?: () => void
  onOpenReferenced?: () => void
  replyCount?: number
  detail?: boolean
}) {
  if (!author) return null
  const markdownEnabled = author.role === 'admin' || author.role === 'ceo'
  const stop = (fn?: () => void) => (event: MouseEvent) => { event.stopPropagation(); fn?.() }
  const share = async () => {
    const text = `${author.name} (${author.username})${post.body ? `\n\n${post.body}` : ''}`
    try {
      if (navigator.share) await navigator.share({ title: `LINK · ${author.name}`, text })
      else await navigator.clipboard?.writeText(text)
    } catch { /* user cancelled */ }
  }

  return <article
    onClick={onOpen}
    className={`${onOpen ? 'cursor-pointer active:bg-[var(--surface-soft)]' : ''} border-b border-[var(--hairline)] px-4 ${detail ? 'py-4' : 'py-3.5'} transition-colors`}
  >
    <div className="flex gap-2.5">
      <button onClick={stop(onProfile)} className="shrink-0"><Avatar profile={author} size={detail ? 42 : 40} /></button>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <button onClick={stop(onProfile)} className="max-w-[42%] truncate text-left text-[15px] font-[850] leading-none">{author.name}</button>
          <VerifiedBadge profile={author} size={15} />
          <span className="min-w-0 truncate text-[12.5px] text-[var(--muted)]">{author.username} · {timeAgo(post.createdAt)}</span>
          <button onClick={stop()} className="ml-auto grid h-7 w-7 shrink-0 place-items-center text-[var(--muted)]"><MoreHorizontal size={17} /></button>
        </div>

        {!!post.body && <div className={`${detail ? 'mt-2.5 text-[15.5px]' : 'mt-2 text-[15px]'} whitespace-pre-wrap leading-[1.42]`}>
          {markdownEnabled ? <MarkdownText text={post.body} /> : post.body}
        </div>}

        {post.mediaUrl && <img src={post.mediaUrl} alt="Post media" className="mt-3 max-h-[460px] w-full rounded-[18px] border border-[var(--hairline)] object-cover" />}

        {(referencedPost && referencedAuthor) && <button onClick={stop(onOpenReferenced || onOpen)} className="mt-3 w-full rounded-[17px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-3 text-left">
          <div className="flex items-center gap-2"><Avatar profile={referencedAuthor} size={24} /><span className="truncate text-[12.5px] font-extrabold">{referencedAuthor.name}</span><VerifiedBadge profile={referencedAuthor} size={12} /><span className="truncate text-[11.5px] text-[var(--muted)]">{referencedAuthor.username}</span></div>
          {referencedPost.body && <div className="mt-2 line-clamp-3 text-[13px] leading-[1.38] text-[var(--text)]">{referencedPost.body}</div>}
        </button>}

        <div className="mt-3 flex items-center justify-between pr-1 text-[var(--muted)]">
          <button onClick={stop(onReply)} className="flex min-w-10 items-center gap-1.5"><MessageCircle size={18} /><span className="text-[11.5px]">{replyCount || 'Reply'}</span></button>
          <button onClick={stop(onRepost)} className="flex min-w-9 items-center gap-1.5"><Repeat2 size={18} /><span className="text-[11.5px]">{(post.repostCount || 0) + (post.quoteCount || 0) || ''}</span></button>
          <motion.button whileTap={{ scale: .82 }} onClick={stop(onLike)} className={`flex min-w-9 items-center gap-1.5 ${post.likedByMe ? 'text-[#ff2d55]' : ''}`}><Heart size={18.5} fill={post.likedByMe ? 'currentColor' : 'none'} /><span className="text-[11.5px]">{post.likeCount || ''}</span></motion.button>
          <motion.button whileTap={{ scale: .86 }} onClick={stop(onBookmark)} className={post.bookmarkedByMe ? 'text-[var(--text)]' : ''}><Bookmark size={17.5} fill={post.bookmarkedByMe ? 'currentColor' : 'none'} /></motion.button>
          <button onClick={stop(() => void share())}><Send size={17.5} /></button>
        </div>
      </div>
    </div>
  </article>
}
