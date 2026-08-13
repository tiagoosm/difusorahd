import { Link } from 'react-router-dom'
import { buildPath } from '../../../routes/paths'
import { formatDate } from '../../../utils/formatDate'
import { formatNumber } from '../../../utils/formatNumber'
import { TOP_NEWS_PERIODS } from '../../../hooks/useTopNews'
import Badge from '../../ui/Badge'
import EmptyState from '../../ui/EmptyState'

function TopNewsList({ news, period, onPeriodChange, loading }) {
  const total = news.reduce((sum, item) => sum + Number(item.views), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {TOP_NEWS_PERIODS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPeriodChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              period === option.value
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 w-full animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <EmptyState title="Nenhuma visualização de notícia neste período" />
      ) : (
        <ol className="flex flex-col divide-y divide-gray-100">
          {news.map((item, index) => (
            <li key={item.news_id} className="flex items-center gap-3 py-3">
              <span className="w-4 shrink-0 text-sm font-semibold text-gray-400">{index + 1}</span>

              {item.cover_image_url ? (
                <img
                  src={item.cover_image_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  to={buildPath.news(item.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-gray-900 hover:text-brand-600"
                >
                  {item.title}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {item.category_name && <Badge className="px-1.5 py-0.5 text-[10px]">{item.category_name}</Badge>}
                  <span>{formatDate(item.published_at)}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">{formatNumber(item.views)}</p>
                <p className="text-xs text-gray-400">{total > 0 ? ((item.views / total) * 100).toFixed(0) : 0}%</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default TopNewsList
