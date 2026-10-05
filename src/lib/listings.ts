import { supabase } from './supabase'
import type { Listing, ListingCategory, ListingFilters, Review, Seller } from '../types/marketplace'

type ProfileRecord = {
  id: string
  full_name: string
  verified: boolean
  role: Seller['role']
  campus: string
  avatar_path: string | null
}

type ImageRecord = { storage_path: string; position: number }

type ListingRecord = {
  id: string
  seller_id: string
  title: string
  description: string
  price: number | string
  category: ListingCategory
  campus: string
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'removed'
  condition: string
  created_at: string
  seller: ProfileRecord
  images: ImageRecord[] | null
}

export type ListingInput = Pick<Listing, 'title' | 'description' | 'price' | 'category' | 'campus' | 'condition'>
export type SellerProfileData = { seller: Seller; listings: Listing[]; reviews: Review[] }

const listingSelection = `
  id, seller_id, title, description, price, category, campus, status, condition, created_at,
  seller:profiles!listings_seller_id_fkey(id, full_name, verified, role, campus, avatar_path),
  images:listing_images(storage_path, position)
`

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured for this environment.')
  return supabase
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function publicUrl(bucket: 'listing-images' | 'avatars', path: string | null) {
  if (!path || !supabase) return null
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

function postedLabel(createdAt: string) {
  const elapsed = Date.now() - new Date(createdAt).getTime()
  const days = Math.max(0, Math.floor(elapsed / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
}

function sellerFromProfile(profile: ProfileRecord, ratings: number[] = []): Seller {
  const rating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0
  return {
    id: profile.id,
    name: profile.full_name,
    initials: initials(profile.full_name),
    verified: profile.verified,
    role: profile.role,
    campus: profile.campus,
    avatarUrl: publicUrl('avatars', profile.avatar_path),
    rating: Number(rating.toFixed(1)),
    reviews: ratings.length,
  }
}

function listingFromRecord(record: ListingRecord, ratings: number[] = []): Listing {
  const images = [...(record.images ?? [])].sort((a, b) => a.position - b.position)
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    price: Number(record.price),
    category: record.category,
    campus: record.campus,
    seller: sellerFromProfile(record.seller, ratings),
    imageIndex: 0,
    imageUrl: publicUrl('listing-images', images[0]?.storage_path ?? null),
    imagePaths: images.map((image) => image.storage_path),
    status: record.status === 'sold' ? 'sold' : 'available',
    condition: record.condition,
    postedLabel: postedLabel(record.created_at),
  }
}

async function ratingsBySeller(sellerIds: string[]) {
  if (sellerIds.length === 0) return new Map<string, number[]>()
  const client = requireClient()
  const { data, error } = await client.from('reviews').select('seller_id, rating').in('seller_id', [...new Set(sellerIds)])
  if (error) throw error
  const result = new Map<string, number[]>()
  for (const row of data ?? []) result.set(row.seller_id, [...(result.get(row.seller_id) ?? []), row.rating])
  return result
}

async function mapRecords(records: ListingRecord[]) {
  const ratings = await ratingsBySeller(records.map((record) => record.seller_id))
  return records.map((record) => listingFromRecord(record, ratings.get(record.seller_id)))
}

function readableError(error: { message: string }) {
  if (error.message.includes('row-level security')) return 'Your account does not have permission to make that change.'
  if (error.message.includes('duplicate key')) return 'That item already exists.'
  return error.message
}

async function uploadListingImages(userId: string, listingId: string, files: File[]) {
  const client = requireClient()
  const uploaded: ImageRecord[] = []
  try {
    for (const [position, file] of files.entries()) {
      const extension = file.name.split('.').pop()?.toLowerCase() || (file.type === 'image/png' ? 'png' : 'jpg')
      const path = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`
      const { error } = await client.storage.from('listing-images').upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      uploaded.push({ storage_path: path, position })
    }
    return uploaded
  } catch (error) {
    if (uploaded.length) await client.storage.from('listing-images').remove(uploaded.map((image) => image.storage_path))
    throw error
  }
}

// Kept only for the still-local order screens until the orders batch is connected.
const demoSeller = (id: string, name: string, rating: number, reviews: number): Seller => ({
  id, name, initials: initials(name), verified: true, role: 'student', campus: 'Bellville', avatarUrl: null, rating, reviews,
})
export const listings: Listing[] = [
  { id: 'textbooks', title: 'Second-hand textbooks', price: 280, category: 'Books', campus: 'Bellville', imageIndex: 0, imageUrl: null, imagePaths: [], description: 'Three first-year textbooks in good condition.', seller: demoSeller('naledi', 'Naledi Mokoena', 4.8, 12), status: 'available', condition: 'Good condition', postedLabel: '2 days ago' },
  { id: 'headphones', title: 'Wireless headphones', price: 650, category: 'Electronics', campus: 'Bellville', imageIndex: 1, imageUrl: null, imagePaths: [], description: 'Comfortable wireless headphones with charging cable.', seller: demoSeller('naledi', 'Naledi Mokoena', 4.8, 12), status: 'available', condition: 'Like new', postedLabel: 'Today' },
  { id: 'desk-lamp', title: 'Study desk lamp', price: 180, category: 'Home', campus: 'Bellville', imageIndex: 2, imageUrl: null, imagePaths: [], description: 'Compact desk lamp with adjustable shade.', seller: demoSeller('aisha', 'Aisha Jacobs', 4.6, 8), status: 'available', condition: 'Good condition', postedLabel: 'Yesterday' },
]

export const listingService = {
  async search(filters: ListingFilters) {
    const client = requireClient()
    let query = client.from('listings').select(listingSelection)
      .eq('status', 'available')
      .eq('campus', filters.campus)
      .gte('price', filters.minPrice)
      .lte('price', filters.maxPrice)
      .order('created_at', { ascending: false })
    if (filters.category !== 'All') query = query.eq('category', filters.category)
    const { data, error } = await query
    if (error) throw new Error(readableError(error))
    const text = filters.query.trim().toLocaleLowerCase()
    const records = (data as unknown as ListingRecord[]).filter((record) => !text || `${record.title} ${record.description} ${record.category}`.toLocaleLowerCase().includes(text))
    return mapRecords(records)
  },

  async findById(id: string) {
    const client = requireClient()
    const { data, error } = await client.from('listings').select(listingSelection).eq('id', id).maybeSingle()
    if (error) throw new Error(readableError(error))
    if (!data) return null
    const [listing] = await mapRecords([data as unknown as ListingRecord])
    return listing
  },

  async findByIds(ids: string[]) {
    if (ids.length === 0) return []
    const client = requireClient()
    const { data, error } = await client.from('listings').select(listingSelection).in('id', ids)
    if (error) throw new Error(readableError(error))
    return mapRecords(data as unknown as ListingRecord[])
  },

  async save(input: ListingInput, files: File[], id?: string) {
    const client = requireClient()
    const { data: authData, error: authError } = await client.auth.getUser()
    if (authError || !authData.user) throw new Error('Sign in again before saving this listing.')
    const payload = {
      title: input.title.trim(), description: input.description.trim(), price: input.price,
      category: input.category, campus: input.campus, condition: input.condition, status: 'available' as const,
    }
    let listingId = id
    if (listingId) {
      const { data, error } = await client.from('listings').update(payload).eq('id', listingId).select('id').single()
      if (error) throw new Error(readableError(error))
      listingId = data.id
    } else {
      const { data, error } = await client.from('listings').insert({ ...payload, seller_id: authData.user.id }).select('id').single()
      if (error) throw new Error(readableError(error))
      listingId = data.id
    }
    if (!listingId) throw new Error('The listing could not be saved.')
    const savedListingId = listingId

    if (files.length) {
      const newImages = await uploadListingImages(authData.user.id, savedListingId, files)
      const { data: oldRows, error: oldError } = await client.from('listing_images').select('storage_path').eq('listing_id', savedListingId)
      if (oldError) throw new Error(readableError(oldError))
      const { error: deleteError } = await client.from('listing_images').delete().eq('listing_id', savedListingId)
      if (deleteError) throw new Error(readableError(deleteError))
      const { error: insertError } = await client.from('listing_images').insert(newImages.map((image) => ({ ...image, listing_id: savedListingId, alt_text: input.title.trim() })))
      if (insertError) throw new Error(readableError(insertError))
      const oldPaths = (oldRows ?? []).map((row) => row.storage_path)
      if (oldPaths.length) await client.storage.from('listing-images').remove(oldPaths)
    }
    return savedListingId
  },

  async findSeller(id: string): Promise<SellerProfileData | null> {
    const client = requireClient()
    const [{ data: profile, error: profileError }, { data: reviewRows, error: reviewError }, { data: listingRows, error: listingError }] = await Promise.all([
      client.from('profiles').select('id, full_name, verified, role, campus, avatar_path').eq('id', id).maybeSingle(),
      client.from('reviews').select('id, order_id, seller_id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name)').eq('seller_id', id).order('created_at', { ascending: false }),
      client.from('listings').select(listingSelection).eq('seller_id', id).eq('status', 'available').order('created_at', { ascending: false }),
    ])
    if (profileError || reviewError || listingError) throw new Error(readableError(profileError ?? reviewError ?? listingError!))
    if (!profile) return null
    const reviews: Review[] = (reviewRows ?? []).map((row) => ({
      id: row.id, orderId: row.order_id, sellerId: row.seller_id,
      reviewerName: (row.reviewer as unknown as { full_name: string } | null)?.full_name ?? 'Rekang member',
      rating: row.rating, comment: row.comment, createdAt: row.created_at,
    }))
    const seller = sellerFromProfile(profile as ProfileRecord, reviews.map((review) => review.rating))
    const sellerListings = (listingRows as unknown as ListingRecord[]).map((record) => listingFromRecord(record, reviews.map((review) => review.rating)))
    return { seller, listings: sellerListings, reviews }
  },
}

export const cartService = {
  async list(userId: string) {
    const client = requireClient()
    const { data, error } = await client.from('cart_items').select('listing_id, quantity').eq('user_id', userId).order('created_at')
    if (error) throw new Error(readableError(error))
    const lines = (data ?? []).map((row) => ({ listingId: row.listing_id, quantity: row.quantity }))
    const liveListings = await listingService.findByIds(lines.map((line) => line.listingId))
    const available = new Set(liveListings.map((listing) => listing.id))
    return { lines: lines.filter((line) => available.has(line.listingId)), listings: liveListings }
  },
  async add(userId: string, listingId: string) {
    const client = requireClient()
    const { error } = await client.from('cart_items').upsert({ user_id: userId, listing_id: listingId, quantity: 1 }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })
    if (error) throw new Error(readableError(error))
  },
  async setQuantity(userId: string, listingId: string, quantity: number) {
    const client = requireClient()
    const { error } = await client.from('cart_items').update({ quantity }).eq('user_id', userId).eq('listing_id', listingId)
    if (error) throw new Error(readableError(error))
  },
  async remove(userId: string, listingId: string) {
    const client = requireClient()
    const { error } = await client.from('cart_items').delete().eq('user_id', userId).eq('listing_id', listingId)
    if (error) throw new Error(readableError(error))
  },
  async clear(userId: string) {
    const client = requireClient()
    const { error } = await client.from('cart_items').delete().eq('user_id', userId)
    if (error) throw new Error(readableError(error))
  },
}
