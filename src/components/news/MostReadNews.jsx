import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import Eyebrow from '../ui/Eyebrow'
import SectionHeading from '../ui/SectionHeading'

// Numeração deliberadamente discreta (texto pequeno, peso médio, cinza
// neutro, alinhada ao topo) — é só um indicador de posição, não pode
// competir com o título. Cor da marca aparece apenas no hover, na Eyebrow
// de categoria e no título — nunca como fundo do número ou do cabeçalho.
function MostReadNews({ items, moreItems = [] }) {
  if (!items.length) return null

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <SectionHeading title="Mais Lidas" />

      <ol className="flex flex-col divide-y divide-ink-100">
        {items.map((item, index) => (
          <MostReadRow key={item.id} item={item} rank={index + 1} />
        ))}
      </ol>

      {/* Preenche o espaço que sobra abaixo do ranking quando "Últimas
          notícias" (coluna vizinha, mais alta) ainda continua — a mesma
          lista segue com mais notícias, sem numeração, em vez de deixar
          vazio. */}
      {moreItems.length > 0 && (
        <ul className="flex flex-col divide-y divide-ink-100 border-t border-ink-100">
          {moreItems.map((item) => (
            <MostReadRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
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
