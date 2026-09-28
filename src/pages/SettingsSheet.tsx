import { Bell, CircleUserRound, Globe2, Languages, LogOut, MessageCircle, Palette, RefreshCw, ShieldCheck, Smartphone, Sparkles, UserRound, Eye, CheckCheck } from 'lucide-react'
import { Sheet } from '../components/ui/Sheet'
import { SettingsGroup, SettingsRow, Toggle } from '../components/settings/SettingsGroup'
import { Avatar } from '../components/ui/Avatar'
import { useAppStore } from '../stores/app-store'

const accents = ['#7C5CFF', '#0A84FF', '#FF2D55', '#34C759', '#FF9F0A', '#00C7BE']

export function SettingsSheet({ open, onClose, onEditProfile }: { open: boolean; onClose: () => void; onEditProfile?: () => void }) {
  const { data, session, patchSettings, patchProfile, signOut, refresh, syncing } = useAppStore()
  if (!data) return null
  const s = data.settings
  const themeLabel = s.themeSetting === 'system' ? 'System' : s.themeSetting[0].toUpperCase() + s.themeSetting.slice(1)
  const nextTheme = () => patchSettings({ themeSetting: s.themeSetting === 'system' ? 'light' : s.themeSetting === 'light' ? 'dark' : 'system' })

  return <Sheet open={open} title="Settings" onClose={onClose} full>
    <div className="pb-6">
      <button onClick={onEditProfile} className="mb-7 flex w-full items-center gap-4 rounded-[28px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-4 text-left link-shadow">
        <Avatar profile={data.me} size={56} />
        <div className="min-w-0 flex-1"><div className="truncate text-[18px] font-[850]">{data.me.name}</div><div className="mt-1 truncate text-[13px] text-[var(--muted)]">{session?.user.email}</div></div>
        <span className="text-[24px] text-[var(--muted)]">›</span>
      </button>

      <SettingsGroup title="Account">
        <SettingsRow icon={CircleUserRound} title="E-mail" value={session?.user.email || ''} />
        <SettingsRow icon={Sparkles} title="Subscription" value={data.entitlements.plan === 'pro' ? 'LINK Pro' : data.entitlements.plan === 'plus' ? 'LINK Plus' : 'Free'} />
        <SettingsRow icon={RefreshCw} title={syncing ? 'Syncing…' : 'Sync with LINK'} value="Production" onClick={() => void refresh(true)} />
      </SettingsGroup>

      <SettingsGroup title="Theme">
        <SettingsRow icon={Smartphone} title="Appearance" value={themeLabel} onClick={() => void nextTheme()} />
        <SettingsRow icon={Palette} title="Accent color"><div className="flex gap-2">{accents.map(color => <button key={color} onClick={() => void patchProfile({ profileAccent: color })} className={`h-6 w-6 rounded-full border-2 ${data.me.profileAccent.toLowerCase() === color.toLowerCase() ? 'border-[var(--text)]' : 'border-transparent'}`} style={{ background: color }} aria-label={`Accent ${color}`} />)}</div></SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="App settings">
        <SettingsRow icon={Languages} title="Language" value={s.languageSetting === 'cs' ? 'Čeština' : s.languageSetting === 'en' ? 'English' : 'System'} onClick={() => void patchSettings({ languageSetting: s.languageSetting === 'system' ? 'cs' : s.languageSetting === 'cs' ? 'en' : 'system' })} />
        <SettingsRow icon={Bell} title="Message notifications"><Toggle checked={s.notificationsMessages} onChange={value => void patchSettings({ notificationsMessages: value })} /></SettingsRow>
        <SettingsRow icon={MessageCircle} title="LINK requests"><Toggle checked={s.notificationsRequests} onChange={value => void patchSettings({ notificationsRequests: value })} /></SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Privacy">
        <SettingsRow icon={Globe2} title="Activity status"><Toggle checked={s.showActivityStatus} onChange={value => void patchSettings({ showActivityStatus: value })} /></SettingsRow>
        <SettingsRow icon={CheckCheck} title="Read receipts"><Toggle checked={s.readReceipts} onChange={value => void patchSettings({ readReceipts: value })} /></SettingsRow>
        <SettingsRow icon={Eye} title="Profile views"><Toggle checked={s.profileViewsEnabled} onChange={value => void patchSettings({ profileViewsEnabled: value })} /></SettingsRow>
        <SettingsRow icon={ShieldCheck} title="Typing indicators"><Toggle checked={s.typingIndicators} onChange={value => void patchSettings({ typingIndicators: value })} /></SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="LINK">
        <SettingsRow icon={UserRound} title="Profile layout" value={data.me.profileLayout} onClick={() => void patchProfile({ profileLayout: data.me.profileLayout === 'default' ? 'social' : data.me.profileLayout === 'social' ? 'compact' : 'default' })} />
        <SettingsRow icon={Sparkles} title="Double Tap reaction" value={s.doubleTapEmoji} onClick={() => void patchSettings({ doubleTapEmoji: s.doubleTapEmoji === '❤️' ? '🔥' : s.doubleTapEmoji === '🔥' ? '😭' : '❤️' })} />
      </SettingsGroup>

      <SettingsGroup title="PWA">
        <SettingsRow icon={Smartphone} title="Install LINK" value="Add to Home Screen" onClick={() => alert('On iPhone: Safari → Share → Add to Home Screen.')} />
        <SettingsRow icon={LogOut} title="Sign out" value={session?.user.email || ''} danger onClick={() => void signOut()} />
      </SettingsGroup>

      <div className="px-4 pb-4 text-center text-[11px] leading-5 text-[var(--muted)]">LINK PWA 3.0 · React + Tailwind<br/>LINK Production · Supabase Realtime</div>
    </div>
  </Sheet>
}
