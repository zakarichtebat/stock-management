<template>
  <div class="products-view">
    <div class="container">
      <!-- En-tête -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <font-awesome-icon icon="box" /> Gestion des Produits
          </h1>
          <p class="page-subtitle">Gérez votre inventaire de produits</p>
        </div>
        <div class="header-actions">
          <router-link to="/products/new" class="btn btn-primary">
            <font-awesome-icon icon="plus" /> Nouveau Produit
          </router-link>
        </div>
      </header>

      <!-- Filtres et recherche -->
      <section class="filters-section card">
        <div class="section-header">
          <h2 class="section-title">
            <font-awesome-icon icon="filter" /> Filtres et Recherche
          </h2>
          <div class="section-actions">
            <button @click="clearFilters" class="btn btn-secondary btn-sm">
              <font-awesome-icon icon="eraser" /> Effacer
            </button>
          </div>
        </div>

        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Nom du produit</label>
            <div class="input-group">
              <font-awesome-icon icon="search" class="input-icon" />
              <input
                v-model="filters.name"
                type="text"
                class="form-input"
                placeholder="Rechercher par nom..."
                @input="debounceSearch"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Catégorie</label>
            <div class="input-group">
              <font-awesome-icon icon="tags" class="input-icon" />
              <input
                v-model="filters.category"
                type="text"
                class="form-input"
                placeholder="Filtrer par catégorie..."
                @input="debounceSearch"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Fournisseur</label>
            <div class="input-group">
              <font-awesome-icon icon="truck" class="input-icon" />
              <input
                v-model="filters.supplier"
                type="text"
                class="form-input"
                placeholder="Filtrer par fournisseur..."
                @input="debounceSearch"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Prix minimum</label>
            <div class="input-group">
              <font-awesome-icon icon="euro-sign" class="input-icon" />
              <input
                v-model="filters.minPrice"
                type="number"
                class="form-input"
                placeholder="0"
                min="0"
                step="0.01"
                @input="debounceSearch"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Prix maximum</label>
            <div class="input-group">
              <font-awesome-icon icon="euro-sign" class="input-icon" />
              <input
                v-model="filters.maxPrice"
                type="number"
                class="form-input"
                placeholder="1000"
                min="0"
                step="0.01"
                @input="debounceSearch"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Statut</label>
            <div class="input-group">
              <font-awesome-icon icon="toggle-on" class="input-icon" />
              <select 
                v-model="filters.isActive" 
                class="form-select"
                @change="debounceSearch"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Résultats -->
      <section class="results-section">
        <div class="results-header">
          <div class="results-info">
            <h2 class="results-title">
              <span class="results-count">{{ displayedProducts.length }}</span>
              produit(s) {{ isSearching ? 'trouvé(s)' : '' }}
            </h2>
          </div>
          
          <div class="view-toggle">
            <button 
              @click="viewMode = 'grid'" 
              class="btn btn-icon"
              :class="{ active: viewMode === 'grid' }"
              title="Vue grille"
            >
              <font-awesome-icon icon="th-large" />
            </button>
            <button 
              @click="viewMode = 'list'" 
              class="btn btn-icon"
              :class="{ active: viewMode === 'list' }"
              title="Vue liste"
            >
              <font-awesome-icon icon="list" />
            </button>
          </div>
        </div>

        <!-- État de chargement -->
        <div v-if="productStore.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des produits...</p>
        </div>

        <!-- État vide -->
        <div v-else-if="displayedProducts.length === 0" class="empty-state">
          <div class="empty-icon">
            <font-awesome-icon icon="box-open" />
          </div>
          <h3>Aucun produit trouvé</h3>
          <p>Modifiez vos critères de recherche ou ajoutez un nouveau produit.</p>
          <router-link to="/products/new" class="btn btn-primary mt-3">
            <font-awesome-icon icon="plus" /> Ajouter un produit
          </router-link>
        </div>

        <!-- Vue grille -->
        <div 
          v-else-if="viewMode === 'grid'" 
          class="products-grid"
        >
          <div 
            v-for="product in displayedProducts" 
            :key="product.id" 
            class="product-card"
            :class="{ 'inactive': !product.isActive }"
          >
            <div class="product-image">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name"
                class="product-img"
                @error="handleImageError"
              />
              <div class="product-status" :class="{ active: product.isActive }">
                {{ product.isActive ? 'Actif' : 'Inactif' }}
              </div>
            </div>

            <div class="product-content">
              <div class="product-header">
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-category" v-if="product.category">
                  {{ product.category }}
                </div>
              </div>

              <div class="product-info">
                <div class="info-item">
                  <span class="info-label">Stock</span>
                  <span class="info-value">{{ product.quantity }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Prix</span>
                  <span class="info-value">{{ product.salePrice.toFixed(2) }} €</span>
                </div>
              </div>

              <div class="product-footer">
                <div class="product-actions">
                  <router-link 
                    :to="`/products/${product.id}`"
                    class="btn btn-icon"
                    title="Voir les détails"
                  >
                    <font-awesome-icon icon="eye" />
                  </router-link>
                  <router-link 
                    :to="`/products/${product.id}/edit`"
                    class="btn btn-icon"
                    title="Modifier"
                  >
                    <font-awesome-icon icon="edit" />
                  </router-link>
                  <button 
                    class="btn btn-icon btn-danger"
                    title="Supprimer"
                    @click="deleteProduct(product.id)"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue liste -->
        <div 
          v-else 
          class="products-list"
        >
          <div class="list-header">
            <div class="list-cell">Image</div>
            <div class="list-cell">Nom</div>
            <div class="list-cell">Catégorie</div>
            <div class="list-cell">Stock</div>
            <div class="list-cell">Prix</div>
            <div class="list-cell">Fournisseur</div>
            <div class="list-cell">Statut</div>
            <div class="list-cell">Actions</div>
          </div>

          <div 
            v-for="product in displayedProducts" 
            :key="product.id" 
            class="list-row"
            :class="{ 'inactive': !product.isActive }"
          >
            <div class="list-cell">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name"
                class="product-thumbnail"
                @error="handleImageError"
              />
            </div>
            <div class="list-cell">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-alerts" v-if="hasAlerts(product)">
                <div 
                  v-if="isLowStock(product)" 
                  class="alert-badge warning"
                  title="Stock faible"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div 
                  v-if="isExpiring(product)" 
                  class="alert-badge danger"
                  title="Expiration proche"
                >
                  <i class="fas fa-clock"></i>
                </div>
              </div>
            </div>
            <div class="list-cell">{{ product.category || '-' }}</div>
            <div class="list-cell">
              <span :class="getStockLevelClass(product)">
                {{ product.quantity }}
              </span>
            </div>
            <div class="list-cell">{{ formatPrice(product.salePrice) }}</div>
            <div class="list-cell">{{ product.supplier || '-' }}</div>
            <div class="list-cell">
              <div class="status-badge" :class="{ active: product.isActive }">
                {{ product.isActive ? 'Actif' : 'Inactif' }}
              </div>
            </div>
            <div class="list-cell actions">
              <router-link 
                :to="'/products/' + product.id" 
                class="btn btn-primary btn-icon btn-sm"
                title="Voir détails"
              >
                <i class="fas fa-eye"></i>
              </router-link>
              <button 
                @click="toggleProductStatus(product)"
                class="btn btn-icon btn-sm"
                :class="product.isActive ? 'btn-warning' : 'btn-success'"
                :title="product.isActive ? 'Désactiver' : 'Activer'"
              >
                <i class="fas" :class="product.isActive ? 'fa-toggle-off' : 'fa-toggle-on'"></i>
              </button>
              <button 
                @click="deleteProduct(product.id)"
                class="btn btn-danger btn-icon btn-sm"
                title="Supprimer"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal de confirmation -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-overlay" @click="cancelDelete"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button @click="cancelDelete" class="btn btn-icon">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Êtes-vous sûr de vouloir supprimer le produit 
            <strong>{{ productToDelete?.name }}</strong> ?
          </p>
          <p class="text-danger">Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-light">
            Annuler
          </button>
          <button @click="confirmDelete" class="btn btn-danger">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { useRouter } from 'vue-router'
import { getImageUrl, getDefaultProductImage } from '../utils/imageHelper'
import { debounce } from 'lodash'
import '@/assets/styles/products.css'

const productStore = useProductStore()
const router = useRouter()
const viewMode = ref('grid')
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const isSearching = ref(false)

const filters = ref({
  name: '',
  category: '',
  supplier: '',
  minPrice: '',
  maxPrice: '',
  isActive: ''
})

const displayedProducts = computed(() => {
  let filtered = productStore.filteredProducts

  // Apply filters
  if (filters.value.name) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  }
  if (filters.value.category) {
    filtered = filtered.filter(p => 
      p.category?.toLowerCase().includes(filters.value.category.toLowerCase())
    )
  }
  if (filters.value.supplier) {
    filtered = filtered.filter(p => 
      p.supplier?.toLowerCase().includes(filters.value.supplier.toLowerCase())
    )
  }
  if (filters.value.minPrice) {
    filtered = filtered.filter(p => 
      p.salePrice >= parseFloat(filters.value.minPrice)
    )
  }
  if (filters.value.maxPrice) {
    filtered = filtered.filter(p => 
      p.salePrice <= parseFloat(filters.value.maxPrice)
    )
  }
  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true'
    filtered = filtered.filter(p => p.isActive === isActive)
  }

  return filtered
})

