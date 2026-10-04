import { AlertCircle, Info } from 'lucide-react'
import type { ReactNode } from 'react'

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <div className={`notice${error ? ' notice--error' : ''}`} role={error ? 'alert' : 'status'}>
      {error ? <AlertCircle size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  )
}
