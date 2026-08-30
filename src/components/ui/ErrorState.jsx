import { WifiOff } from 'lucide-react'
import EmptyState from './EmptyState'

// Loading-failure state — deliberately different from EmptyState's
// "there's nothing here". Before, any network error fell into the empty
// state and the site said "no articles published" / "category not found",
// which is wrong information: the content exists, it just couldn't be loaded.
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
