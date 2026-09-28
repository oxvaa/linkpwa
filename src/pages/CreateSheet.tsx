import { ImagePlus, MessageSquareText, NotebookPen, Sparkles, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Sheet } from '../components/ui/Sheet'
import { Avatar } from '../components/ui/Avatar'
import { Markdown101 } from '../components/ui/MarkdownText'
import { useAppStore } from '../stores/app-store'

export type CreateMode = 'menu'|'post'|'moment'|'note'|'now'|'group'

export function CreateSheet({ open, onClose, onOpenChat, initialMode = 'menu' }: { open: boolean; onClose: () => void; onOpenChat: (chatId: string) => void; initialMode?: CreateMode }) {
  const { data, addPost, addMoment, setNote, setLinkNow, addGroup } = useAppStore()
  const [mode, setMode] = useState<CreateMode>(initialMode)
  const [text, setText] = useState('')
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [momentFile, setMomentFile] = useState<File | null>(null)
  const [momentPreview, setMomentPreview] = useState<string | null>(null)
  const [postFile, setPostFile] = useState<File | null>(null)
  const [postPreview, setPostPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  useEffect(() => () => { if (momentPreview) URL.revokeObjectURL(momentPreview) }, [momentPreview])
  useEffect(() => () => { if (postPreview) URL.revokeObjectURL(postPreview) }, [postPreview])

  if (!data) return null
  const markdownEnabled = data.me.role === 'admin' || data.me.role === 'ceo'
  const close = () => {
    if (momentPreview) URL.revokeObjectURL(momentPreview)
    if (postPreview) URL.revokeObjectURL(postPreview)
    setMode('menu'); setText(''); setGroupName(''); setMembers([]); setMomentFile(null); setMomentPreview(null); setPostFile(null); setPostPreview(null); onClose()
  }
  const chooseMoment = (file?: File) => {
    if (!file) return
    if (momentPreview) URL.revokeObjectURL(momentPreview)
    setMomentFile(file)
    setMomentPreview(URL.createObjectURL(file))
  }
  const choosePost = (file?: File) => {
    if (!file) return
    if (postPreview) URL.revokeObjectURL(postPreview)
    setPostFile(file)
    setPostPreview(URL.createObjectURL(file))
  }
  const submit = async () => {
    setBusy(true)
    try {
      if (mode === 'post') await addPost(text, undefined, undefined, postFile)
      if (mode === 'moment' && momentFile) await addMoment(momentFile, text)
      if (mode === 'note') await setNote(text)
      if (mode === 'now') await setLinkNow(text, data.me.profileAccent)
      if (mode === 'group') { const id = await addGroup(groupName, members); close(); onOpenChat(id); return }
      close()
    } finally { setBusy(false) }
  }

  const title = mode === 'menu' ? 'Create' : mode === 'post' ? 'New post' : mode === 'moment' ? 'New Moment' : mode === 'note' ? 'New Note' : mode === 'now' ? 'LINK Now' : 'New group'

  return <Sheet open={open} title={title} onClose={close}>
    {mode === 'menu' ? <div className="grid grid-cols-2 gap-2.5 pb-6 pt-1">
      <CreateButton icon={MessageSquareText} title="Post" subtitle="Share with your LINKs" onClick={() => setMode('post')} />
      <CreateButton icon={ImagePlus} title="Moment" subtitle="Photo · 24 hours" onClick={() => setMode('moment')} />
      <CreateButton icon={NotebookPen} title="Note" subtitle="Visible for 24 hours" onClick={() => setMode('note')} />
      <CreateButton icon={Sparkles} title="LINK Now" subtitle="Live status" onClick={() => setMode('now')} />
      <CreateButton icon={UsersRound} title="Group" subtitle="Encrypted group chat" onClick={() => setMode('group')} />
    </div> : mode === 'group' ? <div className="pb-6">
      <input className="mb-3 h-11 w-full rounded-[15px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3.5 outline-none" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name" />
      <div className="mb-2 text-[12px] font-extrabold text-[var(--muted)]">Select LINKs</div>
      <div className="max-h-[45dvh] overflow-y-auto rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-solid)]">
        {data.connectedIds.map(id => { const p = data.profiles[id]; if (!p) return null; const selected = members.includes(id); return <button key={id} onClick={() => setMembers(cur => selected ? cur.filter(x => x !== id) : [...cur,id])} className="flex w-full items-center gap-2.5 border-b border-[var(--hairline)] px-3.5 py-2.5 last:border-b-0"><Avatar profile={p} size={36} /><div className="min-w-0 flex-1 text-left"><div className="truncate text-[13px] font-extrabold">{p.name}</div><div className="text-[11px] text-[var(--muted)]">{p.username}</div></div><span className={`grid h-[22px] w-[22px] place-items-center rounded-full border text-[11px] ${selected ? 'border-[var(--link-accent)] bg-[var(--link-accent)] text-white' : 'border-[var(--hairline)]'}`}>{selected ? '✓' : ''}</span></button> })}
      </div>
      <Submit busy={busy} disabled={!groupName.trim() || members.length === 0} onClick={submit}>Create group</Submit>
    </div> : mode === 'moment' ? <div className="pb-6">
      <label className="block cursor-pointer overflow-hidden rounded-[20px] border border-dashed border-[var(--hairline)] bg-[var(--surface-solid)]">
        {momentPreview ? <img src={momentPreview} alt="Moment preview" className="max-h-[52dvh] min-h-[280px] w-full object-cover" /> : <div className="grid min-h-[280px] place-items-center px-6 text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-soft)]"><ImagePlus size={21}/></div><div className="mt-3 text-[14px] font-black">Choose a photo</div><div className="mt-1 text-[11px] text-[var(--muted)]">JPEG, PNG or WebP · disappears after 24h</div></div></div>}
        <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={event => chooseMoment(event.target.files?.[0])} />
      </label>
      <textarea rows={2} value={text} onChange={event => setText(event.target.value)} className="mt-2.5 min-h-[70px] w-full resize-none rounded-[16px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-3.5 py-3 text-[14px] leading-5 outline-none" placeholder="Add a caption…" />
      <Submit busy={busy} disabled={!momentFile} onClick={submit}>Share Moment</Submit>
    </div> : <div className="pb-6">
      <div className="flex gap-2.5 rounded-[19px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-3.5"><Avatar profile={data.me} size={36} /><textarea autoFocus rows={6} value={text} onChange={e => setText(e.target.value)} className="min-h-[135px] flex-1 resize-none bg-transparent text-[15px] leading-6 outline-none" placeholder={mode === 'post' ? 'What’s happening on LINK?' : mode === 'note' ? 'Share a Note…' : 'What are you doing right now?'} /></div>
      {mode === 'post' && postPreview && <div className="relative mt-2.5 overflow-hidden rounded-[17px] border border-[var(--hairline)]"><img src={postPreview} alt="Post preview" className="max-h-[42dvh] w-full object-cover"/><button type="button" onClick={() => { if (postPreview) URL.revokeObjectURL(postPreview); setPostFile(null); setPostPreview(null) }} className="absolute right-2 top-2 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-black text-white">Remove</button></div>}
      {mode === 'post' && <label className="mt-2.5 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[var(--surface-soft)] text-[11.5px] font-extrabold"><ImagePlus size={15}/> {postFile ? 'Change photo' : 'Add photo'}<input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => choosePost(event.target.files?.[0])}/></label>}
      {mode === 'post' && markdownEnabled && <details className="mt-2.5 rounded-[15px] bg-[var(--surface-soft)] px-3 py-2"><summary className="cursor-pointer text-[11.5px] font-extrabold text-[var(--muted)]">Markdown 101</summary><div className="mt-2"><Markdown101 /></div></details>}
      <Submit busy={busy} disabled={mode === 'post' ? (!text.trim() && !postFile) : !text.trim()} onClick={submit}>{mode === 'post' ? 'Post' : mode === 'note' ? 'Share Note' : 'Update LINK Now'}</Submit>
    </div>}
  </Sheet>
}

function CreateButton({ icon: Icon, title, subtitle, onClick }: any) { return <button onClick={onClick} className="rounded-[19px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-3.5 text-left"><div className="mb-4 grid h-[38px] w-[38px] place-items-center rounded-[12px] bg-[var(--surface-soft)]"><Icon size={18}/></div><div className="text-[15px] font-black">{title}</div><div className="mt-0.5 text-[11px] leading-[18px] text-[var(--muted)]">{subtitle}</div></button> }
function Submit({ children, onClick, disabled, busy }: any) { return <button disabled={disabled || busy} onClick={() => void onClick()} className="mt-3.5 h-11 w-full rounded-[15px] bg-[#0a84ff] text-[14px] font-black text-white disabled:opacity-35">{busy ? 'Working…' : children}</button> }
