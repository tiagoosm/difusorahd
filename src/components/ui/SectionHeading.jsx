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
    <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        {eyebrow && (
          <span className="block text-xs font-semibold tracking-wider text-brand-600 uppercase">
            {eyebrow}
          </span>
        )}
        <h2 className={`font-semibold text-gray-900 ${TITLE_SIZE[size]}`}>{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="shrink-0 text-sm font-medium text-brand-600 hover:underline"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  )
}

export default SectionHeading
