import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd.png'
import NavbarSearch from './NavbarSearch'
import CategoryStrip from './CategoryStrip'
import MobileMenu from './MobileMenu'

// Duração da transição de entrada/saída do painel do menu mobile — precisa
// bater com a classe `duration-[180ms]` usada em MobileMenu.jsx.
const MOBILE_MENU_TRANSITION_MS = 180

function Navbar() {
  // "Mounted" controla se o painel existe no DOM; "open" controla a classe
  // CSS que anima. Abrir monta e, no frame seguinte, marca como aberto (pra
  // a transição partir de um estado inicial real). Fechar desmarca primeiro
  // e só desmonta depois da transição — sem isso o painel só existia
  // animado ao ABRIR, e sumia instantaneamente ao fechar.
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { categories, loading } = useCategories()

  function openMobileMenu() {
    setIsMobileMenuMounted(true)
    requestAnimationFrame(() => setIsMobileMenuOpen(true))
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
    setTimeout(() => setIsMobileMenuMounted(false), MOBILE_MENU_TRANSITION_MS)
  }

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
      {/* relative z-40: sem isso, o fundo fixed do menu mobile (posicionado,
          z-30) pinta por cima desta linha inteira mesmo com o <header> tendo
          z-40 — z-index só compara entre elementos posicionados dentro do
          mesmo contexto de empilhamento, e nada aqui tinha position até
          agora. Sem essa camada, o botão de fechar (o próprio ícone que
          abriu o menu) ficava "atrás" do fundo, inclicável. */}
      <div className="relative z-40 border-b border-white/10">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-200 ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
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
              no desktop. No mobile ela mora dentro do menu (ver MobileMenu),
              não aqui — o espaçador à direita só existe pra manter a barra
              de busca do desktop centralizada (espelha a largura da logo),
              por isso só aparece a partir de md junto com ela. */}
          <div className="hidden flex-1 justify-center md:flex">
            <div className="w-full max-w-xl">
              <NavbarSearch />
            </div>
          </div>

          <div className="hidden w-11 shrink-0 md:block" aria-hidden="true" />

          {/* Botão de menu: só no mobile — no desktop a navegação por
              categoria já fica sempre visível na faixa abaixo. */}
          <button
            type="button"
            onClick={() => (isMobileMenuMounted ? closeMobileMenu() : openMobileMenu())}
            aria-label={isMobileMenuMounted ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuMounted}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none md:hidden"
          >
            {isMobileMenuMounted ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Faixa de categorias sempre visível — só a partir de md. Abaixo
          disso, a navegação vive no menu (botão acima). */}
      <div className="hidden md:block">
        <CategoryStrip categories={categories} loading={loading} />
      </div>

      {isMobileMenuMounted && (
        <div id="mobile-menu">
          <MobileMenu
            isOpen={isMobileMenuOpen}
            categories={categories}
            loading={loading}
            onRequestClose={closeMobileMenu}
          />
        </div>
      )}
    </header>
  )
}

export default Navbar
