import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../stores/app-store'

export function AuthPage() {
  const store = useAppStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setBusy(true); setError(''); setMessage('')
    try {
      if (mode === 'signin') await store.signIn(email, password)
      else {
        const result = await store.signUp(email, password, name, username)
        if (result === 'confirm-email') {
          setMessage('Account created. Confirm your e-mail, then sign in.')
          setMode('signin')
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not continue.')
    } finally { setBusy(false) }
  }

  const reset = async () => {
    if (!email.trim()) return setError('Enter your e-mail first.')
    setBusy(true); setError('')
    try { await store.resetPassword(email); setMessage('Password reset link sent.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send reset link.') }
    finally { setBusy(false) }
  }

  return <main className="safe-top flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] px-5 pb-[max(22px,env(safe-area-inset-bottom))]">
    <div className="pointer-events-none absolute -left-28 top-[-120px] h-[330px] w-[330px] rounded-full bg-[#7c5cff]/20 blur-[80px]" />
    <div className="pointer-events-none absolute -right-28 top-[180px] h-[300px] w-[300px] rounded-full bg-[#0a84ff]/15 blur-[90px]" />
    <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col">
      <div className="pt-8">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-[46px] font-black leading-none tracking-[-.075em]">LINK</motion.div>
        <div className="mt-2 flex items-center gap-2 text-[13px] font-bold text-[var(--muted)]"><Sparkles size={15} /> PWA 3.0 · ONE</div>
      </div>

      <div className="flex flex-1 items-center py-7">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }} className="w-full">
          <div className="mb-7">
            <h1 className="max-w-[340px] text-[36px] font-[900] leading-[.98] tracking-[-.055em]">Everything. One LINK.</h1>
            <p className="mt-3 max-w-[360px] text-[16px] leading-[1.45] text-[var(--muted)]">Sign in to your LINK account. Your profile, LINKs, posts and encrypted chats sync from LINK Production.</p>
          </div>

          <div className="rounded-[30px] border border-[var(--hairline)] bg-[var(--surface-solid)] p-2 link-shadow">
            <div className="grid grid-cols-2 gap-1 rounded-[22px] bg-[var(--surface-soft)] p-1">
              {(['signin','signup'] as const).map(key => <button key={key} onClick={() => { setMode(key); setError(''); setMessage('') }} className="relative h-11 rounded-[18px] text-[14px] font-[850]">
                {mode === key && <motion.span layoutId="auth-segment" className="absolute inset-0 rounded-[18px] bg-[var(--surface-solid)] shadow-sm" />}
                <span className="relative">{key === 'signin' ? 'Sign in' : 'Create account'}</span>
              </button>)}
            </div>

            <div className="px-2 pb-2 pt-4">
              <AnimatePresence initial={false} mode="popLayout">
                {mode === 'signup' && <motion.div key="signup-extra" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Field icon={UserRound} value={name} onChange={setName} placeholder="Name" autoComplete="name" />
                  <Field icon={UserRound} value={username} onChange={setUsername} placeholder="Username" autoComplete="username" prefix="@" />
                </motion.div>}
              </AnimatePresence>
              <Field icon={Mail} value={email} onChange={setEmail} placeholder="E-mail" type="email" autoComplete="email" />
              <div className="relative">
                <Field icon={LockKeyhole} value={password} onChange={setPassword} placeholder="Password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} rightSpace />
                <button onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--muted)]" aria-label="Show password">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
              </div>
              {error && <div className="mb-3 rounded-[16px] bg-red-500/10 px-3 py-2.5 text-[13px] font-semibold text-red-500">{error}</div>}
              {message && <div className="mb-3 rounded-[16px] bg-emerald-500/10 px-3 py-2.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">{message}</div>}
              <motion.button whileTap={{ scale: .985 }} disabled={busy || !email || !password || (mode === 'signup' && (!name || !username))} onClick={submit} className="flex h-13 w-full items-center justify-center gap-2 rounded-[18px] bg-[#111114] text-[16px] font-[850] text-white disabled:opacity-35 dark:bg-white dark:text-black">
                {busy ? 'Connecting…' : mode === 'signin' ? 'Continue to LINK' : 'Create LINK account'} {!busy && <ArrowRight size={19} />}
              </motion.button>
              {mode === 'signin' && <button onClick={reset} className="mt-3 w-full py-2 text-center text-[13px] font-bold text-[var(--muted)]">Forgot password?</button>}
            </div>
          </div>
        </motion.section>
      </div>
      <div className="text-center text-[11px] leading-5 text-[var(--muted)]">LINK uses Supabase Auth and the existing LINK Production backend.<br/>No demo or guest account is created.</div>
    </div>
  </main>
}

function Field({ icon: Icon, value, onChange, placeholder, type = 'text', autoComplete, prefix, rightSpace }: { icon: typeof Mail; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; prefix?: string; rightSpace?: boolean }) {
  return <label className="mb-3 flex h-13 items-center gap-2.5 rounded-[18px] border border-[var(--hairline)] bg-[var(--bg)] px-3 focus-within:border-[color-mix(in_srgb,var(--link-accent)_45%,var(--hairline))]">
    <Icon size={19} className="shrink-0 text-[var(--muted)]" />
    {prefix && <span className="text-[16px] font-bold text-[var(--muted)]">{prefix}</span>}
    <input className={`min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--muted)] ${rightSpace ? 'pr-10' : ''}`} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} type={type} autoComplete={autoComplete} autoCapitalize={type === 'email' || placeholder === 'Username' ? 'none' : undefined} />
  </label>
}
