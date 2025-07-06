<template>
  <div class="products-view">
    <div class="container">
      <!-- En-tête -->
      <div class="products-header">
        <h1>📦 Gestion des Produits</h1>
        <router-link to="/products/new" class="btn btn-primary">
          ➕ Ajouter un produit
        </router-link>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section card">
        <h2>🔍 Recherche et Filtres</h2>
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Nom du produit</label>
            <input
              v-model="filters.name"
              type="text"
              class="form-input"
              placeholder="Rechercher par nom..."
              @input="debounceSearch"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Catégorie</label>
            <input
              v-model="filters.category"
              type="text"
              class="form-input"
              placeholder="Catégorie..."
              @input="debounceSearch"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Fournisseur</label>
            <input
              v-model="filters.supplier"
              type="text"
              class="form-input"
              placeholder="Fournisseur..."
              @input="debounceSearch"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Prix min</label>
            <input
              v-model="filters.minPrice"
              type="number"
              class="form-input"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Prix max</label>
            <input
              v-model="filters.maxPrice"
              type="number"
              class="form-input"
              placeholder="1000"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Statut</label>
            <select v-model="filters.isActive" class="form-select">
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>

        <div class="filters-actions">
          <button @click="searchProducts" class="btn btn-primary">
            🔍 Rechercher
          </button>
          <button @click="clearFilters" class="btn btn-secondary">
            🗑️ Effacer
          </button>
          <button @click="loadProducts" class="btn btn-secondary">
            📋 Tous les produits
          </button>
        </div>
      </div>

      <!-- Résultats -->
      <div class="products-results">
        <div class="results-header">
          <h2>
            {{ displayedProducts.length }} produit(s) 
            <span v-if="isSearching">trouvé(s)</span>
          </h2>
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              :class="{ active: viewMode === 'grid' }"
              class="btn btn-secondary btn-sm"
            >
              🔲 Grille
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="{ active: viewMode === 'list' }"
              class="btn btn-secondary btn-sm"
            >
              📋 Liste
            </button>
          </div>
        </div>

        <!-- Chargement -->
        <div v-if="productStore.loading" class="loading">
          Chargement des produits...
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="displayedProducts.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Aucun produit trouvé</h3>
          <p>Essayez de modifier vos critères de recherche ou ajoutez un nouveau produit.</p>
          <router-link to="/products/new" class="btn btn-primary">
            ➕ Ajouter le premier produit
          </router-link>
        </div>

        <!-- Vue grille -->
        <div v-else-if="viewMode === 'grid'" class="products-grid">
          <div 
            v-for="product in displayedProducts" 
            :key="product.id" 
            class="product-card"
          >
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <span 
                class="product-status" 
                :class="{ active: product.isActive, inactive: !product.isActive }"
              >
                {{ product.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="product-info">
              <p class="product-category">{{ product.category }}</p>
              <p class="product-supplier">Fournisseur: {{ product.supplier }}</p>
              <div class="product-prices">
                <span class="purchase-price">Achat: {{ product.purchasePrice }}€</span>
                <span class="sale-price">Vente: {{ product.salePrice }}€</span>
              </div>
            </div>

            <div class="product-stock">
              <div class="stock-info">
                <span class="stock-quantity" :class="{ 'low-stock': product.quantity <= 5 }">
                  Stock: {{ product.quantity }}
                </span>
                <span class="min-stock">Min: {{ product.minStock || 0 }}</span>
              </div>
              <div class="stock-actions">
                <button 
                  @click="quickUpdateStock(product.id, product.quantity - 1)"
                  class="btn btn-secondary btn-sm"
                  :disabled="product.quantity <= 0"
                >
                  -
                </button>
                <button 
                  @click="quickUpdateStock(product.id, product.quantity + 1)"
                  class="btn btn-secondary btn-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div class="product-dates">
              <p class="entry-date">
                Entrée: {{ formatDate(product.entryDate) }}
              </p>
              <p 
                v-if="product.expirationDate" 
                class="expiration-date"
                :class="{ 'expiring': isExpiringSoon(product.expirationDate) }"
              >
                Expire: {{ formatDate(product.expirationDate) }}
              </p>
            </div>

            <div class="product-actions">
              <router-link 
                :to="`/products/${product.id}`" 
                class="btn btn-primary btn-sm"
              >
                👁️ Voir
              </router-link>
              <router-link 
                :to="`/products/${product.id}/edit`" 
                class="btn btn-secondary btn-sm"
              >
                ✏️ Modifier
              </router-link>
              <button 
                @click="deleteProduct(product.id)" 
                class="btn btn-danger btn-sm"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Vue liste -->
        <div v-else class="products-table">
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Prix Vente</th>
                <th>Statut</th>
                <th>Expiration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in displayedProducts" :key="product.id">
                <td>
                  <strong>{{ product.name }}</strong>
                  <br>
                  <small>{{ product.supplier }}</small>
                </td>
                <td>{{ product.category }}</td>
                <td>
                  <span :class="{ 'low-stock': product.quantity <= 5 }">
                    {{ product.quantity }}
                  </span>
                </td>
                <td>{{ product.salePrice }}€</td>
                <td>
                  <span 
                    class="status-badge" 
                    :class="{ active: product.isActive, inactive: !product.isActive }"
                  >
                    {{ product.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td>
                  <span 
                    v-if="product.expirationDate"
                    :class="{ 'expiring': isExpiringSoon(product.expirationDate) }"
                  >
                    {{ formatDate(product.expirationDate) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="actions-cell">
                  <router-link 
                    :to="`/products/${product.id}`" 
                    class="btn btn-primary btn-sm"
                  >
                    👁️
                  </router-link>
                  <router-link 
                    :to="`/products/${product.id}/edit`" 
                    class="btn btn-secondary btn-sm"
                  >
                    ✏️
                  </router-link>
                  <button 
                    @click="deleteProduct(product.id)" 
                    class="btn btn-danger btn-sm"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'

export default {
  name: 'ProductsView',
  setup() {
    const productStore = useProductStore()
    const viewMode = ref('grid')
    const isSearching = ref(false)
    let searchTimeout = null

    const filters = reactive({
      name: '',
      category: '',
      supplier: '',
      minPrice: '',
      maxPrice: '',
      isActive: ''
    })

    const displayedProducts = computed(() => {
      return isSearching.value ? productStore.searchResults : productStore.products
    })

    const searchProducts = async () => {
      try {
        isSearching.value = true
        
        // Préparer les filtres en convertissant les types
        const searchFilters = {}
        
        // Copier les filtres non-vides
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'minPrice' || key === 'maxPrice') {
              // Convertir en nombre pour les prix
              searchFilters[key] = parseFloat(value)
            } else if (key === 'isActive') {
              // Convertir en booléen
              searchFilters[key] = value === 'true'
            } else {
              // Garder comme string pour les autres
              searchFilters[key] = value
            }
          }
        })
        
        await productStore.searchProducts(searchFilters)
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        alert('Erreur lors de la recherche. Vérifiez vos critères.')
      }
    }

    const debounceSearch = () => {
      // Annuler la recherche précédente si elle existe
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      // Programmer une nouvelle recherche après 500ms
      searchTimeout = setTimeout(() => {
        searchProducts()
      }, 500)
    }

    const clearFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = ''
      })
      isSearching.value = false
      productStore.clearSearch()
    }

    const loadProducts = async () => {
      try {
        isSearching.value = false
        productStore.clearSearch()
        await productStore.fetchProducts()
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      }
    }

    const quickUpdateStock = async (productId, newQuantity) => {
      if (newQuantity < 0) return
      
      try {
        await productStore.updateStock(productId, newQuantity)
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error)
      }
    }

    const deleteProduct = async (productId) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

      try {
        await productStore.deleteProduct(productId)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    const isExpiringSoon = (expirationDate) => {
      const expDate = new Date(expirationDate)
      const now = new Date()
      const diffTime = expDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      productStore,
      viewMode,
      isSearching,
      filters,
      displayedProducts,
      searchProducts,
      debounceSearch,
      clearFilters,
      loadProducts,
      quickUpdateStock,
      deleteProduct,
      formatDate,
      isExpiringSoon
    }
  }
}
</script>

