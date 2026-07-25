import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signIn, signOut, fetchProfile } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'
import { useSEO } from '../../hooks/useSEO'
import { ROUTES } from '../../routes/paths'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

function Login() {
  const navigate = useNavigate()
  const { user, isAdmin, loading } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  useSEO({ title: 'Login Administrativo', noindex: true })

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(ROUTES.adminDashboard, { replace: true })
    }
  }, [loading, user, isAdmin, navigate])

  async function onSubmit({ email, password }) {
    const { data, error } = await signIn(email, password)

    if (error) {
      toast.error('E-mail ou senha inválidos.')
      return
    }

    const { data: profile } = await fetchProfile(data.user.id)

    if (profile?.role !== 'admin') {
      await signOut()
      toast.error('Acesso restrito a administradores.')
      return
    }

    toast.success('Login realizado com sucesso!')
    navigate(ROUTES.adminDashboard)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-card"
      >
        <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500">Entre com sua conta de administrador.</p>

        <div className="mt-6 flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="voce@exemplo.com"
            error={errors.email?.message}
            {...register('email', { required: 'Informe seu e-mail' })}
          />
          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Informe sua senha' })}
          />
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-6 w-full">
          Entrar
        </Button>
      </form>
    </div>
  )
}

export default Login
