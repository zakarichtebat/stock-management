<template>
  <div class="product-edit">
    <div class="container">
      <div class="edit-header">
        <h1>✏️ Modifier le produit</h1>
        <button @click="$router.go(-1)" class="btn btn-secondary">
          ← Retour
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement du produit...</p>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="loadProduct" class="btn btn-primary">Réessayer</button>
          <button @click="$router.push('/products')" class="btn btn-secondary">Retour aux produits</button>
        </div>
      </div>

      <div v-else class="edit-content">
        <div class="form-container">
          <form @submit.prevent="updateProduct" class="product-form">
            <!-- Informations de base -->
            <div class="form-section">
              <h2>📋 Informations de base</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="name">Nom du produit*</label>
                  <input
                    v-model="form.name"
                    type="text"
                    id="name"
                    required
                    class="form-control"
                    placeholder="Nom du produit"
                  >
                </div>

                <div class="form-group">
                  <label for="category">Catégorie*</label>
                  <input
                    v-model="form.category"
                    type="text"
                    id="category"
                    required
                    class="form-control"
                    placeholder="Catégorie"
                  >
                </div>

                <div class="form-group">
                  <label for="barcode">Code-barres</label>
                  <input
                    v-model="form.barcode"
                    type="text"
                    id="barcode"
                    class="form-control"
                    placeholder="Code-barres"
                  >
                </div>

                <div class="form-group">
                  <label for="supplier">Fournisseur</label>
                  <input
                    v-model="form.supplier"
                    type="text"
                    id="supplier"
                    class="form-control"
                    placeholder="Fournisseur"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  v-model="form.description"
                  id="description"
                  rows="3"
                  class="form-control"
                  placeholder="Description du produit"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Image du produit</label>
                <div class="image-input-container">
                  <div class="image-preview">
                    <img 
                      :src="getProductImage(form)" 
                      :alt="form.name || 'Aperçu du produit'"
                      class="preview-img"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="image-upload">
                    <input
                      type="file"
                      @change="handleImageUpload"
                      accept="image/*"
                      class="form-control"
                      ref="fileInput"
                    />
                    <small class="form-text text-muted">Formats acceptés : JPG, PNG, GIF</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Prix et coûts -->
            <div class="form-section">
              <h2>💰 Prix et coûts</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="purchasePrice">Prix d'achat*</label>
                  <input
                    v-model.number="form.purchasePrice"
                    type="number"
                    id="purchasePrice"
                    step="0.01"
                    min="0"
                    required
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>

                <div class="form-group">
                  <label for="salePrice">Prix de vente*</label>
                  <input
                    v-model.number="form.salePrice"
                    type="number"
                    id="salePrice"
                    step="0.01"
                    min="0"
                    required
                    class="form-control"
                    placeholder="0.00"
                  >
                </div>

                <div class="form-group calculation-result">
                  <label>Marge bénéficiaire</label>
                  <div class="calculation-display">
                    <span class="amount">{{ marginAmount.toFixed(2) }} €</span>
                    <span class="percentage" :class="{ 'positive': marginPercentage > 0, 'negative': marginPercentage < 0 }">
                      {{ marginPercentage.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stock -->
            <div class="form-section">
              <h2>📦 Stock</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="quantity">Quantité*</label>
                  <input
                    v-model.number="form.quantity"
                    type="number"
                    id="quantity"
                    min="0"
                    required
                    class="form-control"
                    placeholder="0"
                  >
                </div>

                <div class="form-group">
                  <label for="minStock">Stock minimum</label>
                  <input
                    v-model.number="form.minStock"
                    type="number"
                    id="minStock"
                    min="0"
                    class="form-control"
                    placeholder="0"
                  >
                </div>

                <div class="form-group">
                  <label for="location">Emplacement</label>
                  <input
                    v-model="form.location"
                    type="text"
                    id="location"
                    class="form-control"
                    placeholder="Emplacement"
                  >
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="form-section">
              <h2>📅 Dates</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="entryDate">Date d'entrée</label>
                  <input
                    v-model="form.entryDate"
                    type="date"
                    id="entryDate"
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label for="expirationDate">Date d'expiration</label>
                  <input
                    v-model="form.expirationDate"
                    type="date"
                    id="expirationDate"
                    class="form-control"
                  >
                </div>
              </div>
            </div>

            <!-- Statut -->
            <div class="form-section">
              <h2>⚙️ Statut</h2>
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="form-checkbox"
                  >
                  <span class="checkmark"></span>
                  Produit actif
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button
                type="button"
                @click="$router.go(-1)"
                class="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="btn btn-primary"
              >
                {{ submitting ? 'Modification...' : 'Modifier le produit' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Aperçu -->
        <div class="preview-container">
          <div class="preview-card">
            <h3>👁️ Aperçu</h3>
            <div class="preview-content">
              <div class="preview-header">
                <h4>{{ form.name || 'Nom du produit' }}</h4>
                <span class="preview-category">{{ form.category || 'Catégorie' }}</span>
              </div>
              
              <div class="preview-details">
                <p><strong>Prix:</strong> {{ form.salePrice || 0 }} €</p>
                <p><strong>Stock:</strong> {{ form.quantity || 0 }} unités</p>
                <p><strong>Fournisseur:</strong> {{ form.supplier || 'Non spécifié' }}</p>
                <p v-if="form.description"><strong>Description:</strong> {{ form.description }}</p>
              </div>

              <div class="preview-status">
                <span class="status-badge" :class="{ 'active': form.isActive, 'inactive': !form.isActive }">
                  {{ form.isActive ? 'Actif' : 'Inactif' }}
                </span>
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
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '../stores/products'
import { getImageUrl, getDefaultProductImage } from '../utils/imageHelper'

export default {
  name: 'ProductEditView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const productStore = useProductStore()
    const fileInput = ref(null)
    
    const loading = ref(true)
    const error = ref('')
    const submitting = ref(false)
    
    const form = ref({
      name: '',
      category: '',
      description: '',
      barcode: '',
      supplier: '',
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
      minStock: 0,
      location: '',
      entryDate: '',
      expirationDate: '',
      isActive: true,
      imageUrl: ''
    })

    const marginAmount = computed(() => {
      return (form.value.salePrice || 0) - (form.value.purchasePrice || 0)
    })

    const marginPercentage = computed(() => {
      if (!form.value.purchasePrice || form.value.purchasePrice === 0) return 0
      return ((marginAmount.value / form.value.purchasePrice) * 100)
    })

    const getProductImage = (product) => {
      return getImageUrl(product.imageUrl)
    }

    const handleImageError = (e) => {
      e.target.src = getDefaultProductImage();
    }

    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('image', file)

      try {
        // Récupérer le token
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Non autorisé')
        }

        // Créer l'URL complète
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/products/${route.params.id}/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Vérifier le type de contenu de la réponse
        const contentType = response.headers.get('content-type')
        if (!response.ok) {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Erreur lors du téléchargement')
          } else {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`)
          }
        }

        // Vérifier si nous avons une réponse JSON
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          if (data && data.path) {
            form.value.imageUrl = data.path
            // Recharger le produit pour mettre à jour l'image
            await loadProduct()
          } else {
            throw new Error('Format de réponse invalide')
          }
        } else {
          throw new Error('Format de réponse invalide')
        }
      } catch (error) {
        console.error('Erreur de téléchargement:', error)
        alert(error.message || 'Erreur lors du téléchargement de l\'image. Veuillez réessayer.')
      } finally {
        // Réinitialiser le champ de fichier
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    const loadProduct = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const product = await productStore.fetchProduct(route.params.id)
        
        // Remplir le formulaire avec les données existantes
        form.value = {
          name: product.name || '',
          category: product.category || '',
          description: product.description || '',
          barcode: product.barcode || '',
          supplier: product.supplier || '',
          purchasePrice: product.purchasePrice || 0,
          salePrice: product.salePrice || 0,
          quantity: product.quantity || 0,
          minStock: product.minStock || 0,
          location: product.location || '',
          entryDate: product.entryDate ? new Date(product.entryDate).toISOString().split('T')[0] : '',
          expirationDate: product.expirationDate ? new Date(product.expirationDate).toISOString().split('T')[0] : '',
          isActive: product.isActive !== undefined ? product.isActive : true,
          imageUrl: product.imageUrl || ''
        }
      } catch (err) {
        console.error('Erreur détaillée lors du chargement:', err)
        
        if (err.response?.status === 404) {
          error.value = 'Produit non trouvé. Il a peut-être été supprimé.'
        } else if (err.response?.status === 401) {
          error.value = 'Session expirée. Veuillez vous reconnecter.'
        } else if (err.response?.status === 500) {
          error.value = 'Erreur serveur. Vérifiez que le backend est démarré.'
        } else {
          error.value = err.response?.data?.message || 'Erreur lors du chargement du produit'
        }
      } finally {
        loading.value = false
      }
    }

    const updateProduct = async () => {
      try {
        submitting.value = true
        error.value = ''
        
        // Préparer les données avec validation des types
        const productData = {
          name: form.value.name?.trim(),
          category: form.value.category?.trim(),
          description: form.value.description?.trim() || undefined,
          barcode: form.value.barcode?.trim() || undefined,
          supplier: form.value.supplier?.trim() || undefined,
          purchasePrice: parseFloat(form.value.purchasePrice) || 0,
          salePrice: parseFloat(form.value.salePrice) || 0,
          quantity: parseInt(form.value.quantity) || 0,
          minStock: parseInt(form.value.minStock) || 0,
          location: form.value.location?.trim() || undefined,
          entryDate: form.value.entryDate ? new Date(form.value.entryDate).toISOString() : undefined,
          expirationDate: form.value.expirationDate ? new Date(form.value.expirationDate).toISOString() : undefined,
          isActive: form.value.isActive,
          imageUrl: form.value.imageUrl?.trim() || undefined
        }

        // Validation basique
        if (!productData.name) {
          error.value = 'Le nom du produit est requis'
          return
        }
        
        if (!productData.category) {
          error.value = 'La catégorie est requise'
          return
        }
        
        if (productData.purchasePrice < 0) {
          error.value = 'Le prix d\'achat ne peut pas être négatif'
          return
        }
        
        if (productData.salePrice < 0) {
          error.value = 'Le prix de vente ne peut pas être négatif'
          return
        }
        
        if (productData.quantity < 0) {
          error.value = 'La quantité ne peut pas être négative'
          return
        }

        await productStore.updateProduct(route.params.id, productData)
        router.push('/products')
      } catch (err) {
        console.error('Erreur détaillée lors de la mise à jour:', err)
        
        if (err.response?.status === 400) {
          error.value = 'Données invalides. Vérifiez les champs du formulaire.'
          if (err.response?.data?.message) {
            if (Array.isArray(err.response.data.message)) {
              error.value = err.response.data.message.join('\n')
            } else {
              error.value = err.response.data.message
            }
          }
        } else if (err.response?.status === 404) {
          error.value = 'Produit non trouvé. Il a peut-être été supprimé.'
        } else if (err.response?.status === 409) {
          error.value = 'Un autre produit avec ce code-barres existe déjà.'
        } else if (err.response?.status === 500) {
          error.value = 'Erreur serveur. Veuillez réessayer plus tard.'
        } else {
          error.value = 'Erreur lors de la mise à jour du produit'
        }
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      loading,
      error,
      submitting,
      form,
      marginAmount,
      marginPercentage,
      loadProduct,
      updateProduct,
      getProductImage,
      getDefaultProductImage,
      fileInput,
      handleImageUpload,
      handleImageError,
    }
  }
}
</script>

<style scoped>
.product-edit {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.edit-header h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: white;
}

.error {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.edit-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.preview-container {
  position: sticky;
  top: 2rem;
}

.preview-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.preview-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.preview-header h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.preview-category {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.preview-details {
  margin: 1rem 0;
}

.preview-details p {
  margin: 0.5rem 0;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  color: #667eea;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.calculation-result {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.calculation-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.percentage {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.percentage.positive {
  background: #d4edda;
  color: #155724;
}

.percentage.negative {
  background: #f8d7da;
  color: #721c24;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .edit-content {
    grid-template-columns: 1fr;
  }
  
  .preview-container {
    position: static;
    order: -1;
  }
  
  .edit-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .edit-header h1 {
    font-size: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.image-input-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.image-preview {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-text {
  color: #666;
  font-size: 0.875rem;
}
</style> 