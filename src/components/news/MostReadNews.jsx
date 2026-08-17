import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import Eyebrow from '../ui/Eyebrow'

// Numeração perde intensidade a cada posição (100% -> 25% de opacidade em
// brand-600): o 1º lugar ganha destaque de cor real em vez de tamanho
// exagerado, e a lista inteira já lê como "ranking" sem precisar de ícone.
const RANK_TINT = ['text-brand-600', 'text-brand-600/70', 'text-brand-600/50', 'text-brand-600/35', 'text-brand-600/25']

// Título com fundo vermelho (em vez do eyebrow "Ranking") é o único ponto de
// cor forte da seção, como uma etiqueta de destaque sobre a lista.
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <h2 className="inline-block w-fit bg-brand-600 px-3 py-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">
        Mais Lidas da Semana
      </h2>

      <ol className="flex flex-col divide-y divide-ink-100">
        {items.map((item, index) => (
          <li key={item.id} className="first:pt-0 last:pb-0">
            <Link to={buildPath.news(item.slug)} className="group flex items-center gap-3.5 py-3.5">
              <span
                className={`w-7 shrink-0 text-2xl font-extrabold tracking-tight tabular-nums transition-colors group-hover:text-brand-600 ${RANK_TINT[index] ?? RANK_TINT[RANK_TINT.length - 1]}`}
              >
                {String(index + 1).padStart(2, '0')}
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
                <h3 className="mt-1 text-sm leading-snug font-semibold break-words text-ink-900 group-hover:text-brand-700">
                  {item.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default MostReadNews
