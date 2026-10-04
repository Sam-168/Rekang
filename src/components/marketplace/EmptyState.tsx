import type { ReactNode } from 'react'

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__mark" aria-hidden="true">—</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  )
}
