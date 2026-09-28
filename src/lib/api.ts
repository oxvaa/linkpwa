import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { decryptMessage, encryptMessage } from './crypto'
import { normalizeUsername, toMs } from './format'
import type { ChatSummary, Entitlements, Highlight, LinkRequest, Message, Moment, Note, NotificationItem, Post, Profile, UserSettings } from '../types'

const noThrow = async <T>(promise: PromiseLike<{ data: T; error: { message: string } | null }>, fallback: T): Promise<T> => {
  const { data, error } = await promise
  if (error) {
    console.warn('[LINK optional query]', error.message)
    return fallback
  }
  return data ?? fallback
}

export const mapProfile = (row: any): Profile => ({
  id: row.id,
  username: row.username || '@linkuser',
  name: row.name || 'LINK user',
  bio: row.bio || '',
  avatarUrl: row.avatar_url || null,
  coverUrl: row.cover_url || null,
  verified: Boolean(row.verified),
  verificationStyle: row.verification_style || 'blue',
  officialAffiliation: Boolean(row.official_affiliation),
  role: row.role || 'user',
  accountType: row.account_type || 'standard',
  status: row.status || 'Available',
  statusIcon: row.status_icon || 'checkmark-circle',
  statusColor: row.status_color || '#34C759',
  statusGradient: row.status_gradient || null,
  presenceMode: row.presence_mode || 'online',
  presenceVisible: row.presence_visible !== false,
  lastActiveAt: toMs(row.last_active_at),
  profileLayout: row.profile_layout || 'default',
  profileEffectId: row.profile_effect_id || null,
  nameEffectId: row.name_effect_id || null,
  profileAccent: row.profile_accent || '#7C5CFF',
  socials: row.socials || {},
})

const defaultSettings: UserSettings = {
  themeSetting: 'system',
  languageSetting: 'system',
  readReceipts: true,
  typingIndicators: true,
  showActivityStatus: true,
  showLastActive: true,
  profileViewsEnabled: true,
  notificationsMessages: true,
  notificationsRequests: true,
  notificationsMoments: true,
  notificationsProduct: false,
  doubleTapEmoji: '❤️',
}

export async function ensureProfile(session: Session) {
  const uid = session.user.id
  const current = await noThrow(supabase.from('profiles').select('*').eq('id', uid).maybeSingle(), null as any)
  if (current) return mapProfile(current)
  const meta = session.user.user_metadata || {}
  const username = normalizeUsername(meta.username || `user_${uid.replaceAll('-', '').slice(0, 8)}`)
  const name = String(meta.name || session.user.email?.split('@')[0] || 'LINK user').slice(0, 50)
  const { data, error } = await supabase.from('profiles').insert({ id: uid, username, name }).select('*').single()
  if (error) throw error
  return mapProfile(data)
}

export interface BootstrapData {
  me: Profile
  profiles: Record<string, Profile>
  settings: UserSettings
  entitlements: Entitlements
  posts: Post[]
  connectedIds: string[]
  requests: LinkRequest[]
  favorites: string[]
  blocked: string[]
  chats: ChatSummary[]
  messagesByChat: Record<string, Message[]>
  notes: Note[]
  moments: Moment[]
  highlights: Highlight[]
  notifications: NotificationItem[]
}

