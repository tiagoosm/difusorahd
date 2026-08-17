import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAds } from '../../../hooks/useAds'
import { useAdCounts } from '../../../hooks/useAdCounts'
import { deleteAd } from '../../../services/ads'
import { ROUTES } from '../../../routes/paths'
import { AD_POSITIONS } from '../../../utils/adPositions'
import AdList from '../../../components/ads/AdList'
import AdPositionSelector from '../../../components/ads/AdPositionSelector'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'expired', label: 'Expirado' },
  { value: 'inactive', label: 'Inativo' },
]

const SORT_OPTIONS = [
  { value: 'priority', label: 'Maior prioridade' },
  { value: 'recent', label: 'Mais recentes' },
]

function ManageAds() {
  const [searchParams, setSearchParams] = useSearchParams()
  const position = searchParams.get('position') ?? ''
  const status = searchParams.get('status') ?? ''
  const search = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') || 'priority'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { ads, totalCount, pageSize, loading, reload } = useAds({ position, status, search, sort, page })
  const { counts, reload: reloadCounts } = useAdCounts()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function updateParams(next) {
    const params = { position, status, q: search, sort, page: String(page), ...next }
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value && !(key === 'sort' && value === 'priority')),
    )
    setSearchParams(cleaned)
  }

  function handlePageChange(nextPage) {
    updateParams({ page: nextPage === 1 ? undefined : String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete() {
    setIsDeleting(true)
    const { deleted, error } = await deleteAd(deleteTarget)
    setIsDeleting(false)

    if (!deleted) {
      toast.error(error?.message || 'Não foi possível excluir o anúncio.')
      setDeleteTarget(null)
      return
    }

    toast.success('Anúncio excluído com sucesso!')
    setDeleteTarget(null)
    reload()
    reloadCounts()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Gerenciar Anúncios</h1>
        <Link to={ROUTES.adminAdsNew}>
          <Button>
            <Plus className="h-4 w-4" />
            Novo Anúncio
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {AD_POSITIONS.map((item) => (
          <span
            key={item.value}
            className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-500"
          >
            {item.label}: <strong className="text-ink-700">{counts[item.value] ?? 0}</strong>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:w-72">
          <SearchBar
            defaultValue={search}
            placeholder="Buscar por título..."
            onSearch={(value) => updateParams({ q: value || undefined, page: undefined })}
          />
        </div>

        <AdPositionSelector
          label=""
          value={position}
          onChange={(event) => updateParams({ position: event.target.value || undefined, page: undefined })}
          className="w-full sm:w-48"
        />

        <Select
          value={status}
          onChange={(event) => updateParams({ status: event.target.value || undefined, page: undefined })}
          className="w-full sm:w-44"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value, page: undefined })}
          className="w-44"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <AdList ads={ads} onDelete={setDeleteTarget} />
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir anúncio"
        description={
          <>
            Tem certeza que deseja excluir <strong>{deleteTarget?.title}</strong>? Essa ação não pode ser
            desfeita.
          </>
        }
      />
    </div>
  )
}

export default ManageAds
