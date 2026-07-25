import { Link } from 'react-router-dom'
import { buildPath, ROUTES } from '../routes/paths'

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
      <p className="mt-2 text-gray-500">Construída na Etapa 8.</p>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="text-brand-600 hover:underline" to={buildPath.news('exemplo-de-noticia')}>
          Ver notícia
        </Link>
        <Link className="text-brand-600 hover:underline" to={buildPath.category('tecnologia')}>
          Ver categoria
        </Link>
        <Link className="text-brand-600 hover:underline" to={ROUTES.search}>
          Pesquisar
        </Link>
        <Link className="text-brand-600 hover:underline" to={ROUTES.adminLogin}>
          Login admin
        </Link>
      </nav>
    </div>
  )
}

export default Home
