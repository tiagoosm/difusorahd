import { Link } from 'react-router-dom'
import { Tag } from 'lucide-react'
import { buildPath } from '../../../routes/paths'

// Lista de categorias reutilizada tanto no dropdown desktop (layout="grid")
// quanto no painel mobile (layout="list").
function CategoriesMenu({ categories, loading, onSelect, layout = 'list' }) {
  const containerClassName = layout === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'flex flex-col gap-1'

  if (loading) {
    return (
      <div className={containerClassName}>
        {Array.from({ length: layout === 'grid' ? 6 : 4 }).map((_, index) => (
          <span key={index} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!categories.length) {
    return <p className="px-3 py-2 text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
  }

  return (
    <div className={containerClassName} role={layout === 'grid' ? 'menu' : undefined}>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={buildPath.category(category.slug)}
          role={layout === 'grid' ? 'menuitem' : undefined}
          onClick={onSelect}
          className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <Tag className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-brand-600" />
          <span className="truncate">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}

export default CategoriesMenu
