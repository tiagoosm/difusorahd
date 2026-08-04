import { Link } from 'react-router-dom'
import { Newspaper, Radio, ShieldCheck } from 'lucide-react'
import { ROUTES } from '../../../routes/paths'
import logo from '../../../assets/logo-difusora-hd.png'
import AdBanner from '../../ads/AdBanner'
import FooterColumn from './FooterColumn'
import FooterNavigation from './FooterNavigation'
import FooterCategories from './FooterCategories'
import FooterSocial from './FooterSocial'
import FooterBottom from './FooterBottom'

const IDENTITY_BADGES = [
  { icon: Newspaper, label: 'Jornalismo' },
  { icon: Radio, label: 'Rádio' },
  { icon: ShieldCheck, label: 'Credibilidade' },
]

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-700 to-brand-900">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto mb-10 max-w-md">
          <AdBanner position="FOOTER" variant="dark" />
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8">
          <FooterColumn>
            <Link to={ROUTES.home} className="inline-flex items-center">
              <img src={logo} alt="Difusora HD" className="h-11 w-auto" />
            </Link>

            <p className="mt-5 text-sm font-medium text-white">
              Fundação São José do Paraíso
              <br />
              Rádio Difusora HD
            </p>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              Há décadas levando informação, entretenimento e credibilidade para a população de
              Pouso Alegre e região.
            </p>

            <div className="mt-6 flex gap-6">
              {IDENTITY_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </FooterColumn>

          <FooterNavigation />
          <FooterCategories />
          <FooterSocial />
        </div>
      </div>

      <FooterBottom />
    </footer>
  )
}

export default Footer
