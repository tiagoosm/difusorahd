import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useNewsEditor } from '../../hooks/useNewsEditor'
import { updateNews } from '../../services/news'
import { removeFile } from '../../services/storage'
import { ROUTES } from '../../routes/paths'
import NewsForm from '../../components/news/NewsForm'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function EditNews() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { news, loading, notFound } = useNewsEditor(id)

  async function handleUpdate(values) {
    const payload = { ...values }

    // Only touches published_at when the status actually changes state —
    // publishing for the first time records the date now; unpublishing
    // clears it; staying published shouldn't "push" the original date on
    // every text edit.
    if (values.status === 'published' && news.status !== 'published') {
      payload.published_at = new Date().toISOString()
    } else if (values.status === 'draft') {
      payload.published_at = null
    }

    const { error } = await updateNews(id, payload)

    if (error) {
      toast.error(
        error.code === '23505'
          ? 'Já existe uma notícia com esse slug.'
          : error.message || 'Não foi possível atualizar a notícia.',
      )
      return
    }

    // Only cleans up the old file after the swap is already saved —
    // cleaning up earlier (e.g. as soon as the admin picks a new file in
    // the form) would risk deleting a file the published article still
    // uses, in case the edit is abandoned without saving.
    if (news.cover_image_url && news.cover_image_url !== payload.cover_image_url) {
      removeFile('news-media', news.cover_image_url)
    }
    if (news.audio_url && news.audio_url !== payload.audio_url) {
      removeFile('news-media', news.audio_url)
    }

    toast.success('Notícia atualizada com sucesso!')
    navigate(ROUTES.adminNews)
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
      <div className="p-8">
        <EmptyState title="Notícia não encontrada" description="Ela pode ter sido excluída." />
        <div className="mt-6">
          <Link to={ROUTES.adminNews} className="text-sm font-medium text-brand-600 hover:underline">
            Voltar para a listagem
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-ink-900">Editar Notícia</h1>
      <p className="mt-1 text-ink-500">Atualize os dados da notícia abaixo.</p>

      <div className="mt-6 max-w-3xl">
        <NewsForm defaultValues={news} onSubmit={handleUpdate} submitLabel="Salvar alterações" />
      </div>
    </div>
  )
}

export default EditNews
