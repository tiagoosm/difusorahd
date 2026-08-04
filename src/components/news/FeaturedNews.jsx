import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'

function FeaturedNews({ items }) {
  if (!items.length) return null

  const [main, ...secondary] = items

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <Link
          to={buildPath.news(main.slug)}
          className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 shadow-card transition-shadow hover:shadow-card-hover lg:col-span-2"
        >
          <img
            src={main.cover_image_url}
            alt={main.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="relative flex flex-col gap-3 p-6 md:p-8 lg:p-10">
            {main.category?.name && <Badge>{main.category.name}</Badge>}
            <h2 className="text-2xl leading-tight font-semibold text-white md:text-3xl lg:text-4xl">
              {main.title}
            </h2>
            {main.excerpt && (
              <p className="line-clamp-2 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {main.excerpt}
              </p>
            )}
            <span className="text-xs text-white/60">{formatDate(main.published_at)}</span>
          </div>
        </Link>

        {secondary.length > 0 && (
          <div className="flex flex-col divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-card">
            {secondary.map((item) => (
              <FeaturedListItem key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedListItem({ news }) {
  return (
    <Link to={buildPath.news(news.slug)} className="group flex items-center gap-3.5 p-4">
      <div className="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <img
          src={news.cover_image_url}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {news.category?.name && (
          <span className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
            {news.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-gray-900 group-hover:text-brand-700">
          {news.title}
        </h3>
        <span className="text-xs text-gray-400">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default FeaturedNews
