import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'

// Única barra de pesquisa do site (sem duplicata na página de resultados).
// Sempre ocupa 100% do espaço do wrapper — a Navbar controla a largura
// (centralizada e larga no desktop, full-width no toggle mobile).
function NavbarSearch({ autoFocus = false, onSubmitSuccess, onCancel }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isOnSearchPage = location.pathname === ROUTES.search
  const urlQuery = isOnSearchPage ? (searchParams.get('q') ?? '') : ''

  const [value, setValue] = useState(urlQuery)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Mantém o campo refletindo o termo da URL: entrar direto em /busca?q=...,
  // navegar com o botão voltar/avançar, etc. Não interfere na digitação em
  // andamento, já que urlQuery só muda quando a navegação de fato acontece.
  useEffect(() => {
    setValue(urlQuery)
  }, [urlQuery])

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
    <form onSubmit={handleSubmit} role="search" className="group relative w-full">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        placeholder="Pesquisar notícias..."
        aria-label="Pesquisar notícias"
        className="w-full rounded-full border border-transparent bg-white py-2.5 pr-12 pl-4 text-sm text-ink-900 shadow-sm outline-none transition-shadow duration-200 placeholder:text-ink-500 [&::-webkit-search-cancel-button]:appearance-none focus:ring-2 focus:ring-white/70"
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar pesquisa"
          className="absolute top-1/2 right-11 -translate-y-1/2 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="submit"
        aria-label="Pesquisar"
        className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}

export default NavbarSearch
