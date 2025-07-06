import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProductsView from '../views/ProductsView.vue'
import ProductCreateView from '../views/ProductCreateView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import ProductEditView from '../views/ProductEditView.vue'
import DashboardView from '../views/DashboardView.vue'
import AlertsView from '../views/AlertsView.vue'
import StatsView from '../views/StatsView.vue'
import QuotesView from '../views/QuotesView.vue'
import InvoicesView from '../views/InvoicesView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { useAuthStore } from '../stores/auth'
import QuoteCreateView from '../views/QuoteCreateView.vue'
import QuoteDetailView from '../views/QuoteDetailView.vue'
import InvoiceCreateView from '../views/InvoiceCreateView.vue'
import InvoiceDetailView from '../views/InvoiceDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/products/new',
      name: 'product-create',
      component: ProductCreateView,
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetailView,
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/products/:id/edit',
      name: 'product-edit',
      component: ProductEditView,
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: AlertsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/quotes',
      name: 'quotes',
      component: QuotesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/quotes/create',
      name: 'quote-create',
      component: QuoteCreateView,
      meta: { requiresAuth: true }
    },
    {
      path: '/quotes/:id',
      name: 'quote-detail',
      component: QuoteDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: InvoicesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices/create',
      name: 'invoice-create',
      component: InvoiceCreateView,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices/:id',
      name: 'invoice-detail',
      component: InvoiceDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 