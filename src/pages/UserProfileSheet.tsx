import { Ban, MoreHorizontal } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { PostCard } from '../components/profile/PostCard'
import { useAppStore } from '../stores/app-store'

export function UserProfileSheet({ profileId, onClose, onOpenChat }: { profileId: string | null; onClose: () => void; onOpenChat: (chatId: string) => void }) {
  const { data, likePost, bookmarkPost, sendLinkRequest, unlink, favorite, block, openOrCreateDirect } = useAppStore()
  if (!data || !profileId) return null
  const profile = data.profiles[profileId]
  if (!profile) return null
  const connected = data.connectedIds.includes(profile.id)
  const isFavorite = data.favorites.includes(profile.id)
  const blocked = data.blocked.includes(profile.id)
  const posts = data.posts.filter(post => post.authorId === profile.id && !post.parentId)
  const highlights = data.highlights.filter(item => item.ownerId === profile.id)
  return <Sheet open title={profile.username} onClose={onClose} full>
    <div className="pb-8">
      <ProfileHeader profile={profile} postsCount={posts.length} linksCount={connected ? 1 : 0} highlights={highlights} connected={connected} favorite={isFavorite}
        onMessage={async () => { const chatId = await openOrCreateDirect(profile.id); onClose(); onOpenChat(chatId) }}
        onLink={() => void (connected ? unlink(profile.id) : sendLinkRequest(profile.id))}
        onFavorite={() => void favorite(profile.id)}
      />
      <div className="mt-7 flex gap-2 px-5"><button onClick={() => void block(profile.id)} className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-[15px] text-[14px] font-extrabold ${blocked ? 'bg-red-500 text-white' : 'bg-[var(--surface-soft)]'}`}><Ban size={17}/>{blocked ? 'Unblock' : 'Block'}</button><button className="grid h-11 w-12 place-items-center rounded-[15px] bg-[var(--surface-soft)]"><MoreHorizontal size={20}/></button></div>
      <div className="mt-7 border-t border-[var(--hairline)]">{posts.map(post => <PostCard key={post.id} post={post} author={profile} onLike={() => void likePost(post)} onBookmark={() => void bookmarkPost(post)} />)}</div>
    </div>
  </Sheet>
}
