import { Link } from 'react-router-dom'

const TITLE_SIZE = {
  md: 'text-xl sm:text-2xl',
  lg: 'text-2xl sm:text-3xl',
}

// Cabeçalho padrão de seção (Destaques, Últimas notícias, Relacionadas...),
// reutilizado em vez de cada seção montar seu próprio título — dá consistência
// de hierarquia (mesmo peso/divisor) em qualquer lugar do site.
function SectionHeading({ eyebrow, title, description, viewAllHref, viewAllLabel = 'Ver todas', size = 'md' }) {
  return (
    <div className="flex flex-col gap-1 border-b-2 border-ink-900 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        {eyebrow && (
          <span className="block text-xs font-semibold tracking-wider text-brand-600 uppercase">
            {eyebrow}
          </span>
        )}
        <h2 className={`font-bold tracking-tight text-ink-900 ${TITLE_SIZE[size]}`}>{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="group flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {viewAllLabel}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </div>
  )
}

export default SectionHeading
