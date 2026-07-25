import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useManageNews } from '../../hooks/useManageNews'
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

function ManageNews() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { categories } = useCategories()
  const { news, totalCount, pageSize, loading, reload } = useManageNews({ status, categoryId, page })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function updateFilters(next) {
    const params = { status, category: categoryId, page: String(page), ...next }
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value))
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
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Notícias</h1>
        <Link to={ROUTES.adminNewsNew}>
          <Button>
            <Plus className="h-4 w-4" />
            Nova Notícia
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select
          value={status}
          onChange={(event) => updateFilters({ status: event.target.value || undefined, page: undefined })}
          className="w-48"
        >
          <option value="">Todos os status</option>
          <option value="published">Publicada</option>
          <option value="draft">Rascunho</option>
        </Select>

        <Select
          value={categoryId}
          onChange={(event) => updateFilters({ category: event.target.value || undefined, page: undefined })}
          className="w-56"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          title="Nenhuma notícia encontrada"
          description="Ajuste os filtros ou crie uma nova notícia."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Título</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item) => (
                  <tr key={item.id}>
                    <td className="max-w-xs truncate px-5 py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="px-5 py-3 text-gray-500">{item.category?.name ?? '—'}</td>
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
                      {formatDate(item.published_at ?? item.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
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

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
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
