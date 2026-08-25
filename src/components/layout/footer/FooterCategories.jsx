import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useCategories } from '../../../hooks/useCategories'
import { buildPath } from '../../../routes/paths'
import FooterColumn from './FooterColumn'

function CategoryPills({ categories, loading }) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-7 w-16 animate-pulse rounded-full bg-white/10" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={buildPath.category(category.slug)}
          className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85 transition-colors hover:border-white hover:bg-white hover:text-brand-700"
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}

function FooterCategories() {
  const { categories, loading } = useCategories()

  return (
    <>
      {/* Mobile: <details> nativo (sem JS) — 9 categorias em pills que
          quebram linha ocupam bastante altura; recolhido por padrão evita
          um footer gigantesco antes mesmo de chegar em redes sociais/contato.
          sm+: sempre aberto (versão normal abaixo), como antes. */}
      <details className="group sm:hidden">
        <summary className="mb-5 flex cursor-pointer list-none items-center justify-between text-xs font-semibold tracking-[0.15em] text-white/70 uppercase [&::-webkit-details-marker]:hidden">
          Categorias
          <ChevronDown className="h-4 w-4 shrink-0 text-white/50 transition-transform group-open:rotate-180" />
        </summary>
        <CategoryPills categories={categories} loading={loading} />
      </details>

      <div className="hidden sm:block">
        <FooterColumn title="Categorias">
          <CategoryPills categories={categories} loading={loading} />
        </FooterColumn>
      </div>
    </>
  )
}

export default FooterCategories
