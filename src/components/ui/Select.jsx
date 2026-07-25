import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  { label, error, id, className = '', children, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
          error ? 'border-red-400' : 'border-gray-300 focus:border-brand-500'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})

export default Select
