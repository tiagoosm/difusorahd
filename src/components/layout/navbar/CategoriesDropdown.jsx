import { useRef, useState } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useEscapeKey } from '../../../hooks/useEscapeKey'
import CategoriesMenu from './CategoriesMenu'

function CategoriesDropdown({ categories, loading }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  const close = () => setIsOpen(false)

  function closeAndRefocus() {
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  useOnClickOutside(containerRef, close, isOpen)
  useEscapeKey(closeAndRefocus, isOpen)

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="group relative flex items-center gap-1.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
      >
        <Tag className="h-4 w-4" />
        Categorias
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        <span
          className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand-600 transition-transform duration-200 ease-out ${
            isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
          }`}
        />
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute top-full left-1/2 z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl shadow-black/10 transition-all duration-200 ease-out ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <CategoriesMenu categories={categories} loading={loading} onSelect={close} />
      </div>
    </div>
  )
}

export default CategoriesDropdown
