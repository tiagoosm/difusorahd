import { Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { WhatsAppIcon, XIcon } from '../layout/footer/SocialIcons'

// Ícones de marca reais (não genéricos) para cada rede: um balão de chat
// comum pode ser confundido com "comentários" — inexistente no site — em vez
// de sinalizar claramente WhatsApp/X, já que não há texto ao lado do ícone.
function ShareButtons({ title, url }) {
  const shareLinks = [
    {
      label: 'WhatsApp',
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      label: 'X (Twitter)',
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
  ]

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-500">Compartilhar:</span>
      {shareLinks.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copiar link"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default ShareButtons
