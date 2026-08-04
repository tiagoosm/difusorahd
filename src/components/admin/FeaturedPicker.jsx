import { useEffect, useState } from 'react'
import { Search, Plus, ImageOff } from 'lucide-react'
import { fetchFeaturableNews } from '../../services/news'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

// Busca notícias publicadas que ainda não são destaque, para o admin
// escolher o que adicionar em /admin/destaques.
function FeaturedPicker({ isOpen, onClose, onSelect, excludeIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    const timeout = setTimeout(() => {
      fetchFeaturableNews(query).then(({ data }) => {
        setResults(data ?? [])
        setLoading(false)
      })
    }, 250)

    return () => clearTimeout(timeout)
  }, [isOpen, query])

  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  const visibleResults = results.filter((item) => !excludeIds.includes(item.id))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar destaque">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pr-3.5 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none"
        />
      </div>

      <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : visibleResults.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            {query ? 'Nenhuma notícia encontrada.' : 'Nenhuma notícia publicada disponível para destacar.'}
          </p>
        ) : (
          visibleResults.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-brand-50"
            >
              <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                {item.title}
              </span>
              <Plus className="h-4 w-4 shrink-0 text-brand-600" />
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}

export default FeaturedPicker
