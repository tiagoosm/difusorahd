import { Link } from 'react-router-dom'
import { buildPath } from '../../routes/paths'
import Eyebrow from '../ui/Eyebrow'

// Badge do ranking muda de cor por posição (1º sólido, 2º-3º tingido de
// vermelho claro, 4º-5º neutro) — leitura tipo "pódio" em vez de números
// soltos crescendo de tamanho, que lia como genérico.
const RANK_BADGE = [
  'bg-brand-600 text-white ring-brand-600',
  'bg-brand-100 text-brand-700 ring-brand-200',
  'bg-brand-50 text-brand-600 ring-brand-100',
  'bg-ink-100 text-ink-500 ring-ink-200',
  'bg-ink-100 text-ink-400 ring-ink-200',
]

// Seção embalada em card próprio (borda + sombra) para funcionar como um
// módulo editorial autônomo — padrão "mais lidas" de portais de notícia —
// em vez de uma lista solta competindo visualmente com "Últimas notícias".
function MostReadNews({ items }) {
  if (!items.length) return null

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
      <h2 className="bg-brand-600 px-5 py-3 text-lg font-bold tracking-tight text-white sm:text-xl">
        Mais Lidas da Semana
      </h2>

      <ol className="flex flex-col divide-y divide-ink-100 px-5 pb-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              to={buildPath.news(item.slug)}
              className="group -mx-2 flex items-center gap-3.5 rounded-lg px-2 py-3.5 transition-colors duration-200 hover:bg-ink-50"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ring-1 transition-colors duration-200 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 ${RANK_BADGE[index] ?? RANK_BADGE[RANK_BADGE.length - 1]}`}
              >
                {index + 1}
              </span>

              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 ring-1 ring-ink-100">
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
