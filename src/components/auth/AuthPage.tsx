import type { ReactNode } from 'react'

type AuthPageProps = {
  eyebrow?: string
  title: string
  intro?: string
  wide?: boolean
  children: ReactNode
}

export function AuthPage({ eyebrow, title, intro, wide, children }: AuthPageProps) {
  return (
    <section className={`auth-content${wide ? ' auth-content--wide' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {intro && <p className="page-intro">{intro}</p>}
      {children}
    </section>
  )
}

export function SignUpProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="progress" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((item) => (
        <span key={item} className={item < step ? 'is-complete' : item === step ? 'is-active' : ''} />
      ))}
    </div>
  )
}