const handleImageError = (event) => {
  event.target.src = getDefaultProductImage();
}

const clearFilters = () => {
  filters.value = {
    name: '',
    category: '',
    supplier: '',
    minPrice: '',
    maxPrice: '',
    isActive: ''
  }
  productStore.clearSearch()
  debounceSearch()
}

const debounceSearch = debounce(async () => {
  isSearching.value = true
  try {
    await productStore.searchProducts({
      name: filters.value.name,
      category: filters.value.category,
      supplier: filters.value.supplier,
      minPrice: filters.value.minPrice ? parseFloat(filters.value.minPrice) : undefined,
      maxPrice: filters.value.maxPrice ? parseFloat(filters.value.maxPrice) : undefined,
      isActive: filters.value.isActive === '' ? undefined : filters.value.isActive === 'true'
    })
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  } finally {
    isSearching.value = false
  }
}, 300)

const getStockLevelClass = (product) => {
  if (product.quantity <= 0) return 'stock-empty'
  if (product.quantity <= product.minStock) return 'stock-low'
  return 'stock-normal'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const isLowStock = (product) => {
  return product.quantity <= product.minStock
}

const isExpiring = (product) => {
  if (!product.expirationDate) return false
  const expirationDate = new Date(product.expirationDate)
  const today = new Date()
  const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilExpiration <= 30
}

const hasAlerts = (product) => {
  return isLowStock(product) || isExpiring(product)
}

const toggleProductStatus = async (product) => {
  try {
    await productStore.updateProduct({
      ...product,
      isActive: !product.isActive
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  }
}

const deleteProduct = async (productId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    try {
      await productStore.deleteProduct(productId)
      await productStore.fetchProducts()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const confirmDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
}

const getProductImage = (product) => {
  if (!product.imageUrl) return getDefaultProductImage();
  const imageUrl = getImageUrl(product.imageUrl);
  return imageUrl || getDefaultProductImage();
}

onMounted(async () => {
  try {
    await productStore.fetchProducts()
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  }
})
</script>

<style scoped>
/* Variables locales */
:root {
  --card-border-radius: 12px;
  --transition-speed: 0.3s;
}

/* Structure de la page */
.products-view {
  min-height: 100vh;
  padding: var(--spacing-4) 0;
  background-color: var(--light-color);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

/* En-tête de la page */
.page-header {
  margin-bottom: var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--secondary-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: var(--primary-color);
}

.page-subtitle {
  margin: var(--spacing-2) 0 0;
  color: var(--gray-color);
  font-size: var(--font-size-sm);
}

/* Section des filtres */
.filters-section {
  background: white;
  border-radius: var(--card-border-radius);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.section-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--primary-color);
  font-size: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

/* Formulaires et inputs */
.form-group {
  margin-bottom: var(--spacing-3);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  color: var(--secondary-color);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
  font-size: 1rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) calc(var(--spacing-3) * 2 + 16px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: white;
  color: var(--secondary-color);
  font-size: var(--font-size-base);
  transition: all var(--transition-speed);
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  outline: none;
}

.form-input::placeholder {
  color: var(--gray-color);
}

/* Résultats */
.results-section {
  margin-top: var(--spacing-4);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.results-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  color: var(--secondary-color);
  margin: 0;
}

.results-count {
  color: var(--primary-color);
}

.view-toggle {
  display: flex;
  gap: var(--spacing-2);
}

.btn-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  color: var(--gray-color);
  background: white;
  border: 1px solid var(--border-color);
  transition: all var(--transition-speed);
}

.btn-icon:hover,
.btn-icon.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-rgb), 0.1);
}

/* Grille de produits */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.5);
}

