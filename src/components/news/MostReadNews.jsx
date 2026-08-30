import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'
import SectionHeading from '../ui/SectionHeading'

// Fixed thumbnail (h-14 w-14 = 56px).
const THUMB_WIDTHS = [56, 112]
const COLUMN_SIZE = 5

// Editorial list, no longer a ranking in cards: numbering is deliberately
// discreet (small text, medium weight, neutral gray) — it's just a
// position indicator, it can never compete with the title. Brand color
// only shows up on hover and in the category Eyebrow — never as the
// number's background.
//
// Desktop (sm+): 2 columns of 5 (grid-flow-col + grid-rows-5 fills the
// entire left column — 01 to 05 — before moving to the right one — 06 to
// 10). Mobile: 1 continuous column with all 10, in that same order.
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title="Mais Lidas" />
      <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-5">
        {items.map((item, index) => (
          <MostReadRow key={item.id} item={item} rank={index + 1} />
        ))}
      </ol>
    </section>
  )
}

function MostReadRow({ item, rank }) {
  // The last row of each column (5th and 10th) doesn't get a divider
  // below it — same "last:border-b-0" rule as before, just per column now.
  const isColumnEnd = rank % COLUMN_SIZE === 0

  return (
    <li className={isColumnEnd ? '' : 'border-b border-ink-100'}>
      <Link to={buildPath.news(item.slug)} className="group flex items-start gap-3 py-3.5 sm:gap-3.5">
        <span className="mt-0.5 w-5 shrink-0 text-xs font-medium text-ink-300 tabular-nums transition-colors duration-200 group-hover:text-brand-600">
          {rank ? String(rank).padStart(2, '0') : ''}
        </span>

        {/* No image on mobile: the list stays more compact and focused on
            the title — the focus is what's being read, not the photo. It
            reappears from sm (tablet+) up, where 2 columns already fit. */}
        <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:block">
          <img
            src={item.cover_image_url}
            srcSet={buildSrcSet(item.cover_image_url, THUMB_WIDTHS)}
            sizes="56px"
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          {item.category?.name && <Eyebrow>{item.category.name}</Eyebrow>}
          <h3 className="mt-1 text-sm leading-snug font-semibold break-words text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
            {item.title}
          </h3>
        </div>
      </Link>
    </li>
  )
}

export default MostReadNews
