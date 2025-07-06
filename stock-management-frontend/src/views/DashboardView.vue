<template>
  <div class="dashboard">
    <div class="container">
      <!-- En-tête -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <font-awesome-icon icon="chart-line" /> Tableau de bord
          </h1>
          <p class="page-subtitle">
            Bienvenue, <span class="user-name">{{ authStore.user?.name }}</span> !
          </p>
        </div>
        <div class="header-actions">
          <button @click="refreshData" class="btn btn-icon" title="Rafraîchir">
            <font-awesome-icon icon="sync-alt" :spin="isRefreshing" />
          </button>
        </div>
      </header>

      <!-- Statistiques -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card" :class="{ 'pulse': stats.total > previousStats.total }">
            <div class="stat-icon">
              <font-awesome-icon icon="box" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">Produits Total</div>
              <div class="stat-trend" v-if="stats.total !== previousStats.total">
                <font-awesome-icon :icon="getTrendIcon(stats.total, previousStats.total)" />
                {{ calculateTrendPercentage(stats.total, previousStats.total) }}%
              </div>
            </div>
          </div>

          <div class="stat-card" :class="{ 'pulse': stats.active > previousStats.active }">
            <div class="stat-icon">
              <font-awesome-icon icon="check-circle" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">Produits Actifs</div>
              <div class="stat-trend" v-if="stats.active !== previousStats.active">
                <font-awesome-icon :icon="getTrendIcon(stats.active, previousStats.active)" />
                {{ calculateTrendPercentage(stats.active, previousStats.active) }}%
              </div>
            </div>
          </div>

          <div 
            class="stat-card" 
            :class="{ 
              'warning': stats.lowStock > 0,
              'pulse': stats.lowStock > previousStats.lowStock 
            }"
          >
            <div class="stat-icon">
              <font-awesome-icon icon="exclamation-triangle" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.lowStock }}</div>
              <div class="stat-label">Stock Faible</div>
              <div class="stat-trend" v-if="stats.lowStock !== previousStats.lowStock">
                <font-awesome-icon :icon="getTrendIcon(stats.lowStock, previousStats.lowStock)" />
                {{ calculateTrendPercentage(stats.lowStock, previousStats.lowStock) }}%
              </div>
            </div>
          </div>

          <div 
            class="stat-card" 
            :class="{ 
              'danger': stats.expiring > 0,
              'pulse': stats.expiring > previousStats.expiring 
            }"
          >
            <div class="stat-icon">
              <font-awesome-icon icon="clock" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.expiring }}</div>
              <div class="stat-label">Expiration Proche</div>
              <div class="stat-trend" v-if="stats.expiring !== previousStats.expiring">
                <font-awesome-icon :icon="getTrendIcon(stats.expiring, previousStats.expiring)" />
                {{ calculateTrendPercentage(stats.expiring, previousStats.expiring) }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions rapides -->
      <section class="quick-actions">
        <h2 class="section-title">
          <font-awesome-icon icon="bolt" /> Actions Rapides
        </h2>
        <div class="actions-grid">
          <router-link to="/products/new" class="action-card">
            <div class="action-icon">
              <font-awesome-icon icon="plus-circle" />
            </div>
            <h3>Nouveau Produit</h3>
            <p>Ajouter un produit à l'inventaire</p>
          </router-link>

          <router-link to="/products" class="action-card">
            <div class="action-icon">
              <font-awesome-icon icon="boxes" />
            </div>
            <h3>Inventaire</h3>
            <p>Gérer tous les produits</p>
          </router-link>

          <router-link to="/alerts" class="action-card">
            <div class="action-icon">
              <font-awesome-icon icon="bell" />
            </div>
            <h3>Alertes</h3>
            <p>Voir les stocks faibles et expirations</p>
          </router-link>

          <router-link to="/stats" class="action-card">
            <div class="action-icon">
              <font-awesome-icon icon="chart-bar" />
            </div>
            <h3>Statistiques</h3>
            <p>Consulter les rapports détaillés</p>
          </router-link>
        </div>
      </section>

      <!-- Produits récents -->
      <section class="recent-products">
        <div class="section-header">
          <h2 class="section-title">
            <font-awesome-icon icon="history" /> Produits Récents
          </h2>
          <router-link to="/products" class="btn btn-link">
            Voir tout <font-awesome-icon icon="arrow-right" />
          </router-link>
        </div>

        <div v-if="productStore.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des produits récents...</p>
        </div>

        <div v-else-if="recentProducts.length === 0" class="empty-state">
          <div class="empty-icon">
            <font-awesome-icon icon="box-open" />
          </div>
          <h3>Aucun produit récent</h3>
          <p>Commencez par ajouter des produits à votre inventaire</p>
          <router-link to="/products/new" class="btn btn-primary mt-3">
            <font-awesome-icon icon="plus-circle" /> Ajouter un produit
          </router-link>
        </div>

        <div v-else class="products-grid">
          <div 
            v-for="product in recentProducts" 
            :key="product.id" 
            class="product-card"
          >
            <div class="product-header">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-category" v-if="product.category">
                {{ product.category }}
              </div>
            </div>

            <div class="product-details">
              <div class="detail-item">
                <font-awesome-icon icon="cubes" />
                <span :class="getStockLevelClass(product)">
                  {{ product.quantity }} en stock
                </span>
              </div>
              <div class="detail-item">
                <font-awesome-icon icon="tag" />
                <span>{{ formatPrice(product.salePrice) }}</span>
              </div>
            </div>

            <div class="product-footer">
              <router-link 
                :to="'/products/' + product.id" 
                class="btn btn-primary btn-sm"
              >
                <font-awesome-icon icon="eye" /> Voir détails
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Alertes -->
      <section v-if="alerts.length > 0" class="alerts-section">
        <div class="section-header">
          <h2 class="section-title">
            <font-awesome-icon icon="exclamation-circle" /> Alertes Importantes
          </h2>
          <router-link to="/alerts" class="btn btn-link">
            Voir toutes les alertes <font-awesome-icon icon="arrow-right" />
          </router-link>
        </div>

        <div class="alerts-grid">
          <div 
            v-for="alert in alerts" 
            :key="alert.id" 
            class="alert-card"
            :class="alert.type"
          >
            <div class="alert-icon">
              <font-awesome-icon 
                :icon="alert.type === 'low-stock' ? 'exclamation-triangle' : 
                      alert.type === 'expiring' ? 'clock' : 'times-circle'"
              />
            </div>
            <div class="alert-content">
              <h4 class="alert-title">{{ alert.title }}</h4>
              <p class="alert-message">{{ alert.message }}</p>
            </div>
            <router-link :to="alert.link" class="btn btn-icon">
              <font-awesome-icon icon="arrow-right" />
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProductStore } from '../stores/products'

