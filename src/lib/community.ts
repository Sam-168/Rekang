import type { BulletinCategory, BulletinPost } from '../types/community'

const posts: BulletinPost[] = [
  {
    id: 'accounting-study-group', title: 'Accounting, together.', category: 'Study groups', campus: 'Bellville',
    body: 'Join a small study group for first-year accounting. Bring your notes, a calculator and any questions from this week’s lectures. We’ll work through the practice questions together. All first-year students are welcome.',
    author: { id: 'naledi', name: 'Naledi Mokoena', initials: 'NM', verified: true }, createdAt: '2026-10-04T10:20:00+02:00',
    eventDate: '2026-10-06', eventTime: '16:00', location: 'Library room 2',
  },
  {
    id: 'library-hours', title: 'Library hours this week.', category: 'Announcements', campus: 'Bellville',
    body: 'The library closes at 18:00 on Friday and will reopen at 09:00 on Saturday. Plan your study time and book collections accordingly.',
    author: { id: 'faculty-office', name: 'Faculty Office', initials: 'FO', verified: true }, createdAt: '2026-10-04T08:10:00+02:00',
  },
  {
    id: 'career-session', title: 'From campus to career.', category: 'Events', campus: 'Bellville',
    body: 'Meet local employers and alumni for a practical conversation about internships, graduate roles and preparing your first professional CV.',
    author: { id: 'career-centre', name: 'Career Centre', initials: 'CC', verified: true }, createdAt: '2026-10-03T14:00:00+02:00',
    eventDate: '2026-10-09', eventTime: '14:00', location: 'Student Centre hall',
  },
  {
    id: 'campus-cleanup', title: 'Campus clean-up morning.', category: 'Events', campus: 'Bellville',
    body: 'Help keep our shared campus clean. Gloves and bags will be provided. Meet outside the Student Centre.',
    author: { id: 'green-society', name: 'Green Society', initials: 'GS', verified: true }, createdAt: '2026-10-02T12:30:00+02:00',
    eventDate: '2026-10-10', eventTime: '09:00', location: 'Student Centre entrance',
  },
]

const wait = (milliseconds = 320) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export const bulletinService = {
  async list() { await wait(); return [...posts] },
  async findById(id: string) { await wait(180); return posts.find((post) => post.id === id) ?? null },
  async create(input: { title: string; body: string; category: BulletinCategory; eventDate?: string; eventTime?: string; location?: string }) {
    await wait(520)
    const post: BulletinPost = {
      ...input, id: `post-${Date.now()}`, campus: 'Bellville',
      author: { id: 'current-user', name: 'Current user', initials: 'CU', verified: true }, createdAt: new Date().toISOString(),
    }
    posts.unshift(post)
    return post
  },
}
