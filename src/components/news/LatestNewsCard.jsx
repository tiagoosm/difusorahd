import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Eyebrow from '../ui/Eyebrow'

// Imagem em cima, título abaixo ocupando a largura inteira do card — ao
// contrário de um layout com imagem ao lado (NewsRow), o título aqui nunca
// fica espremido numa coluna estreita, então qualquer tamanho de título
// quebra em quantas linhas precisar sem forçar corte. Deliberadamente sem
// line-clamp/max-height/overflow-hidden no título — é a regra da seção.
function LatestNewsCard({ news, className = '' }) {
  return (
    <Link to={buildPath.news(news.slug)} className={`group flex min-w-0 flex-col gap-3 ${className}`}>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-100">
        <img
          src={news.cover_image_url}
          alt={news.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="text-base leading-snug font-semibold break-words text-ink-900 group-hover:text-brand-700 sm:text-lg">
          {news.title}
        </h3>
        <span className="text-xs text-ink-500">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default LatestNewsCard
