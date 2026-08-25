import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// 2 colunas x 3 linhas (6 itens) no desktop/tablet, 1 coluna no mobile.
// `items-start` deixa cada card com sua própria altura de conteúdo — se um
// título ocupar 3 linhas e o vizinho na mesma linha da grade só 1, o card
// menor não estica pra "combinar", só sobra espaço ao lado dele. Título
// completo tem prioridade sobre alinhamento perfeito entre os cards.
function LatestNewsList({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:items-start">
        {items.map((item) => (
          <LatestNewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default LatestNewsList
