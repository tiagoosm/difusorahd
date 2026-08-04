import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useScrolled } from '../../../hooks/useScrolled'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd-icon-white.png'
import CategoriesDropdown from './CategoriesDropdown'
import NavbarSearch from './NavbarSearch'
import MobileMenu from './MobileMenu'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const isScrolled = useScrolled()
  const { categories, loading } = useCategories()
  const mobileMenuButtonRef = useRef(null)

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
    mobileMenuButtonRef.current?.focus()
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-brand-600 transition-shadow duration-300 ${
          isScrolled ? 'shadow-lg shadow-black/20' : ''
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
          {isMobileSearchOpen ? (
            <NavbarSearch
              fullWidth
              autoFocus
              onSubmitSuccess={() => setIsMobileSearchOpen(false)}
              onCancel={() => setIsMobileSearchOpen(false)}
            />
          ) : (
            <>
              <Link
                to={ROUTES.home}
                className="flex shrink-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              >
                <img src={logo} alt="Difusora HD" className="h-10 w-auto" />
              </Link>

              <nav className="hidden items-center gap-8 md:flex">
                <NavLink to={ROUTES.home} end className="group relative py-1.5">
                  {({ isActive }) => (
                    <>
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isActive ? 'text-white' : 'text-white/85 group-hover:text-white'
                        }`}
                      >
                        Início
                      </span>
                      <span
                        className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-white transition-transform duration-200 ease-out ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                <CategoriesDropdown categories={categories} loading={loading} />
              </nav>

              <div className="flex flex-1 items-center justify-end gap-1.5">
                <div className="hidden md:block">
                  <NavbarSearch />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(true)}
                  aria-label="Pesquisar"
                  className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:hidden"
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  ref={mobileMenuButtonRef}
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Abrir menu"
                  aria-haspopup="true"
                  aria-expanded={isMobileMenuOpen}
                  className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        categories={categories}
        loading={loading}
      />
    </>
  )
}

export default Navbar
