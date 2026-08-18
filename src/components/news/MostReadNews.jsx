import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import Eyebrow from '../ui/Eyebrow'
import SectionHeading from '../ui/SectionHeading'

// Numeração deliberadamente discreta (texto pequeno, peso médio, cinza
// neutro, alinhada ao topo) — é só um indicador de posição, não pode
// competir com o título. Cor da marca aparece apenas no hover, na Eyebrow
// de categoria e no título — nunca como fundo do número ou do cabeçalho.
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHeading title="Mais Lidas da Semana" />

      <ol className="flex flex-col divide-y divide-ink-100">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link to={buildPath.news(item.slug)} className="group flex items-start gap-3.5 py-3.5">
              <span className="mt-0.5 w-5 shrink-0 text-xs font-medium text-ink-300 tabular-nums transition-colors duration-200 group-hover:text-brand-600">
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
                <h3 className="mt-1 text-sm leading-snug font-semibold break-words text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
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
