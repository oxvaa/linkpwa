import { MessageSquareText, NotebookPen, Sparkles, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Sheet } from '../components/ui/Sheet'
import { Avatar } from '../components/ui/Avatar'
import { useAppStore } from '../stores/app-store'

export function CreateSheet({ open, onClose, onOpenChat }: { open: boolean; onClose: () => void; onOpenChat: (chatId: string) => void }) {
  const { data, addPost, setNote, setLinkNow, addGroup } = useAppStore()
  const [mode, setMode] = useState<'menu'|'post'|'note'|'now'|'group'>('menu')
  const [text, setText] = useState('')
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  if (!data) return null
  const close = () => { setMode('menu'); setText(''); setGroupName(''); setMembers([]); onClose() }
  const submit = async () => {
    setBusy(true)
    try {
      if (mode === 'post') await addPost(text)
      if (mode === 'note') await setNote(text)
      if (mode === 'now') await setLinkNow(text, data.me.profileAccent)
      if (mode === 'group') { const id = await addGroup(groupName, members); close(); onOpenChat(id); return }
      close()
    } finally { setBusy(false) }
  }
  return <Sheet open={open} title={mode === 'menu' ? 'Create' : mode === 'post' ? 'New post' : mode === 'note' ? 'New Note' : mode === 'now' ? 'LINK Now' : 'New group'} onClose={close}>
    {mode === 'menu' ? <div className="grid grid-cols-2 gap-3 pb-8 pt-2">
      <CreateButton icon={MessageSquareText} title="Post" subtitle="Share with your LINKs" onClick={() => setMode('post')} />
      <CreateButton icon={NotebookPen} title="Note" subtitle="Visible for 24 hours" onClick={() => setMode('note')} />
      <CreateButton icon={Sparkles} title="LINK Now" subtitle="Live status" onClick={() => setMode('now')} />
      <CreateButton icon={UsersRound} title="Group" subtitle="Encrypted group chat" onClick={() => setMode('group')} />
    </div> : mode === 'group' ? <div className="pb-7">
      <input className="mb-4 h-13 w-full rounded-[18px] border border-[var(--hairline)] bg-[var(--surface-solid)] px-4 outline-none" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name" />
      <div className="mb-3 text-[13px] font-extrabold text-[var(--muted)]">Select LINKs</div>
      <div className="max-h-[45dvh] overflow-y-auto rounded-[22px] border border-[var(--hairline)] bg-[var(--surface-solid)]">
        {data.connectedIds.map(id => { const p = data.profiles[id]; if (!p) return null; const selected = members.includes(id); return <button key={id} onClick={() => setMembers(cur => selected ? cur.filter(x => x !== id) : [...cur,id])} className="flex w-full items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 last:border-b-0"><Avatar profile={p} size={40} /><div className="min-w-0 flex-1 text-left"><div className="truncate font-extrabold">{p.name}</div><div className="text-[12px] text-[var(--muted)]">{p.username}</div></div><span className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? 'border-[var(--link-accent)] bg-[var(--link-accent)] text-white' : 'border-[var(--hairline)]'}`}>{selected ? '✓' : ''}</span></button> })}
      </div>
      <Submit busy={busy} disabled={!groupName.trim() || members.length === 0} onClick={submit}>Create group</Submit>
    </div> : <div className="pb-7">
      <div className="flex gap-3 rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-4"><Avatar profile={data.me} size={42} /><textarea autoFocus rows={7} value={text} onChange={e => setText(e.target.value)} className="min-h-[170px] flex-1 resize-none bg-transparent text-[17px] leading-6 outline-none" placeholder={mode === 'post' ? 'What’s happening on LINK?' : mode === 'note' ? 'Share a Note…' : 'What are you doing right now?'} /></div>
      <Submit busy={busy} disabled={!text.trim()} onClick={submit}>{mode === 'post' ? 'Post' : mode === 'note' ? 'Share Note' : 'Update LINK Now'}</Submit>
    </div>}
  </Sheet>
}

function CreateButton({ icon: Icon, title, subtitle, onClick }: any) { return <button onClick={onClick} className="rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-4 text-left"><div className="mb-6 grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--surface-soft)]"><Icon size={21}/></div><div className="text-[17px] font-black">{title}</div><div className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{subtitle}</div></button> }
function Submit({ children, onClick, disabled, busy }: any) { return <button disabled={disabled || busy} onClick={() => void onClick()} className="mt-4 h-13 w-full rounded-[18px] bg-[#0a84ff] text-[16px] font-black text-white disabled:opacity-35">{busy ? 'Working…' : children}</button> }
