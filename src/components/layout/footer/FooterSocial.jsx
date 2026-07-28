import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from './SocialIcons'
import FooterColumn from './FooterColumn'
import FooterContact from './FooterContact'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/difusorahd/',
    Icon: FacebookIcon,
    hoverClassName: 'hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/difusorahd/',
    Icon: InstagramIcon,
    hoverClassName:
      'hover:border-transparent hover:bg-gradient-to-tr hover:from-[#FEDA75] hover:via-[#D62976] hover:to-[#4F5BD5] hover:text-white',
  },
  {
    name: 'X',
    href: 'https://x.com/DifusoraHD',
    Icon: XIcon,
    hoverClassName: 'hover:border-white hover:bg-white hover:text-black',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@DifusorahdEssencial',
    Icon: YoutubeIcon,
    hoverClassName: 'hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white',
  },
]

function FooterSocial() {
  return (
    <FooterColumn title="Redes sociais">
      <div className="flex items-center gap-3">
        {SOCIAL_LINKS.map(({ name, href, Icon, hoverClassName }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${hoverClassName}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>

      <div className="mt-8">
        <FooterContact />
      </div>
    </FooterColumn>
  )
}

export default FooterSocial
