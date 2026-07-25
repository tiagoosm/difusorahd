import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import { useSearchNews } from '../hooks/useSearchNews'
import SearchBar from '../components/ui/SearchBar'
import NewsCard from '../components/news/NewsCard'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { news, totalCount, pageSize, loading } = useSearchNews(query, page)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function handleSearch(nextQuery) {
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  function handlePageChange(nextPage) {
    setSearchParams(nextPage === 1 ? { q: query } : { q: query, page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Pesquisar</h1>
        <SearchBar defaultValue={query} onSearch={handleSearch} />
      </header>

      {!query ? (
        <EmptyState
          icon={SearchIcon}
          title="Digite algo para pesquisar"
          description="Busque por título ou conteúdo das notícias."
        />
      ) : loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`Nenhum resultado para "${query}"`}
          description="Tente pesquisar com outras palavras-chave."
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {totalCount} resultado{totalCount !== 1 ? 's' : ''} para "{query}"
          </p>
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
