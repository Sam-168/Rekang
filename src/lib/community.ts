import { supabase } from './supabase'
import type { AppNotification, BulletinCategory, BulletinPost } from '../types/community'

type PostRecord = {
  id: string
  author_id: string
  title: string
  body: string
  category: BulletinCategory
  campus: string
  event_date: string | null
  event_time: string | null
  location: string | null
  created_at: string
}

type ProfileRecord = { id: string; full_name: string; verified: boolean; campus: string }

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured for this environment.')
  return supabase
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

async function currentProfile() {
  const client = requireClient()
  const { data: auth, error: authError } = await client.auth.getUser()
  if (authError || !auth.user) throw new Error('Sign in again to continue.')
  const { data, error } = await client.from('profiles').select('id, full_name, verified, campus').eq('id', auth.user.id).single()
  if (error) throw new Error(error.message)
  return data as ProfileRecord
}

async function mapPosts(records: PostRecord[]) {
  if (!records.length) return []
  const client = requireClient()
  const { data, error } = await client.from('profiles').select('id, full_name, verified, campus').in('id', [...new Set(records.map((post) => post.author_id))])
  if (error) throw new Error(error.message)
  const authors = new Map((data as ProfileRecord[]).map((profile) => [profile.id, profile]))
  return records.flatMap<BulletinPost>((record) => {
    const author = authors.get(record.author_id)
    if (!author) return []
    return [{
      id: record.id,
      title: record.title,
      body: record.body,
      category: record.category,
      campus: record.campus,
      author: { id: author.id, name: author.full_name, initials: initials(author.full_name), verified: author.verified },
      createdAt: record.created_at,
      eventDate: record.event_date ?? undefined,
      eventTime: record.event_time?.slice(0, 5) ?? undefined,
      location: record.location ?? undefined,
    }]
  })
}

export const bulletinService = {
  async list() {
    const client = requireClient()
    const profile = await currentProfile()
    const { data, error } = await client.from('bulletin_posts').select('*').eq('campus', profile.campus).order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return mapPosts(data as PostRecord[])
  },

  async findById(id: string) {
    const client = requireClient()
    const { data, error } = await client.from('bulletin_posts').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return (await mapPosts([data as PostRecord]))[0] ?? null
  },

  async create(input: { title: string; body: string; category: BulletinCategory; eventDate?: string; eventTime?: string; location?: string }) {
    const client = requireClient()
    const profile = await currentProfile()
    if (!profile.verified) throw new Error('Verify your account before creating a community post.')
    const { data, error } = await client.from('bulletin_posts').insert({
      author_id: profile.id,
      title: input.title,
      body: input.body,
      category: input.category,
      campus: profile.campus,
      event_date: input.eventDate ?? null,
      event_time: input.eventTime ?? null,
      location: input.location ?? null,
    }).select('*').single()
    if (error) throw new Error(error.message)
    return (await mapPosts([data as PostRecord]))[0]
  },
}

function mapNotification(record: { id: string; title: string; message: string; href: string; created_at: string; read_at: string | null; type: AppNotification['type'] }): AppNotification {
  return { id: record.id, title: record.title, message: record.message, href: record.href, createdAt: record.created_at, read: Boolean(record.read_at), type: record.type }
}

export const notificationService = {
  async list() {
    const client = requireClient()
    const { data, error } = await client.from('notifications').select('id, title, message, href, created_at, read_at, type').order('created_at', { ascending: false }).limit(100)
    if (error) throw new Error(error.message)
    return data.map(mapNotification)
  },

  async markRead(id: string) {
    const client = requireClient()
    const { error } = await client.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).is('read_at', null)
    if (error) throw new Error(error.message)
  },

  async markAllRead() {
    const client = requireClient()
    const { error } = await client.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
    if (error) throw new Error(error.message)
  },

  subscribe(userId: string, reload: () => void) {
    const client = requireClient()
    const channel = client.channel(`notifications:${userId}`).on('postgres_changes', {
      event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}`,
    }, reload).subscribe()
    return () => { void client.removeChannel(channel) }
  },
}
