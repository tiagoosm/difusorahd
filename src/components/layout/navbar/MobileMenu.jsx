import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES, buildPath } from '../../../routes/paths'
import NavbarSearch from './NavbarSearch'

// Painel do menu mobile: substitui a rolagem horizontal de categorias por
// uma lista vertical organizada, acessível via um botão de menu — o site
// tem 9 categorias, rolar todas na horizontal numa tela de 375px exige
// vários swipes só pra ver as últimas opções.
//
// Puramente controlado por `isOpen` (a transição de entrada/saída e o
// timing de desmontagem ficam no Navbar, que é quem sabe quando o painel
// realmente precisa sair do DOM) — todo caminho de fechar (botão do menu,
// clique fora, Esc, clicar num link) passa pelo mesmo `onRequestClose` e
// portanto pela mesma animação.
function MobileMenu({ isOpen, categories, loading, onRequestClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onRequestClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRequestClose])

  return (
    <>
      {/* Fundo clicável: fecha o menu ao tocar fora dele. */}
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onRequestClose}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-[180ms] md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <nav
        aria-label="Menu principal"
        className={`absolute inset-x-0 top-full z-30 max-h-[calc(100vh-4rem)] overflow-y-auto bg-brand-700 shadow-lg transition-[opacity,transform] duration-[180ms] ease-out md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-6xl border-b border-white/10 px-4 py-3">
          <NavbarSearch onSubmitSuccess={onRequestClose} />
        </div>

        <ul className="mx-auto flex max-w-6xl flex-col divide-y divide-white/10 px-4">
          <MenuLink to={ROUTES.home} end onClick={onRequestClose}>
            Início
          </MenuLink>

          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="py-3.5">
                  <span className="block h-4 w-24 animate-pulse rounded bg-white/10" />
                </li>
              ))
            : categories.map((category) => (
                <MenuLink key={category.id} to={buildPath.category(category.slug)} onClick={onRequestClose}>
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
