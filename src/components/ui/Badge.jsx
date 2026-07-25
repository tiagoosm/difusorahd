const TONES = {
  brand: 'bg-brand-100 text-brand-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
}

function Badge({ children, tone = 'brand', className = '' }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
