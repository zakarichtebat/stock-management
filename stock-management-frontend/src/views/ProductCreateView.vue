<template>
  <div class="product-create-view">
    <div class="container">
      <div class="create-header">
        <h1>➕ Créer un nouveau produit</h1>
        <router-link to="/products" class="btn btn-secondary">
          ← Retour aux produits
        </router-link>
      </div>

      <div class="create-form-container">
        <form @submit.prevent="createProduct" class="create-form">
          <div class="form-sections">
            <!-- Informations de base -->
            <div class="form-section">
              <h2>📝 Informations de base</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="name" class="form-label">Nom du produit *</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="Ex: iPhone 15 Pro"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="category" class="form-label">Catégorie</label>
                  <input
                    id="category"
                    v-model="form.category"
                    type="text"
                    class="form-input"
                    placeholder="Ex: Électronique"
                  />
                </div>

                <div class="form-group">
                  <label for="supplier" class="form-label">Fournisseur</label>
                  <input
                    id="supplier"
                    v-model="form.supplier"
                    type="text"
                    class="form-input"
                    placeholder="Ex: Apple Inc."
                  />
                </div>

                <div class="form-group">
                  <label for="barcode" class="form-label">Code-barres</label>
                  <input
                    id="barcode"
                    v-model="form.barcode"
                    type="text"
                    class="form-input"
                    placeholder="Ex: 1234567890123"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  class="form-input"
                  rows="3"
                  placeholder="Description détaillée du produit..."
                ></textarea>
              </div>
            </div>

            <!-- Prix et stock -->
            <div class="form-section">
              <h2>💰 Prix et stock</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="purchasePrice" class="form-label">Prix d'achat *</label>
                  <input
                    id="purchasePrice"
                    v-model="form.purchasePrice"
                    type="number"
                    class="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="salePrice" class="form-label">Prix de vente *</label>
                  <input
                    id="salePrice"
                    v-model="form.salePrice"
                    type="number"
                    class="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="quantity" class="form-label">Quantité initiale *</label>
                  <input
                    id="quantity"
                    v-model="form.quantity"
                    type="number"
                    class="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="minStock" class="form-label">Stock minimum</label>
                  <input
                    id="minStock"
                    v-model="form.minStock"
                    type="number"
                    class="form-input"
                    placeholder="5"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div class="form-section">
              <h2>📅 Dates</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="entryDate" class="form-label">Date d'entrée</label>
                  <input
                    id="entryDate"
                    v-model="form.entryDate"
                    type="date"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="expirationDate" class="form-label">Date d'expiration</label>
                  <input
                    id="expirationDate"
                    v-model="form.expirationDate"
                    type="date"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Statut -->
            <div class="form-section">
              <h2>⚙️ Statut</h2>
              <div class="form-group">
                <label class="form-label">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  Produit actif
                </label>
                <small class="form-help">
                  Les produits inactifs ne sont pas visibles dans les listes principales
                </small>
              </div>
            </div>
          </div>

          <!-- Erreurs -->
          <div v-if="productStore.error" class="error-message">
            {{ productStore.error }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="productStore.loading || !isFormValid"
            >
              <span v-if="productStore.loading">Création...</span>
              <span v-else>✅ Créer le produit</span>
            </button>
            <router-link to="/products" class="btn btn-secondary">
              ❌ Annuler
            </router-link>
          </div>
        </form>

        <!-- Aperçu -->
        <div class="product-preview">
          <h2>👁️ Aperçu</h2>
          <div class="preview-card">
            <div class="preview-header">
              <h3>{{ form.name || 'Nom du produit' }}</h3>
              <span 
                class="preview-status"
                :class="{ active: form.isActive, inactive: !form.isActive }"
              >
                {{ form.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            
            <div class="preview-info">
              <p><strong>Catégorie:</strong> {{ form.category || 'Non spécifiée' }}</p>
              <p><strong>Fournisseur:</strong> {{ form.supplier || 'Non spécifié' }}</p>
              <p><strong>Code-barres:</strong> {{ form.barcode || 'Non spécifié' }}</p>
            </div>

            <div class="preview-prices">
              <div class="price-item">
                <span class="price-label">Prix d'achat:</span>
                <span class="price-value purchase">{{ form.purchasePrice || 0 }}€</span>
              </div>
              <div class="price-item">
                <span class="price-label">Prix de vente:</span>
                <span class="price-value sale">{{ form.salePrice || 0 }}€</span>
              </div>
              <div class="price-item">
                <span class="price-label">Marge:</span>
                <span class="price-value margin" :class="{ positive: margin > 0, negative: margin < 0 }">
                  {{ margin }}€ ({{ marginPercent }}%)
                </span>
              </div>
            </div>

            <div class="preview-stock">
              <p><strong>Stock initial:</strong> {{ form.quantity || 0 }} unités</p>
              <p><strong>Stock minimum:</strong> {{ form.minStock || 0 }} unités</p>
            </div>

            <div class="preview-dates">
              <p><strong>Date d'entrée:</strong> {{ formatDate(form.entryDate) || 'Aujourd\'hui' }}</p>
              <p v-if="form.expirationDate">
                <strong>Date d'expiration:</strong> {{ formatDate(form.expirationDate) }}
              </p>
            </div>

            <div v-if="form.description" class="preview-description">
              <p><strong>Description:</strong></p>
              <p>{{ form.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { useRouter } from 'vue-router'

export default {
  name: 'ProductCreateView',
  setup() {
    const productStore = useProductStore()
    const router = useRouter()

    const form = reactive({
      name: '',
      category: '',
      supplier: '',
      barcode: '',
      description: '',
      purchasePrice: '',
      salePrice: '',
      quantity: '',
      minStock: '',
      entryDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      isActive: true
    })

    const isFormValid = computed(() => {
      return form.name && 
             form.purchasePrice && 
             form.salePrice && 
             form.quantity !== ''
    })

    const margin = computed(() => {
      const purchase = parseFloat(form.purchasePrice) || 0
      const sale = parseFloat(form.salePrice) || 0
      return (sale - purchase).toFixed(2)
    })

    const marginPercent = computed(() => {
      const purchase = parseFloat(form.purchasePrice) || 0
      const sale = parseFloat(form.salePrice) || 0
      
      if (purchase === 0) return '0'
      
      const percent = ((sale - purchase) / purchase) * 100
      return percent.toFixed(1)
    })

    const formatDate = (dateString) => {
      if (!dateString) return null
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    }

    const createProduct = async () => {
      if (!isFormValid.value) return

      try {
        // Préparer les données
        const productData = {
          name: form.name,
          category: form.category || null,
          supplier: form.supplier || null,
          barcode: form.barcode || null,
          description: form.description || null,
          purchasePrice: parseFloat(form.purchasePrice),
          salePrice: parseFloat(form.salePrice),
          quantity: parseInt(form.quantity),
          minStock: form.minStock ? parseInt(form.minStock) : null,
          entryDate: form.entryDate,
          expirationDate: form.expirationDate || null,
          isActive: form.isActive
        }

        await productStore.createProduct(productData)
        router.push('/products')
      } catch (error) {
        console.error('Erreur lors de la création:', error)
      }
    }

    onMounted(() => {
      // Nettoyer les erreurs précédentes
      productStore.clearError()
    })

    return {
      form,
      productStore,
      isFormValid,
      margin,
      marginPercent,
      formatDate,
      createProduct
    }
  }
}
</script>

<style scoped>
.product-create-view {
  max-width: 1200px;
  margin: 0 auto;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-header h1 {
  color: #2c3e50;
  margin: 0;
}

.create-form-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.create-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 2rem;
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.form-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.form-help {
  display: block;
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
}

.product-preview {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.product-preview h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.preview-card {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.preview-header h3 {
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.preview-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.preview-status.active {
  background-color: #d4edda;
  color: #155724;
}

.preview-status.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.preview-info,
.preview-stock,
.preview-dates {
  margin-bottom: 1rem;
}

.preview-info p,
.preview-stock p,
.preview-dates p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.preview-prices {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.price-item:last-child {
  margin-bottom: 0;
  padding-top: 0.5rem;
  border-top: 1px solid #ecf0f1;
}

.price-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.price-value {
  font-weight: 600;
}

.price-value.purchase {
  color: #e74c3c;
}

.price-value.sale {
  color: #27ae60;
}

.price-value.margin.positive {
  color: #27ae60;
}

.price-value.margin.negative {
  color: #e74c3c;
}

.preview-description {
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.preview-description p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .create-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .create-form-container {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .product-preview {
    position: static;
  }
}
</style> 