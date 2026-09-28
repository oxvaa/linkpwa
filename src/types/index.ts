export type Plan = 'free' | 'plus' | 'pro'
export type ThemeSetting = 'system' | 'light' | 'dark'
export type TabKey = 'feed' | 'discover' | 'create' | 'chats' | 'profile'

export interface Profile {
  id: string
  username: string
  name: string
  bio: string
  avatarUrl: string | null
  coverUrl: string | null
  verified: boolean
  verificationStyle: 'blue' | 'gold' | 'green'
  officialAffiliation: boolean
  role: 'user' | 'moderator' | 'admin' | 'ceo'
  accountType: 'standard' | 'artist'
  status: string
  statusIcon: string
  statusColor: string
  statusGradient: string | null
  presenceMode: 'online' | 'dnd' | 'busy' | 'ghost'
  presenceVisible: boolean
  lastActiveAt: number | null
  profileLayout: string
  profileEffectId: string | null
  nameEffectId: string | null
  profileAccent: string
  socials: Record<string, unknown>
  plan?: Plan
}

export interface UserSettings {
  themeSetting: ThemeSetting
  languageSetting: 'system' | 'cs' | 'en'
  readReceipts: boolean
  typingIndicators: boolean
  showActivityStatus: boolean
  showLastActive: boolean
  profileViewsEnabled: boolean
  notificationsMessages: boolean
  notificationsRequests: boolean
  notificationsMoments: boolean
  notificationsProduct: boolean
  doubleTapEmoji: string
}

export interface Entitlements {
  plusUntil: number | null
  proUntil: number | null
  coins: number
  ownedEffects: string[]
  plan: Plan
}

export interface Post {
  id: string
  authorId: string
  body: string
  mediaPath: string | null
  mediaType: string | null
  createdAt: number
  updatedAt: number | null
  parentId: string | null
  repostOfId: string | null
  quoteOfId: string | null
  pinned: boolean
  likeCount: number
  likedByMe: boolean
  bookmarkedByMe: boolean
}

export interface LinkRequest {
  id: string
  fromId: string
  toId: string
  status: string
  createdAt: number
}

export interface ChatSummary {
  id: string
  kind: 'direct' | 'group'
  name: string | null
  avatarUrl: string | null
  createdBy: string
  themeId: string
  memberIds: string[]
  memberRoles: Record<string, string>
  keyBase64: string | null
  archived: boolean
  mutedUntil: number | null
  lastMessage?: Message
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  type: string
  text: string
  createdAt: number
  editedAt: number | null
  deletedAt: number | null
  replyTo: string | null
  expiresAt: number | null
  viewOnce: boolean
  reaction?: string | null
}

export interface Note {
  id: string
  ownerId: string
  text: string
  emoji: string | null
  audience: string
  createdAt: number
  expiresAt: number
}

export interface Moment {
  id: string
  ownerId: string
  imageUrl: string | null
  caption: string
  emoji: string | null
  createdAt: number
  expiresAt: number
}

export interface Highlight {
  id: string
  ownerId: string
  momentId: string
  title: string
  coverEmoji: string | null
}

export interface NotificationItem {
  id: string
  userId: string
  actorId: string | null
  type: string
  title: string
  body: string
  read: boolean
  createdAt: number
  entityType: string | null
  entityId: string | null
}