export async function bootstrap(session: Session): Promise<BootstrapData> {
  const uid = session.user.id
  const me = await ensureProfile(session)
  const [
    profileRows, settingsRow, entitlementRow, connectionRows, postRows, likeRows, bookmarkRows,
    favoriteRows, blockedRows, chatRows, memberRows, keyRows, messageRows, reactionRows, chatSettingRows,
    noteRows, momentRows, highlightRows, notificationRows,
  ] = await Promise.all([
    noThrow(supabase.from('profiles').select('*').order('name'), [] as any[]),
    noThrow(supabase.from('user_settings').select('*').eq('user_id', uid).maybeSingle(), null as any),
    noThrow(supabase.from('entitlements').select('*').eq('user_id', uid).maybeSingle(), null as any),
    noThrow(supabase.from('connections').select('*').or(`user_a.eq.${uid},user_b.eq.${uid}`).order('updated_at', { ascending: false }), [] as any[]),
    noThrow(supabase.from('profile_posts').select('*').order('created_at', { ascending: false }).limit(250), [] as any[]),
    noThrow(supabase.from('profile_post_likes').select('*').limit(5000), [] as any[]),
    noThrow(supabase.from('profile_post_bookmarks').select('*').eq('user_id', uid).limit(1500), [] as any[]),
    noThrow(supabase.from('favorites').select('*').eq('user_id', uid), [] as any[]),
    noThrow(supabase.from('blocked_users').select('*').eq('blocker_id', uid), [] as any[]),
    noThrow(supabase.from('chats').select('*').order('updated_at', { ascending: false }), [] as any[]),
    noThrow(supabase.from('chat_members').select('*'), [] as any[]),
    noThrow(supabase.from('chat_keys').select('*').eq('user_id', uid), [] as any[]),
    noThrow(supabase.rpc('recent_messages_for_my_chats', { p_per_chat: 60 }), [] as any[]),
    noThrow(supabase.from('message_reactions').select('*').limit(4000), [] as any[]),
    noThrow(supabase.from('chat_user_settings').select('*').eq('user_id', uid), [] as any[]),
    noThrow(supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(120), [] as any[]),
    noThrow(supabase.from('moments').select('*').eq('archived', false).order('created_at', { ascending: false }).limit(120), [] as any[]),
    noThrow(supabase.from('profile_highlights').select('*').order('created_at', { ascending: true }).limit(200), [] as any[]),
    noThrow(supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(120), [] as any[]),
  ])

  const profiles: Record<string, Profile> = {}
  for (const row of profileRows) profiles[row.id] = mapProfile(row)
  profiles[me.id] = { ...profiles[me.id], ...me }

  const now = Date.now()
  const plusUntil = toMs(entitlementRow?.plus_until)
  const proUntil = toMs(entitlementRow?.pro_until)
  const plan = proUntil && proUntil > now ? 'pro' : plusUntil && plusUntil > now ? 'plus' : 'free'
  profiles[uid].plan = plan
  const entitlements: Entitlements = {
    plusUntil,
    proUntil,
    coins: entitlementRow?.coins ?? 0,
    ownedEffects: entitlementRow?.owned_effects || [],
    plan,
  }

  const settings: UserSettings = settingsRow ? {
    themeSetting: settingsRow.theme_setting || 'system',
    languageSetting: settingsRow.language_setting || 'system',
    readReceipts: settingsRow.read_receipts !== false,
    typingIndicators: settingsRow.typing_indicators !== false,
    showActivityStatus: settingsRow.show_activity_status !== false,
    showLastActive: settingsRow.show_last_active !== false,
    profileViewsEnabled: settingsRow.profile_views_enabled !== false,
    notificationsMessages: settingsRow.notifications_messages !== false,
    notificationsRequests: settingsRow.notifications_requests !== false,
    notificationsMoments: settingsRow.notifications_moments !== false,
    notificationsProduct: Boolean(settingsRow.notifications_product),
    doubleTapEmoji: settingsRow.double_tap_emoji || '❤️',
  } : defaultSettings

  const likesByPost = new Map<string, string[]>()
  for (const row of likeRows) likesByPost.set(row.post_id, [...(likesByPost.get(row.post_id) || []), row.user_id])
  const bookmarks = new Set(bookmarkRows.map(row => row.post_id))
  const posts: Post[] = postRows.map(row => ({
    id: row.id,
    authorId: row.author_id,
    body: row.body || '',
    mediaPath: row.media_path || null,
    mediaType: row.media_type || null,
    createdAt: toMs(row.created_at) || now,
    updatedAt: toMs(row.updated_at),
    parentId: row.parent_id || null,
    repostOfId: row.repost_of_id || null,
    quoteOfId: row.quote_of_id || null,
    pinned: Boolean(row.pinned),
    likeCount: (likesByPost.get(row.id) || []).length,
    likedByMe: (likesByPost.get(row.id) || []).includes(uid),
    bookmarkedByMe: bookmarks.has(row.id),
  }))

  const connectedIds: string[] = []
  const requests: LinkRequest[] = []
  for (const row of connectionRows) {
    const other = row.user_a === uid ? row.user_b : row.user_a
    if (row.status === 'accepted') connectedIds.push(other)
    if (row.status === 'pending') {
      const toId = row.requested_by === row.user_a ? row.user_b : row.user_a
      requests.push({ id: row.id, fromId: row.requested_by, toId, status: row.status, createdAt: toMs(row.created_at) || now })
    }
  }

  const membersByChat: Record<string, any[]> = {}
  memberRows.forEach(row => (membersByChat[row.chat_id] ||= []).push(row))
  const keysByChat = new Map(keyRows.map(row => [row.chat_id, row.wrapped_key]))
  const chatSettings = new Map(chatSettingRows.map(row => [row.chat_id, row]))
  const chats: ChatSummary[] = chatRows.map(row => ({
    id: row.id,
    kind: row.kind,
    name: row.name || null,
    avatarUrl: row.avatar_url || null,
    createdBy: row.created_by,
    themeId: row.group_theme_id || row.theme_id || 'default',
    memberIds: (membersByChat[row.id] || []).map(member => member.user_id),
    memberRoles: Object.fromEntries((membersByChat[row.id] || []).map(member => [member.user_id, member.role || 'member'])),
    keyBase64: keysByChat.get(row.id) || null,
    archived: Boolean(chatSettings.get(row.id)?.archived),
    mutedUntil: toMs(chatSettings.get(row.id)?.muted_until),
  }))

  const reactions = new Map<string, string>()
  for (const row of reactionRows) if (!reactions.has(row.message_id)) reactions.set(row.message_id, row.emoji)
  const chatMap = new Map(chats.map(chat => [chat.id, chat]))
  const messagesByChat: Record<string, Message[]> = {}
  for (const row of messageRows) {
    const chat = chatMap.get(row.chat_id)
    if (!chat) continue
    let text = row.text_preview || 'Encrypted message'
    if (row.cipher && chat.keyBase64) {
      try {
        const body = await decryptMessage(row.cipher, chat.keyBase64)
        text = String(body.text || text)
      } catch {
        text = 'Unable to decrypt this message'
      }
    }
    const message: Message = {
      id: row.id,
      chatId: row.chat_id,
      senderId: row.sender_id,
      type: row.type || 'text',
      text,
      createdAt: toMs(row.created_at) || now,
      editedAt: toMs(row.edited_at),
      deletedAt: toMs(row.deleted_at),
      replyTo: row.reply_to || null,
      expiresAt: toMs(row.expires_at),
      viewOnce: Boolean(row.view_once),
      reaction: reactions.get(row.id) || null,
    }
    ;(messagesByChat[row.chat_id] ||= []).push(message)
  }
  chats.forEach(chat => { chat.lastMessage = messagesByChat[chat.id]?.at(-1) })

  const notes: Note[] = noteRows.filter(row => !row.expires_at || new Date(row.expires_at).getTime() > now).map(row => ({
    id: row.id, ownerId: row.owner_id, text: row.text || '', emoji: row.emoji || null,
    audience: row.audience || 'links', createdAt: toMs(row.created_at) || now, expiresAt: toMs(row.expires_at) || now + 86400000,
  }))
  const moments: Moment[] = momentRows.filter(row => !row.expires_at || new Date(row.expires_at).getTime() > now).map(row => ({
    id: row.id, ownerId: row.owner_id, imageUrl: row.image_url || null, caption: row.caption || '', emoji: row.emoji || null,
    createdAt: toMs(row.created_at) || now, expiresAt: toMs(row.expires_at) || now + 86400000,
  }))
  const highlights: Highlight[] = highlightRows.map(row => ({ id: row.id, ownerId: row.owner_id, momentId: row.moment_id, title: row.title || 'Highlight', coverEmoji: row.cover_emoji || null }))
  const notifications: NotificationItem[] = notificationRows.map(row => ({
    id: row.id, userId: row.user_id, actorId: row.actor_id || null, type: row.type || 'activity', title: row.title || 'LINK', body: row.body || '', read: Boolean(row.read),
    createdAt: toMs(row.created_at) || now, entityType: row.entity_type || null, entityId: row.entity_id || null,
  }))

  return {
    me: profiles[uid], profiles, settings, entitlements, posts,
    connectedIds: Array.from(new Set(connectedIds)), requests,
    favorites: favoriteRows.map(row => row.favorite_user_id), blocked: blockedRows.map(row => row.blocked_id),
    chats, messagesByChat, notes, moments, highlights, notifications,
  }
}

