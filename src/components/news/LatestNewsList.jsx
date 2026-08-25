import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// Cada card é posicionado explicitamente (linha/coluna) na MESMA grid
// externa que "Mais Lidas" usa (ver Home.jsx) — em vez de uma grid interna
// própria e independente, que é o motivo de a coluna lateral nunca alinhar
// de verdade com essas linhas (cada uma calculava sua própria altura).
// 2 por linha, começando na linha 2 da grid externa (linha 1 é o cabeçalho).
// lg (não md): é o breakpoint que a grid externa já usa (Home.jsx e
// MostReadNews.jsx) — abaixo disso os itens só empilham em lista.
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
function LatestNewsList({ title, items, mobileExtraItems = [], viewAllHref }) {
  if (!items.length) return null

  return (
    <>
      <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1">
        <SectionHeading title={title} viewAllHref={viewAllHref} />
      </div>

      {/* display:contents no desktop: o wrapper "desaparece" e cada card
          volta a ser filho direto da grid externa (necessário pro
          posicionamento explícito acima funcionar). No mobile, o wrapper é
          uma lista vertical normal — os 9 itens (6 + 3 extras) formam uma
          lista contínua, não uma grade quebrada. */}
      <div className="flex flex-col lg:contents">
        {items.map((item, index) => (
          <LatestNewsCard key={item.id} news={item} className={CARD_POSITION[index] ?? ''} />
        ))}

        {/* Só no mobile: continua a mesma lista até 9 notícias (a versão
            mobile é uma lista contínua, não uma grade 2x3) — nunca entra na
            grid do desktop, que sempre mostra só os 6 primeiros. */}
        {mobileExtraItems.map((item) => (
          <LatestNewsCard key={item.id} news={item} className="lg:hidden" />
        ))}
      </div>
    </>
  )
}

export default LatestNewsList
