import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  authApi, bootstrap, createDirectChat, createGroupChat, createPost, markNotificationsRead, reactToMessage,
  removeLink, requestLink, respondToLink, saveLinkNow, saveNote, sendEncryptedMessage, toggleBlock,
  toggleFavorite, togglePostBookmark, togglePostLike, updateProfile, updateUserSettings, uploadAvatar,
  type BootstrapData,
} from '../lib/api'
import type { ChatSummary, Post, Profile, ThemeSetting, UserSettings } from '../types'

interface AppStoreValue {
  authReady: boolean
  session: Session | null
  data: BootstrapData | null
  loading: boolean
  syncing: boolean
  error: string | null
  toast: string | null
  refresh: (quiet?: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, username: string) => Promise<'signed-in' | 'confirm-email'>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  patchProfile: (patch: Partial<Profile>) => Promise<void>
  changeAvatar: (file: File) => Promise<void>
  patchSettings: (patch: Partial<UserSettings>) => Promise<void>
  addPost: (body: string, parentId?: string | null, quoteOfId?: string | null) => Promise<void>
  likePost: (post: Post) => Promise<void>
  bookmarkPost: (post: Post) => Promise<void>
  sendLinkRequest: (profileId: string) => Promise<void>
  answerLinkRequest: (requestId: string, status: 'accepted' | 'declined') => Promise<void>
  unlink: (profileId: string) => Promise<void>
  favorite: (profileId: string) => Promise<void>
  block: (profileId: string) => Promise<void>
  openOrCreateDirect: (profileId: string) => Promise<string>
  addGroup: (name: string, members: string[]) => Promise<string>
  sendMessage: (chat: ChatSummary, text: string, replyTo?: string | null, expiresInSeconds?: number | null) => Promise<void>
  reactMessage: (messageId: string, emoji: string) => Promise<void>
  setNote: (text: string, audience?: string) => Promise<void>
  setLinkNow: (text: string, color: string) => Promise<void>
  readActivity: () => Promise<void>
  notify: (message: string) => void
}

