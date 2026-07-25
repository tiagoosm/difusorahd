import { useState } from 'react'
import { Search } from 'lucide-react'

function SearchBar({ defaultValue = '', onSearch, placeholder = 'Pesquisar notícias...' }) {
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(event) {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Pesquisar
      </button>
    </form>
  )
}

export default SearchBar
