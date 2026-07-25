import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './paths'

import Home from '../pages/Home'
import NewsDetail from '../pages/NewsDetail'
import Category from '../pages/Category'
import Search from '../pages/Search'
import NotFound from '../pages/NotFound'

import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import ManageNews from '../pages/admin/ManageNews'
import NewNews from '../pages/admin/NewNews'
import EditNews from '../pages/admin/EditNews'
import ManageCategories from '../pages/admin/ManageCategories'
import Profile from '../pages/admin/Profile'

function AppRoutes() {
  return (
    <Routes>
      {/* Área pública */}
      <Route path={ROUTES.home} element={<Home />} />
      <Route path={ROUTES.newsDetail} element={<NewsDetail />} />
      <Route path={ROUTES.category} element={<Category />} />
      <Route path={ROUTES.search} element={<Search />} />

      {/* Área administrativa */}
      <Route path={ROUTES.adminLogin} element={<Login />} />
      <Route path={ROUTES.adminDashboard} element={<Dashboard />} />
      <Route path={ROUTES.adminNews} element={<ManageNews />} />
      <Route path={ROUTES.adminNewsNew} element={<NewNews />} />
      <Route path={ROUTES.adminNewsEdit} element={<EditNews />} />
      <Route path={ROUTES.adminCategories} element={<ManageCategories />} />
      <Route path={ROUTES.adminProfile} element={<Profile />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
