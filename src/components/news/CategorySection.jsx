import SectionHeading from '../ui/SectionHeading'
import NewsCard from './NewsCard'

// columns=3 (default): dense grid, used in full-width listings (Related
// articles, Home category sections). columns=2: larger cards, for a
// section that needs more breathing room per card.
const GRID_COLUMNS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

function CategorySection({ title, items, viewAllHref, columns = 3 }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      {/* Below sm, NewsCard is already a row with its own border (see
          NewsCard.jsx) — gap-6 there would just duplicate the spacing.
          items-stretch (not items-start): every card in the same row ends
          up the same height — NewsCard is already built for this (text
          grows with flex-1, date pinned to the bottom with mt-auto),
          without cutting off any title; it just avoids differently-sized
          boxes side by side when titles wrap to a different number of lines. */}
      <div className={`grid items-stretch gap-1 sm:gap-6 ${GRID_COLUMNS[columns]}`}>
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
