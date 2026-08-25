import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './routes/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <div className="min-h-screen bg-ink-50 font-sans">
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
