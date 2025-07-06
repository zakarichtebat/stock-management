<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Bienvenue, {{ authStore.user?.name }} !</p>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>{{ stats.total }}</h3>
            <p>Produits Total</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ stats.active }}</h3>
            <p>Produits Actifs</p>
          </div>
        </div>

        <div class="stat-card" :class="{ 'stat-warning': stats.lowStock > 0 }">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <h3>{{ stats.lowStock }}</h3>
            <p>Stock Faible</p>
          </div>
        </div>

        <div class="stat-card" :class="{ 'stat-danger': stats.expiring > 0 }">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3>{{ stats.expiring }}</h3>
            <p>Expiration Proche</p>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <h2>Actions Rapides</h2>
        <div class="actions-grid">
          <router-link to="/products/new" class="action-card">
            <div class="action-icon">➕</div>
            <h3>Ajouter Produit</h3>
            <p>Créer un nouveau produit</p>
          </router-link>

          <router-link to="/products" class="action-card">
            <div class="action-icon">📋</div>
            <h3>Voir Produits</h3>
            <p>Gérer tous les produits</p>
          </router-link>

          <router-link to="/alerts" class="action-card">
            <div class="action-icon">🚨</div>
            <h3>Alertes</h3>
            <p>Stocks faibles et expirations</p>
          </router-link>

          <router-link to="/stats" class="action-card">
            <div class="action-icon">📊</div>
            <h3>Statistiques</h3>
            <p>Rapports détaillés</p>
          </router-link>
        </div>
      </div>

      <!-- Produits récents -->
      <div class="recent-products">
        <h2>Produits Récents</h2>
        <div v-if="productStore.loading" class="loading">
          Chargement...
        </div>
        <div v-else-if="recentProducts.length === 0" class="empty-state">
          Aucun produit récent
        </div>
        <div v-else class="products-grid">
          <div v-for="product in recentProducts" :key="product.id" class="product-card">
            <h3>{{ product.name }}</h3>
            <p class="product-category">{{ product.category }}</p>
            <div class="product-info">
              <span class="product-quantity">Stock: {{ product.quantity }}</span>
              <span class="product-price">{{ product.salePrice }}€</span>
            </div>
            <router-link 
              :to="`/products/${product.id}`" 
              class="btn btn-primary btn-sm"
            >
              Voir détails
            </router-link>
          </div>
        </div>
      </div>

      <!-- Alertes importantes -->
      <div v-if="alerts.length > 0" class="alerts-section">
        <h2>🚨 Alertes</h2>
        <div class="alerts-list">
          <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.type">
            <div class="alert-icon">
              <span v-if="alert.type === 'low-stock'">⚠️</span>
              <span v-else-if="alert.type === 'expiring'">⏰</span>
              <span v-else>📦</span>
            </div>
            <div class="alert-content">
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.message }}</p>
            </div>
            <router-link :to="alert.link" class="alert-action">
              Voir
            </router-link>
          </div>
        </div>
      </div>
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
    const stats = ref({
      total: 0,
      active: 0,
      lowStock: 0,
      expiring: 0,
      expired: 0
    })

    const recentProducts = computed(() => {
      return productStore.products.slice(0, 6)
    })

    const alerts = computed(() => {
      const alertsList = []
      
      if (stats.value.lowStock > 0) {
        alertsList.push({
          id: 'low-stock',
          type: 'low-stock',
          title: 'Stock Faible',
          message: `${stats.value.lowStock} produit(s) avec un stock faible`,
          link: '/alerts'
        })
      }
      
      if (stats.value.expiring > 0) {
        alertsList.push({
          id: 'expiring',
          type: 'expiring',
          title: 'Expiration Proche',
          message: `${stats.value.expiring} produit(s) vont expirer prochainement`,
          link: '/alerts'
        })
      }
      
      if (stats.value.expired > 0) {
        alertsList.push({
          id: 'expired',
          type: 'expired',
          title: 'Produits Expirés',
          message: `${stats.value.expired} produit(s) ont expiré`,
          link: '/alerts'
        })
      }
      
      return alertsList
    })

    const loadData = async () => {
      try {
        // Charger les statistiques
        const statsData = await productStore.fetchStats()
        stats.value = statsData
        
        // Charger les produits récents
        await productStore.fetchProducts()
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      authStore,
      productStore,
      stats,
      recentProducts,
      alerts
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.stat-warning {
  border-left: 4px solid #f39c12;
}

.stat-card.stat-danger {
  border-left: 4px solid #e74c3c;
}

.stat-icon {
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;
}

.stat-content h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #7f8c8d;
  margin: 0;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #7f8c8d;
  margin: 0;
}

.recent-products {
  margin-bottom: 3rem;
}

.recent-products h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.product-category {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.product-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.product-quantity {
  color: #7f8c8d;
}

.product-price {
  color: #27ae60;
  font-weight: 600;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.alerts-section {
  margin-bottom: 2rem;
}

.alerts-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-item.low-stock {
  border-left: 4px solid #f39c12;
}

.alert-item.expiring {
  border-left: 4px solid #e74c3c;
}

.alert-icon {
  font-size: 1.5rem;
  min-width: 40px;
  text-align: center;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.alert-content p {
  color: #7f8c8d;
  margin: 0;
}

.alert-action {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: background-color 0.3s;
}

.alert-action:hover {
  background-color: #2980b9;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 