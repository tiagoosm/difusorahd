import { NavLink } from 'react-router-dom'
import { ROUTES, buildPath } from '../../../routes/paths'

// Faixa de navegação por categorias, sempre visível (desktop e mobile) —
// é a "seção 2" da Navbar, abaixo do mastro (logo + busca).
function CategoryStrip({ categories, loading }) {
  return (
    <nav aria-label="Categorias" className="bg-brand-700">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
        <CategoryLink to={ROUTES.home} end>
          Início
        </CategoryLink>

        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="h-4 w-16 shrink-0 animate-pulse rounded bg-white/10" />
            ))
          : categories.map((category) => (
              <CategoryLink key={category.id} to={buildPath.category(category.slug)}>
                {category.name}
              </CategoryLink>
            ))}
      </div>
    </nav>
  )
}

function CategoryLink({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="group relative shrink-0 rounded-md py-1 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
    >
      {({ isActive }) => (
        <>
          <span
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
              isActive ? 'text-white' : 'text-white/75 group-hover:text-white'
            }`}
          >
            {children}
          </span>
          <span
            className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-white transition-transform duration-200 ease-out ${
              isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </>
      )}
    </NavLink>
  )
}

export default CategoryStrip
