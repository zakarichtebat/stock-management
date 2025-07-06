<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>📦 Stock Management</h1>
        <p>Connexion à votre compte</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="admin@stockmanagement.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Votre mot de passe"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary login-btn"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Connexion...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Pas encore de compte ? 
          <router-link to="/register" class="link">S'inscrire</router-link>
        </p>
      </div>

      <!-- Compte de test -->
      <div class="test-account">
        <h3>Compte de test</h3>
        <p><strong>Email:</strong> admin@stockmanagement.com</p>
        <p><strong>Mot de passe:</strong> admin123</p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const form = reactive({
      email: '',
      password: ''
    })

    const handleLogin = async () => {
      try {
        await authStore.login(form)
        router.push('/dashboard')
      } catch (error) {
        console.error('Erreur de connexion:', error)
      }
    }

    onMounted(() => {
      // Nettoyer les erreurs précédentes
      authStore.clearError()
    })

    return {
      form,
      authStore,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.login-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  color: #7f8c8d;
}

.link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.test-account {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.test-account h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.test-account p {
  color: #5a6c7d;
  margin: 0.25rem 0;
  font-size: 0.9rem;
}
</style> 