<template>
  <div class="stats-view">
    <div class="container">
      <div class="stats-header">
        <h1>📊 Statistiques</h1>
        <button @click="refreshStats" class="btn btn-primary">
          🔄 Actualiser
        </button>
      </div>

      <!-- Résumé général -->
      <div class="stats-summary">
        <div class="summary-card">
          <div class="summary-icon">📦</div>
          <div class="summary-content">
            <h3>{{ stats.total }}</h3>
            <p>Produits Total</p>
            <small>Dans toute la base</small>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">✅</div>
          <div class="summary-content">
            <h3>{{ stats.active }}</h3>
            <p>Produits Actifs</p>
            <small>{{ activePercentage }}% du total</small>
          </div>
        </div>

        <div class="summary-card warning" v-if="stats.lowStock > 0">
          <div class="summary-icon">⚠️</div>
          <div class="summary-content">
            <h3>{{ stats.lowStock }}</h3>
            <p>Stock Faible</p>
            <small>{{ lowStockPercentage }}% des actifs</small>
          </div>
        </div>

        <div class="summary-card danger" v-if="stats.expiring > 0">
          <div class="summary-icon">⏰</div>
          <div class="summary-content">
            <h3>{{ stats.expiring }}</h3>
            <p>Expiration Proche</p>
            <small>{{ expiringPercentage }}% des actifs</small>
          </div>
        </div>
      </div>

      <!-- Graphiques et analyses -->
      <div class="stats-content">
        <!-- Analyse des stocks -->
        <div class="stats-section">
          <h2>📈 Analyse des Stocks</h2>
          <div class="stock-analysis">
            <div class="analysis-card">
              <h3>Répartition par Statut</h3>
              <div class="status-chart">
                <div class="status-item">
                  <div class="status-bar">
                    <div class="status-fill active" :style="{ width: activePercentage + '%' }"></div>
                  </div>
                  <div class="status-info">
                    <span class="status-label">Actifs</span>
                    <span class="status-value">{{ stats.active }} ({{ activePercentage }}%)</span>
                  </div>
                </div>
                <div class="status-item">
                  <div class="status-bar">
                    <div class="status-fill inactive" :style="{ width: inactivePercentage + '%' }"></div>
                  </div>
                  <div class="status-info">
                    <span class="status-label">Inactifs</span>
                    <span class="status-value">{{ inactiveCount }} ({{ inactivePercentage }}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="analysis-card">
              <h3>État des Stocks</h3>
              <div class="stock-health">
                <div class="health-item good">
                  <div class="health-icon">✅</div>
                  <div class="health-content">
                    <h4>{{ healthyStockCount }}</h4>
                    <p>Stocks Normaux</p>
                  </div>
                </div>
                <div class="health-item warning">
                  <div class="health-icon">⚠️</div>
                  <div class="health-content">
                    <h4>{{ stats.lowStock }}</h4>
                    <p>Stocks Faibles</p>
                  </div>
                </div>
                <div class="health-item danger">
                  <div class="health-icon">🚫</div>
                  <div class="health-content">
                    <h4>{{ stats.expired }}</h4>
                    <p>Expirés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top produits -->
        <div class="stats-section">
          <h2>🏆 Top Produits</h2>
          <div class="top-products">
            <div class="top-section">
              <h3>Stock le plus élevé</h3>
              <div v-if="topStockProducts.length > 0" class="top-list">
                <div 
                  v-for="(product, index) in topStockProducts.slice(0, 5)" 
                  :key="product.id"
                  class="top-item"
                >
                  <div class="top-rank">{{ index + 1 }}</div>
                  <div class="top-info">
                    <h4>{{ product.name }}</h4>
                    <p>{{ product.category }}</p>
                  </div>
                  <div class="top-value">
                    <span class="value">{{ product.quantity }}</span>
                    <span class="unit">unités</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-top">
                Aucune donnée disponible
              </div>
            </div>

            <div class="top-section">
              <h3>Valeur la plus élevée</h3>
              <div v-if="topValueProducts.length > 0" class="top-list">
                <div 
                  v-for="(product, index) in topValueProducts.slice(0, 5)" 
                  :key="product.id"
                  class="top-item"
                >
                  <div class="top-rank">{{ index + 1 }}</div>
                  <div class="top-info">
                    <h4>{{ product.name }}</h4>
                    <p>{{ product.category }}</p>
                  </div>
                  <div class="top-value">
                    <span class="value">{{ (product.salePrice * product.quantity).toFixed(2) }}</span>
                    <span class="unit">€</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-top">
                Aucune donnée disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Analyse financière -->
        <div class="stats-section">
          <h2>💰 Analyse Financière</h2>
          <div class="financial-analysis">
            <div class="financial-card">
              <h3>Valeur Total du Stock</h3>
              <div class="financial-content">
                <div class="financial-item">
                  <span class="financial-label">Valeur d'achat:</span>
                  <span class="financial-value purchase">{{ totalPurchaseValue.toFixed(2) }}€</span>
                </div>
                <div class="financial-item">
                  <span class="financial-label">Valeur de vente:</span>
                  <span class="financial-value sale">{{ totalSaleValue.toFixed(2) }}€</span>
                </div>
                <div class="financial-item total">
                  <span class="financial-label">Marge potentielle:</span>
                  <span class="financial-value margin" :class="{ positive: totalMargin > 0, negative: totalMargin < 0 }">
                    {{ totalMargin.toFixed(2) }}€ ({{ marginPercentage }}%)
                  </span>
                </div>
              </div>
            </div>

            <div class="financial-card">
              <h3>Répartition par Catégorie</h3>
              <div class="category-breakdown">
                <div 
                  v-for="category in categoryStats" 
                  :key="category.name"
                  class="category-item"
                >
                  <div class="category-header">
                    <span class="category-name">{{ category.name || 'Sans catégorie' }}</span>
                    <span class="category-count">{{ category.count }} produits</span>
                  </div>
                  <div class="category-bar">
                    <div 
                      class="category-fill" 
                      :style="{ width: (category.count / stats.total * 100) + '%' }"
                    ></div>
                  </div>
                  <div class="category-value">
                    {{ category.value.toFixed(2) }}€
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertes et recommandations -->
        <div class="stats-section">
          <h2>💡 Recommandations</h2>
          <div class="recommendations">
            <div v-for="recommendation in recommendations" :key="recommendation.id" class="recommendation-card" :class="recommendation.type">
              <div class="recommendation-icon">{{ recommendation.icon }}</div>
              <div class="recommendation-content">
                <h3>{{ recommendation.title }}</h3>
                <p>{{ recommendation.message }}</p>
                <router-link v-if="recommendation.action" :to="recommendation.action.link" class="btn btn-sm btn-primary">
                  {{ recommendation.action.text }}
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
  name: 'StatsView',
  setup() {
    const productStore = useProductStore()
    const stats = ref({
      total: 0,
      active: 0,
      lowStock: 0,
      expiring: 0,
      expired: 0
    })

    const products = computed(() => productStore.products)

    const activePercentage = computed(() => {
      return stats.value.total > 0 ? Math.round((stats.value.active / stats.value.total) * 100) : 0
    })

    const inactiveCount = computed(() => {
      return stats.value.total - stats.value.active
    })

    const inactivePercentage = computed(() => {
      return stats.value.total > 0 ? Math.round((inactiveCount.value / stats.value.total) * 100) : 0
    })

    const lowStockPercentage = computed(() => {
      return stats.value.active > 0 ? Math.round((stats.value.lowStock / stats.value.active) * 100) : 0
    })

    const expiringPercentage = computed(() => {
      return stats.value.active > 0 ? Math.round((stats.value.expiring / stats.value.active) * 100) : 0
    })

    const healthyStockCount = computed(() => {
      return stats.value.active - stats.value.lowStock - stats.value.expired
    })

    const topStockProducts = computed(() => {
      return [...products.value]
        .filter(p => p.isActive)
        .sort((a, b) => b.quantity - a.quantity)
    })

    const topValueProducts = computed(() => {
      return [...products.value]
        .filter(p => p.isActive)
        .sort((a, b) => (b.salePrice * b.quantity) - (a.salePrice * a.quantity))
    })

    const totalPurchaseValue = computed(() => {
      return products.value
        .filter(p => p.isActive)
        .reduce((total, product) => total + (product.purchasePrice * product.quantity), 0)
    })

    const totalSaleValue = computed(() => {
      return products.value
        .filter(p => p.isActive)
        .reduce((total, product) => total + (product.salePrice * product.quantity), 0)
    })

    const totalMargin = computed(() => {
      return totalSaleValue.value - totalPurchaseValue.value
    })

    const marginPercentage = computed(() => {
      return totalPurchaseValue.value > 0 
        ? Math.round((totalMargin.value / totalPurchaseValue.value) * 100)
        : 0
    })

    const categoryStats = computed(() => {
      const categories = {}
      
      products.value
        .filter(p => p.isActive)
        .forEach(product => {
          const category = product.category || 'Sans catégorie'
          if (!categories[category]) {
            categories[category] = {
              name: category,
              count: 0,
              value: 0
            }
          }
          categories[category].count++
          categories[category].value += product.salePrice * product.quantity
        })

      return Object.values(categories).sort((a, b) => b.count - a.count)
    })

    const recommendations = computed(() => {
      const recs = []

      if (stats.value.lowStock > 0) {
        recs.push({
          id: 'low-stock',
          type: 'warning',
          icon: '⚠️',
          title: 'Stock Faible Détecté',
          message: `${stats.value.lowStock} produit(s) ont un stock faible et nécessitent un réapprovisionnement.`,
          action: {
            text: 'Voir les alertes',
            link: '/alerts'
          }
        })
      }

      if (stats.value.expiring > 0) {
        recs.push({
          id: 'expiring',
          type: 'danger',
          icon: '⏰',
          title: 'Produits Bientôt Expirés',
          message: `${stats.value.expiring} produit(s) expirent dans les 30 prochains jours.`,
          action: {
            text: 'Voir les alertes',
            link: '/alerts'
          }
        })
      }

      if (inactiveCount.value > 0) {
        recs.push({
          id: 'inactive',
          type: 'info',
          icon: '📦',
          title: 'Produits Inactifs',
          message: `${inactiveCount.value} produit(s) sont marqués comme inactifs. Vérifiez s'ils peuvent être réactivés.`,
          action: {
            text: 'Voir les produits',
            link: '/products'
          }
        })
      }

      if (stats.value.total === 0) {
        recs.push({
          id: 'empty',
          type: 'info',
          icon: '🎯',
          title: 'Commencer l\'Inventaire',
          message: 'Votre inventaire est vide. Commencez par ajouter vos premiers produits.',
          action: {
            text: 'Ajouter un produit',
            link: '/products/new'
          }
        })
      }

      if (recs.length === 0) {
        recs.push({
          id: 'all-good',
          type: 'success',
          icon: '✅',
          title: 'Tout va bien !',
          message: 'Votre inventaire est en bon état. Continuez le bon travail !',
          action: null
        })
      }

      return recs
    })

    const refreshStats = async () => {
      try {
        // Charger les statistiques et les produits
        const [statsData] = await Promise.all([
          productStore.fetchStats(),
          productStore.fetchProducts()
        ])
        
        stats.value = statsData
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      }
    }

    onMounted(() => {
      refreshStats()
    })

    return {
      stats,
      products,
      activePercentage,
      inactiveCount,
      inactivePercentage,
      lowStockPercentage,
      expiringPercentage,
      healthyStockCount,
      topStockProducts,
      topValueProducts,
      totalPurchaseValue,
      totalSaleValue,
      totalMargin,
      marginPercentage,
      categoryStats,
      recommendations,
      refreshStats
    }
  }
}
</script>

