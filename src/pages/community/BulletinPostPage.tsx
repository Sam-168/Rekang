import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { bulletinService } from '../../lib/community'
import type { BulletinPost } from '../../types/community'

export function BulletinPostPage() {
  const { postId = '' } = useParams()
  const [post, setPost] = useState<BulletinPost | null | undefined>()

  useEffect(() => {
    let active = true
    bulletinService.findById(postId).then((item) => { if (active) setPost(item) }).catch(() => { if (active) setPost(null) })
    return () => { active = false }
  }, [postId])

  if (post === undefined) return <div className="community-detail community-detail--loading" aria-label="Loading post"><i /><i /><i /></div>
  if (post === null) return <div className="community-empty community-empty--page"><h1>Post not found.</h1><p>This bulletin post may have been removed.</p><Link className="button button--primary" to="/community">Back to community</Link></div>

  const date = new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${post.eventDate ?? post.createdAt.slice(0, 10)}T12:00:00`))
  return (
    <article className="community-detail">
      <Link className="back-link" to="/community"><ArrowLeft size={17} /> Community</Link>
      <header>
        <span className="bulletin-category">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="community-detail__campus">{post.campus} campus</p>
      </header>
      {post.eventDate && <section className="event-panel" aria-label="Event details">
        <div><CalendarDays size={19} /><span><small>When</small><strong>{date} at {post.eventTime}</strong></span></div>
        <div><MapPin size={19} /><span><small>Where</small><strong>{post.location}</strong></span></div>
      </section>}
      <div className="community-detail__body"><p>{post.body}</p></div>
      <footer className="post-author">
        <span className="author-avatar">{post.author.initials}</span>
        <div><strong>{post.author.name} {post.author.verified && <CheckCircle2 size={14} aria-label="Verified" />}</strong><small>Posted {new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'long' }).format(new Date(post.createdAt))}</small></div>
      </footer>
    </article>
  )
}
