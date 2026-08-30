import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'

// Hero takes up 2/3 of the 1152px container on desktop, full width on mobile.
const HERO_WIDTHS = [640, 960, 1280, 1600]
const HERO_SIZES = '(min-width: 1024px) 760px, 100vw'
// Fixed square thumbnail (h-20 w-20 = 80px) for the secondary list.
const THUMB_WIDTHS = [80, 160]

function FeaturedNews({ items }) {
  if (!items.length) return null

  const [main, ...secondary] = items

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <Link
          to={buildPath.news(main.slug)}
          className="group relative flex min-h-[24rem] min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-ink-900 shadow-card transition-shadow hover:shadow-card-hover lg:col-span-2 lg:min-h-[28rem]"
        >
          {/* Home page's LCP image: eager (no lazy) + high fetchPriority so
              the browser fetches it before the others. */}
          <img
            src={main.cover_image_url}
            srcSet={buildSrcSet(main.cover_image_url, HERO_WIDTHS)}
            sizes={HERO_SIZES}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
          <div className="relative flex flex-col gap-3.5 p-6 md:p-8 lg:p-10">
            {main.category?.name && <Eyebrow tone="light">{main.category.name}</Eyebrow>}
            {/* Home page's h1: the main headline is the page's title. The
                Home page used to have no h1 at all — a semantics/SEO gap. */}
            <h1 className="text-2xl leading-[1.1] font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {main.title}
            </h1>
            {main.excerpt && (
              <p className="line-clamp-2 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {main.excerpt}
              </p>
            )}
            <span className="text-xs font-medium text-white/60">{formatDate(main.published_at)}</span>
          </div>
        </Link>

        {secondary.length > 0 && (
          <div className="flex min-w-0 flex-col divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white shadow-card">
            {secondary.map((item) => (
              <FeaturedListItem key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedListItem({ news }) {
  return (
    <Link to={buildPath.news(news.slug)} className="group flex min-w-0 items-center gap-3.5 p-4">
      <div className="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
        {/* Decorative: the title comes right next to it in the same link. */}
        <img
          src={news.cover_image_url}
          srcSet={buildSrcSet(news.cover_image_url, THUMB_WIDTHS)}
          sizes="80px"
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {news.category?.name && <Eyebrow>{news.category.name}</Eyebrow>}
        <h3 className="text-sm leading-snug font-semibold break-words text-ink-900 group-hover:text-brand-700">
          {news.title}
        </h3>
        <span className="text-xs text-ink-500">{formatDate(news.published_at)}</span>
      </div>
    </Link>
  )
}

export default FeaturedNews
