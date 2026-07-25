import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold text-gray-900">404</h1>
      <p className="text-gray-500">Página não encontrada.</p>
      <Link to="/" className="text-brand-600 hover:underline">
        Voltar para a Home
      </Link>
    </div>
  )
}

export default NotFound
