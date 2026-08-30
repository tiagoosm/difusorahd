import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

// retry:1 (not React Query's default of 3) to keep the error showing up
// fast for the visitor instead of silently retrying for ~10s before
// ErrorState shows the "try again" button. refetchOnWindowFocus turned
// off: a news portal doesn't need to redo the query every time the
// visitor comes back to the tab, and this avoided re-triggering effects
// like incrementNewsViews/trackPageView unnecessarily.
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
