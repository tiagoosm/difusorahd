import SectionHeading from '../ui/SectionHeading'
import NewsCard from './NewsCard'

function CategorySection({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
