import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <aside className="auth-story" aria-label="About Rekang">
        <a className="brand" href="/login" aria-label="Rekang home">rekang.</a>
        <div className="story-copy">
          <h2>Good finds, close to home.</h2>
          <p>Buy, sell and connect with students, faculty, vendors and residents in one trusted campus community.</p>
        </div>
        <div className="story-foot" aria-label="Product benefits">
          <span>Verified community</span>
          <span>Local collection</span>
          <span>Safer trading</span>
        </div>
      </aside>
      <main className="auth-main">
        <header className="auth-topbar">
          <a className="brand" href="/login" aria-label="Rekang home">rekang.</a>
          <a className="help-link" href="mailto:support@rekang.example">Need help?</a>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
