import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCategoriesAdmin } from '../../hooks/useCategoriesAdmin'
import { createCategory, updateCategory, deleteCategory } from '../../services/categories'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import CategoryForm from '../../components/categories/CategoryForm'

function ManageCategories() {
  const { categories, loading, reload } = useCategoriesAdmin()
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleCreate(values) {
    const { error } = await createCategory(values)

    if (error) {
      toast.error(
        error.code === '23505'
          ? 'Já existe uma categoria com esse nome ou slug.'
          : error.message || 'Não foi possível criar a categoria.',
      )
      return
    }

    toast.success('Categoria criada com sucesso!')
    setModalState(null)
    reload()
  }

  async function handleUpdate(values) {
    const { error } = await updateCategory(modalState.category.id, values)

    if (error) {
      toast.error(
        error.code === '23505'
          ? 'Já existe uma categoria com esse nome ou slug.'
          : error.message || 'Não foi possível atualizar a categoria.',
      )
      return
    }

    toast.success('Categoria atualizada com sucesso!')
    setModalState(null)
    reload()
  }

  async function handleDelete() {
    setIsDeleting(true)
    const { deleted, error } = await deleteCategory(deleteTarget.id)
    setIsDeleting(false)

    if (!deleted) {
      toast.error(
        error?.code === '23503'
          ? 'Essa categoria possui notícias vinculadas e não pode ser excluída.'
          : error?.message || 'Não foi possível excluir a categoria.',
      )
      setDeleteTarget(null)
      return
    }

    toast.success('Categoria excluída com sucesso!')
    setDeleteTarget(null)
    reload()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Categorias</h1>
        <Button onClick={() => setModalState({ mode: 'create' })}>
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria cadastrada ainda" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{category.name}</td>
                  <td className="px-5 py-3 text-gray-500">{category.slug}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-gray-500">
                    {category.description || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: 'edit', category })}
                        aria-label="Editar"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
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
      )}

      <Modal
        isOpen={Boolean(modalState)}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <CategoryForm
          defaultValues={modalState?.mode === 'edit' ? modalState.category : undefined}
          onSubmit={modalState?.mode === 'edit' ? handleUpdate : handleCreate}
          submitLabel={modalState?.mode === 'edit' ? 'Salvar alterações' : 'Criar categoria'}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir categoria"
        description={
          <>
            Tem certeza que deseja excluir a categoria <strong>{deleteTarget?.name}</strong>? Essa ação
            não pode ser desfeita.
          </>
        }
      />
    </div>
  )
}

export default ManageCategories
