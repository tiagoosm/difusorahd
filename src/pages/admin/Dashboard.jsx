import { useAuth } from '../../hooks/useAuth'

function Dashboard() {
  const { profile } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-500">Bem-vindo, {profile?.full_name || 'Administrador'}.</p>
      <p className="mt-6 text-gray-500">Construída completamente na Etapa 12.</p>
    </div>
  )
}

export default Dashboard
