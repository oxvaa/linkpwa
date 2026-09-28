import { ArrowUp, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { PostCard } from '../components/profile/PostCard'
import { Avatar } from '../components/ui/Avatar'
import { Markdown101 } from '../components/ui/MarkdownText'
import { Sheet } from '../components/ui/Sheet'
import { useAppStore } from '../stores/app-store'

export function PostDetailSheet({ postId, onClose, onProfile, onOpenPost }: { postId: string | null; onClose: () => void; onProfile: (id: string) => void; onOpenPost: (id: string) => void }) {
  const { data, addPost, likePost, bookmarkPost, repostPost, notify } = useAppStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  if (!data || !postId) return null

  const post = data.posts.find(item => item.id === postId)
  if (!post) return null
  const author = data.profiles[post.authorId]
  const replies = data.posts.filter(item => item.parentId === post.id).sort((a, b) => a.createdAt - b.createdAt)
  const refId = post.repostOfId || post.quoteOfId
  const referencedPost = refId ? data.posts.find(item => item.id === refId) : undefined
  const referencedAuthor = referencedPost ? data.profiles[referencedPost.authorId] : undefined
  const markdownEnabled = data.me.role === 'admin' || data.me.role === 'ceo'
  const openProfile = (id: string) => { onClose(); requestAnimationFrame(() => onProfile(id)) }

  const submit = async () => {
    const value = text.trim()
    if (!value || busy) return
    setBusy(true)
    try {
      await addPost(value, post.id)
      setText('')
      notify('Reply posted')
    } finally {
      setBusy(false)
    }
  }

  return <Sheet open title="Post" onClose={onClose} full>
    <div className="-mx-4 pb-2">
      <PostCard
        post={post}
        author={author}
        referencedPost={referencedPost}
        referencedAuthor={referencedAuthor}
        onProfile={() => openProfile(post.authorId)}
        onLike={() => void likePost(post)}
        onBookmark={() => void bookmarkPost(post)}
        onReply={() => document.getElementById('link-post-reply')?.focus()}
        onRepost={() => void repostPost(post)}
        onOpenReferenced={referencedPost ? () => onOpenPost(referencedPost.id) : undefined}
        replyCount={replies.length}
        detail
      />

      <div className="flex items-center gap-2 px-4 py-3 text-[12px] font-extrabold text-[var(--muted)]">
        <MessageCircle size={15} />
        <span>{replies.length ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : 'No replies yet'}</span>
      </div>

      <div className="border-t border-[var(--hairline)]">
        {replies.map(reply => {
          const replyAuthor = data.profiles[reply.authorId]
          const nestedCount = data.posts.filter(item => item.parentId === reply.id).length
          const nestedRefId = reply.repostOfId || reply.quoteOfId
          const nestedReferenced = nestedRefId ? data.posts.find(item => item.id === nestedRefId) : undefined
          return <PostCard
            key={reply.id}
            post={reply}
            author={replyAuthor}
            referencedPost={nestedReferenced}
            referencedAuthor={nestedReferenced ? data.profiles[nestedReferenced.authorId] : undefined}
            onProfile={() => openProfile(reply.authorId)}
            onLike={() => void likePost(reply)}
            onBookmark={() => void bookmarkPost(reply)}
            onRepost={() => void repostPost(reply)}
            onReply={() => onOpenPost(reply.id)}
            onOpen={() => onOpenPost(reply.id)}
            onOpenReferenced={nestedReferenced ? () => onOpenPost(nestedReferenced.id) : undefined}
            replyCount={nestedCount}
          />
        })}
      </div>

      <div className="sticky bottom-0 border-t border-[var(--hairline)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="flex items-end gap-2.5">
          <Avatar profile={data.me} size={32} />
          <div className="min-w-0 flex-1 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3.5 py-2">
            <textarea id="link-post-reply" rows={1} value={text} onChange={event => setText(event.target.value)} placeholder={`Reply to ${author?.name || 'post'}…`} className="max-h-28 min-h-6 w-full resize-none bg-transparent text-[15px] leading-6 outline-none" />
          </div>
          <button disabled={!text.trim() || busy} onClick={() => void submit()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0a84ff] text-white disabled:opacity-35"><ArrowUp size={19} strokeWidth={2.6} /></button>
        </div>
        {markdownEnabled && <details className="ml-[42px] mt-2 rounded-[14px] bg-[var(--surface-soft)] px-3 py-2"><summary className="cursor-pointer text-[11.5px] font-extrabold text-[var(--muted)]">Markdown 101</summary><div className="mt-2"><Markdown101 /></div></details>}
      </div>
    </div>
  </Sheet>
}
