import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import { useSearchNews } from '../hooks/useSearchNews'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME } from '../utils/seo'
import NewsCard from '../components/news/NewsCard'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { news, totalCount, pageSize, loading } = useSearchNews(query, page)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  useSEO({
    title: query ? `Busca: ${query} — ${SITE_NAME}` : `Pesquisar — ${SITE_NAME}`,
    noindex: true,
  })

  function handlePageChange(nextPage) {
    setSearchParams(nextPage === 1 ? { q: query } : { q: query, page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col gap-1 border-b-2 border-ink-900 pb-5">
        <span className="text-xs font-bold tracking-wide text-brand-600 uppercase">Busca</span>
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
          {query ? `Resultados para "${query}"` : 'Pesquisar notícias'}
        </h1>
        {!loading && query && (
          <p className="mt-1 text-sm text-ink-400">
            {totalCount} resultado{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {!query ? (
        <EmptyState
          icon={SearchIcon}
          title="Digite algo para pesquisar"
          description="Use a barra de pesquisa no topo da página para encontrar notícias do Difusora HD."
        />
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2.5 overflow-hidden rounded-xl border border-ink-200">
              <div className="aspect-video animate-pulse bg-ink-100" />
              <div className="flex flex-col gap-2.5 p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Não encontramos nenhuma matéria para sua busca"
          description={`Tente outras palavras-chave, ou confira as últimas notícias na Home enquanto isso.`}
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}

export default Search
