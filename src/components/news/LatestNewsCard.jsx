import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'

// Card cabe em até 2 colunas dentro do container de 1152px (2/3 dele na
// Home) — a imagem original raramente precisa passar de ~800px na tela.
const IMAGE_WIDTHS = [400, 600, 800]
const IMAGE_SIZES = '(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw'

// Imagem em cima, título abaixo ocupando a largura inteira do card — ao
// contrário de um layout com imagem ao lado (NewsRow), o título aqui nunca
// fica espremido numa coluna estreita, então qualquer tamanho de título
// quebra em quantas linhas precisar sem forçar corte. Deliberadamente sem
// line-clamp/max-height/overflow-hidden no título — é a regra da seção.
function LatestNewsCard({ news, className = '' }) {
  return (
    <Link to={buildPath.news(news.slug)} className={`group flex min-w-0 flex-col gap-3 ${className}`}>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-100">
        {/* alt vazio: a imagem é decorativa aqui — o título logo abaixo já
            é lido pelo leitor de tela, e repeti-lo no alt duplica o anúncio. */}
        <img
          src={news.cover_image_url}
          srcSet={buildSrcSet(news.cover_image_url, IMAGE_WIDTHS)}
          sizes={IMAGE_SIZES}
          alt=""
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
