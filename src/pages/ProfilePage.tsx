import { Settings, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { IconButton } from '../components/ui/IconButton'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { PostCard } from '../components/profile/PostCard'
import { Sheet } from '../components/ui/Sheet'
import { useAppStore } from '../stores/app-store'

export function ProfilePage({ onSettings, onSearch, onProfile }: { onSettings: () => void; onSearch: () => void; onProfile: (id: string) => void }) {
  const { data, likePost, bookmarkPost } = useAppStore()
  const [editOpen, setEditOpen] = useState(false)
  const [tab, setTab] = useState<'posts'|'replies'|'media'|'likes'>('posts')
  if (!data) return null
  const mine = data.posts.filter(post => post.authorId === data.me.id)
  const list = tab === 'replies' ? mine.filter(post => post.parentId) : tab === 'media' ? mine.filter(post => post.mediaPath) : tab === 'likes' ? data.posts.filter(post => post.likedByMe) : mine.filter(post => !post.parentId)
  const highlights = data.highlights.filter(item => item.ownerId === data.me.id)

  return <div className="pb-32">
    <ScreenHeader title="Profile" subtitle="Your LINK" right={<><IconButton icon={Search} label="Search" onClick={onSearch} /><IconButton icon={Settings} label="Settings" onClick={onSettings} /></>} />
    <ProfileHeader profile={data.me} postsCount={mine.filter(post => !post.parentId).length} linksCount={data.connectedIds.length} highlights={highlights} self onEdit={() => setEditOpen(true)} onShare={() => navigator.share?.({ title: `LINK · ${data.me.name}`, text: `${data.me.name} ${data.me.username}` }).catch(() => {})} onPulse={() => {}} />
    <div className="mt-7 grid grid-cols-4 border-y border-[var(--hairline)]">
      {(['posts','replies','media','likes'] as const).map(key => <button key={key} onClick={() => setTab(key)} className={`relative h-13 text-[13px] font-[850] capitalize ${tab === key ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>{key}{tab === key && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[var(--text)]" />}</button>)}
    </div>
    <div>{list.map(post => <PostCard key={post.id} post={post} author={data.profiles[post.authorId]} onProfile={() => onProfile(post.authorId)} onLike={() => void likePost(post)} onBookmark={() => void bookmarkPost(post)} />)}</div>
    <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
  </div>
}

function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, patchProfile, changeAvatar } = useAppStore()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  if (!data) return null
  const sync = () => { setName(data.me.name); setUsername(data.me.username); setBio(data.me.bio); setStatus(data.me.status) }
  return <Sheet open={open} title="Edit profile" onClose={onClose} full>
    <div onLoad={sync} className="pb-8">
      <div className="flex flex-col items-center py-6">
        <label className="cursor-pointer text-center"><div className="mx-auto h-[92px] w-[92px] overflow-hidden rounded-full bg-[linear-gradient(145deg,var(--link-accent),#a78bfa)]">{data.me.avatarUrl ? <img src={data.me.avatarUrl} className="h-full w-full object-cover" alt="" /> : <div className="grid h-full place-items-center text-3xl font-black text-white">{data.me.name[0]}</div>}</div><span className="mt-3 block text-[14px] font-extrabold text-[#0a84ff]">Change profile photo</span><input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void changeAvatar(file) }} /></label>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-solid)]">
        <EditRow label="Name"><input value={name || data.me.name} onFocus={() => { if (!name) setName(data.me.name) }} onChange={event => setName(event.target.value)} /></EditRow>
        <EditRow label="Username"><input value={username || data.me.username} onFocus={() => { if (!username) setUsername(data.me.username) }} onChange={event => setUsername(event.target.value)} autoCapitalize="none" /></EditRow>
        <EditRow label="Bio" tall><textarea value={bio || data.me.bio} onFocus={() => { if (!bio) setBio(data.me.bio) }} onChange={event => setBio(event.target.value)} rows={3} /></EditRow>
        <EditRow label="Status"><input value={status || data.me.status} onFocus={() => { if (!status) setStatus(data.me.status) }} onChange={event => setStatus(event.target.value)} /></EditRow>
      </div>
      <button disabled={busy} onClick={async () => { setBusy(true); try { await patchProfile({ name: name || data.me.name, username: username || data.me.username, bio: bio || data.me.bio, status: status || data.me.status }); onClose() } finally { setBusy(false) } }} className="mt-5 h-13 w-full rounded-[18px] bg-[#0a84ff] text-[16px] font-black text-white disabled:opacity-50">{busy ? 'Saving…' : 'Done'}</button>
    </div>
  </Sheet>
}

function EditRow({ label, children, tall }: { label: string; children: ReactNode; tall?: boolean }) {
  return <label className={`flex gap-3 border-b border-[var(--hairline)] px-4 last:border-b-0 ${tall ? 'items-start py-3' : 'items-center min-h-[58px]'}`}><span className="w-[88px] shrink-0 text-[15px] font-semibold text-[var(--muted)]">{label}</span><div className="min-w-0 flex-1 [&_input]:w-full [&_input]:bg-transparent [&_input]:outline-none [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:bg-transparent [&_textarea]:outline-none">{children}</div></label>
}
