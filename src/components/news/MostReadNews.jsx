import { Link } from 'react-router-dom'
import { Flame, Eye } from 'lucide-react'
import { buildPath } from '../../routes/paths'
import { formatNumber } from '../../utils/formatNumber'

// Identidade própria (não é NewsCard nem a lista da FeaturedNews): card
// fechado com borda, numeração grande em destaque — o padrão clássico de
// "ranking" que diferencia esta seção do resto da Home, que já usa grade de
// cards (Últimas) e hero + lista simples (Destaques).
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-card lg:p-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Flame className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-gray-900">Mais Lidas</h2>
      </div>

      <ol className="flex flex-col divide-y divide-gray-100">
        {items.map((item, index) => (
          <li key={item.id} className="first:pt-0 last:pb-0">
            <Link to={buildPath.news(item.slug)} className="group flex items-center gap-3 py-3.5">
              <span className="w-7 shrink-0 text-2xl font-black tracking-tight text-gray-200 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-gray-900 group-hover:text-brand-600">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  {item.category?.name && (
                    <>
                      <span className="font-medium text-brand-600">{item.category.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <Eye className="h-3 w-3" />
                  {formatNumber(item.views_count)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default MostReadNews
