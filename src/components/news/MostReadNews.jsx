import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import { buildSrcSet } from '../../utils/imageUrl'
import Eyebrow from '../ui/Eyebrow'
import SectionHeading from '../ui/SectionHeading'

// Miniatura fixa (h-14 w-14 = 56px).
const THUMB_WIDTHS = [56, 112]
const COLUMN_SIZE = 5

// Lista editorial, não mais ranking em cards: numeração deliberadamente
// discreta (texto pequeno, peso médio, cinza neutro) — é só um indicador de
// posição, nunca pode competir com o título. Cor da marca aparece apenas no
// hover e na Eyebrow de categoria — nunca como fundo do número.
//
// Desktop (sm+): 2 colunas de 5 (grid-flow-col + grid-rows-5 preenche a
// coluna esquerda inteira — 01 a 05 — antes de passar pra direita — 06 a
// 10). Mobile: 1 coluna corrida com as 10, nessa mesma ordem.
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading title="Mais Lidas" />
      <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-5">
        {items.map((item, index) => (
          <MostReadRow key={item.id} item={item} rank={index + 1} />
        ))}
      </ol>
    </section>
  )
}

function MostReadRow({ item, rank }) {
  // Última linha de cada coluna (5ª e 10ª) não leva divisória embaixo —
  // mesma regra do "last:border-b-0" de antes, só que agora por coluna.
  const isColumnEnd = rank % COLUMN_SIZE === 0

  return (
    <li className={isColumnEnd ? '' : 'border-b border-ink-100'}>
      <Link to={buildPath.news(item.slug)} className="group flex items-start gap-3 py-3.5 sm:gap-3.5">
        <span className="mt-0.5 w-5 shrink-0 text-xs font-medium text-ink-300 tabular-nums transition-colors duration-200 group-hover:text-brand-600">
          {rank ? String(rank).padStart(2, '0') : ''}
        </span>

        {/* Sem imagem no mobile: a lista fica mais compacta e com foco no
            título — o foco é o que está sendo lido, não a foto. Volta a
            aparecer a partir de sm (tablet+), onde já cabem 2 colunas. */}
        <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:block">
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