const AppStore = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [data, setData] = useState<BootstrapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const refreshTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)

  const notify = useCallback((message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const refresh = useCallback(async (quiet = false) => {
    if (!session) return
    if (quiet) setSyncing(true)
    else setLoading(true)
    try {
      const next = await bootstrap(session)
      setData(next)
      setError(null)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'LINK could not sync.'
      setError(message)
      if (!quiet) notify(message)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [session, notify])

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data: result }) => {
      if (!alive) return
      setSession(result.session)
      setAuthReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setAuthReady(true)
      if (!next) setData(null)
    })
    return () => {
      alive = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    void refresh()
  }, [session?.user.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session) return
    const schedule = () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current)
      refreshTimer.current = window.setTimeout(() => void refresh(true), 220)
    }
    const channel = supabase.channel(`link-pwa3:${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_posts' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_post_likes' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_members' }, schedule)
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [session?.user.id, refresh])

  useEffect(() => {
    const setting: ThemeSetting = data?.settings.themeSetting || 'system'
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = setting === 'dark' || (setting === 'system' && query.matches)
      document.documentElement.classList.toggle('dark', dark)
      const theme = dark ? '#09090b' : '#f5f5f7'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme)
    }
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [data?.settings.themeSetting])

  useEffect(() => {
    document.documentElement.style.setProperty('--link-accent', data?.me.profileAccent || '#7C5CFF')
  }, [data?.me.profileAccent])

  const requireUser = () => {
    const uid = session?.user.id
    if (!uid) throw new Error('Sign in to LINK first.')
    return uid
  }

  const value = useMemo<AppStoreValue>(() => ({
    authReady, session, data, loading, syncing, error, toast, refresh,
    notify,
    signIn: async (email, password) => {
      setError(null)
      const { error: authError } = await authApi.signIn(email.trim(), password)
      if (authError) throw authError
    },
    signUp: async (email, password, name, username) => {
      setError(null)
      const { data: result, error: authError } = await authApi.signUp(email.trim(), password, name, username)
      if (authError) throw authError
      return result.session ? 'signed-in' : 'confirm-email'
    },
    resetPassword: async email => {
      const { error: authError } = await authApi.resetPassword(email.trim())
      if (authError) throw authError
    },
    signOut: async () => {
      await authApi.signOut()
      setData(null)
    },
    patchProfile: async patch => {
      const uid = requireUser()
      await updateProfile(uid, patch)
      await refresh(true)
      notify('Profile updated')
    },
    changeAvatar: async file => {
      const uid = requireUser()
      await uploadAvatar(uid, file)
      await refresh(true)
      notify('Profile photo updated')
    },
    patchSettings: async patch => {
      const uid = requireUser()
      setData(current => current ? { ...current, settings: { ...current.settings, ...patch } } : current)
      await updateUserSettings(uid, patch)
      await refresh(true)
    },
    addPost: async (body, parentId, quoteOfId) => {
      const uid = requireUser()
      await createPost(uid, body, { parentId, quoteOfId })
      await refresh(true)
      notify('Posted to LINK')
    },
    likePost: async post => {
      const uid = requireUser()
      setData(current => current ? {
        ...current,
        posts: current.posts.map(item => item.id === post.id ? { ...item, likedByMe: !item.likedByMe, likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)) } : item),
      } : current)
      await togglePostLike(uid, post)
    },
    bookmarkPost: async post => {
      const uid = requireUser()
      setData(current => current ? { ...current, posts: current.posts.map(item => item.id === post.id ? { ...item, bookmarkedByMe: !item.bookmarkedByMe } : item) } : current)
      await togglePostBookmark(uid, post)
    },
    sendLinkRequest: async profileId => {
      await requestLink(profileId)
      await refresh(true)
      notify('LINK request sent')
    },
    answerLinkRequest: async (requestId, status) => {
      await respondToLink(requestId, status)
      await refresh(true)
    },
    unlink: async profileId => {
      const uid = requireUser()
      await removeLink(uid, profileId)
      await refresh(true)
      notify('LINK removed')
    },
    favorite: async profileId => {
      const uid = requireUser()
      const isFavorite = Boolean(data?.favorites.includes(profileId))
      await toggleFavorite(uid, profileId, isFavorite)
      await refresh(true)
    },
    block: async profileId => {
      const uid = requireUser()
      const isBlocked = Boolean(data?.blocked.includes(profileId))
      await toggleBlock(uid, profileId, isBlocked)
      await refresh(true)
      notify(isBlocked ? 'Account unblocked' : 'Account blocked')
    },
    openOrCreateDirect: async profileId => {
      const uid = requireUser()
      const existing = data?.chats.find(chat => chat.kind === 'direct' && chat.memberIds.includes(uid) && chat.memberIds.includes(profileId))
      if (existing) return existing.id
      const id = await createDirectChat(profileId)
      await refresh(true)
      return id
    },
    addGroup: async (name, members) => {
      const id = await createGroupChat(name, members)
      await refresh(true)
      notify('Group created')
      return id
    },
    sendMessage: async (chat, text, replyTo, expiresInSeconds) => {
      const uid = requireUser()
      await sendEncryptedMessage(uid, chat, text, replyTo, expiresInSeconds)
      await refresh(true)
    },
    reactMessage: async (messageId, emoji) => {
      const uid = requireUser()
      await reactToMessage(uid, messageId, emoji)
      await refresh(true)
    },
    setNote: async (text, audience = 'links') => {
      const uid = requireUser()
      await saveNote(uid, text, audience)
      await refresh(true)
      notify('Note updated')
    },
    setLinkNow: async (text, color) => {
      const uid = requireUser()
      await saveLinkNow(uid, text, color)
      await refresh(true)
      notify('LINK Now updated')
    },
    readActivity: async () => {
      const uid = requireUser()
      await markNotificationsRead(uid)
      await refresh(true)
    },
  }), [authReady, session, data, loading, syncing, error, toast, refresh, notify])

  return <AppStore.Provider value={value}>{children}</AppStore.Provider>
}

export function useAppStore() {
  const value = useContext(AppStore)
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider')
  return value
}
