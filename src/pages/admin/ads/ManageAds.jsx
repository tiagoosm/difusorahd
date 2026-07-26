import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAds } from '../../../hooks/useAds'
import { deleteAd } from '../../../services/ads'
import { ROUTES } from '../../../routes/paths'
import AdList from '../../../components/ads/AdList'
import AdPositionSelector from '../../../components/ads/AdPositionSelector'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'

function ManageAds() {
  const [searchParams, setSearchParams] = useSearchParams()
  const position = searchParams.get('position') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { ads, totalCount, pageSize, loading, reload } = useAds({ position, page })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  function updateParams(next) {
    const params = { position, page: String(page), ...next }
    const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value))
    setSearchParams(cleaned)
  }

  function handlePageChange(nextPage) {
    updateParams({ page: nextPage === 1 ? undefined : String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete() {
    const { error } = await deleteAd(deleteTarget.id)

    if (error) {
      toast.error('Não foi possível excluir o anúncio.')
      setDeleteTarget(null)
      return
    }

    toast.success('Anúncio excluído com sucesso!')
    setDeleteTarget(null)
    reload()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Anúncios</h1>
        <Link to={ROUTES.adminAdsNew}>
          <Button>
            <Plus className="h-4 w-4" />
            Novo Anúncio
          </Button>
        </Link>
      </div>

      <AdPositionSelector
        value={position}
        onChange={(event) => updateParams({ position: event.target.value || undefined, page: undefined })}
        className="w-64"
      />

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

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Excluir anúncio">
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

export default ManageAds
