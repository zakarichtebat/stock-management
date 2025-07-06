<template>
  <div class="home-view">
    <div class="container">
      <div class="home-content">
        <div class="home-header">
          <h1>📦 Stock Management</h1>
          <p>Système de gestion de stock moderne et efficace</p>
        </div>

        <div class="home-actions">
          <router-link to="/dashboard" class="btn btn-primary btn-large">
            📊 Accéder au Dashboard
          </router-link>
          <router-link to="/products" class="btn btn-secondary btn-large">
            📦 Voir les Produits
          </router-link>
        </div>

        <div class="home-features">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Dashboard Intuitif</h3>
            <p>Vue d'ensemble de votre inventaire avec statistiques en temps réel</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Recherche Avancée</h3>
            <p>Trouvez rapidement vos produits avec des filtres puissants</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🚨</div>
            <h3>Alertes Intelligentes</h3>
            <p>Notifications pour stocks faibles et dates d'expiration</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Analyses Détaillées</h3>
            <p>Rapports et statistiques pour optimiser votre gestion</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-content {
  text-align: center;
  color: white;
}

.home-header {
  margin-bottom: 3rem;
}

.home-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.home-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.home-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.home-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: white;
  margin-bottom: 1rem;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .home-header h1 {
    font-size: 2rem;
  }
  
  .home-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .home-features {
    grid-template-columns: 1fr;
  }
}
</style>
  