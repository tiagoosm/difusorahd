import { useForm, Controller } from 'react-hook-form'
import Input from '../ui/Input'
import Switch from '../ui/Switch'
import Button from '../ui/Button'
import AdPositionSelector from './AdPositionSelector'
import UploadAdImage from './UploadAdImage'
import AdPreview from './AdPreview'

const EMPTY_VALUES = {
  title: '',
  image_url: '',
  link_url: '',
  position: '',
  priority: 0,
  start_date: '',
  end_date: '',
  active: true,
}

function AdForm({ defaultValues, onSubmit, submitLabel = 'Salvar' }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultValues ?? EMPTY_VALUES })

  const imageUrl = watch('image_url')
  const title = watch('title')
  const linkUrl = watch('link_url')
  const startDate = watch('start_date')
  const position = watch('position')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        id="title"
        label="Título"
        placeholder="Nome interno do anúncio (não aparece para o visitante)"
        error={errors.title?.message}
        {...register('title', { required: 'Informe o título' })}
      />

      <Controller
        name="image_url"
        control={control}
        rules={{ required: 'Envie a imagem do anúncio' }}
        render={({ field }) => <UploadAdImage value={field.value} onChange={field.onChange} />}
      />
      {errors.image_url && <span className="-mt-3 text-xs text-red-500">{errors.image_url.message}</span>}

      <AdPreview title={title} imageUrl={imageUrl} linkUrl={linkUrl} position={position} />

      <Input
        id="link_url"
        type="url"
        label="Link do anúncio"
        placeholder="https://..."
        error={errors.link_url?.message}
        {...register('link_url', { required: 'Informe o link do anúncio' })}
      />

      <Controller
        name="position"
        control={control}
        rules={{ required: 'Selecione a posição' }}
        render={({ field }) => <AdPositionSelector {...field} error={errors.position?.message} />}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="start_date"
          type="datetime-local"
          label="Data de início"
          error={errors.start_date?.message}
          {...register('start_date', { required: 'Informe a data de início' })}
        />
        <Input
          id="end_date"
          type="datetime-local"
          label="Data de término"
          error={errors.end_date?.message}
          {...register('end_date', {
            required: 'Informe a data de término',
            validate: (value) =>
              !startDate || value >= startDate || 'Deve ser igual ou posterior à data de início',
          })}
        />
      </div>

      <Input
        id="priority"
        type="number"
        label="Prioridade"
        placeholder="0"
        error={errors.priority?.message}
        {...register('priority', {
          required: 'Informe a prioridade',
          valueAsNumber: true,
          min: { value: 0, message: 'Não pode ser negativa' },
        })}
      />

      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <Switch id="active" label="Ativo" checked={field.value} onChange={field.onChange} />
        )}
      />

      <Button type="submit" loading={isSubmitting} className="w-fit">
        {submitLabel}
      </Button>
    </form>
  )
}

export default AdForm
