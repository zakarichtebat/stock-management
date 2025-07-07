<template>
  <div class="quote-create container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0 text-gray-800">
        <i class="fas fa-file-invoice me-2"></i>Nouveau devis
      </h1>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="previewQuote" :disabled="!isFormValid">
          <i class="fas fa-eye me-1"></i> Aperçu
        </button>
        <router-link to="/quotes" class="btn btn-outline-secondary">
          <i class="fas fa-times me-1"></i> Annuler
        </router-link>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="quote-form">
      <!-- Section Client -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h3 class="h5 mb-0 text-primary">
            <i class="fas fa-user me-2"></i>Informations client
          </h3>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Nom du client <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-user-circle"></i>
                </span>
                <input
                  v-model="quote.clientName"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Entrez le nom du client"
                >
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-envelope"></i>
                </span>
                <input
                  v-model="quote.clientEmail"
                  type="email"
                  class="form-control"
                  placeholder="email@exemple.com"
                >
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">Adresse</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-map-marker-alt"></i>
                </span>
                <textarea
                  v-model="quote.clientAddress"
                  class="form-control"
                  rows="3"
                  placeholder="Adresse complète du client"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Produits -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h3 class="h5 mb-0 text-primary">
            <i class="fas fa-shopping-cart me-2"></i>Produits
          </h3>
          <button type="button" class="btn btn-primary btn-sm" @click="addItem">
            <i class="fas fa-plus me-1"></i> Ajouter un produit
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Produit</th>
                  <th style="width: 150px">Quantité</th>
                  <th style="width: 150px">Prix unitaire</th>
                  <th style="width: 150px">Total</th>
                  <th style="width: 80px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in quote.items" :key="index">
                  <td>
                    <select
                      v-model="item.productId"
                      class="form-select"
                      required
                      @change="updateItemPrice(index)"
                    >
                      <option value="">Sélectionner un produit</option>
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product.id"
                      >
                        {{ product.name }} ({{ formatPrice(product.salePrice) }})
                      </option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      class="form-control"
                      min="1"
                      required
                      @change="updateItemTotal(index)"
                    >
                  </td>
                  <td>
                    <div class="input-group">
                      <input
                        v-model.number="item.unitPrice"
                        type="number"
                        class="form-control"
                        step="0.01"
                        required
                        @change="updateItemTotal(index)"
                      >
                      <span class="input-group-text">€</span>
                    </div>
                  </td>
                  <td>
                    <div class="input-group">
                      <input
                        :value="formatPrice(item.total)"
                        type="text"
                        class="form-control"
                        readonly
                      >
                      <span class="input-group-text">€</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      @click="removeItem(index)"
                      title="Supprimer"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="quote.items.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    <i class="fas fa-box fa-2x mb-2"></i>
                    <p class="mb-0">Aucun produit ajouté</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section Totaux -->
      <div class="row">
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h3 class="h5 mb-0 text-primary">
                <i class="fas fa-cog me-2"></i>Paramètres
              </h3>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Taux de TVA (%)</label>
                  <div class="input-group">
                    <input
                      v-model.number="quote.taxRate"
                      type="number"
                      class="form-control"
                      step="0.1"
                      @change="updateTotals"
                    >
                    <span class="input-group-text">%</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Remise (%)</label>
                  <div class="input-group">
                    <input
                      v-model.number="quote.discount"
                      type="number"
                      class="form-control"
                      step="0.1"
                      @change="updateTotals"
                    >
                    <span class="input-group-text">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white py-3">
              <h3 class="h5 mb-0 text-primary">
                <i class="fas fa-calculator me-2"></i>Totaux
              </h3>
            </div>
            <div class="card-body">
              <div class="totals">
                <div class="d-flex justify-content-between mb-2">
                  <span>Sous-total :</span>
                  <span>{{ formatPrice(quote.subtotal) }} €</span>
                </div>
                <div class="d-flex justify-content-between mb-2" v-if="quote.discount > 0">
                  <span>Remise ({{ quote.discount }}%) :</span>
                  <span class="text-danger">-{{ formatPrice(getDiscountAmount()) }} €</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>TVA ({{ quote.taxRate }}%) :</span>
                  <span>{{ formatPrice(quote.taxAmount) }} €</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="h5 mb-0">Total TTC :</span>
                  <span class="h4 mb-0 text-primary">{{ formatPrice(quote.total) }} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
          <i class="fas fa-save me-1"></i> 
          <span v-if="loading">Enregistrement...</span>
          <span v-else>Enregistrer</span>
        </button>
      </div>
    </form>

    <!-- Modal Aperçu -->
    <div class="modal fade" id="previewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Aperçu du devis</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Contenu de l'aperçu -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuoteStore } from '../stores/quotes';
import { useProductStore } from '../stores/products';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle';

export default {
  name: 'QuoteCreateView',
  setup() {
    const quoteStore = useQuoteStore();
    const productStore = useProductStore();
    const router = useRouter();
    const loading = ref(false);
    const products = ref([]);
    let previewModal = null;

    const quote = ref({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      items: [],
      taxRate: 20,
      discount: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });

    const isFormValid = computed(() => {
      return quote.value.clientName && 
             quote.value.items.length > 0 &&
             quote.value.items.every(item => 
               item.productId && 
               item.quantity > 0 && 
               item.unitPrice > 0
             );
    });

    const formatPrice = (value) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    const loadProducts = async () => {
      try {
        products.value = await productStore.fetchProducts();
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };

    const addItem = () => {
      quote.value.items.push({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      });
    };

    const removeItem = (index) => {
      quote.value.items.splice(index, 1);
      updateTotals();
    };

    const updateItemPrice = (index) => {
      const item = quote.value.items[index];
      const product = products.value.find(p => p.id === item.productId);
      if (product) {
        item.unitPrice = product.salePrice;
        updateItemTotal(index);
      }
    };

    const updateItemTotal = (index) => {
      const item = quote.value.items[index];
      item.total = item.quantity * item.unitPrice;
      updateTotals();
    };

    const getDiscountAmount = () => {
      return (quote.value.subtotal * quote.value.discount) / 100;
    };

    const updateTotals = () => {
      quote.value.subtotal = quote.value.items.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = getDiscountAmount();
      const taxableAmount = quote.value.subtotal - discountAmount;
      quote.value.taxAmount = (taxableAmount * quote.value.taxRate) / 100;
      quote.value.total = taxableAmount + quote.value.taxAmount;
    };

    const previewQuote = () => {
      if (previewModal) {
        previewModal.show();
      }
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;
      
      loading.value = true;
      try {
        await quoteStore.createQuote(quote.value);
        router.push('/quotes');
      } catch (error) {
        console.error('Erreur lors de la création du devis:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadProducts();
      previewModal = new Modal(document.getElementById('previewModal'));
    });

    return {
      quote,
      products,
      loading,
      isFormValid,
      formatPrice,
      addItem,
      removeItem,
      updateItemPrice,
      updateItemTotal,
      getDiscountAmount,
      updateTotals,
      previewQuote,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.quote-create {
  background-color: #f8f9fc;
}

.card {
  border: none;
  border-radius: 0.5rem;
}

.card-header {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
  padding: 1rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.text-primary {
  color: #4e73df !important;
}

.btn-primary {
  background-color: #4e73df;
  border-color: #4e73df;
}

.btn-primary:hover {
  background-color: #2e59d9;
  border-color: #2653d4;
}

.totals {
  font-size: 1rem;
}

.h4 {
  font-weight: 600;
}
</style> 