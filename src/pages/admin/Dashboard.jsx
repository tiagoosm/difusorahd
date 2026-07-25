import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'
import { ROUTES } from '../../routes/paths'
import Button from '../../components/ui/Button'

function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    toast.success('Sessão encerrada.')
    navigate(ROUTES.adminLogin)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Bem-vindo, {profile?.full_name || 'Administrador'}.</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>
      <p className="mt-6 text-gray-500">Construída completamente na Etapa 12.</p>
    </div>
  )
}

export default Dashboard
