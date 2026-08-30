import { Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { WhatsAppIcon, XIcon } from '../layout/footer/SocialIcons'

// Real brand icons (not generic ones) for each network: a plain chat
// bubble could be mistaken for "comments" — nonexistent on this site —
// instead of clearly signaling WhatsApp/X, since there's no text next to the icon.
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
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold tracking-wide text-ink-500 uppercase">Compartilhar</span>
      <div className="flex items-center gap-2">
        {shareLinks.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copiar link"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default ShareButtons
