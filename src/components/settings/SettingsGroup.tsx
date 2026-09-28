import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-5"><h3 className="mb-1.5 px-2.5 text-[13px] font-semibold text-[var(--muted)]">{title}</h3><div className="overflow-hidden rounded-[21px] border border-[var(--hairline)] bg-[var(--surface-solid)]">{children}</div></section>
}

export function SettingsRow({ icon: Icon, title, value, onClick, danger = false, children }: { icon: LucideIcon; title: string; value?: string; onClick?: () => void; danger?: boolean; children?: ReactNode }) {
  const content = <>
    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${danger ? 'bg-red-500/10 text-red-500' : 'bg-[var(--surface-soft)] text-[var(--text)]'}`}><Icon size={17} strokeWidth={2} /></div>
    <div className={`min-w-0 flex-1 text-[14.5px] ${danger ? 'text-red-500' : 'text-[var(--text)]'}`}>{title}</div>
    {children || (value && <div className="max-w-[46%] truncate text-[13.5px] text-[var(--muted)]">{value}</div>)}
    {onClick && <ChevronRight className="text-[var(--muted)]" size={16} />}
  </>
  return onClick ? <button onClick={onClick} className="flex min-h-[51px] w-full items-center gap-2.5 border-b border-[var(--hairline)] px-3.5 text-left last:border-b-0">{content}</button> : <div className="flex min-h-[51px] items-center gap-2.5 border-b border-[var(--hairline)] px-3.5 last:border-b-0">{content}</div>
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <button onClick={() => onChange(!checked)} className={`relative h-[27px] w-[45px] rounded-full p-[2px] transition ${checked ? 'bg-[#34c759]' : 'bg-[#d1d1d6] dark:bg-[#3a3a3c]'}`} aria-pressed={checked}><span className={`block h-[23px] w-[23px] rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`} /></button>
}
