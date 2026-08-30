import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './paths'
import ProtectedRoute from './ProtectedRoute'
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'
import Spinner from '../components/ui/Spinner'

import Home from '../pages/Home'
import NewsDetail from '../pages/NewsDetail'
import Category from '../pages/Category'
import Search from '../pages/Search'
import Sweepstakes from '../pages/Sweepstakes'
import NotFound from '../pages/NotFound'

// Admin area loaded on demand: regular readers never download this code
// (rich text editor, forms, etc.), only whoever visits /admin.
const Login = lazy(() => import('../pages/admin/Login'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const Analytics = lazy(() => import('../pages/admin/Analytics'))
const ManageNews = lazy(() => import('../pages/admin/ManageNews'))
const NewNews = lazy(() => import('../pages/admin/NewNews'))
const EditNews = lazy(() => import('../pages/admin/EditNews'))
const ManageFeatured = lazy(() => import('../pages/admin/ManageFeatured'))
const ManageCategories = lazy(() => import('../pages/admin/ManageCategories'))
const ManageAds = lazy(() => import('../pages/admin/ads/ManageAds'))
const NewAd = lazy(() => import('../pages/admin/ads/NewAd'))
const EditAd = lazy(() => import('../pages/admin/ads/EditAd'))
const ManageSweepstakes = lazy(() => import('../pages/admin/ManageSweepstakes'))
const Profile = lazy(() => import('../pages/admin/Profile'))

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public area */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.newsDetail} element={<NewsDetail />} />
        <Route path={ROUTES.category} element={<Category />} />
        <Route path={ROUTES.search} element={<Search />} />
        <Route path={ROUTES.sweepstakes} element={<Sweepstakes />} />
      </Route>

      {/* Login (outside the protected layout) */}
      <Route
        path={ROUTES.adminLogin}
        element={
          <Suspense fallback={<AdminFallback />}>
            <Login />
          </Suspense>
        }
      />

      {/* Protected admin area */}
      <Route
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.adminDashboard} element={<Dashboard />} />
        <Route path={ROUTES.adminAnalytics} element={<Analytics />} />
        <Route path={ROUTES.adminNews} element={<ManageNews />} />
        <Route path={ROUTES.adminNewsNew} element={<NewNews />} />
        <Route path={ROUTES.adminNewsEdit} element={<EditNews />} />
        <Route path={ROUTES.adminFeatured} element={<ManageFeatured />} />
        <Route path={ROUTES.adminCategories} element={<ManageCategories />} />
        <Route path={ROUTES.adminAds} element={<ManageAds />} />
        <Route path={ROUTES.adminAdsNew} element={<NewAd />} />
        <Route path={ROUTES.adminAdsEdit} element={<EditAd />} />
        <Route path={ROUTES.adminSweepstakes} element={<ManageSweepstakes />} />
        <Route path={ROUTES.adminProfile} element={<Profile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