export const authApi = {
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, name: string, username: string) => supabase.auth.signUp({
    email, password,
    options: { data: { name: name.trim(), username: normalizeUsername(username).slice(1), language_setting: 'system' } },
  }),
  resetPassword: (email: string) => supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }),
  signOut: () => supabase.auth.signOut(),
}

export async function updateProfile(uid: string, patch: Partial<Profile>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name.trim()
  if (patch.username !== undefined) dbPatch.username = normalizeUsername(patch.username)
  if (patch.bio !== undefined) dbPatch.bio = patch.bio.trim()
  if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.statusColor !== undefined) dbPatch.status_color = patch.statusColor
  if (patch.presenceMode !== undefined) dbPatch.presence_mode = patch.presenceMode
  if (patch.profileLayout !== undefined) dbPatch.profile_layout = patch.profileLayout
  if (patch.profileAccent !== undefined) dbPatch.profile_accent = patch.profileAccent
  if (patch.socials !== undefined) dbPatch.socials = patch.socials
  const { error } = await supabase.from('profiles').update({ ...dbPatch, updated_at: new Date().toISOString() }).eq('id', uid)
  if (error) throw error
}

export async function updateUserSettings(uid: string, patch: Partial<UserSettings>) {
  const dbPatch: Record<string, unknown> = { user_id: uid, updated_at: new Date().toISOString() }
  if (patch.themeSetting !== undefined) dbPatch.theme_setting = patch.themeSetting
  if (patch.languageSetting !== undefined) dbPatch.language_setting = patch.languageSetting
  if (patch.readReceipts !== undefined) dbPatch.read_receipts = patch.readReceipts
  if (patch.typingIndicators !== undefined) dbPatch.typing_indicators = patch.typingIndicators
  if (patch.showActivityStatus !== undefined) dbPatch.show_activity_status = patch.showActivityStatus
  if (patch.showLastActive !== undefined) dbPatch.show_last_active = patch.showLastActive
  if (patch.profileViewsEnabled !== undefined) dbPatch.profile_views_enabled = patch.profileViewsEnabled
  if (patch.notificationsMessages !== undefined) dbPatch.notifications_messages = patch.notificationsMessages
  if (patch.notificationsRequests !== undefined) dbPatch.notifications_requests = patch.notificationsRequests
  if (patch.notificationsMoments !== undefined) dbPatch.notifications_moments = patch.notificationsMoments
  if (patch.notificationsProduct !== undefined) dbPatch.notifications_product = patch.notificationsProduct
  if (patch.doubleTapEmoji !== undefined) dbPatch.double_tap_emoji = patch.doubleTapEmoji
  const { error } = await supabase.from('user_settings').upsert(dbPatch, { onConflict: 'user_id' })
  if (error) throw error
}

