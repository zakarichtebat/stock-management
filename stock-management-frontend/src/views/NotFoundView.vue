<template>
  <div class="not-found-view">
    <div class="container">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
        
        <div class="not-found-actions">
          <router-link to="/" class="btn btn-primary">
            🏠 Accueil
          </router-link>
          <router-link to="/dashboard" class="btn btn-secondary">
            📊 Dashboard
          </router-link>
          <router-link to="/products" class="btn btn-secondary">
            📦 Produits
          </router-link>
        </div>

        <div class="not-found-help">
          <h3>Que pouvez-vous faire ?</h3>
          <ul>
            <li>Vérifiez l'URL dans la barre d'adresse</li>
            <li>Retournez à la page d'accueil</li>
            <li>Utilisez la navigation pour trouver ce que vous cherchez</li>
            <li>Contactez l'administrateur si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  color: white;
  max-width: 600px;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.not-found-content h1 {
  font-size: 6rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: #fff;
}

.not-found-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #fff;
}

.not-found-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.not-found-help {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}

.not-found-help h3 {
  color: white;
  margin-bottom: 1rem;
  text-align: center;
}

.not-found-help ul {
  list-style: none;
  padding: 0;
}

.not-found-help li {
  padding: 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  padding-left: 1.5rem;
}

.not-found-help li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #fff;
}

@media (max-width: 768px) {
  .not-found-content h1 {
    font-size: 4rem;
  }
  
  .not-found-content h2 {
    font-size: 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 