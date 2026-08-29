import { Gift } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { SITE_NAME } from '../utils/seo'
import SweepstakesForm from '../components/sweepstakes/SweepstakesForm'

function Sweepstakes() {
  useSEO({
    title: `Sorteio — ${SITE_NAME}`,
    description: 'Cadastre-se para participar do sorteio da Difusora HD.',
    noindex: true,
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Gift className="h-7 w-7" />
        </span>
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
          Participe do nosso sorteio!
        </h1>
        <p className="max-w-md text-ink-600">
          Preencha seus dados abaixo para concorrer. É rápido, gratuito e você pode acompanhar as
          novidades do sorteio aqui na Difusora HD.
        </p>
      </header>

      <SweepstakesForm />
    </div>
  )
}

export default Sweepstakes
