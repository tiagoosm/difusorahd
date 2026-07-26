import { Link } from 'react-router-dom'
import { ROUTES } from '../../routes/paths'
import AdBanner from '../ads/AdBanner'
import logo from '../../assets/logo-difusora-hd.png'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#E81736]">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <AdBanner position="FOOTER" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={ROUTES.home} className="flex items-center">
            <img src={logo} alt="Difusora HD" className="-my-1 h-11 w-auto" />
          </Link>
          <p>&copy; {year} Difusora HD. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
