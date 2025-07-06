<template>
  <div id="app">
    <!-- Navigation -->
    <NavBar v-if="isAuthenticated" />

    <!-- Contenu principal -->
    <main class="main-content" :class="{ 'with-nav': isAuthenticated }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Notifications -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { useProductStore } from './stores/products'
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  
  components: {
    NavBar
  },
  
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const notification = ref(null)
    const productStore = useProductStore()
    const expiringCount = ref(0)
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }

    const showNotification = (message, type = 'info') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 5000)
    }

    const loadExpiringCount = async () => {
      try {
        const products = await productStore.fetchExpiring(40)
        expiringCount.value = products.length
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error)
      }
    }

    // Charger le compte initial et mettre à jour toutes les 5 minutes
    onMounted(() => {
      if (authStore.isAuthenticated) {
        loadExpiringCount()
        setInterval(loadExpiringCount, 5 * 60 * 1000)
      }
    })

    // Surveiller l'état d'authentification
    watch(() => authStore.isAuthenticated, (newValue) => {
      if (newValue) {
        loadExpiringCount()
      }
    })

    return {
      isAuthenticated,
      handleLogout,
      notification,
      showNotification,
      expiringCount
    }
  }
}
</script>

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Barre de navigation */
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo .logo-link {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

/* Contenu principal */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

.main-content.with-nav {
  padding-top: 4rem;
}

/* Notifications */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #27ae60;
}

.notification.error {
  background-color: #e74c3c;
}

.notification.info {
  background-color: #3498db;
}

.notification.warning {
  background-color: #f39c12;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Styles globaux */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn-success:hover {
  background-color: #219a52;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading::after {
  content: '';
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}

.alert-badge {
  background-color: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-left: 4px;
  font-weight: bold;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
