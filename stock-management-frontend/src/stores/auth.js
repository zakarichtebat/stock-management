import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // État
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN')

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      
      token.value = response.access_token
      user.value = response.user
      
      // Sauvegarder dans localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.register(userData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'inscription'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function validateToken() {
    if (!token.value) return false
    
    try {
      const response = await authService.validateToken()
      return response.valid
    } catch (err) {
      logout()
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // État
    token,
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    validateToken,
    clearError
  }
}) 