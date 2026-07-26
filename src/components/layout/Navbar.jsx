import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { ROUTES, buildPath } from '../../routes/paths'
import logo from '../../assets/logo-difusora-hd.png'

function Navbar() {
  const { categories } = useCategories()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearchClick() {
    setIsMenuOpen(false)
    navigate(ROUTES.search)
  }

  return (
    <header className="bg-[#E81736]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to={ROUTES.home} className="flex items-center">
          <img src={logo} alt="Difusora HD" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((category) => (
            <NavLink
              key={category.id}
              to={buildPath.category(category.slug)}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/80 hover:text-white'
                }`
              }
            >
              {category.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="Pesquisar"
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/20 px-4 py-3 md:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={buildPath.category(category.slug)}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navbar
