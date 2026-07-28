import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!email) return

    // TODO: integrar com serviço de newsletter quando o backend existir.
    setSubscribed(true)
    setEmail('')
  }

  return (
    <div className="border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent px-6 py-8 sm:px-10 lg:flex-row">
          <div className="text-center lg:text-left">
            <h2 className="text-lg font-semibold text-white">Fique por dentro</h2>
            <p className="mt-1 text-sm text-white/60">
              Receba notícias e destaques diretamente no seu e-mail.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              aria-label="Seu e-mail"
              className="w-full flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-brand-500"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Inscrito!
                </>
              ) : (
                <>
                  Inscrever-se
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewsletterSection
