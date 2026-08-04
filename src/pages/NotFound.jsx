import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/paths'
import logo from '../assets/logo-difusora-hd.png'

const REDIRECT_SECONDS = 5

function NotFound() {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const navigate = useNavigate()

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate(ROUTES.home, { replace: true })
      return
    }

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-brand-700 to-brand-900 px-4 py-16 text-center">
      <Link to={ROUTES.home} className="inline-flex items-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none">
        <img src={logo} alt="Difusora HD" className="h-10 w-auto" />
      </Link>

      <div className="flex flex-col items-center gap-4">
        <span className="text-7xl font-bold tracking-tight text-white sm:text-8xl">404</span>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Ops! A página que você procura não foi encontrada.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
          A página pode ter sido removida, renomeada ou o endereço informado está incorreto.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-white/70">
          Você será redirecionado automaticamente para a página inicial em{' '}
          <span className="font-semibold text-white">{secondsLeft}</span>{' '}
          {secondsLeft === 1 ? 'segundo' : 'segundos'}.
        </p>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / REDIRECT_SECONDS) * 100}%` }}
          />
        </div>

        <Link
          to={ROUTES.home}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  )
}

export default NotFound
