import { Link } from 'react-router-dom'
import NewsCard from './NewsCard'

function CategorySection({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="text-sm font-medium text-brand-600 hover:underline">
            Ver todas
          </Link>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
