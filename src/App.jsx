import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './routes/ScrollToTop'

function App() {
  return (
    <div className="min-h-screen bg-ink-50 font-sans">
      <ScrollToTop />
      <AppRoutes />
      <Toaster position="top-right" />
    </div>
  )
}

export default App
