<template>
  <div class="product-detail-view">
    <div class="container">
      <div v-if="productStore.loading" class="loading">
        Chargement du produit...
      </div>

      <div v-else-if="!product" class="not-found">
        <h2>Produit non trouvé</h2>
        <p>Le produit demandé n'existe pas ou a été supprimé.</p>
        <router-link to="/products" class="btn btn-primary">
          ← Retour aux produits
        </router-link>
      </div>

      <div v-else class="product-detail">
        <!-- En-tête -->
        <div class="detail-header">
          <div class="header-content">
            <h1>{{ product.name }}</h1>
            <span 
              class="product-status" 
              :class="{ active: product.isActive, inactive: !product.isActive }"
            >
              {{ product.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>
          <div class="header-actions">
            <router-link 
              :to="`/products/${product.id}/edit`" 
              class="btn btn-primary"
            >
              ✏️ Modifier
            </router-link>
            <router-link to="/products" class="btn btn-secondary">
              ← Retour
            </router-link>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="detail-content">
          <!-- Informations générales -->
          <div class="info-section">
            <h2>📝 Informations Générales</h2>
            <!-- Image du produit -->
            <div v-if="product.imageUrl" class="product-image">
              <img :src="getProductImage(product)" :alt="product.name" />
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Nom du produit</label>
                <span>{{ product.name }}</span>
              </div>
              <div class="info-item">
                <label>Catégorie</label>
                <span>{{ product.category || 'Non spécifiée' }}</span>
              </div>
              <div class="info-item">
                <label>Fournisseur</label>
                <span>{{ product.supplier || 'Non spécifié' }}</span>
              </div>
              <div class="info-item">
                <label>Code-barres</label>
                <span>{{ product.barcode || 'Non spécifié' }}</span>
              </div>
            </div>
            <div v-if="product.description" class="description">
              <label>Description</label>
              <p>{{ product.description }}</p>
            </div>
          </div>

          <!-- Prix et stock -->
          <div class="info-section">
            <h2>💰 Prix et Stock</h2>
            <div class="price-stock-grid">
              <div class="price-card">
                <h3>Prix d'achat</h3>
                <div class="price-value purchase">{{ formatPrice(product.purchasePrice) }}</div>
              </div>
              <div class="price-card">
                <h3>Prix de vente</h3>
                <div class="price-value sale">{{ formatPrice(product.salePrice) }}</div>
              </div>
              <div class="price-card">
                <h3>Marge unitaire</h3>
                <div class="price-value margin" :class="{ positive: margin > 0, negative: margin < 0 }">
                  {{ formatPrice(margin) }} ({{ marginPercent }}%)
                </div>
              </div>
            </div>

            <div class="stock-section">
              <div class="stock-info">
                <div class="stock-item">
                  <label>Stock actuel</label>
                  <span class="stock-value" :class="{ 'low-stock': isLowStock }">
                    {{ product.quantity }} unités
                  </span>
                </div>
                <div class="stock-item">
                  <label>Stock minimum</label>
                  <span>{{ product.minStock || 'Non défini' }}</span>
                </div>
                <div class="stock-item">
                  <label>Valeur totale du stock</label>
                  <span class="stock-value-total">{{ formatPrice(totalValue) }}</span>
                </div>
              </div>

              <div class="stock-actions">
                <h3>Gestion du stock</h3>
                <div class="stock-controls">
                  <button 
                    @click="adjustStock(-1)"
                    class="btn btn-secondary btn-sm"
                    :disabled="product.quantity <= 0"
                  >
                    - Retirer 1
                  </button>
                  <button 
                    @click="adjustStock(1)"
                    class="btn btn-secondary btn-sm"
                  >
                    + Ajouter 1
                  </button>
                  <button 
                    @click="showStockModal = true"
                    class="btn btn-primary btn-sm"
                  >
                    📝 Modifier stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="info-section">
            <h2>📅 Dates</h2>
            <div class="dates-grid">
              <div class="date-item">
                <label>Date d'entrée</label>
                <span>{{ formatDate(product.entryDate) }}</span>
              </div>
              <div class="date-item">
                <label>Date d'expiration</label>
                <span v-if="product.expirationDate" :class="{ 'expiring': isExpiringSoon }">
                  {{ formatDate(product.expirationDate) }}
                  <small v-if="isExpiringSoon" class="expiring-warning">
                    ({{ daysUntilExpiration }} jours restants)
                  </small>
                </span>
                <span v-else>Non définie</span>
              </div>
              <div class="date-item">
                <label>Créé le</label>
                <span>{{ formatDate(product.createdAt) }}</span>
              </div>
              <div class="date-item">
                <label>Modifié le</label>
                <span>{{ formatDate(product.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Alertes -->
          <div v-if="alerts.length > 0" class="alerts-section">
            <h2>🚨 Alertes</h2>
            <div class="alerts-list">
              <div 
                v-for="alert in alerts" 
                :key="alert.type" 
                class="alert-item" 
                :class="alert.type"
              >
                <div class="alert-icon">{{ alert.icon }}</div>
                <div class="alert-content">
                  <h4>{{ alert.title }}</h4>
                  <p>{{ alert.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de modification du stock -->
      <div v-if="showStockModal" class="modal-overlay" @click="showStockModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Modifier le stock</h3>
            <button @click="showStockModal = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nouvelle quantité</label>
              <input 
                v-model="newStock" 
                type="number" 
                class="form-input"
                min="0"
                :placeholder="product.quantity"
              />
            </div>
          </div>
          <div class="modal-actions">
            <button @click="updateStock" class="btn btn-primary">
              ✅ Confirmer
            </button>
            <button @click="showStockModal = false" class="btn btn-secondary">
              ❌ Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { useRoute, useRouter } from 'vue-router'
import { getImageUrl, getDefaultProductImage } from '../utils/imageHelper'

export default {
  name: 'ProductDetailView',
  setup() {
    const productStore = useProductStore()
    const route = useRoute()
    const router = useRouter()
    const showStockModal = ref(false)
    const newStock = ref('')

    const product = computed(() => productStore.currentProduct)

    const getProductImage = (product) => {
      if (!product.imageUrl) return getDefaultProductImage();
      const imageUrl = getImageUrl(product.imageUrl);
      return imageUrl || getDefaultProductImage();
    }

    const margin = computed(() => {
      if (!product.value) return 0
      const purchasePrice = Number(product.value.purchasePrice) || 0
      const salePrice = Number(product.value.salePrice) || 0
      return salePrice - purchasePrice
    })

    const marginPercent = computed(() => {
      if (!product.value || !product.value.purchasePrice) return 0
      const purchasePrice = Number(product.value.purchasePrice)
      return ((margin.value / purchasePrice) * 100).toFixed(2)
    })

    const totalValue = computed(() => {
      if (!product.value) return 0
      const purchasePrice = Number(product.value.purchasePrice) || 0
      return purchasePrice * product.value.quantity
    })

    const isLowStock = computed(() => {
      if (!product.value) return false
      return product.value.quantity <= (product.value.minStock || 5)
    })

    const isExpiringSoon = computed(() => {
      if (!product.value || !product.value.expirationDate) return false
      const expDate = new Date(product.value.expirationDate)
      const now = new Date()
      const diffTime = expDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    })

    const daysUntilExpiration = computed(() => {
      if (!product.value || !product.value.expirationDate) return 0
      const expDate = new Date(product.value.expirationDate)
      const now = new Date()
      const diffTime = expDate.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    })

    const alerts = computed(() => {
      if (!product.value) return []
      
      const alertsList = []

      if (isLowStock.value) {
        alertsList.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Stock Faible',
          message: `Le stock est faible (${product.value.quantity} unités). Réapprovisionnement recommandé.`
        })
      }

      if (isExpiringSoon.value) {
        alertsList.push({
          type: 'danger',
          icon: '⏰',
          title: 'Expiration Proche',
          message: `Ce produit expire dans ${daysUntilExpiration.value} jours.`
        })
      }

      if (product.value.expirationDate && daysUntilExpiration.value <= 0) {
        alertsList.push({
          type: 'danger',
          icon: '🚫',
          title: 'Produit Expiré',
          message: 'Ce produit a dépassé sa date d\'expiration.'
        })
      }

      if (!product.value.isActive) {
        alertsList.push({
          type: 'info',
          icon: '📦',
          title: 'Produit Inactif',
          message: 'Ce produit est marqué comme inactif et n\'apparaît pas dans les listes principales.'
        })
      }

      return alertsList
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    const formatPrice = (price) => {
      if (price === null || price === undefined) return 'N/A'
      return new Intl.NumberFormat('ar-MA', {
        style: 'currency',
        currency: 'MAD'
      }).format(price)
    }

    async function adjustStock(amount) {
      if (!product.value) return
      try {
        await productStore.adjustStock(product.value.id, amount)
      } catch (error) {
        console.error('Erreur lors de l\'ajustement du stock:', error)
      }
    }

    async function updateStock() {
      if (!product.value || newStock.value === '') return
      
      try {
        await productStore.updateStock(product.value.id, parseInt(newStock.value))
        showStockModal.value = false
        newStock.value = ''
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error)
      }
    }

    onMounted(async () => {
      const productId = parseInt(route.params.id)
      try {
        await productStore.fetchProduct(productId)
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error)
      }
    })

    return {
      productStore,
      product,
      showStockModal,
      newStock,
      getProductImage,
      getDefaultProductImage,
      margin,
      marginPercent,
      totalValue,
      isLowStock,
      isExpiringSoon,
      daysUntilExpiration,
      alerts,
      formatDate,
      formatPrice,
      adjustStock,
      updateStock
    }
  }
}
</script>

<style scoped>
.product-detail-view {
  max-width: 1000px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-item span {
  color: #2c3e50;
  font-weight: 600;
}

.description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.description label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.description p {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
}

.price-stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.price-card {
  text-align: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.price-card h3 {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.price-value.purchase {
  color: #e74c3c;
}

.price-value.sale {
  color: #27ae60;
}

.price-value.margin.positive {
  color: #27ae60;
}

.price-value.margin.negative {
  color: #e74c3c;
}

.stock-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stock-item label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stock-value {
  font-weight: 600;
  color: #2c3e50;
}

.stock-value.low-stock {
  color: #e74c3c;
}

.stock-value-total {
  font-weight: 600;
  color: #27ae60;
}

.stock-actions h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stock-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-item label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-item span {
  color: #2c3e50;
  font-weight: 600;
}

.expiring {
  color: #e74c3c !important;
}

.expiring-warning {
  display: block;
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.alerts-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alerts-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.warning {
  background-color: #fff3cd;
  border-left-color: #f39c12;
}

.alert-item.danger {
  background-color: #f8d7da;
  border-left-color: #e74c3c;
}

.alert-item.info {
  background-color: #d6f3ff;
  border-left-color: #3498db;
}

.alert-icon {
  font-size: 1.25rem;
  min-width: 30px;
}

.alert-content h4 {
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.alert-content p {
  color: #2c3e50;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.not-found {
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
}

.not-found h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.product-image {
  margin-bottom: 2rem;
  text-align: center;
}

.product-image img {
  max-width: 300px;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .price-stock-grid {
    grid-template-columns: 1fr;
  }
  
  .stock-section {
    grid-template-columns: 1fr;
  }
  
  .dates-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 