import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Navegações SPA trocam a árvore de componentes via History API, sem o reload
// completo que faria o navegador resetar a rolagem sozinho — por isso cada
// troca de rota via push precisa disparar isso manualmente. Navegações POP
// (botão voltar/avançar) ficam de fora: o navegador já restaura a posição de
// rolagem original sozinho, e forçar o topo quebraria essa expectativa.
//
// Para preservar a rolagem em algum caso futuro, navegue passando
// `state: { preserveScroll: true }`.
function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    if (location.state?.preserveScroll) return

    window.scrollTo(0, 0)
  }, [location.key, navigationType, location.state])

  return null
}

export default ScrollToTop