export async function uploadAvatar(uid: string, file: File) {
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${uid}/avatar-${Date.now()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  await updateProfile(uid, { avatarUrl: data.publicUrl })
  return data.publicUrl
}

export async function createPost(uid: string, body: string, options: { parentId?: string | null; quoteOfId?: string | null } = {}) {
  const { error } = await supabase.from('profile_posts').insert({ author_id: uid, body: body.trim(), parent_id: options.parentId || null, quote_of_id: options.quoteOfId || null })
  if (error) throw error
}

export async function togglePostLike(uid: string, post: Post) {
  if (post.likedByMe) {
    const { error } = await supabase.from('profile_post_likes').delete().eq('post_id', post.id).eq('user_id', uid)
    if (error) throw error
  } else {
    const { error } = await supabase.from('profile_post_likes').insert({ post_id: post.id, user_id: uid })
    if (error) throw error
  }
}

export async function togglePostBookmark(uid: string, post: Post) {
  if (post.bookmarkedByMe) {
    const { error } = await supabase.from('profile_post_bookmarks').delete().eq('post_id', post.id).eq('user_id', uid)
    if (error) throw error
  } else {
    const { error } = await supabase.from('profile_post_bookmarks').insert({ post_id: post.id, user_id: uid })
    if (error) throw error
  }
}

export async function requestLink(otherUser: string) {
  const { error } = await supabase.rpc('request_link', { other_user: otherUser })
  if (error) throw error
}

export async function respondToLink(requestId: string, status: 'accepted' | 'declined') {
  const { error } = await supabase.from('connections').update({ status, updated_at: new Date().toISOString() }).eq('id', requestId)
  if (error) throw error
}

export async function removeLink(uid: string, otherId: string) {
  const { error } = await supabase.from('connections').delete().or(`and(user_a.eq.${uid},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${uid})`).eq('status', 'accepted')
  if (error) throw error
}

export async function toggleFavorite(uid: string, otherId: string, isFavorite: boolean) {
  if (isFavorite) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', uid).eq('favorite_user_id', otherId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('favorites').insert({ user_id: uid, favorite_user_id: otherId })
    if (error) throw error
  }
}

