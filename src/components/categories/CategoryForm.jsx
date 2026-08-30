import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { slugify } from '../../utils/slugify'
import Input from '../ui/Input'
import Button from '../ui/Button'

function CategoryForm({ defaultValues, onSubmit, submitLabel = 'Salvar' }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultValues ?? { name: '', slug: '', description: '' } })

  const name = watch('name')

  // Auto-generates the slug from the name only when creating; when
  // editing, the existing slug doesn't change on its own (avoids breaking
  // already-published links because of a tweak to the name).
  useEffect(() => {
    if (!defaultValues) {
      setValue('slug', slugify(name || ''))
    }
  }, [name, defaultValues, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        id="name"
        label="Nome"
        placeholder="Ex: Tecnologia"
        error={errors.name?.message}
        {...register('name', { required: 'Informe o nome da categoria' })}
      />
      <Input
        id="slug"
        label="Slug"
        placeholder="ex-tecnologia"
        error={errors.slug?.message}
        {...register('slug', { required: 'Informe o slug' })}
      />
      <Input
        id="description"
        label="Descrição (opcional)"
        placeholder="Uma breve descrição da categoria"
        {...register('description')}
      />
      <Button type="submit" loading={isSubmitting} className="w-fit">
        {submitLabel}
      </Button>
    </form>
  )
}

export default CategoryForm
