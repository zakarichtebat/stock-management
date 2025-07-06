import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getProducts, 
  getProduct, 
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  searchProducts as apiSearchProducts,
  adjustProductStock,
  updateProductStock
} from '../services/api'

export const useProductStore = defineStore('products', () => {
  // État
  const products = ref([])
  const currentProduct = ref(null)
  const stats = ref({
    total: 0,
    active: 0,
    lowStock: 0,
    expiring: 0,
    expired: 0
  })
  const loading = ref(false)
  const error = ref(null)
  const searchResults = ref([])

  // Getters
  const filteredProducts = computed(() => {
    return searchResults.value.length > 0 ? searchResults.value : products.value
  })

  const lowStockProducts = computed(() => 
    products.value.filter(p => p.quantity <= (p.minStock || 5))
  )
  
  const activeProducts = computed(() => 
    products.value.filter(p => p.isActive)
  )

  // Fonction utilitaire pour calculer les jours jusqu'à l'expiration
  const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return Infinity
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Actions
  async function fetchProducts() {
    loading.value = true
    error.value = null
    
    try {
      const response = await getProducts()
      products.value = response.data
      searchResults.value = [] // Réinitialiser les résultats de recherche
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchExpiring(days = 40) {
    if (products.value.length === 0) {
      await fetchProducts()
    }

    return products.value.filter(product => {
      if (!product.expirationDate) return false
      const daysLeft = getDaysUntilExpiration(product.expirationDate)
      return daysLeft > 0 && daysLeft <= days
    }).sort((a, b) => {
      const daysA = getDaysUntilExpiration(a.expirationDate)
      const daysB = getDaysUntilExpiration(b.expirationDate)
      return daysA - daysB
    })
  }

  async function fetchExpired() {
    if (products.value.length === 0) {
      await fetchProducts()
    }

    return products.value.filter(product => {
      if (!product.expirationDate) return false
      return getDaysUntilExpiration(product.expirationDate) <= 0
    })
  }

  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await getProduct(id)
      currentProduct.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Produit non trouvé'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProduct(productData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiCreateProduct(productData)
      products.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id, productData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiUpdateProduct(id, productData)
      
      // Mettre à jour la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id) {
    loading.value = true
    error.value = null
    
    try {
      await apiDeleteProduct(id)
      
      // Supprimer de la liste locale
      products.value = products.value.filter(p => p.id !== id)
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(query) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiSearchProducts(query)
      searchResults.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la recherche'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    loading.value = true
    error.value = null
    
    try {
      // Calculer les statistiques à partir des produits existants
      const total = products.value.length
      const active = products.value.filter(p => p.isActive).length
      const lowStock = products.value.filter(p => p.quantity <= (p.minStock || 5)).length
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
      const expiring = products.value.filter(p => {
        if (!p.expirationDate) return false
        const expDate = new Date(p.expirationDate)
        return expDate > now && expDate <= thirtyDaysFromNow
      }).length
      const expired = products.value.filter(p => {
        if (!p.expirationDate) return false
        return new Date(p.expirationDate) <= now
      }).length

      stats.value = {
        total,
        active,
        lowStock,
        expiring,
        expired
      }

      return stats.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des statistiques'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearSearch() {
    searchResults.value = []
  }

  // Nouvelle fonction pour ajuster le stock
  async function adjustStock(id, amount) {
    if (!id || typeof amount !== 'number') return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await adjustProductStock(id, amount)
      
      // Mettre à jour le produit dans la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      
      // Mettre à jour le produit courant si c'est celui qui est modifié
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajustement du stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Nouvelle fonction pour mettre à jour directement le stock
  async function updateStock(id, quantity) {
    if (!id || typeof quantity !== 'number' || quantity < 0) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await updateProductStock(id, quantity)
      
      // Mettre à jour le produit dans la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      
      // Mettre à jour le produit courant si c'est celui qui est modifié
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    products,
    currentProduct,
    loading,
    error,
    searchResults,
    stats,
    
    // Getters
    filteredProducts,
    lowStockProducts,
    activeProducts,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    fetchStats,
    fetchExpiring,
    fetchExpired,
    clearError,
    clearSearch,
    adjustStock,
    updateStock
  }
}) 