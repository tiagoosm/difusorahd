import { MapPin, Phone } from 'lucide-react'
import { WhatsAppIcon } from './SocialIcons'

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: 'Endereço',
    content: (
      <span>
        Rua Coronel José Inácio, 96
        <br />
        Centro, Pouso Alegre - MG
      </span>
    ),
  },
  {
    icon: Phone,
    label: 'Telefone',
    content: <a href="tel:+553534231488">(35) 3423-1488</a>,
  },
  {
    icon: WhatsAppIcon,
    label: 'WhatsApp',
    content: (
      <a href="https://wa.me/5535998661032" target="_blank" rel="noopener noreferrer">
        (35) 99866-1032
      </a>
    ),
  },
]

function FooterContact() {
  return (
    <ul className="flex flex-col gap-4">
      {CONTACT_ITEMS.map(({ icon: Icon, label, content }) => (
        <li key={label} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/15 text-white">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm text-white/85 [&_a]:text-white [&_a]:transition-colors [&_a:hover]:text-white/70">
            {content}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default FooterContact
