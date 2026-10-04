export const bulletinCategories = ['All', 'Events', 'Announcements', 'Study groups'] as const
export type BulletinFilter = (typeof bulletinCategories)[number]
export type BulletinCategory = Exclude<BulletinFilter, 'All'>

export type BulletinPost = {
  id: string
  title: string
  body: string
  category: BulletinCategory
  campus: string
  author: { id: string; name: string; initials: string; verified: boolean }
  createdAt: string
  eventDate?: string
  eventTime?: string
  location?: string
}

export type AppNotification = {
  id: string
  title: string
  message: string
  href: string
  createdAt: string
  read: boolean
  type: 'order' | 'review' | 'community' | 'account'
}
