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
              className="h-7 w-16 animate-pulse rounded-full bg-white/10"
            />
          ))}
        </div>
      ) : (
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
      )}
    </FooterColumn>
  )
}

export default FooterCategories
