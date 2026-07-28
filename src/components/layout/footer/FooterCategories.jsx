import { Link } from 'react-router-dom'
import { useCategories } from '../../../hooks/useCategories'
import { buildPath } from '../../../routes/paths'
import FooterColumn from './FooterColumn'

function FooterCategories() {
  const { categories, loading } = useCategories()

  return (
    <FooterColumn title="Categorias">
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className="h-7 w-16 animate-pulse rounded-full bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={buildPath.category(category.slug)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </FooterColumn>
  )
}

export default FooterCategories
