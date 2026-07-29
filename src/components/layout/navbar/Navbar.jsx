import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useScrolled } from '../../../hooks/useScrolled'
import logo from '../../../assets/logo-difusora-hd.png'
import CategoriesDropdown from './CategoriesDropdown'
import MobileMenu from './MobileMenu'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = useScrolled()
  const navigate = useNavigate()

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-[#E81736] transition-shadow duration-300 ${
          isScrolled ? 'shadow-lg shadow-black/15' : ''
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[padding] duration-300 ${
            isScrolled ? 'py-3' : 'py-4'
          }`}
        >
          <Link to={ROUTES.home} className="flex items-center">
            <img src={logo} alt="Difusora HD" className="-my-1 h-11 w-auto" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink
              to={ROUTES.home}
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/80 hover:text-white'
                }`
              }
            >
              Início
            </NavLink>

            <CategoriesDropdown />
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate(ROUTES.search)}
              aria-label="Pesquisar"
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
              aria-haspopup="true"
              aria-expanded={isMobileMenuOpen}
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}

export default Navbar
