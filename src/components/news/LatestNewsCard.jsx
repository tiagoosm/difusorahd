import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'

// Mesma <img> serve os dois formatos (miniatura 80px abaixo de lg, card de
// até 800px em lg+) — um único srcset/sizes cobrindo as duas larguras reais,
// em vez de escolher um dos dois e servir a imagem errada num dos formatos.
const IMAGE_WIDTHS = [80, 160, 400, 600, 800]
const IMAGE_SIZES = '(min-width: 1024px) 380px, 80px'

// Abaixo de lg (1024px — o mesmo breakpoint que a grid de "Últimas
// notícias"/"Mais Lidas" já usa em Home.jsx): linha compacta (miniatura à
// esquerda + texto), pensada pra uma lista contínua de várias notícias por
// rolagem. lg+ (desktop, inalterado): imagem em cima, título abaixo
// ocupando a largura inteira do card — evita título espremido numa coluna
// estreita, então qualquer tamanho de título quebra em quantas linhas
// precisar sem forçar corte. Deliberadamente sem line-clamp/max-height/
// overflow-hidden no título em nenhum dos dois — é a regra da seção.
function LatestNewsCard({ news, className = '', mobileVisible = true }) {
  const displayClass = mobileVisible ? 'flex' : 'hidden lg:flex'

  return (
    <Link
      to={buildPath.news(news.slug)}
      className={`group ${displayClass} min-w-0 gap-3 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 lg:flex-col lg:gap-3 lg:border-0 lg:pb-0 ${className}`}
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100 lg:h-auto lg:w-full lg:aspect-video lg:rounded-xl">
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

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 lg:flex-none lg:justify-start lg:gap-1.5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="text-sm leading-snug font-semibold break-words text-ink-900 group-hover:text-brand-700 lg:text-lg">
          {news.title}
        </h3>
        <span className="text-xs text-ink-500">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default LatestNewsCard
