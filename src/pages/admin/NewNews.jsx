import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { createNews } from '../../services/news'
import { ROUTES } from '../../routes/paths'
import NewsForm from '../../components/news/NewsForm'

function NewNews() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleCreate(values) {
    const payload = {
      ...values,
      author_id: user.id,
      published_at: values.status === 'published' ? new Date().toISOString() : null,
    }

    const { error } = await createNews(payload)

    if (error) {
      toast.error(
        error.code === '23505'
          ? 'Já existe uma notícia com esse slug.'
          : error.message || 'Não foi possível criar a notícia.',
      )
      return
    }

    toast.success('Notícia criada com sucesso!')
    navigate(ROUTES.adminNews)
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Nova Notícia</h1>
      <p className="mt-1 text-gray-500">Preencha os dados abaixo para publicar uma nova notícia.</p>

      <div className="mt-6 max-w-3xl">
        <NewsForm onSubmit={handleCreate} submitLabel="Criar notícia" />
      </div>
    </div>
  )
}

export default NewNews