<style scoped>
.stats-view {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-header h1 {
  color: #2c3e50;
  margin: 0;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card.warning {
  border-left: 4px solid #f39c12;
}

.summary-card.danger {
  border-left: 4px solid #e74c3c;
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
  color: #2c3e50;
  margin: 0.25rem 0;
  font-weight: 600;
}

.summary-content small {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.stock-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.analysis-card {
  padding: 1.5rem;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.analysis-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.status-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-bar {
  height: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  transition: width 0.3s;
}

.status-fill.active {
  background-color: #27ae60;
}

.status-fill.inactive {
  background-color: #95a5a6;
}

.status-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.status-label {
  color: #7f8c8d;
}

.status-value {
  color: #2c3e50;
  font-weight: 600;
}

.stock-health {
  display: flex;
  gap: 1rem;
}

.health-item {
  flex: 1;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
}

.health-item.good {
  background-color: #d4edda;
}

.health-item.warning {
  background-color: #fff3cd;
}

.health-item.danger {
  background-color: #f8d7da;
}

.health-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.health-content h4 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.health-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.875rem;
}

.top-products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.top-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.top-rank {
  width: 30px;
  height: 30px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.top-info {
  flex: 1;
}

.top-info h4 {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.top-info p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.8rem;
}

.top-value {
  text-align: right;
}

.top-value .value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
}

.top-value .unit {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.empty-top {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.financial-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.financial-card {
  padding: 1.5rem;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.financial-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.financial-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.financial-item.total {
  border-top: 1px solid #ecf0f1;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.financial-label {
  color: #7f8c8d;
}

.financial-value {
  font-weight: 600;
}

.financial-value.purchase {
  color: #e74c3c;
}

.financial-value.sale {
  color: #27ae60;
}

.financial-value.margin.positive {
  color: #27ae60;
}

.financial-value.margin.negative {
  color: #e74c3c;
}

.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  padding: 0.75rem;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.category-name {
  color: #2c3e50;
  font-weight: 600;
}

.category-count {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.category-bar {
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.category-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s;
}

.category-value {
  text-align: right;
  color: #27ae60;
  font-weight: 600;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-card.success {
  background-color: #d4edda;
  border-left-color: #27ae60;
}

.recommendation-card.warning {
  background-color: #fff3cd;
  border-left-color: #f39c12;
}

.recommendation-card.danger {
  background-color: #f8d7da;
  border-left-color: #e74c3c;
}

.recommendation-card.info {
  background-color: #d6f3ff;
  border-left-color: #3498db;
}

.recommendation-icon {
  font-size: 1.5rem;
  min-width: 30px;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.recommendation-content p {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .stock-analysis,
  .top-products,
  .financial-analysis {
    grid-template-columns: 1fr;
  }
  
  .stock-health {
    flex-direction: column;
  }
  
  .recommendation-card {
    flex-direction: column;
    text-align: center;
  }
}
</style> 