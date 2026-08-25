import { WifiOff } from 'lucide-react'
import EmptyState from './EmptyState'

// Estado de falha de carregamento — deliberadamente diferente do EmptyState
// "não há nada aqui". Antes, qualquer erro de rede caía no estado vazio e o
// site dizia "nenhuma notícia publicada" / "categoria não encontrada", que é
// informação errada: o conteúdo existe, só não pôde ser carregado.
function ErrorState({
  title = 'Não foi possível carregar o conteúdo',
  description = 'Verifique sua conexão e tente novamente. Se o problema continuar, o serviço pode estar temporariamente indisponível.',
  onRetry,
}) {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Tentar novamente
          </button>
        )
      }
    />
  )
}

export default ErrorState
