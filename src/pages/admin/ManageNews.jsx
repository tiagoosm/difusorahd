import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  Newspaper,
  FileCheck2,
  FileText,
  CalendarCheck,
  ImageOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useManageNews } from '../../hooks/useManageNews'
import { useNewsStats } from '../../hooks/useNewsStats'
import { useCategories } from '../../hooks/useCategories'
import { deleteNews } from '../../services/news'
import { buildPath, ROUTES } from '../../routes/paths'
import { formatDate } from '../../utils/formatDate'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import SearchBar from '../../components/ui/SearchBar'
import StatsCard from '../../components/ui/StatsCard'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'published', label: 'Publicada' },
  { value: 'draft', label: 'Rascunho' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'views', label: 'Mais visualizadas' },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function ManageNews() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const search = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') || 'recent'
  const publishedFrom = searchParams.get('from') ?? ''
  const publishedTo = searchParams.get('to') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.get('pageSize')))
    ? Number(searchParams.get('pageSize'))
    : PAGE_SIZE_OPTIONS[0]

  const { categories } = useCategories()
  const { news, totalCount, loading, reload } = useManageNews({
    status,
    categoryId,
    search,
    sort,
    publishedFrom,
    publishedTo,
    page,
    pageSize,
  })
  const { stats, reload: reloadStats } = useNewsStats()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function updateFilters(next) {
    const params = {
      status,
      category: categoryId,
      q: search,
      sort,
      from: publishedFrom,
      to: publishedTo,
      page: String(page),
      pageSize: String(pageSize),
      ...next,
    }
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value && !(key === 'sort' && value === 'recent')),
    )
    setSearchParams(cleaned)
  }

  function handlePageChange(nextPage) {
    updateFilters({ page: nextPage === 1 ? undefined : String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete() {
    const { error } = await deleteNews(deleteTarget.id)

    if (error) {
      toast.error('Não foi possível excluir a notícia.')
      setDeleteTarget(null)
      return
    }

    toast.success('Notícia excluída com sucesso!')
    setDeleteTarget(null)
    reload()
    reloadStats()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Notícias</h1>
        <Link to={ROUTES.adminNewsNew}>
          <Button>
            <Plus className="h-4 w-4" />
            Nova Notícia
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Total de notícias" value={stats.total} icon={Newspaper} />
        <StatsCard label="Publicadas" value={stats.published} icon={FileCheck2} />
        <StatsCard label="Rascunhos" value={stats.drafts} icon={FileText} />
        <StatsCard label="Visualizações totais" value={stats.totalViews} icon={Eye} />
        <StatsCard label="Publicadas este mês" value={stats.publishedThisMonth} icon={CalendarCheck} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="w-full sm:max-w-md">
          <SearchBar
            defaultValue={search}
            placeholder="Buscar por título ou conteúdo..."
            onSearch={(value) => updateFilters({ q: value || undefined, page: undefined })}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Categoria"
            value={categoryId}
            onChange={(event) => updateFilters({ category: event.target.value || undefined, page: undefined })}
            className="w-48"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            value={status}
            onChange={(event) => updateFilters({ status: event.target.value || undefined, page: undefined })}
            className="w-40"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select
            label="Ordenar por"
            value={sort}
            onChange={(event) => updateFilters({ sort: event.target.value, page: undefined })}
            className="w-44"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Publicada de</span>
            <input
              type="date"
              value={publishedFrom}
              onChange={(event) => updateFilters({ from: event.target.value || undefined, page: undefined })}
              className="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">até</span>
            <input
              type="date"
              value={publishedTo}
              onChange={(event) => updateFilters({ to: event.target.value || undefined, page: undefined })}
              className="rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <Select
            label="Por página"
            value={String(pageSize)}
            onChange={(event) => updateFilters({ pageSize: event.target.value, page: undefined })}
            className="w-28"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Nenhuma notícia encontrada"
          description="Ajuste os filtros ou crie uma nova notícia."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Notícia</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Visualizações</th>
                  <th className="px-5 py-3 font-medium">Publicada em</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.cover_image_url ? (
                            <img
                              src={item.cover_image_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <ImageOff className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <span className="max-w-xs truncate font-medium text-gray-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="brand">{item.category?.name ?? '—'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={item.status === 'published' ? 'green' : 'gray'}>
                        {item.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.views_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {item.published_at ? formatDate(item.published_at) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {item.status === 'published' && (
                          <a
                            href={buildPath.news(item.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Ver no site"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          to={buildPath.adminNewsEdit(item.id)}
                          aria-label="Editar"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          aria-label="Excluir"
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-sm text-gray-500">
              {totalCount} notícia{totalCount === 1 ? '' : 's'} encontrada{totalCount === 1 ? '' : 's'}
            </span>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir notícia">
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir <strong>{deleteTarget?.title}</strong>? Essa ação não pode ser
          desfeita.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ManageNews
