import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
          error ? 'border-red-400' : 'border-ink-300 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})

export default Input
