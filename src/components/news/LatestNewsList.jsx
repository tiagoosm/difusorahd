import SectionHeading from '../ui/SectionHeading'
import NewsRow from './NewsRow'

// Lista editorial de 2 colunas x 3 linhas (6 itens) para "Últimas notícias"
// na Home — mesma ordem de leitura de uma grade normal (row-major: mais
// recente no topo-esquerda, 2ª mais recente no topo-direita...), só que
// implementada como lista com separadores em vez de cards repetidos.
function LatestNewsList({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title={title} viewAllHref={viewAllHref} />
      <div className="grid divide-y divide-ink-100 sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0">
        {items.map((item, index) => (
          <div key={item.id} className={index >= 2 ? 'sm:border-t sm:border-ink-100' : ''}>
            <NewsRow news={item} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default LatestNewsList
