import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '../services/api'

export const useProductStore = defineStore('products', () => {
  // État
  const products = ref([])
  const currentProduct = ref(null)
  const stats = ref({})
  const loading = ref(false)
  const error = ref(null)
  const searchResults = ref([])

  // Getters
  const lowStockProducts = computed(() => 
    products.value.filter(p => p.quantity <= (p.minStock || 5))
  )
  
  const activeProducts = computed(() => 
    products.value.filter(p => p.isActive)
  )

  // Actions
  async function fetchProducts() {
    loading.value = true
    error.value = null
    
    try {
      const response = await productService.getAll()
      products.value = response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await productService.getById(id)
      currentProduct.value = response
      return response
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
      const response = await productService.create(productData)
      products.value.unshift(response)
      return response
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
      const response = await productService.update(id, productData)
      
      // Mettre à jour la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = response
      }
      
      return response
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
      await productService.delete(id)
      
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

  async function searchProducts(filters) {
    loading.value = true
    error.value = null
    
    try {
      const response = await productService.search(filters)
      searchResults.value = response
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la recherche'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStock(id, quantity) {
    loading.value = true
    error.value = null
    
    try {
      const response = await productService.updateStock(id, quantity)
      
      // Mettre à jour la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index].quantity = response.quantity
      }
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function adjustStock(id, adjustment) {
    loading.value = true
    error.value = null
    
    try {
      const response = await productService.adjustStock(id, adjustment)
      
      // Mettre à jour la liste locale
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index].quantity = response.quantity
      }
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajustement du stock'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const response = await productService.getStats()
      stats.value = response
      return response
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
    }
  }

  async function fetchLowStock() {
    try {
      const response = await productService.getLowStock()
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      throw err
    }
  }

  async function fetchExpiring(days = 30) {
    try {
      const response = await productService.getExpiring(days)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  function clearSearch() {
    searchResults.value = []
  }

  return {
    // État
    products,
    currentProduct,
    stats,
    loading,
    error,
    searchResults,
    
    // Getters
    lowStockProducts,
    activeProducts,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    updateStock,
    adjustStock,
    fetchStats,
    fetchLowStock,
    fetchExpiring,
    clearError,
    clearSearch
  }
}) 