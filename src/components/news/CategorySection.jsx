import SectionHeading from '../ui/SectionHeading'
import NewsCard from './NewsCard'

// columns=3 (padrão): grade densa, usada em listagens de largura cheia
// (Relacionadas). columns=2: cards maiores, usada quando a seção divide
// espaço com uma barra lateral (Últimas notícias, na Home).
const GRID_COLUMNS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

function CategorySection({ title, items, viewAllHref, columns = 3 }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      <div className={`grid items-start gap-6 ${GRID_COLUMNS[columns]}`}>
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
