import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Search, Home } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useEscapeKey } from '../../../hooks/useEscapeKey'
import CategoriesMenu from './CategoriesMenu'

const LINK_CLASSNAME =
  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none'

function MobileMenu({ isOpen, onClose, categories, loading }) {
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  useLockBodyScroll(isOpen)
  useOnClickOutside(panelRef, onClose, isOpen)
  useEscapeKey(onClose, isOpen)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`absolute top-0 right-0 flex h-full w-full max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="text-sm font-semibold text-gray-900">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
          <Link to={ROUTES.home} onClick={onClose} className={LINK_CLASSNAME}>
            <Home className="h-4 w-4 text-gray-400" />
            Início
          </Link>

          <Link to={ROUTES.search} onClick={onClose} className={LINK_CLASSNAME}>
            <Search className="h-4 w-4 text-gray-400" />
            Buscar
          </Link>

          <div className="mt-5 mb-2 px-3">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Categorias
            </span>
          </div>

          <CategoriesMenu categories={categories} loading={loading} onSelect={onClose} />
        </nav>
      </div>
    </div>
  )
}

export default MobileMenu
