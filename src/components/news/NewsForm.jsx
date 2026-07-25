import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useCategories } from '../../hooks/useCategories'
import { slugify } from '../../utils/slugify'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Editor from '../ui/Editor'
import Button from '../ui/Button'

const EMPTY_VALUES = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  category_id: '',
  status: 'draft',
  is_featured: false,
}

function NewsForm({ defaultValues, onSubmit, submitLabel = 'Salvar' }) {
  const { categories } = useCategories()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultValues ?? EMPTY_VALUES })

  const title = watch('title')

  // Auto-gera o slug a partir do título apenas ao criar; ao editar, o slug existente
  // não muda sozinho (evita quebrar o link público por causa de um ajuste no título).
  useEffect(() => {
    if (!defaultValues) {
      setValue('slug', slugify(title || ''))
    }
  }, [title, defaultValues, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        id="title"
        label="Título"
        placeholder="Título da notícia"
        error={errors.title?.message}
        {...register('title', { required: 'Informe o título' })}
      />

      <Input
        id="slug"
        label="Slug"
        placeholder="titulo-da-noticia"
        error={errors.slug?.message}
        {...register('slug', { required: 'Informe o slug' })}
      />

      <Input
        id="excerpt"
        label="Resumo"
        placeholder="Um breve resumo, exibido nos cards e na listagem"
        error={errors.excerpt?.message}
        {...register('excerpt', { required: 'Informe o resumo' })}
      />

      <Input
        id="cover_image_url"
        label="URL da imagem de capa"
        placeholder="https://..."
        error={errors.cover_image_url?.message}
        {...register('cover_image_url', { required: 'Informe a imagem de capa' })}
      />

      <Select
        id="category_id"
        label="Categoria"
        error={errors.category_id?.message}
        {...register('category_id', { required: 'Selecione uma categoria' })}
      >
        <option value="">Selecione...</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">Conteúdo</span>
        <Controller
          name="content"
          control={control}
          rules={{
            validate: (value) => (value && value !== '<p></p>') || 'Escreva o conteúdo da notícia',
          }}
          render={({ field }) => <Editor value={field.value} onChange={field.onChange} />}
        />
        {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Select id="status" label="Status" className="w-40" {...register('status')}>
          <option value="draft">Rascunho</option>
          <option value="published">Publicada</option>
        </Select>

        <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/30"
            {...register('is_featured')}
          />
          Destacar na Home
        </label>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-fit">
        {submitLabel}
      </Button>
    </form>
  )
}

export default NewsForm
