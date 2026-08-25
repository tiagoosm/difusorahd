import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Eyebrow from '../ui/Eyebrow'

function NewsCard({ news }) {
  return (
    <Link
      to={buildPath.news(news.slug)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="aspect-video overflow-hidden bg-ink-100">
        {/* Decorativa: o título vem logo abaixo no mesmo link. */}
        <img
          src={news.cover_image_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="text-base leading-snug font-semibold break-words text-ink-900 transition-colors group-hover:text-brand-700">
          {news.title}
        </h3>
        {news.excerpt && <p className="line-clamp-2 text-sm text-ink-500">{news.excerpt}</p>}
        <span className="mt-auto pt-3 text-xs text-ink-500">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default NewsCard
