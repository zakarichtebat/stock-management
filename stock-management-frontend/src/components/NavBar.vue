<!-- Template -->
<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo et titre -->
        <router-link to="/" class="navbar-brand">
          <div class="brand-logo">
            <i class="fas fa-boxes"></i>
          </div>
          <span class="brand-name">DIDOPRO</span>
        </router-link>

        <!-- Navigation principale -->
        <div class="navbar-nav" :class="{ 'active': isMenuOpen }">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'active': isCurrentRoute(item.path) }"
            @click="closeMenu"
          >
            <i class="fas" :class="item.icon"></i>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>

        <!-- Actions utilisateur -->
        <div class="navbar-actions">
          <!-- Notifications -->
          <div class="notifications-dropdown">
            <button 
              class="btn btn-icon"
              :class="{ 'has-notifications': hasNotifications }"
              @click="toggleNotifications"
            >
              <i class="fas fa-bell"></i>
              <span v-if="notifications.length" class="notification-badge">
                {{ notifications.length }}
              </span>
            </button>

            <div v-if="showNotifications" class="dropdown-menu">
              <div class="dropdown-header">
                <h3>Notifications</h3>
                <button 
                  v-if="notifications.length"
                  class="btn btn-link"
                  @click="clearNotifications"
                >
                  Tout marquer comme lu
                </button>
              </div>

              <div v-if="notifications.length" class="notifications-list">
                <div 
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="notification.type"
                >
                  <div class="notification-icon">
                    <i 
                      class="fas"
                      :class="{
                        'fa-exclamation-triangle': notification.type === 'warning',
                        'fa-info-circle': notification.type === 'info',
                        'fa-check-circle': notification.type === 'success',
                        'fa-times-circle': notification.type === 'error'
                      }"
                    ></i>
                  </div>
                  <div class="notification-content">
                    <p class="notification-text">{{ notification.message }}</p>
                    <span class="notification-time">
                      {{ formatNotificationTime(notification.timestamp) }}
                    </span>
                  </div>
                  <button 
                    class="btn btn-icon"
                    @click="dismissNotification(notification.id)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div v-else class="notifications-empty">
                <i class="fas fa-check-circle"></i>
                <p>Aucune nouvelle notification</p>
              </div>
            </div>
          </div>

          <!-- Menu utilisateur -->
          <div class="user-dropdown">
            <button 
              class="user-button"
              @click="toggleUserMenu"
            >
              <div class="user-avatar">
                <img 
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                />
                <span v-else class="avatar-placeholder">
                  {{ getUserInitials }}
                </span>
              </div>
              <span class="user-name">{{ user.name }}</span>
              <i 
                class="fas fa-chevron-down"
                :class="{ 'rotate': showUserMenu }"
              ></i>
            </button>

            <div v-if="showUserMenu" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user"></i>
                <span>Mon Profil</span>
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <i class="fas fa-cog"></i>
                <span>Paramètres</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item text-danger">
                <i class="fas fa-sign-out-alt"></i>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          <!-- Menu mobile -->
          <button 
            class="menu-toggle"
            :class="{ 'active': isMenuOpen }"
            @click="toggleMenu"
          >
            <span class="menu-icon"></span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'warning',
    message: '5 produits en stock faible',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    type: 'info',
    message: 'Nouvelle mise à jour disponible',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  }
])

const menuItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: 'fa-chart-line'
  },
  {
    path: '/products',
    label: 'Produits',
    icon: 'fa-box'
  },
  {
    path: '/quotes',
    label: 'Devis',
    icon: 'fa-file-invoice'
  },
  {
    path: '/invoices',
    label: 'Factures',
    icon: 'fa-file-invoice-dollar'
  },
  {
    path: '/reports',
    label: 'Rapports',
    icon: 'fa-chart-bar'
  }
]

const user = computed(() => {
  return {
    name: authStore.user?.name || 'Utilisateur',
    avatar: authStore.user?.avatar || null
  }
})

