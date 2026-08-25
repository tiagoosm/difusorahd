import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

// retry:1 (não o padrão 3 do React Query) pra manter o erro aparecendo
// rápido pro visitante em vez de ficar tentando em silêncio por ~10s antes
// do ErrorState mostrar o botão de "tentar novamente". refetchOnWindowFocus
// desligado: um portal de notícias não precisa refazer a query toda vez que
// o visitante volta pra aba, e isso evitava re-disparar efeitos como
// incrementNewsViews/trackPageView sem necessidade.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
