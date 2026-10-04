import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bulletinService } from '../../lib/community'
import { bulletinCategories, type BulletinFilter, type BulletinPost } from '../../types/community'

const dateLabel = (date: string) => new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))

export function BulletinBoardPage() {
  const [posts, setPosts] = useState<BulletinPost[]>([])
  const [filter, setFilter] = useState<BulletinFilter>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    bulletinService.list().then((items) => { if (active) { setPosts(items); setLoading(false) } })
    return () => { active = false }
  }, [])

  const visiblePosts = useMemo(() => filter === 'All' ? posts : posts.filter((post) => post.category === filter), [filter, posts])

  return (
    <div className="bulletin-page">
      <section className="bulletin-hero">
        <div>
          <p className="eyebrow">Bellville campus</p>
          <h1>What’s happening.</h1>
          <p>Events, notices and study groups from people on your campus.</p>
        </div>
        <Link className="button button--primary" to="/community/new"><Plus size={17} /> Create post</Link>
      </section>

      <div className="bulletin-tabs" role="tablist" aria-label="Filter bulletin posts">
        {bulletinCategories.map((category) => (
          <button key={category} type="button" role="tab" aria-selected={filter === category} className={filter === category ? 'is-active' : ''} onClick={() => setFilter(category)}>{category}</button>
        ))}
      </div>

      <section className="bulletin-list" aria-live="polite">
        {loading ? <BulletinLoading /> : visiblePosts.length ? visiblePosts.map((post) => <BulletinRow key={post.id} post={post} />) : (
          <div className="community-empty"><h2>No posts here yet.</h2><p>Start the conversation with your campus.</p><Link className="button button--secondary" to="/community/new">Create the first post</Link></div>
        )}
      </section>
    </div>
  )
}

function BulletinRow({ post }: { post: BulletinPost }) {
  return (
    <Link className="bulletin-row" to={`/community/${post.id}`}>
      <div className="bulletin-row__meta"><span>{post.category}</span><small>{post.campus}</small></div>
      <div className="bulletin-row__copy">
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <small>By {post.author.name}</small>
      </div>
      <div className="bulletin-row__event">
        {post.eventDate ? <><strong><CalendarDays size={15} /> {dateLabel(post.eventDate)} · {post.eventTime}</strong><span><MapPin size={14} /> {post.location}</span></> : <span>Posted {new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short' }).format(new Date(post.createdAt))}</span>}
      </div>
      <ArrowRight className="bulletin-row__arrow" size={18} aria-hidden="true" />
    </Link>
  )
}

function BulletinLoading() {
  return <div className="bulletin-loading" aria-label="Loading posts">{[1, 2, 3].map((item) => <div key={item}><i /><span /><span /></div>)}</div>
}
