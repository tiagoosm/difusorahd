import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createAd } from '../../../services/ads'
import { ROUTES } from '../../../routes/paths'
import AdForm from '../../../components/ads/AdForm'

function NewAd() {
  const navigate = useNavigate()

  async function handleCreate(values) {
    const payload = {
      ...values,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
    }

    const { error } = await createAd(payload)

    if (error) {
      toast.error(
        error.code === '23514'
          ? 'A data de término deve ser igual ou posterior à data de início.'
          : error.message || 'Não foi possível criar o anúncio.',
      )
      return
    }

    toast.success('Anúncio criado com sucesso!')
    navigate(ROUTES.adminAds)
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-ink-900">Novo Anúncio</h1>
      <p className="mt-1 text-ink-500">Preencha os dados abaixo para cadastrar um novo anúncio.</p>

      <div className="mt-6 max-w-2xl">
        <AdForm onSubmit={handleCreate} submitLabel="Criar anúncio" />
      </div>
    </div>
  )
}

export default NewAd