.product-status.active {
  background: rgba(40, 167, 69, 0.8);
}

.product-content {
  padding: 15px;
}

.product-header {
  margin-bottom: 10px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.product-category {
  font-size: 0.9rem;
  color: #666;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 15px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 3px;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
}

.product-footer {
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 10px;
}

.product-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e0e0e0;
  color: #333;
}

.btn-icon.btn-danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-icon.btn-danger:hover {
  background: #fecaca;
}

/* Vue liste */
.products-list {
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: grid;
  grid-template-columns: 100px 2fr 1fr 1fr 1fr 120px;
  padding: 15px;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.list-row {
  display: grid;
  grid-template-columns: 100px 2fr 1fr 1fr 1fr 120px;
  padding: 15px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.list-row:hover {
  background: #f8f9fa;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background: #f5f5f5;
  padding: 5px;
}

/* États */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-6);
  background: white;
  border-radius: var(--card-border-radius);
  box-shadow: var(--box-shadow);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--light-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  margin: 0 auto var(--spacing-4);
  animation: spin 1s linear infinite;
}

.empty-icon {
  font-size: 3rem;
  color: var(--gray-color);
  margin-bottom: var(--spacing-4);
}

/* Responsive */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .list-header, .list-row {
    grid-template-columns: 80px 2fr 1fr 1fr 100px;
  }

  .supplier-cell {
    display: none;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .list-header, .list-row {
    grid-template-columns: 60px 2fr 1fr 80px;
  }

  .category-cell {
    display: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>