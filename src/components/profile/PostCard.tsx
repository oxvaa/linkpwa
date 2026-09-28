import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Post, Profile } from '../../types'
import { timeAgo } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { VerifiedBadge } from '../ui/VerifiedBadge'

export function PostCard({ post, author, onProfile, onLike, onBookmark, onReply }: { post: Post; author?: Profile; onProfile?: () => void; onLike?: () => void; onBookmark?: () => void; onReply?: () => void }) {
  if (!author) return null
  return <article className="border-b border-[var(--hairline)] px-5 py-4">
    <div className="flex gap-3">
      <button onClick={onProfile}><Avatar profile={author} size={45} /></button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button onClick={onProfile} className="truncate text-left text-[16px] font-[850]">{author.name}</button>
          <VerifiedBadge profile={author} size={16} />
          <span className="truncate text-[14px] text-[var(--muted)]">{author.username} · {timeAgo(post.createdAt)}</span>
          <button className="ml-auto text-[var(--muted)]"><MoreHorizontal size={19} /></button>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-[16px] leading-[1.42]">{post.body}</p>
        <div className="mt-3 flex items-center justify-between pr-2 text-[var(--muted)]">
          <button onClick={onReply} className="flex items-center gap-1.5"><MessageCircle size={19} /><span className="text-[12px]">Reply</span></button>
          <button className="flex items-center gap-1.5"><Repeat2 size={19} /></button>
          <motion.button whileTap={{ scale: .82 }} onClick={onLike} className={`flex items-center gap-1.5 ${post.likedByMe ? 'text-[#ff2d55]' : ''}`}><Heart size={20} fill={post.likedByMe ? 'currentColor' : 'none'} /><span className="text-[12px]">{post.likeCount || ''}</span></motion.button>
          <motion.button whileTap={{ scale: .86 }} onClick={onBookmark} className={post.bookmarkedByMe ? 'text-[var(--text)]' : ''}><Bookmark size={19} fill={post.bookmarkedByMe ? 'currentColor' : 'none'} /></motion.button>
        </div>
      </div>
    </div>
  </article>
}
