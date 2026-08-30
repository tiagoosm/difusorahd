import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useCategories } from '../../../hooks/useCategories'
import logo from '../../../assets/logo-difusora-hd.png'
import NavbarSearch from './NavbarSearch'
import CategoryStrip from './CategoryStrip'
import MobileMenu from './MobileMenu'

// Duration of the mobile menu panel's enter/exit transition — needs to
// match the `duration-[180ms]` class used in MobileMenu.jsx.
const MOBILE_MENU_TRANSITION_MS = 180

function Navbar() {
  // "Mounted" controls whether the panel exists in the DOM; "open"
  // controls the CSS class that animates it. Opening mounts it and, on the
  // next frame, marks it open (so the transition starts from a real
  // initial state). Closing unmarks it first and only unmounts after the
  // transition — without this the panel was only ever animated on OPEN,
  // and vanished instantly on close.
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

  // Subtly compacts on scroll — doesn't change the structure, just
  // reduces vertical breathing room, so the navbar takes up less screen
  // during a long read without ever disappearing (keeps search and
  // categories always at hand).
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
      {/* relative z-40: without this, the mobile menu's fixed backdrop
          (positioned, z-30) paints over this entire row even with the
          <header> at z-40 — z-index only compares between positioned
          elements within the same stacking context, and nothing here had
          a position until now. Without this layer, the close button (the
          very icon that opened the menu) ended up "behind" the backdrop, unclickable. */}
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

          {/* Search takes up the center space — the main navigation
              element on desktop. On mobile it lives inside the menu (see
              MobileMenu), not here — the spacer on the right only exists
              to keep the desktop search bar centered (mirrors the logo's
              width), which is why it only shows up from md up, alongside it. */}
          <div className="hidden flex-1 justify-center md:flex">
            <div className="w-full max-w-xl">
              <NavbarSearch />
            </div>
          </div>

          <div className="hidden w-11 shrink-0 md:block" aria-hidden="true" />

          {/* Menu button: mobile only — on desktop, category navigation is
              already always visible in the strip below. */}
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

      {/* Always-visible category strip — only from md up. Below that,
          navigation lives in the menu (button above). */}
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