export async function toggleBlock(uid: string, otherId: string, isBlocked: boolean) {
  if (isBlocked) {
    const { error } = await supabase.from('blocked_users').delete().eq('blocker_id', uid).eq('blocked_id', otherId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('blocked_users').insert({ blocker_id: uid, blocked_id: otherId })
    if (error) throw error
  }
}

export async function createDirectChat(otherUser: string) {
  const { data, error } = await supabase.rpc('create_direct_chat', { other_user: otherUser })
  if (error) throw error
  return data as string
}

export async function createGroupChat(name: string, memberIds: string[]) {
  const { data, error } = await supabase.rpc('create_group_chat', { group_name: name.trim() || 'New Group', member_ids: memberIds })
  if (error) throw error
  return data as string
}

export async function sendEncryptedMessage(uid: string, chat: ChatSummary, text: string, replyTo?: string | null, expiresInSeconds?: number | null) {
  if (!chat.keyBase64) throw new Error('This chat has no encryption key on this device.')
  const cipher = await encryptMessage({ text: text.trim() }, chat.keyBase64)
  const expiresAt = expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000).toISOString() : null
  const { error } = await supabase.from('messages').insert({
    chat_id: chat.id,
    sender_id: uid,
    type: 'text',
    cipher,
    text_preview: 'Encrypted message',
    reply_to: replyTo || null,
    expires_at: expiresAt,
    client_nonce: crypto.randomUUID(),
  })
  if (error) throw error
}

export async function reactToMessage(uid: string, messageId: string, emoji: string) {
  const { error } = await supabase.from('message_reactions').upsert({ message_id: messageId, user_id: uid, emoji }, { onConflict: 'message_id,user_id' })
  if (error) throw error
}

export async function saveNote(uid: string, text: string, audience = 'links') {
  const { data: existing } = await supabase.from('notes').select('id').eq('owner_id', uid).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const expiresAt = new Date(Date.now() + 86400000).toISOString()
  if (existing?.id) {
    const { error } = await supabase.from('notes').update({ text: text.trim(), audience, expires_at: expiresAt }).eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('notes').insert({ owner_id: uid, text: text.trim(), audience, expires_at: expiresAt })
    if (error) throw error
  }
}

export async function saveLinkNow(uid: string, text: string, color: string) {
  const { error } = await supabase.from('link_now_statuses').upsert({
    user_id: uid,
    text: text.trim(),
    icon: 'sparkles',
    color,
    audience: 'links',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function markNotificationsRead(uid: string) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false)
  if (error) throw error
}
