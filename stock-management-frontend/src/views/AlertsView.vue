<template>
  <div class="alerts-view">
    <div class="container">
      <div class="alerts-header">
        <h1>🚨 Alertes</h1>
        <button @click="refreshAlerts" class="btn btn-primary">
          🔄 Actualiser
        </button>
      </div>

      <!-- Résumé des alertes -->
      <div class="alerts-summary">
        <div class="summary-card" :class="{ active: lowStockProducts.length > 0 }">
          <div class="summary-icon">⚠️</div>
          <div class="summary-content">
            <h3>{{ lowStockProducts.length }}</h3>
            <p>Stock Faible</p>
          </div>
        </div>

        <div class="summary-card" :class="{ active: expiringProducts.length > 0 }">
          <div class="summary-icon">⏰</div>
          <div class="summary-content">
            <h3>{{ expiringProducts.length }}</h3>
            <p>Expiration Proche</p>
          </div>
        </div>

        <div class="summary-card" :class="{ active: expiredProducts.length > 0 }">
          <div class="summary-icon">🚫</div>
          <div class="summary-content">
            <h3>{{ expiredProducts.length }}</h3>
            <p>Expirés</p>
          </div>
        </div>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="loading">
        Chargement des alertes...
      </div>

      <!-- Aucune alerte -->
      <div v-else-if="!hasAlerts" class="no-alerts">
        <div class="no-alerts-icon">✅</div>
        <h2>Aucune alerte active</h2>
        <p>Tous vos produits sont en bon état !</p>
      </div>

      <!-- Alertes -->
      <div v-else class="alerts-sections">
        <!-- Stock faible -->
        <div v-if="lowStockProducts.length > 0" class="alert-section">
          <h2>⚠️ Stock Faible ({{ lowStockProducts.length }})</h2>
          <div class="alert-description">
            <p>Produits dont le stock est inférieur ou égal au minimum défini</p>
          </div>
          <div class="products-grid">
            <div 
              v-for="product in lowStockProducts" 
              :key="product.id" 
              class="product-alert-card low-stock"
            >
              <div class="alert-badge">⚠️ Stock Faible</div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-category">{{ product.category }}</p>
                <p class="product-supplier">{{ product.supplier }}</p>
              </div>
              <div class="stock-info">
                <div class="stock-current">
                  <span class="stock-label">Stock actuel:</span>
                  <span class="stock-value critical">{{ product.quantity }}</span>
                </div>
                <div class="stock-minimum">
                  <span class="stock-label">Minimum:</span>
                  <span class="stock-value">{{ product.minStock || 5 }}</span>
                </div>
              </div>
              <div class="product-actions">
                <button 
                  @click="quickUpdateStock(product.id, (product.minStock || 5) + 10)"
                  class="btn btn-success btn-sm"
                >
                  ➕ Réapprovisionner
                </button>
                <router-link 
                  :to="`/products/${product.id}`" 
                  class="btn btn-primary btn-sm"
                >
                  👁️ Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Expiration proche -->
        <div v-if="expiringProducts.length > 0" class="alert-section">
          <h2>⏰ Expiration Proche ({{ expiringProducts.length }})</h2>
          <div class="alert-description">
            <p>Produits qui expirent dans les 30 prochains jours</p>
          </div>
          <div class="products-grid">
            <div 
              v-for="product in expiringProducts" 
              :key="product.id" 
              class="product-alert-card expiring"
            >
              <div class="alert-badge">⏰ Expire bientôt</div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-category">{{ product.category }}</p>
                <p class="product-supplier">{{ product.supplier }}</p>
              </div>
              <div class="expiration-info">
                <div class="expiration-date">
                  <span class="expiration-label">Expire le:</span>
                  <span class="expiration-value">{{ formatDate(product.expirationDate) }}</span>
                </div>
                <div class="days-remaining">
                  <span class="days-value" :class="getDaysRemainingClass(product.expirationDate)">
                    {{ getDaysRemaining(product.expirationDate) }} jours restants
                  </span>
                </div>
              </div>
              <div class="product-actions">
                <button 
                  @click="markAsExpired(product.id)"
                  class="btn btn-danger btn-sm"
                >
                  🚫 Marquer expiré
                </button>
                <router-link 
                  :to="`/products/${product.id}`" 
                  class="btn btn-primary btn-sm"
                >
                  👁️ Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Produits expirés -->
        <div v-if="expiredProducts.length > 0" class="alert-section">
          <h2>🚫 Produits Expirés ({{ expiredProducts.length }})</h2>
          <div class="alert-description">
            <p>Produits qui ont dépassé leur date d'expiration</p>
          </div>
          <div class="products-grid">
            <div 
              v-for="product in expiredProducts" 
              :key="product.id" 
              class="product-alert-card expired"
            >
              <div class="alert-badge">🚫 Expiré</div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-category">{{ product.category }}</p>
                <p class="product-supplier">{{ product.supplier }}</p>
              </div>
              <div class="expiration-info">
                <div class="expiration-date">
                  <span class="expiration-label">Expiré le:</span>
                  <span class="expiration-value expired">{{ formatDate(product.expirationDate) }}</span>
                </div>
                <div class="days-remaining">
                  <span class="days-value expired">
                    {{ Math.abs(getDaysRemaining(product.expirationDate)) }} jours de retard
                  </span>
                </div>
              </div>
              <div class="product-actions">
                <button 
                  @click="deactivateProduct(product.id)"
                  class="btn btn-danger btn-sm"
                >
                  🗑️ Désactiver
                </button>
                <router-link 
                  :to="`/products/${product.id}`" 
                  class="btn btn-primary btn-sm"
                >
                  👁️ Voir détails
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'

