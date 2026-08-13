import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  FilePlus,
  Star,
  FolderKanban,
  Megaphone,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react'
import { signOut } from '../../services/auth'
import { ROUTES } from '../../routes/paths'

const NAV_ITEMS = [
  { to: ROUTES.adminDashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.adminAnalytics, label: 'Análise', icon: BarChart3 },
  { to: ROUTES.adminNews, label: 'Notícias', icon: Newspaper },
  { to: ROUTES.adminNewsNew, label: 'Nova Notícia', icon: FilePlus },
  { to: ROUTES.adminFeatured, label: 'Destaques', icon: Star },
  { to: ROUTES.adminCategories, label: 'Categorias', icon: FolderKanban },
  { to: ROUTES.adminAds, label: 'Anúncios', icon: Megaphone },
  { to: ROUTES.adminProfile, label: 'Perfil', icon: UserCircle },
]

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    toast.success('Sessão encerrada.')
    navigate(ROUTES.adminLogin)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <span className="text-lg font-semibold text-gray-900">Portal Admin</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
