import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd.png'
import NavbarSearch from './NavbarSearch'
import CategoryStrip from './CategoryStrip'

function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { categories, loading } = useCategories()

  return (
    <header className="sticky top-0 z-40 bg-brand-600 shadow-md shadow-black/10">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          {isMobileSearchOpen ? (
            <NavbarSearch
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
                <img src={logo} alt="Difusora HD" className="h-8 w-auto sm:h-10" />
              </Link>

              {/* Busca ocupa o espaço central — elemento principal da navegação
                  no desktop. O espaçador à direita espelha a largura da logo
                  para que a barra fique realmente centralizada, não deslocada. */}
              <div className="hidden flex-1 justify-center md:flex">
                <div className="w-full max-w-xl">
                  <NavbarSearch />
                </div>
              </div>

              <div className="w-11 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(true)}
                  aria-label="Pesquisar"
                  className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:invisible"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CategoryStrip categories={categories} loading={loading} />
    </header>
  )
}

export default Navbar
