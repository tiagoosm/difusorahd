import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { GripVertical, Plus, X, Star, ImageOff } from 'lucide-react'
import { useFeaturedNewsAdmin } from '../../hooks/useFeaturedNewsAdmin'
import { useDragReorder } from '../../hooks/useDragReorder'
import { saveFeaturedNews } from '../../services/news'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import FeaturedNews from '../../components/news/FeaturedNews'
import FeaturedPicker from '../../components/admin/FeaturedPicker'

function ManageFeatured() {
  const { items: initialItems, loading } = useFeaturedNewsAdmin()
  const [items, setItems] = useState([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const { draggedId, handleDragStart, handleDragOver, handleDragEnd } = useDragReorder(items, setItems)

  const isDirty = initialItems.map((item) => item.id).join(',') !== items.map((item) => item.id).join(',')

  function handleRemove(id) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function handleAdd(item) {
    setItems((current) => [...current, item])
  }

  async function handleSave() {
    setIsSaving(true)
    const { error } = await saveFeaturedNews(items.map((item) => item.id))
    setIsSaving(false)

    if (error) {
      toast.error(error.message || 'Não foi possível salvar os destaques.')
      return
    }

    toast.success('Destaques atualizados com sucesso!')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Destaques</h1>
          <p className="mt-1 text-gray-500">
            Arraste para reordenar. O primeiro item é o destaque principal da Home.
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="secondary" onClick={() => setItems(initialItems)}>
              Descartar alterações
            </Button>
          )}
          <Button onClick={handleSave} loading={isSaving} disabled={!isDirty}>
            Salvar destaques
          </Button>
        </div>
      </div>

      <div className="flex max-w-2xl flex-col gap-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Nenhum destaque selecionado"
            description="Adicione notícias publicadas para preencher a seção de destaques da Home."
          />
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={handleDragStart(item.id)}
              onDragOver={handleDragOver(item.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-card transition-opacity ${
                draggedId === item.id ? 'opacity-40' : 'opacity-100'
              } ${index === 0 ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-200'}`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />

              <div
                className={`shrink-0 overflow-hidden rounded-lg bg-gray-100 ${
                  index === 0 ? 'h-16 w-24' : 'h-12 w-16'
                }`}
              >
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <ImageOff className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    index === 0 ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index === 0 ? 'Principal' : `Secundário ${index}`}
                </span>
                <p className="mt-1 truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-400">{formatDate(item.published_at)}</p>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                aria-label="Remover destaque"
                className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}

        <Button variant="secondary" onClick={() => setIsPickerOpen(true)} className="w-fit">
          <Plus className="h-4 w-4" />
          Adicionar destaque
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-gray-700">Preview da Home</span>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 sm:p-6">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              Adicione destaques para ver o preview.
            </p>
          ) : (
            <div className="pointer-events-none">
              <FeaturedNews items={items} />
            </div>
          )}
        </div>
      </div>

      <FeaturedPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAdd}
        excludeIds={items.map((item) => item.id)}
      />
    </div>
  )
}

export default ManageFeatured
