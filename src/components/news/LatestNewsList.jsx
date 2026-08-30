import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// Independent, full-width section (no longer split with a sidebar): below
// lg, a continuous stacked list (the 9 articles in sequence, with no other
// block breaking them up); at lg+, a 3x3 grid. Same breakpoint
// LatestNewsCard already uses internally (compact row < lg, full card
// lg+), so the layout switch happens together in both.
function LatestNewsList({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:items-start lg:gap-x-8 lg:gap-y-10">
        {items.map((item) => (
          <LatestNewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default LatestNewsList
