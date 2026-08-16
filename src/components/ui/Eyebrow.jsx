import { Link } from 'react-router-dom'

// "Kicker" editorial: rótulo de categoria acima de um título, com uma
// marca (barrinha) em vez de pílula — é o padrão de grandes portais de
// notícia, e o que diferencia o destaque/artigo de um card de dashboard.
// Vira link para a categoria quando `to` é passado (ex: página da notícia).
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
