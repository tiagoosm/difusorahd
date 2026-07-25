import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { ROUTES, buildPath } from '../../routes/paths'

function Navbar() {
  const { categories } = useCategories()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearchClick() {
    setIsMenuOpen(false)
    navigate(ROUTES.search)
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight text-gray-900">
          Portal de Notícias
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((category) => (
            <NavLink
              key={category.id}
              to={buildPath.category(category.slug)}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900'
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
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3 md:hidden">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={buildPath.category(category.slug)}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
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
