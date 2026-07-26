import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAdEditor } from '../../../hooks/useAdEditor'
import { updateAd } from '../../../services/ads'
import { ROUTES } from '../../../routes/paths'
import { toDatetimeLocalValue } from '../../../utils/datetimeLocal'
import AdForm from '../../../components/ads/AdForm'
import Spinner from '../../../components/ui/Spinner'
import EmptyState from '../../../components/ui/EmptyState'

function EditAd() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ad, loading, notFound } = useAdEditor(id)

  async function handleUpdate(values) {
    const payload = {
      ...values,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
    }

    const { error } = await updateAd(id, payload)

    if (error) {
      toast.error(
        error.code === '23514'
          ? 'A data de término deve ser igual ou posterior à data de início.'
          : 'Não foi possível atualizar o anúncio.',
      )
      return
    }

    toast.success('Anúncio atualizado com sucesso!')
    navigate(ROUTES.adminAds)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-4 sm:p-8">
        <EmptyState title="Anúncio não encontrado" description="Ele pode ter sido excluído." />
        <div className="mt-6">
          <Link to={ROUTES.adminAds} className="text-sm font-medium text-brand-600 hover:underline">
            Voltar para a listagem
          </Link>
        </div>
      </div>
    )
  }

  const defaultValues = {
    ...ad,
    start_date: toDatetimeLocalValue(ad.start_date),
    end_date: toDatetimeLocalValue(ad.end_date),
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Editar Anúncio</h1>
      <p className="mt-1 text-gray-500">Atualize os dados do anúncio abaixo.</p>

      <div className="mt-6 max-w-2xl">
        <AdForm defaultValues={defaultValues} onSubmit={handleUpdate} submitLabel="Salvar alterações" />
      </div>
    </div>
  )
}

export default EditAd
