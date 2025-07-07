<template>
  <div class="alerts-view">
    <div class="container">
      <div class="alerts-header">
        <h1>⚠️ Alertes & Surveillance</h1>
        <div class="alert-stats">
          <div class="stat-card warning">
            <span class="stat-number">{{ expiringCount }}</span>
            <span class="stat-label">Produits proche d'expiration</span>
          </div>
          <div class="stat-card danger">
            <span class="stat-number">{{ expiredCount }}</span>
            <span class="stat-label">Produits expirés</span>
          </div>
        </div>
      </div>

      <!-- Produits proches d'expiration -->
      <div class="alert-section">
        <h2>🕒 Produits à surveiller (expiration < 40 jours)</h2>
        
        <div v-if="loading" class="loading">
          Chargement des alertes...
        </div>

        <div v-else-if="expiringProducts.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>Aucun produit proche de l'expiration</h3>
          <p>Tous vos produits ont des dates d'expiration confortables.</p>
        </div>

        <div v-else class="products-table">
          <table class="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Produit</th>
                <th>Stock</th>
                <th>Date d'expiration</th>
                <th>Jours restants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="product in expiringProducts" 
                :key="product.id"
                :class="getExpirationClass(product.expirationDate)"
              >
                <td class="product-image">
                  <img 
                    :src="getProductImage(product)" 
                    :alt="product.name"
                    class="product-img"
                    @error="$event.target.src = getDefaultProductImage()"
                  />
                </td>
                <td>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-category">{{ product.category }}</div>
                </td>
                <td>
                  <span :class="{ 'low-stock': product.quantity <= product.minStock }">
                    {{ product.quantity }}
                  </span>
                </td>
                <td>{{ formatDate(product.expirationDate) }}</td>
                <td>
                  <span class="days-left" :class="getExpirationClass(product.expirationDate)">
                    {{ getDaysLeft(product.expirationDate) }} jours
                  </span>
                </td>
                <td class="actions">
                  <router-link 
                    :to="'/products/' + product.id + '/edit'" 
                    class="btn btn-warning btn-sm"
                    title="Modifier"
                  >
                    ✏️
                  </router-link>
                  <button 
                    @click="markAsHandled(product.id)"
                    class="btn btn-success btn-sm"
                    title="Marquer comme traité"
                  >
                    ✓
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
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { getImageUrl, getDefaultProductImage } from '../utils/imageHelper'

export default {
  name: 'AlertsView',
  setup() {
    const productStore = useProductStore()
    const loading = ref(false)
    const expiringProducts = ref([])
    const expiringCount = ref(0)
    const expiredCount = ref(0)

    const loadAlerts = async () => {
      loading.value = true
      try {
        // Charger les produits expirant dans 40 jours
        const products = await productStore.fetchExpiring(40)
        expiringProducts.value = products
        expiringCount.value = products.length

        // Charger les produits déjà expirés
        const expired = await productStore.fetchExpired()
        expiredCount.value = expired.length
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    }

    const getDaysLeft = (date) => {
      if (!date) return 0
      const today = new Date()
      const expirationDate = new Date(date)
      const diffTime = expirationDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

    const getExpirationClass = (date) => {
      const daysLeft = getDaysLeft(date)
      if (daysLeft <= 0) return 'expired'
      if (daysLeft <= 15) return 'critical'
      if (daysLeft <= 30) return 'warning'
      return 'notice'
    }

    const markAsHandled = async (productId) => {
      // Retirer le produit de la liste
      expiringProducts.value = expiringProducts.value.filter(p => p.id !== productId)
      expiringCount.value--
    }

    const getProductImage = (product) => {
      if (!product.imageUrl) return getDefaultProductImage();
      const imageUrl = getImageUrl(product.imageUrl);
      return imageUrl || getDefaultProductImage();
    }

    onMounted(loadAlerts)

    return {
      loading,
      expiringProducts,
      expiringCount,
      expiredCount,
      formatDate,
      getDaysLeft,
      getExpirationClass,
      markAsHandled,
      getProductImage,
      getDefaultProductImage
    }
  }
}
</script>

<style scoped>
.alerts-view {
  padding: 2rem 0;
}

.alerts-header {
  margin-bottom: 2rem;
}

.alert-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-card.warning .stat-number {
  color: #f39c12;
}

.stat-card.danger .stat-number {
  color: #e74c3c;
}

.alert-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 60px;
  padding: 4px;
}

.product-img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.product-category {
  font-size: 0.85em;
  color: #666;
}

.days-left {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.days-left.expired {
  background: #fee2e2;
  color: #991b1b;
}

.days-left.critical {
  background: #fef2f2;
  color: #b91c1c;
}

.days-left.warning {
  background: #fff7ed;
  color: #c2410c;
}

.days-left.notice {
  background: #f0fdf4;
  color: #166534;
}

tr.expired {
  background: #fee2e2 !important;
}

tr.critical {
  background: #fef2f2 !important;
}

tr.warning {
  background: #fff7ed !important;
}

.low-stock {
  color: #e74c3c;
  font-weight: 500;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style> 