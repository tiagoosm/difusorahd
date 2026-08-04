import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useScrolled } from '../../../hooks/useScrolled'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd-icon-white.png'
import NavbarSearch from './NavbarSearch'
import CategoryStrip from './CategoryStrip'

function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const isScrolled = useScrolled()
  const { categories, loading } = useCategories()

  return (
    <header
      className={`sticky top-0 z-40 bg-brand-600 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      <div className="border-b border-white/10">
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
                <img src={logo} alt="Difusora HD" className="h-11 w-auto" />
              </Link>

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
            </>
          )}
        </div>
      </div>

      <CategoryStrip categories={categories} loading={loading} />
    </header>
  )
}

export default Navbar
