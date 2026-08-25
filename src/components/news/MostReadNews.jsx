import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'
import SectionHeading from '../ui/SectionHeading'
import LatestNewsCard from './LatestNewsCard'

// Miniatura fixa (h-14 w-14 = 56px).
const THUMB_WIDTHS = [56, 112]

// Cartão(ões) de preenchimento posicionados explicitamente na linha 4 da
// grid externa (a mesma linha dos 2 últimos cards de "Últimas notícias") —
// é isso que garante que a borda do cartão encoste exatamente na borda dos
// cards vizinhos, em vez de só "flutuar" abaixo da lista do ranking.
const FILLER_POSITION = ['lg:col-start-3 lg:row-start-4', 'lg:col-start-3 lg:row-start-5']

// Numeração deliberadamente discreta (texto pequeno, peso médio, cinza
// neutro, alinhada ao topo) — é só um indicador de posição, não pode
// competir com o título. Cor da marca aparece apenas no hover, na Eyebrow
// de categoria e no título — nunca como fundo do número ou do cabeçalho.
//
// Heading, lista do ranking e preenchimento são 3 células separadas da
// MESMA grid externa (ver Home.jsx / LatestNewsList) — não uma coluna
// própria e independente. A lista ocupa as linhas 2-3 (as 2 primeiras
// linhas de cards), deixando a linha 4 livre para o preenchimento alinhar
// com a última linha de "Últimas notícias".
function MostReadNews({ items, moreItems = [] }) {
  if (!items.length) return null

  return (
    <>
      <div className="lg:col-start-3 lg:row-start-1">
        <SectionHeading title="Mais Lidas" />
      </div>

      <ol className="flex flex-col divide-y divide-ink-100 lg:col-start-3 lg:row-start-2 lg:row-span-2">
        {items.map((item, index) => (
          <MostReadRow key={item.id} item={item} rank={index + 1} />
        ))}
      </ol>

      {moreItems.map((item, index) => (
        <LatestNewsCard
          key={item.id}
          news={item}
          className={FILLER_POSITION[index] ?? 'lg:col-start-3'}
        />
      ))}
    </>
  )
}

function MostReadRow({ item, rank }) {
  return (
    <li>
      <Link to={buildPath.news(item.slug)} className="group flex items-start gap-3.5 py-3.5">
        <span className="mt-0.5 w-5 shrink-0 text-xs font-medium text-ink-300 tabular-nums transition-colors duration-200 group-hover:text-brand-600">
          {rank ? String(rank).padStart(2, '0') : ''}
        </span>

        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
          <img
            src={item.cover_image_url}
            srcSet={buildSrcSet(item.cover_image_url, THUMB_WIDTHS)}
            sizes="56px"
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          {item.category?.name && <Eyebrow>{item.category.name}</Eyebrow>}
          <h3 className="mt-1 text-sm leading-snug font-semibold break-words text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
            {item.title}
          </h3>
        </div>
      </Link>
    </li>
  )
}

export default MostReadNews
