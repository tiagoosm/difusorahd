import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import AdBanner from '../ads/AdBanner'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <AdBanner position="FOOTER" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={ROUTES.home} className="font-semibold text-gray-900">
            Portal de Notícias
          </Link>
          <p>&copy; {year} Portal de Notícias. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
