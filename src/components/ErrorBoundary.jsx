import { Component } from 'react'

// Needs to be a class component: it's the only way to implement
// componentDidCatch/getDerivedStateFromError in React — there's no
// equivalent hook. Without this, a render error in any component (an
// unexpected field coming from Supabase, for example) took down the
// entire page into a blank white screen, with no explanation for the visitor.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-700 to-brand-900 px-4 py-16 text-center">
        <span className="text-6xl font-bold tracking-tight text-white sm:text-7xl">:(</span>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Algo deu errado nesta página</h1>
          <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            Um erro inesperado interrompeu o carregamento. Tente recarregar a página — se o problema
            continuar, volte para a página inicial.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* window.location (not react-router) on purpose: after a render
              error you can't trust that the app's state is still
              consistent, so the reset needs to reload everything from scratch. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            Recarregar página
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
          >
            Voltar para a Home
          </a>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
