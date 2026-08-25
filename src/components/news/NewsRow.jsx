import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Eyebrow from '../ui/Eyebrow'

// Linha editorial (imagem + texto lado a lado) — a unidade da lista de
// "Últimas notícias" e do item em destaque de uma categoria. Deliberadamente
// diferente do NewsCard vertical usado em grades (Relacionadas, Categoria,
// Busca): aqui o objetivo é ler uma sequência, não escanear uma grade.
function NewsRow({ news, size = 'md' }) {
  const isLarge = size === 'lg'

  return (
    <Link to={buildPath.news(news.slug)} className="group flex min-w-0 gap-4 py-4 sm:gap-5">
      <div
        className={`shrink-0 overflow-hidden rounded-xl bg-ink-100 ${
          isLarge ? 'h-28 w-28 sm:h-40 sm:w-56' : 'h-20 w-20 sm:h-24 sm:w-32'
        }`}
      >
        {/* Decorativa: o título vem ao lado no mesmo link. */}
        <img
          src={news.cover_image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3
          className={`font-semibold break-words text-ink-900 group-hover:text-brand-700 ${
            isLarge ? 'text-lg leading-snug sm:text-2xl' : 'text-sm leading-snug sm:text-base'
          }`}
        >
          {news.title}
        </h3>
        {isLarge && news.excerpt && (
          <p className="hidden text-sm leading-relaxed text-ink-500 sm:line-clamp-2">{news.excerpt}</p>
        )}
        <span className="text-xs text-ink-500">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default NewsRow
