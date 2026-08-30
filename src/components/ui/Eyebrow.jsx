import { Link } from 'react-router-dom'

// Editorial "kicker": category label above a title, with a small bar
// marker instead of a pill — this is the pattern major news outlets use,
// and what sets a featured item/article apart from a dashboard card.
// Becomes a link to the category when `to` is passed (e.g. article page).
function Eyebrow({ children, to, tone = 'brand', className = '' }) {
  if (!children) return null

  const toneClass = tone === 'light' ? 'text-white' : 'text-brand-600'
  const barClass = tone === 'light' ? 'bg-white' : 'bg-brand-600'
  const content = (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] uppercase ${toneClass} ${className}`}>
      <span className={`h-2.5 w-0.5 rounded-full ${barClass}`} aria-hidden="true" />
      {children}
    </span>
  )

  if (!to) return content

  return (
    <Link to={to} className="w-fit transition-opacity hover:opacity-75">
      {content}
    </Link>
  )
}

export default Eyebrow