export default {
  name: 'DashboardView',
  
  setup() {
    const authStore = useAuthStore()
    const productStore = useProductStore()
    const isRefreshing = ref(false)
    const previousStats = ref({
      total: 0,
      active: 0,
      lowStock: 0,
      expiring: 0
    })

    const stats = computed(() => productStore.stats)
    const recentProducts = computed(() => productStore.products.slice(0, 6))

    const alerts = computed(() => {
      const alertsList = []
      
      // Stock faible
      if (stats.value.lowStock > 0) {
        alertsList.push({
          id: 'low-stock',
          type: 'warning',
          title: 'Stock Faible',
          message: `${stats.value.lowStock} produit(s) nécessitent un réapprovisionnement`,
          link: '/alerts'
        })
      }
      
      // Expiration proche
      if (stats.value.expiring > 0) {
        alertsList.push({
          id: 'expiring',
          type: 'warning',
          title: 'Expiration Proche',
          message: `${stats.value.expiring} produit(s) arrivent à expiration`,
          link: '/alerts'
        })
      }
      
      // Produits expirés
      if (stats.value.expired > 0) {
        alertsList.push({
          id: 'expired',
          type: 'danger',
          title: 'Produits Expirés',
          message: `${stats.value.expired} produit(s) sont expirés`,
          link: '/alerts'
        })
      }
      
      return alertsList
    })

    const getTrendIcon = (current, previous) => {
      if (current > previous) return 'arrow-up'
      if (current < previous) return 'arrow-down'
      return 'equals'
    }

    const calculateTrendPercentage = (current, previous) => {
      if (previous === 0) return 100
      const diff = current - previous
      return Math.abs(Math.round((diff / previous) * 100))
    }

    const getStockLevelClass = (product) => {
      if (product.quantity <= 0) return 'stock-level danger'
      if (product.quantity <= (product.minStock || 5)) return 'stock-level warning'
      return 'stock-level normal'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const loadData = async () => {
      try {
        previousStats.value = { ...stats.value }
        await productStore.fetchProducts()
        await productStore.fetchStats()
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    const refreshData = async () => {
      isRefreshing.value = true
      await loadData()
      setTimeout(() => {
        isRefreshing.value = false
      }, 1000)
    }

    onMounted(() => {
      loadData()
    })

    return {
      authStore,
      productStore,
      stats,
      previousStats,
      recentProducts,
      alerts,
      isRefreshing,
      refreshData,
      getTrendIcon,
      calculateTrendPercentage,
      getStockLevelClass,
      formatPrice
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* En-tête */
.page-header {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title i {
  color: #3498db;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1rem;
}

.user-name {
  color: #3498db;
  font-weight: 600;
}

/* Statistiques */
.stats-section {
  margin-bottom: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid #eee;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.stat-card.warning {
  border-left: 4px solid #f1c40f;
}

.stat-card.danger {
  border-left: 4px solid #e74c3c;
}

.stat-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2.5rem;
  opacity: 0.1;
  color: #2c3e50;
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-trend i {
  font-size: 0.8rem;
}

/* Actions rapides */
.quick-actions {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: #3498db;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #3498db;
}

.action-icon {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.action-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Produits récents */
.recent-products {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.product-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.product-header {
  margin-bottom: 1rem;
}

.product-name {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #2c3e50;
}

.product-category {
  font-size: 0.9rem;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  display: inline-block;
}

.product-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #7f8c8d;
}

.stock-level {
  font-weight: 600;
}

.stock-level.normal {
  color: #2ecc71;
}

.stock-level.warning {
  color: #f1c40f;
}

.stock-level.danger {
  color: #e74c3c;
}

/* Alertes */
.alerts-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.alert-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.alert-card.warning {
  border-left: 4px solid #f1c40f;
}

.alert-card.danger {
  border-left: 4px solid #e74c3c;
}

.alert-icon {
  font-size: 1.5rem;
  color: #e74c3c;
}

.alert-content {
  flex: 1;
}

.alert-title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.alert-message {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* États */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 0.5s ease-in-out;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-decoration: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-link {
  color: #3498db;
  padding: 0;
}

.btn-link:hover {
  color: #2980b9;
}

.btn-icon {
  padding: 0.5rem;
  border-radius: 50%;
  background: transparent;
  color: #7f8c8d;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stats-grid,
  .actions-grid,
  .products-grid,
  .alerts-grid {
    grid-template-columns: 1fr;
  }

  .stat-card,
  .action-card,
  .product-card,
  .alert-card {
    margin-bottom: 1rem;
  }
}
</style> 