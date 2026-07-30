import { Link } from 'react-router-dom'
import { buildPath } from '../../../routes/paths'

// Lista de categorias reutilizada tanto no dropdown desktop quanto no
// painel mobile — mesmo visual e comportamento em qualquer tela.
function CategoriesMenu({ categories, loading, onSelect }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!categories.length) {
    return <p className="px-3 py-2 text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={buildPath.category(category.slug)}
          onClick={onSelect}
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}

export default CategoriesMenu