const getUserInitials = computed(() => {
  const name = user.value.name
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
})

const hasNotifications = computed(() => notifications.value.length > 0)

const isCurrentRoute = (path) => {
  return route.path === path
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showUserMenu.value = false
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showNotifications.value = false
  }
}

const formatNotificationTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: fr
  })
}

const dismissNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const clearNotifications = () => {
  notifications.value = []
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

const closeDropdowns = (event) => {
  const notificationsDropdown = document.querySelector('.notifications-dropdown')
  const userDropdown = document.querySelector('.user-dropdown')
  
  if (!notificationsDropdown?.contains(event.target)) {
    showNotifications.value = false
  }
  
  if (!userDropdown?.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
/* ==========================================================================
   Navbar - Structure principale
   ========================================================================== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: var(--box-shadow);
  z-index: var(--z-fixed);
}

.navbar-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* ==========================================================================
   Logo et Marque
   ========================================================================== */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: var(--border-radius);
  color: white;
  font-size: 1.25rem;
}

.brand-name {
  font-size: 1.25rem;
  display: none;
}

@media (min-width: 768px) {
  .brand-name {
    display: block;
  }
}

/* ==========================================================================
   Navigation principale
   ========================================================================== */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--secondary-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.nav-item:hover {
  background: var(--light-color);
  color: var(--primary-color);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-label {
  display: none;
}

@media (min-width: 992px) {
  .nav-label {
    display: block;
  }
}

/* ==========================================================================
   Actions utilisateur (Notifications & Profil)
   ========================================================================== */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Notifications */
.notifications-dropdown {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--danger-color);
  color: white;
  border-radius: 9px;
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}

.notification-item:hover {
  background: var(--light-color);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex-grow: 1;
  min-width: 0;
}

.notification-text {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--secondary-color);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--gray-color);
}

/* Menu utilisateur */
.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-color);
  transition: var(--transition);
}

.user-button:hover {
  color: var(--primary-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--light-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--secondary-color);
}

.user-name {
  display: none;
}

@media (min-width: 768px) {
  .user-name {
    display: block;
  }
}

/* ==========================================================================
   Menus déroulants (Commun)
   ========================================================================== */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  margin-top: 0.5rem;
  animation: slideInDown 0.2s ease-in-out;
  z-index: var(--z-dropdown);
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--secondary-color);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--secondary-color);
  text-decoration: none;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--light-color);
  color: var(--primary-color);
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

/* ==========================================================================
   Menu Mobile
   ========================================================================== */
.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.menu-icon,
.menu-icon::before,
.menu-icon::after {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--secondary-color);
  position: absolute;
  left: 8px;
  transition: var(--transition);
}

.menu-icon {
  top: 19px;
}

.menu-icon::before {
  content: '';
  top: -8px;
}

.menu-icon::after {
  content: '';
  bottom: -8px;
}

.menu-toggle.active .menu-icon {
  background: transparent;
}

.menu-toggle.active .menu-icon::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-toggle.active .menu-icon::after {
  bottom: 0;
  transform: rotate(-45deg);
}

@media (max-width: 991px) {
  .menu-toggle {
    display: block;
  }

  .navbar-nav {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    background: white;
    padding: 1rem;
    transform: translateX(-100%);
    transition: var(--transition);
  }

  .navbar-nav.active {
    transform: translateX(0);
  }

  .nav-item {
    width: 100%;
    padding: 1rem;
  }

  .nav-label {
    display: block;
  }
}

/* ==========================================================================
   Animations
   ========================================================================== */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rotate {
  transform: rotate(180deg);
}

/* États des notifications */
.notification-item.warning .notification-icon {
  color: var(--warning-color);
}

.notification-item.info .notification-icon {
  color: var(--info-color);
}

.notification-item.success .notification-icon {
  color: var(--success-color);
}

.notification-item.error .notification-icon {
  color: var(--danger-color);
}
</style> 