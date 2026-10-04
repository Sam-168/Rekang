import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}

export function FormField({ label, hint, error, type = 'text', id, ...props }: FormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const messageId = `${inputId}-message`

  return (
    <div className={`field${isPassword ? ' field--password' : ''}`}>
      <label className="field__label" htmlFor={inputId}>{label}</label>
      <span className="field__control">
        <input
          {...props}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hint || error ? messageId : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="field__action"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {error ? <span id={messageId} className="field__error">{error}</span> : hint ? <span id={messageId} className="field__hint">{hint}</span> : null}
    </div>
  )
}
