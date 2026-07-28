import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import FooterColumn from './FooterColumn'

const LINKS = [
  { label: 'Início', to: ROUTES.home },
  { label: 'Buscar notícias', to: ROUTES.search },
]

function FooterNavigation() {
  return (
    <FooterColumn title="Navegação">
      <nav className="flex flex-col gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5 text-brand-500 opacity-0 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100" />
            <span className="transition-transform group-hover:translate-x-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </FooterColumn>
  )
}

export default FooterNavigation