export default {
  name: 'AlertsView',
  setup() {
    const productStore = useProductStore()
    const loading = ref(false)
    const lowStockProducts = ref([])
    const expiringProducts = ref([])
    const expiredProducts = ref([])

    const hasAlerts = computed(() => {
      return lowStockProducts.value.length > 0 || 
             expiringProducts.value.length > 0 || 
             expiredProducts.value.length > 0
    })

    const refreshAlerts = async () => {
      loading.value = true
      try {
        // Charger les différents types d'alertes
        const [lowStock, expiring, expired] = await Promise.all([
          productStore.fetchLowStock(),
          productStore.fetchExpiring(30),
          productStore.fetchExpired ? productStore.fetchExpired() : []
        ])

        lowStockProducts.value = lowStock
        expiringProducts.value = expiring
        expiredProducts.value = expired || []
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error)
      } finally {
        loading.value = false
      }
    }

    const quickUpdateStock = async (productId, newQuantity) => {
      try {
        await productStore.updateStock(productId, newQuantity)
        // Actualiser les alertes
        await refreshAlerts()
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error)
      }
    }

    const markAsExpired = async (productId) => {
      if (!confirm('Marquer ce produit comme expiré et le désactiver ?')) return

      try {
        await productStore.updateProduct(productId, { isActive: false })
        await refreshAlerts()
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
      }
    }

    const deactivateProduct = async (productId) => {
      if (!confirm('Désactiver ce produit expiré ?')) return

      try {
        await productStore.updateProduct(productId, { isActive: false })
        await refreshAlerts()
      } catch (error) {
        console.error('Erreur lors de la désactivation:', error)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    const getDaysRemaining = (expirationDate) => {
      const expDate = new Date(expirationDate)
      const now = new Date()
      const diffTime = expDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

    const getDaysRemainingClass = (expirationDate) => {
      const days = getDaysRemaining(expirationDate)
      if (days <= 0) return 'expired'
      if (days <= 7) return 'critical'
      if (days <= 15) return 'warning'
      return 'normal'
    }

    onMounted(() => {
      refreshAlerts()
    })

    return {
      loading,
      lowStockProducts,
      expiringProducts,
      expiredProducts,
      hasAlerts,
      refreshAlerts,
      quickUpdateStock,
      markAsExpired,
      deactivateProduct,
      formatDate,
      getDaysRemaining,
      getDaysRemainingClass
    }
  }
}
</script>

<style scoped>
.alerts-view {
  max-width: 1200px;
  margin: 0 auto;
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.alerts-header h1 {
  color: #2c3e50;
  margin: 0;
}

.alerts-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.6;
  transition: all 0.3s;
}

.summary-card.active {
  opacity: 1;
  transform: translateY(-2px);
}

.summary-icon {
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;
}

.summary-content h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.summary-content p {
  color: #7f8c8d;
  margin: 0;
}

.no-alerts {
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
}

.no-alerts-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-alerts h2 {
  color: #27ae60;
  margin-bottom: 1rem;
}

.alerts-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.alert-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alert-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.alert-description {
  margin-bottom: 1.5rem;
}

.alert-description p {
  color: #7f8c8d;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.product-alert-card {
  border: 2px solid;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s;
}

.product-alert-card:hover {
  transform: translateY(-2px);
}

.product-alert-card.low-stock {
  border-color: #f39c12;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.product-alert-card.expiring {
  border-color: #e74c3c;
  background: linear-gradient(135deg, #ffeaea 0%, #ffffff 100%);
}

.product-alert-card.expired {
  border-color: #c0392b;
  background: linear-gradient(135deg, #f8d7da 0%, #ffffff 100%);
}

.alert-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.low-stock .alert-badge {
  background-color: #f39c12;
  color: white;
}

.expiring .alert-badge {
  background-color: #e74c3c;
  color: white;
}

.expired .alert-badge {
  background-color: #c0392b;
  color: white;
}

.product-info {
  margin-bottom: 1rem;
}

.product-info h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.product-category,
.product-supplier {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.stock-current,
.stock-minimum {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stock-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.stock-value {
  font-weight: 600;
  color: #2c3e50;
}

.stock-value.critical {
  color: #e74c3c;
  font-size: 1.2rem;
}

.expiration-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.expiration-date {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.expiration-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.expiration-value {
  font-weight: 600;
  color: #2c3e50;
}

.expiration-value.expired {
  color: #c0392b;
}

.days-remaining {
  text-align: center;
}

.days-value {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.days-value.normal {
  color: #27ae60;
  background-color: #d4edda;
}

.days-value.warning {
  color: #f39c12;
  background-color: #fff3cd;
}

.days-value.critical {
  color: #e74c3c;
  background-color: #f8d7da;
}

.days-value.expired {
  color: #c0392b;
  background-color: #f5c6cb;
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

@media (max-width: 768px) {
  .alerts-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .alerts-summary {
    grid-template-columns: 1fr;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .stock-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .expiration-date {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
</style> 