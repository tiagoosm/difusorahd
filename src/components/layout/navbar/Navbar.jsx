import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd.png'
import NavbarSearch from './NavbarSearch'
import CategoryStrip from './CategoryStrip'
import MobileMenu from './MobileMenu'

function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { categories, loading } = useCategories()

  // Compacta sutilmente ao rolar — não muda a estrutura, só reduz a
  // respiração vertical, então a navbar ocupa menos tela numa leitura longa
  // sem nunca sumir (mantém a busca e as categorias sempre à mão).
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 bg-brand-600 transition-shadow duration-200 ${
        isScrolled ? 'shadow-lg shadow-black/20' : 'shadow-md shadow-black/10'
      }`}
    >
      <div className="border-b border-white/10">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-200 ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
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
                <img
                  src={logo}
                  alt="Difusora HD"
                  className={`w-auto transition-[height] duration-200 ${isScrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-10'}`}
                />
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
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsMobileSearchOpen(true)
                  }}
                  aria-label="Pesquisar"
                  className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:invisible"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Botão de menu: só no mobile — no desktop a navegação por
                  categoria já fica sempre visível na faixa abaixo. */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Faixa de categorias sempre visível — só a partir de md. Abaixo
          disso, a navegação vive no menu (botão acima). */}
      <div className="hidden md:block">
        <CategoryStrip categories={categories} loading={loading} />
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-menu">
          <MobileMenu categories={categories} loading={loading} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  )
}

export default Navbar
