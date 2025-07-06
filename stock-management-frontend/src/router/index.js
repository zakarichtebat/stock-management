import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../views/ProductsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/new',
    name: 'product-create',
    component: () => import('../views/ProductCreateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/products/:id/edit',
    name: 'product-edit',
    component: () => import('../views/ProductEditView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/alerts',
    name: 'alerts',
    component: () => import('../views/AlertsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/StatsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard pour l'authentification
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Rediriger vers le dashboard si déjà connecté et tentative d'accès à login/register
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router 