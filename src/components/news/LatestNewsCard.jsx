import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'

// The same <img> serves both formats (80px thumbnail below lg, card up to
// 800px at lg+) — a single srcset/sizes covering both real widths, instead
// of picking one of the two and serving the wrong image in one of the formats.
const IMAGE_WIDTHS = [80, 160, 400, 600, 800]
const IMAGE_SIZES = '(min-width: 1024px) 380px, 80px'

// Below lg (1024px — the breakpoint where "Latest News" turns into a 3x3
// grid, see LatestNewsList.jsx): compact row (thumbnail on the left +
// text), meant for a continuous list of several articles while scrolling.
// lg+ (desktop): image on top, title below taking up the card's full
// width — avoids a title squeezed into a narrow column, so any title
// length wraps to as many lines as needed without forcing a cut.
// Deliberately no line-clamp/max-height/overflow-hidden on the title in
// either case — that's the section's rule.
function LatestNewsCard({ news }) {
  return (
    <Link
      to={buildPath.news(news.slug)}
      className="group flex min-w-0 gap-3 border-b border-ink-100 pb-4 last:border-b-0 last:pb-0 lg:flex-col lg:gap-3 lg:border-0 lg:pb-0"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100 lg:h-auto lg:w-full lg:aspect-video lg:rounded-xl">
        {/* Empty alt: the image is decorative here — the title right below
            is already read by the screen reader, and repeating it in alt
            would duplicate the announcement. */}
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
