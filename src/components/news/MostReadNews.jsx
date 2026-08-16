import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { buildPath } from '../../routes/paths'

// Identidade própria (não é NewsCard nem NewsRow): numeração grande em
// destaque sobre uma faixa de cor da marca — o padrão clássico de "ranking"
// que dá peso visual a esta seção, reforçando que é uma parte importante do
// portal e não uma lista secundária qualquer.
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card">
      <div className="flex items-center gap-2 bg-ink-900 px-5 py-4">
        <TrendingUp className="h-4 w-4 text-brand-400" />
        <h2 className="text-sm font-bold tracking-wide text-white uppercase">Mais Lidas da Semana</h2>
      </div>

      <ol className="flex flex-col divide-y divide-ink-100 px-5 pb-1">
        {items.map((item, index) => (
          <li key={item.id} className="first:pt-0 last:pb-0">
            <Link to={buildPath.news(item.slug)} className="group flex items-center gap-3 py-3.5">
              <span className="w-8 shrink-0 text-3xl font-black tracking-tighter text-ink-200 tabular-nums group-hover:text-brand-200">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <img
                  src={item.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-ink-900 group-hover:text-brand-700">
                  {item.title}
                </h3>
                {item.category?.name && (
                  <p className="mt-1 text-xs font-semibold tracking-wide text-brand-600 uppercase">
                    {item.category.name}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default MostReadNews