<style scoped>
.products-view {
  max-width: 1200px;
  margin: 0 auto;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.products-header h1 {
  color: #2c3e50;
  margin: 0;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h2 {
  color: #2c3e50;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-toggle button.active {
  background-color: #3498db;
  color: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-header h3 {
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.product-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.product-status.active {
  background-color: #d4edda;
  color: #155724;
}

.product-status.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.product-info {
  margin-bottom: 1rem;
}

.product-category {
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.product-supplier {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.product-prices {
  display: flex;
  gap: 1rem;
}

.purchase-price {
  color: #e74c3c;
  font-size: 0.9rem;
}

.sale-price {
  color: #27ae60;
  font-weight: 600;
}

.product-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stock-quantity {
  font-weight: 600;
  color: #2c3e50;
}

.stock-quantity.low-stock {
  color: #e74c3c;
}

.min-stock {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.stock-actions {
  display: flex;
  gap: 0.5rem;
}

.product-dates {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.product-dates p {
  margin: 0.25rem 0;
}

.expiration-date.expiring {
  color: #e74c3c;
  font-weight: 600;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.products-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.table tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.actions-cell {
  white-space: nowrap;
}

.actions-cell .btn {
  margin-right: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.low-stock {
  color: #e74c3c !important;
  font-weight: 600;
}

.expiring {
  color: #e74c3c !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-actions {
    flex-direction: column;
  }
  
  .product-stock {
    flex-direction: column;
    gap: 1rem;
  }
  
  .product-actions {
    justify-content: center;
  }
}
</style> 