import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { updateProfile } from '../../services/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: profile?.full_name ?? '',
    },
  })

  async function onSubmit({ full_name }) {
    const { error } = await updateProfile(user.id, { full_name })

    if (error) {
      toast.error(error.message || 'Não foi possível atualizar o perfil.')
      return
    }

    await refreshProfile()
    toast.success('Perfil atualizado com sucesso!')
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Perfil do Administrador</h1>
      <p className="mt-1 text-gray-500">Atualize suas informações de exibição.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex max-w-sm flex-col gap-4">
        <Input id="email" label="E-mail" value={user?.email ?? ''} disabled />
        <Input
          id="full_name"
          label="Nome completo"
          placeholder="Seu nome"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Informe seu nome' })}
        />
        <Button type="submit" loading={isSubmitting} className="w-fit">
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}

export default Profile
