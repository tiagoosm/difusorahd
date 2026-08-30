import { Outlet } from 'react-router-dom'
import Navbar from './navbar/Navbar'
import Footer from './footer/Footer'
import SweepstakesPopup from '../sweepstakes/SweepstakesPopup'
import RadioBar from '../radio/RadioBar'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sem isto, quem navega por teclado tinha que passar pela logo, pela
          busca e por todas as categorias antes de chegar ao conteúdo, em
          cada troca de página. Só fica visível quando recebe foco. */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg focus:ring-2 focus:ring-brand-600 focus:outline-none"
      >
        Pular para o conteúdo
      </a>

      <Navbar />
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <SweepstakesPopup />
      <RadioBar />
    </div>
  )
}

export default PublicLayout
