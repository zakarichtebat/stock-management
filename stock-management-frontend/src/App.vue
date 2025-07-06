<template>
  <div id="app">
    <!-- Barre de navigation -->
    <nav v-if="authStore.isAuthenticated" class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-logo">
          <router-link to="/dashboard" class="logo-link">
            📦 Stock Management
          </router-link>
        </div>

        <!-- Menu principal -->
        <div class="nav-menu">
          <router-link to="/dashboard" class="nav-link">
            📊 Dashboard
          </router-link>
          <router-link to="/products" class="nav-link">
            📦 Produits
          </router-link>
          <router-link to="/alerts" class="nav-link">
            🚨 Alertes
          </router-link>
          <router-link to="/stats" class="nav-link">
            📈 Statistiques
          </router-link>
        </div>

        <!-- Menu utilisateur -->
        <div class="nav-user">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <button @click="handleLogout" class="logout-btn">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="main-content" :class="{ 'with-nav': authStore.isAuthenticated }">
      <router-view />
    </main>

    <!-- Notifications -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const notification = ref(null)

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

    onMounted(() => {
      // Vérifier le token au chargement
      if (authStore.token) {
        authStore.validateToken()
      }
    })

    return {
      authStore,
      handleLogout,
      notification,
      showNotification
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
  min-height: 100vh;
  padding: 2rem;
}

.main-content.with-nav {
  min-height: calc(100vh - 80px);
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
</style>
