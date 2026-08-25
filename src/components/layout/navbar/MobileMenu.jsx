import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES, buildPath } from '../../../routes/paths'

// Painel do menu mobile: substitui a rolagem horizontal de categorias por
// uma lista vertical organizada, acessível via um botão de menu — o site
// tem 9 categorias, rolar todas na horizontal numa tela de 375px exige
// vários swipes só pra ver as últimas opções.
function MobileMenu({ categories, loading, onClose }) {
  // Fecha com Esc, como qualquer painel/diálogo temporário.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Fundo clicável: fecha o menu ao tocar fora dele. */}
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/40 md:hidden"
      />

      <nav
        aria-label="Menu principal"
        className="absolute inset-x-0 top-full z-30 max-h-[calc(100vh-4rem)] overflow-y-auto bg-brand-700 shadow-lg md:hidden"
      >
        <ul className="mx-auto flex max-w-6xl flex-col divide-y divide-white/10 px-4">
          <MenuLink to={ROUTES.home} end onClick={onClose}>
            Início
          </MenuLink>

          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="py-3.5">
                  <span className="block h-4 w-24 animate-pulse rounded bg-white/10" />
                </li>
              ))
            : categories.map((category) => (
                <MenuLink key={category.id} to={buildPath.category(category.slug)} onClick={onClose}>
                  {category.name}
                </MenuLink>
              ))}
        </ul>
      </nav>
    </>
  )
}

function MenuLink({ to, end, onClick, children }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          // py-3.5 (~24px + fonte) mantém a área de toque confortável — nada
          // de links espremidos numa lista que já precisa caber 10 itens.
          `block py-3.5 text-base font-medium transition-colors ${isActive ? 'text-white' : 'text-white/80 active:text-white'}`
        }
      >
        {children}
      </NavLink>
    </li>
  )
}

export default MobileMenu
