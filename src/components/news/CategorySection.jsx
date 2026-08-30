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
      {/* Abaixo de sm o NewsCard já é uma linha com borda própria (ver
          NewsCard.jsx) — gap-6 ali só duplicaria o espaçamento.
          items-stretch (não items-start): todo card da mesma linha fica com
          a mesma altura — NewsCard já é preparado pra isso (texto cresce com
          flex-1, data fixada embaixo com mt-auto), sem cortar nenhum título;
          só evita caixas de tamanhos diferentes lado a lado quando os
          títulos têm números de linhas diferentes. */}
      <div className={`grid items-stretch gap-1 sm:gap-6 ${GRID_COLUMNS[columns]}`}>
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
