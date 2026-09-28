export const initials = (name = 'LINK') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'L'
export const timeAgo = (value: number) => {
  const diff = Math.max(0, Date.now() - value)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / 1440)}d`
}
export const clock = (value: number) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(value)
export const toMs = (value: string | null | undefined) => value ? new Date(value).getTime() : null
export const normalizeUsername = (value: string) => `@${value.trim().replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '')}`
