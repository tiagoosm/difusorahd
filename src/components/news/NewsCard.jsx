import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { buildSrcSet } from '../../utils/imageUrl'
import { coverPositionStyle } from '../../utils/coverFocalPoint'
import Eyebrow from '../ui/Eyebrow'

// The same <img> serves both formats (80px thumbnail below sm, card up to
// 800px at sm+) — a single srcset/sizes covering both real widths.
const IMAGE_WIDTHS = [80, 160, 400, 600, 800]
const IMAGE_SIZES = '(min-width: 1024px) 360px, (min-width: 640px) 45vw, 80px'

// Below sm (640px — the same breakpoint where the grid using this card
// turns into 2+ columns, see Category.jsx/Search.jsx/CategorySection.jsx):
// compact row (thumbnail + text), no card border/shadow — a list of
// secondary articles doesn't need a "box" per item. sm+ (unchanged):
// vertical card with the image on top, same as before.
//
// `compact` (sm+ only, e.g. NewsDetail's "Notícias relacionadas"): shorter
// image and tighter padding — same column width as a regular card, just a
// lighter/shorter card in it. Pair with items-start (not items-stretch) on
// the parent grid so the card keeps this natural height instead of being
// stretched to match a taller sibling in the same row.
function NewsCard({ news, compact = false }) {
  return (
    <Link
      to={buildPath.news(news.slug)}
      className="group flex min-w-0 gap-3 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 sm:flex-col sm:overflow-hidden sm:rounded-xl sm:border sm:border-ink-200 sm:bg-white sm:pb-0 sm:shadow-card sm:transition-shadow sm:hover:shadow-card-hover"
    >
      <div
        className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:h-auto sm:w-full sm:rounded-none ${compact ? 'sm:aspect-[2/1]' : 'sm:aspect-video'}`}
      >
        {/* Decorative: the title comes right next to/below it in the same link. */}
        <img
          src={news.cover_image_url}
          srcSet={buildSrcSet(news.cover_image_url, IMAGE_WIDTHS)}
          sizes={IMAGE_SIZES}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={coverPositionStyle(news.cover_focal_points, 'card')}
          loading="lazy"
        />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center gap-1.5 sm:flex-1 sm:justify-start sm:gap-2 ${compact ? 'sm:p-3' : 'sm:p-4'}`}
      >
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="text-sm leading-snug font-semibold break-words text-ink-900 transition-colors group-hover:text-brand-700 sm:text-base">
          {news.title}
        </h3>
        {/* line-clamp-2 (não corta o título, só a descrição): sem isso um
            resumo longo por si só já estica o card verticalmente. Sem
            "sm:block" aqui — line-clamp já define seu próprio display
            (-webkit-box); "sm:block" na mesma classe competia com ele pelo
            "display" e, dependendo da ordem do CSS gerado, vencia a
            cascata e desativava o clamp, deixando resumos longos sem
            cortar (card ficava mais alto que os outros da linha). */}
        {news.excerpt && <p className="hidden text-sm text-ink-500 sm:line-clamp-2">{news.excerpt}</p>}
        <span className="text-xs text-ink-500 sm:mt-auto sm:pt-2">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default NewsCard
