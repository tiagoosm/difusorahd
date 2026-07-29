import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCategories } from '../../../hooks/useCategories'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'
import { useEscapeKey } from '../../../hooks/useEscapeKey'
import CategoriesMenu from './CategoriesMenu'

function CategoriesDropdown() {
  const { categories, loading } = useCategories()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const close = () => setIsOpen(false)

  useOnClickOutside(containerRef, close, isOpen)
  useEscapeKey(close, isOpen)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-white/85 transition-colors hover:text-white"
      >
        Categorias
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl shadow-black/10 transition-all duration-200 ease-out ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <CategoriesMenu categories={categories} loading={loading} layout="grid" onSelect={close} />
      </div>
    </div>
  )
}

export default CategoriesDropdown
