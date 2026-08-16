import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Eyebrow from '../ui/Eyebrow'

function NewsCard({ news }) {
  return (
    <Link
      to={buildPath.news(news.slug)}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="aspect-video overflow-hidden bg-ink-100">
        <img
          src={news.cover_image_url}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
          {news.title}
        </h3>
        {news.excerpt && <p className="line-clamp-2 text-sm text-ink-500">{news.excerpt}</p>}
        <span className="mt-auto pt-3 text-xs text-ink-400">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default NewsCard
