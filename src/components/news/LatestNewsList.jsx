import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// Cada card é posicionado explicitamente (linha/coluna) na MESMA grid
// externa que "Mais Lidas" usa (ver Home.jsx) — em vez de uma grid interna
// própria e independente, que é o motivo de a coluna lateral nunca alinhar
// de verdade com essas linhas (cada uma calculava sua própria altura).
// 2 por linha, começando na linha 2 da grid externa (linha 1 é o cabeçalho).
const CARD_POSITION = [
  'lg:col-start-1 lg:row-start-2',
  'lg:col-start-2 lg:row-start-2',
  'lg:col-start-1 lg:row-start-3',
  'lg:col-start-2 lg:row-start-3',
  'lg:col-start-1 lg:row-start-4',
  'lg:col-start-2 lg:row-start-4',
]

// `items-start` (na grid externa) deixa cada card com sua própria altura de
// conteúdo — se um título ocupar 3 linhas e o vizinho na mesma linha da
// grade só 1, o card menor não estica pra "combinar", só sobra espaço ao
// lado dele. Título completo tem prioridade sobre alinhamento perfeito
// entre os cards.
function LatestNewsList({ title, items, viewAllHref }) {
  if (!items.length) return null

  return (
    <>
      <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1">
        <SectionHeading title={title} viewAllHref={viewAllHref} />
      </div>

      {items.map((item, index) => (
        <LatestNewsCard key={item.id} news={item} className={CARD_POSITION[index] ?? ''} />
      ))}
    </>
  )
}

export default LatestNewsList
