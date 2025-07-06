<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>📦 Stock Management</h1>
        <p>Créer un nouveau compte</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name" class="form-label">Nom complet</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Votre nom complet"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="votre@email.com"
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
            placeholder="Mot de passe (min. 6 caractères)"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="Confirmer le mot de passe"
            required
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary register-btn"
          :disabled="authStore.loading || !isFormValid"
        >
          <span v-if="authStore.loading">Inscription...</span>
          <span v-else>S'inscrire</span>
        </button>
      </form>

      <div class="register-footer">
        <p>Déjà un compte ? 
          <router-link to="/login" class="link">Se connecter</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const form = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const passwordError = computed(() => {
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        return 'Les mots de passe ne correspondent pas'
      }
      return null
    })

    const isFormValid = computed(() => {
      return form.name && 
             form.email && 
             form.password && 
             form.confirmPassword &&
             form.password === form.confirmPassword &&
             form.password.length >= 6
    })

    const handleRegister = async () => {
      if (!isFormValid.value) return

      try {
        await authStore.register({
          name: form.name,
          email: form.email,
          password: form.password
        })
        
        // Rediriger vers login après inscription réussie
        router.push('/login')
      } catch (error) {
        console.error('Erreur d\'inscription:', error)
      }
    }

    onMounted(() => {
      // Nettoyer les erreurs précédentes
      authStore.clearError()
    })

    return {
      form,
      authStore,
      passwordError,
      isFormValid,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.register-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.register-form {
  margin-bottom: 1.5rem;
}

.register-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
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
</style> 