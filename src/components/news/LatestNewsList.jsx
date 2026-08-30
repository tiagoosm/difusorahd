import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// Seção independente e cheia (não mais dividida com uma barra lateral):
// abaixo de lg, uma lista contínua empilhada (as 9 notícias em sequência,
// sem quebra de nenhum outro bloco no meio); em lg+, grade 3x3. Mesmo
// breakpoint que LatestNewsCard já usa internamente (linha compacta < lg,
// card cheio lg+), então a troca de layout acontece junto nos dois.
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
