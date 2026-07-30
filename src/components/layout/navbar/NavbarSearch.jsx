import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'

// Mesmo componente para desktop (pill que expande com foco, via
// focus-within) e mobile (fullWidth=true, controlado pela Navbar).
function NavbarSearch({ fullWidth = false, autoFocus = false, onSubmitSuccess, onCancel }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    navigate(`${ROUTES.search}?${new URLSearchParams({ q: trimmed })}`)
    inputRef.current?.blur()
    onSubmitSuccess?.()
  }

  function handleClear() {
    setValue('')
    if (onCancel) {
      onCancel()
    } else {
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape') return
    setValue('')
    onCancel?.()
    inputRef.current?.blur()
  }

  const showClear = value.length > 0 || Boolean(onCancel)

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative ${fullWidth ? 'w-full' : 'shrink-0'}`}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        placeholder="Pesquisar notícias..."
        aria-label="Pesquisar notícias"
        className={`rounded-full border border-gray-200 bg-gray-50 py-2 pr-9 pl-9 text-sm text-gray-900 outline-none transition-all duration-300 ease-out placeholder:text-gray-400 [&::-webkit-search-cancel-button]:appearance-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 ${
          fullWidth ? 'w-full' : 'w-56 focus:w-80'
        }`}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar pesquisa"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  )
}

export default NavbarSearch
