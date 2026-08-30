import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useCategories } from '../../hooks/useCategories'
import { slugify } from '../../utils/slugify'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Editor from '../ui/Editor'
import Button from '../ui/Button'
import FileUpload from '../ui/FileUpload'

const EMPTY_VALUES = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  cover_image_caption: null,
  audio_url: null,
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

  // Auto-generates the slug from the title only when creating; when editing,
  // the existing slug doesn't change on its own (avoids breaking the public
  // link because of a tweak to the title).
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

      <Controller
        name="cover_image_url"
        control={control}
        rules={{ required: 'Envie a imagem de capa' }}
        render={({ field }) => (
          <FileUpload
            label="Imagem de capa"
            kind="image"
            accept="image/*"
            bucket="news-media"
            folder="covers"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      {errors.cover_image_url && (
        <span className="-mt-3 text-xs text-red-500">{errors.cover_image_url.message}</span>
      )}

      <Input
        id="cover_image_caption"
        label="Legenda da imagem (opcional)"
        placeholder="Ex: Foto: Divulgação"
        {...register('cover_image_caption')}
      />

      <Controller
        name="audio_url"
        control={control}
        render={({ field }) => (
          <FileUpload
            label="Áudio da notícia (opcional — ex: versão narrada)"
            kind="audio"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm,.flac"
            bucket="news-media"
            folder="audio"
            value={field.value}
            onChange={field.onChange}
          />
        )}
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
        <span className="text-sm font-medium text-ink-700">Conteúdo</span>
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

        <label className="mt-6 flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
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
