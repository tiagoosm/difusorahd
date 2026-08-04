import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'
import SectionHeading from '../ui/SectionHeading'
import NewsCard from './NewsCard'

function FeaturedNews({ items }) {
  if (!items.length) return null

  const [main, ...secondary] = items

  return (
    <section className="flex flex-col gap-6">
      <SectionHeading eyebrow="Difusora HD" title="Destaques" size="lg" />

      <Link
        to={buildPath.news(main.slug)}
        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover md:flex-row"
      >
        <div className="aspect-video overflow-hidden bg-gray-100 md:aspect-auto md:w-3/5">
          <img
            src={main.cover_image_url}
            alt={main.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3.5 p-6 md:p-8 lg:p-10">
          {main.category?.name && <Badge>{main.category.name}</Badge>}
          <h2 className="text-2xl leading-tight font-semibold text-gray-900 md:text-3xl">
            {main.title}
          </h2>
          {main.excerpt && <p className="line-clamp-3 text-gray-500">{main.excerpt}</p>}
          <span className="text-xs text-gray-400">{formatDate(main.published_at)}</span>
        </div>
      </Link>

      {secondary.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {secondary.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedNews
