import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useCategories } from '../../../hooks/useCategories'
import { useScrollDirectionVisibility } from '../../../hooks/useScrollDirectionVisibility'
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
  const { categories, loading } = useCategories()
  // Desktop only in effect: the category strip below is already `hidden`
  // under md, so this never has anything visible to act on there (see
  // MobileMenu — categories live in the hamburger menu on mobile instead).
  const showCategories = useScrollDirectionVisibility()

  function openMobileMenu() {
    setIsMobileMenuMounted(true)
    requestAnimationFrame(() => setIsMobileMenuOpen(true))
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
    setTimeout(() => setIsMobileMenuMounted(false), MOBILE_MENU_TRANSITION_MS)
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-600 shadow-md shadow-black/10">
      {/* relative z-40: without this, the mobile menu's fixed backdrop
          (positioned, z-30) paints over this entire row even with the
          <header> at z-40 — z-index only compares between positioned
          elements within the same stacking context, and nothing here had
          a position until now. Without this layer, the close button (the
          very icon that opened the menu) ended up "behind" the backdrop, unclickable. */}
      <div className="relative z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link
            to={ROUTES.home}
            className="flex shrink-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            <img src={logo} alt="Difusora HD" className="h-8 w-auto sm:h-10" />
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

      {/* Category strip — only from md up (below that, navigation lives in
          the menu opened by the button above, untouched by any of this).
          The outer hidden/md:block is the existing responsive gate; the
          inner grid-rows is the scroll-direction show/hide: 1fr/0fr
          animates the row's height itself (via grid-template-rows,
          animatable and GPU-friendly) instead of sliding with
          translate/absolute positioning, so collapsing never leaves a
          gap and never causes a layout jump when it returns. `inert`
          while collapsed keeps its links out of the tab order — without
          it, keyboard users could tab into a strip that's not visibly there.
          (Scroll anchoring is disabled site-wide in index.css specifically
          because of this element — see the comment there.) */}
      <div className="hidden md:block">
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
            showCategories ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
          inert={!showCategories}
        >
          <div className="overflow-hidden">
            <CategoryStrip categories={categories} loading={loading} />
          </div>
        </div>
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
