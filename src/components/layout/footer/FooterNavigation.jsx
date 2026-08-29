import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import FooterColumn from './FooterColumn'

const LINKS = [
  { label: 'Início', to: ROUTES.home },
  { label: 'Buscar notícias', to: ROUTES.search },
  // Acesso permanente ao cadastro do sorteio, pra quem fechou o pop-up e
  // quer participar depois.
  { label: '🎁 Participe do sorteio', to: ROUTES.sweepstakes },
]

function FooterNavigation() {
  return (
    <FooterColumn title="Navegação">
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            // py-1.5 leva a área clicável a 26px de altura — abaixo disso o
            // link falhava o mínimo de 24px do WCAG 2.2 (SC 2.5.8).
            className="group flex items-center gap-1.5 py-1.5 text-sm text-white/85 transition-colors hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5 text-white opacity-0 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100" />
            <span className="transition-transform group-hover:translate-x-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </FooterColumn>
  )
}

export default FooterNavigation
