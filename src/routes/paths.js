// Padrões de rota, usados nas definições <Route path="...">
export const ROUTES = {
  home: '/',
  newsDetail: '/noticia/:slug',
  category: '/categoria/:slug',
  search: '/busca',
  adminLogin: '/admin/login',
  adminDashboard: '/admin',
  adminNews: '/admin/noticias',
  adminNewsNew: '/admin/noticias/nova',
  adminNewsEdit: '/admin/noticias/:id/editar',
  adminCategories: '/admin/categorias',
  adminAds: '/admin/anuncios',
  adminAdsNew: '/admin/anuncios/novo',
  adminAdsEdit: '/admin/anuncios/:id/editar',
  adminProfile: '/admin/perfil',
}

// URLs concretas, usadas em <Link to="..."> e navigate()
export const buildPath = {
  news: (slug) => `/noticia/${slug}`,
  category: (slug) => `/categoria/${slug}`,
  adminNewsEdit: (id) => `/admin/noticias/${id}/editar`,
  adminAdsEdit: (id) => `/admin/anuncios/${id}/editar`,
}
