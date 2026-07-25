import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'

function FeaturedNews({ items }) {
  if (!items.length) return null

  const [main, ...rest] = items

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Link
        to={buildPath.news(main.slug)}
        className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover lg:col-span-2"
      >
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={main.cover_image_url}
            alt={main.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-2 p-5">
          {main.category?.name && <Badge>{main.category.name}</Badge>}
          <h2 className="text-2xl font-semibold leading-tight text-gray-900">{main.title}</h2>
          {main.excerpt && <p className="text-gray-500">{main.excerpt}</p>}
          <span className="text-xs text-gray-400">{formatDate(main.published_at)}</span>
        </div>
      </Link>

      {rest.length > 0 && (
        <div className="flex flex-col gap-4">
          {rest.map((item) => (
            <Link
              key={item.id}
              to={buildPath.news(item.slug)}
              className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1">
                {item.category?.name && <Badge>{item.category.name}</Badge>}
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedNews
