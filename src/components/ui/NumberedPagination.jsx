import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPageItems, ELLIPSIS } from '../../utils/pagination'

// Numbered pagination (page a reader can jump straight into, not just
// step through) for multi-page listings (category pages, search results).
// Real <Link>s, not onClick-only
// buttons — the page number is a genuine distinct URL, so it needs to be
// a normal link (middle-click/new-tab, crawlable, works without JS).
// Two independent rendered lists (desktop/mobile) instead of one dynamic
// one: the sibling count differs, and the codebase already prefers a pure
// CSS breakpoint switch over a JS matchMedia hook for this kind of thing.
function NumberedPagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className="flex justify-center">
      <PageList page={page} totalPages={totalPages} buildHref={buildHref} siblingCount={2} className="hidden sm:flex" />
      <PageList page={page} totalPages={totalPages} buildHref={buildHref} siblingCount={1} className="flex sm:hidden" />
    </nav>
  )
}

function PageList({ page, totalPages, buildHref, siblingCount, className }) {
  const items = getPageItems(page, totalPages, siblingCount)

  return (
    <ol className={`items-center gap-1 sm:gap-1.5 ${className}`}>
      <li>
        <PageLink type="prev" disabled={page <= 1} href={buildHref(page - 1)} />
      </li>

      {items.map((item, index) =>
        item === ELLIPSIS ? (
          <li
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-ink-400 select-none sm:px-1.5"
          >
            …
          </li>
        ) : (
          <li key={item}>
            <PageLink type="number" number={item} current={item === page} href={buildHref(item)} />
          </li>
        ),
      )}

      <li>
        <PageLink type="next" disabled={page >= totalPages} href={buildHref(page + 1)} />
      </li>
    </ol>
  )
}

function handleNavigate() {
  // Same intent as the old prev/next-only Pagination: jumping to a
  // different listing page should read like landing on a fresh page, not
  // like scrolling within the current one — but smoothly, not a hard
  // jump. `state: preserveScroll` (see ScrollToTop.jsx) opts these links
  // out of the app's default instant scroll-to-top so this smooth one
  // gets to run instead of being cut off by it.
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function PageLink({ type, number, current, disabled, href }) {
  const baseClass =
    'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none'

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={type === 'prev' ? 'Página anterior' : 'Próxima página'}
        className={`${baseClass} cursor-not-allowed text-ink-300`}
      >
        {type === 'prev' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </span>
    )
  }

  if (type !== 'number') {
    return (
      <Link
        to={href}
        state={{ preserveScroll: true }}
        onClick={handleNavigate}
        aria-label={type === 'prev' ? 'Página anterior' : 'Próxima página'}
        className={`${baseClass} text-ink-600 hover:bg-ink-100`}
      >
        {type === 'prev' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Link>
    )
  }

  return (
    <Link
      to={href}
      state={{ preserveScroll: true }}
      onClick={handleNavigate}
      aria-current={current ? 'page' : undefined}
      aria-label={`Página ${number}`}
      className={`${baseClass} ${current ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
    >
      {number}
    </Link>
  )
}

export default NumberedPagination
