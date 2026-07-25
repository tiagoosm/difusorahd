function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
