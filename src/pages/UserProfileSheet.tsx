import { Ban, MoreHorizontal } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { PostCard } from '../components/profile/PostCard'
import { useAppStore } from '../stores/app-store'

export function UserProfileSheet({ profileId, onClose, onOpenChat, onOpenPost }: { profileId: string | null; onClose: () => void; onOpenChat: (chatId: string) => void; onOpenPost: (postId: string) => void }) {
  const { data, likePost, bookmarkPost, repostPost, sendLinkRequest, unlink, favorite, block, openOrCreateDirect } = useAppStore()
  if (!data || !profileId) return null
  const profile = data.profiles[profileId]
  if (!profile) return null
  const connected = data.connectedIds.includes(profile.id)
  const isFavorite = data.favorites.includes(profile.id)
  const blocked = data.blocked.includes(profile.id)
  const posts = data.posts.filter(post => post.authorId === profile.id && !post.parentId)
  const highlights = data.highlights.filter(item => item.ownerId === profile.id)
  const postMap = new Map(data.posts.map(post => [post.id, post]))
  return <Sheet open title={profile.username} onClose={onClose} full>
    <div className="pb-7">
      <ProfileHeader profile={profile} postsCount={posts.length} linksCount={connected ? 1 : 0} highlights={highlights} connected={connected} favorite={isFavorite}
        onMessage={async () => { const chatId = await openOrCreateDirect(profile.id); onClose(); onOpenChat(chatId) }}
        onLink={() => void (connected ? unlink(profile.id) : sendLinkRequest(profile.id))}
        onFavorite={() => void favorite(profile.id)}
      />
      <div className="mt-5 flex gap-2 px-4"><button onClick={() => void block(profile.id)} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-[14px] text-[12.5px] font-extrabold ${blocked ? 'bg-red-500 text-white' : 'bg-[var(--surface-soft)]'}`}><Ban size={16}/>{blocked ? 'Unblock' : 'Block'}</button><button className="grid h-10 w-11 place-items-center rounded-[14px] bg-[var(--surface-soft)]"><MoreHorizontal size={18}/></button></div>
      <div className="mt-5 border-t border-[var(--hairline)]">{posts.map(post => {
        const refId = post.repostOfId || post.quoteOfId
        const referenced = refId ? postMap.get(refId) : undefined
        return <PostCard
          key={post.id}
          post={post}
          author={profile}
          referencedPost={referenced}
          referencedAuthor={referenced ? data.profiles[referenced.authorId] : undefined}
          onLike={() => void likePost(post)}
          onBookmark={() => void bookmarkPost(post)}
          onRepost={() => void repostPost(post)}
          onReply={() => onOpenPost(post.id)}
          onOpen={() => onOpenPost(post.id)}
          onOpenReferenced={referenced ? () => onOpenPost(referenced.id) : undefined}
        />
      })}</div>
    </div>
  </Sheet>
}
