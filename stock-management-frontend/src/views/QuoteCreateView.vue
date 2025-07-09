<template>
  <div class="quote-create">
    <div class="container">
      <!-- En-tête -->
      <header class="quote-header">
        <div class="quote-header-content">
          <h1 class="quote-title">
            <i class="fas fa-file-invoice"></i>
            Nouveau devis
          </h1>
          <div class="quote-reference">
            Devis #{{ generateQuoteNumber() }}
          </div>
        </div>
        <div class="quote-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="previewQuote" 
            :disabled="!isFormValid"
          >
            <i class="fas fa-eye"></i>
            Aperçu
          </button>
          <router-link to="/quotes" class="btn btn-outline">
            <i class="fas fa-times"></i>
            Annuler
          </router-link>
        </div>
      </header>

      <form @submit.prevent="handleSubmit" class="quote-form">
        <div class="quote-grid">
          <!-- Colonne gauche -->
          <div class="quote-col">
            <!-- Section Client -->
            <div class="quote-card">
              <div class="quote-card-header">
                <h2 class="quote-card-title">
                  <i class="fas fa-user"></i>
                  Informations client
                </h2>
              </div>
              <div class="quote-card-body">
                <div class="form-group">
                  <label class="form-label">
                    Nom du client
                    <span class="required">*</span>
                  </label>
                  <div class="input-group">
                    <i class="fas fa-user input-group-icon"></i>
                    <input
                      v-model="quote.clientName"
                      type="text"
                      class="form-control"
                      required
                      placeholder="Entrez le nom du client"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Email</label>
                  <div class="input-group">
                    <i class="fas fa-envelope input-group-icon"></i>
                    <input
                      v-model="quote.clientEmail"
                      type="email"
                      class="form-control"
                      placeholder="email@exemple.com"
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Adresse</label>
                  <div class="input-group">
                    <i class="fas fa-map-marker-alt input-group-icon"></i>
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

            <!-- Section Dates -->
            <div class="quote-card">
              <div class="quote-card-header">
                <h2 class="quote-card-title">
                  <i class="fas fa-calendar"></i>
                  Dates
                </h2>
              </div>
              <div class="quote-card-body">
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label class="form-label">
                      Date d'émission
                      <span class="required">*</span>
                    </label>
                    <div class="input-group">
                      <i class="fas fa-calendar-alt input-group-icon"></i>
                      <input
                        v-model="quote.date"
                        type="date"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>
                  <div class="form-group col-md-6">
                    <label class="form-label">
                      Date d'échéance
                      <span class="required">*</span>
                    </label>
                    <div class="input-group">
                      <i class="fas fa-calendar-check input-group-icon"></i>
                      <input
                        v-model="quote.dueDate"
                        type="date"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="quote-col">
            <!-- Section Paramètres -->
            <div class="quote-card">
              <div class="quote-card-header">
                <h2 class="quote-card-title">
                  <i class="fas fa-cog"></i>
                  Paramètres
                </h2>
              </div>
              <div class="quote-card-body">
                <div class="form-row">
                  <div class="form-group col-md-12">
                    <label class="form-label">Remise (%)</label>
                    <div class="input-group">
                      <i class="fas fa-tags input-group-icon"></i>
                      <input
                        v-model.number="quote.discount"
                        type="number"
                        class="form-control"
                        min="0"
                        max="100"
                        step="0.1"
                        @change="updateTotals"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Totaux -->
            <div class="quote-card">
              <div class="quote-card-header">
                <h2 class="quote-card-title">
                  <i class="fas fa-calculator"></i>
                  Totaux
                </h2>
              </div>
              <div class="quote-card-body">
                <div class="totals-section">
                  <div class="total-row">
                    <span>Sous-total :</span>
                    <span>{{ formatPrice(subtotal) }} MAD</span>
                  </div>
                  <div class="total-row" v-if="quote.discount > 0">
                    <span>Remise ({{ quote.discount }}%) :</span>
                    <span>-{{ formatPrice(discountAmount) }} MAD</span>
                  </div>
                  <div class="total-row final">
                    <span class="label">Total</span>
                    <span class="value">{{ formatPrice(total) }} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Produits (pleine largeur) -->
        <div class="quote-card products-card">
          <div class="quote-card-header">
            <h2 class="quote-card-title">
              <i class="fas fa-shopping-cart"></i>
              Produits
            </h2>
            <button type="button" class="btn btn-primary btn-sm" @click="addItem">
              <i class="fas fa-plus"></i>
              Ajouter un produit
            </button>
          </div>
          <div class="quote-card-body p-0">
            <div class="table-responsive">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th class="text-end" style="width: 150px">Quantité</th>
                    <th class="text-end" style="width: 200px">Prix unitaire</th>
                    <th class="text-end" style="width: 200px">Total</th>
                    <th style="width: 80px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in quote.items" :key="index">
                    <td>
                      <div class="form-group mb-0">
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
                            {{ product.name }} ({{ formatPrice(product.salePrice) }} MAD)
                          </option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div class="form-group mb-0">
                        <input
                          v-model.number="item.quantity"
                          type="number"
                          class="form-control text-end"
                          min="1"
                          required
                          @change="updateItemTotal(index)"
                        >
                      </div>
                    </td>
                    <td>
                      <div class="form-group mb-0">
                        <div class="input-group">
                          <input
                            v-model.number="item.unitPrice"
                            type="number"
                            class="form-control text-end"
                            step="0.01"
                            required
                            @change="updateItemTotal(index)"
                          >
                          <span class="input-group-text">MAD</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="form-group mb-0">
                        <div class="input-group">
                          <input
                            :value="formatPrice(item.total)"
                            type="text"
                            class="form-control text-end"
                            readonly
                          >
                          <span class="input-group-text">MAD</span>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="removeItem(index)"
                        title="Supprimer"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="quote.items.length === 0">
                    <td colspan="5">
                      <div class="empty-products">
                        <i class="fas fa-box"></i>
                        <p>Aucun produit ajouté</p>
                        <button type="button" class="btn btn-primary mt-3" @click="addItem">
                          <i class="fas fa-plus"></i>
                          Ajouter un produit
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Bouton de soumission -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary btn-lg"
            :disabled="!isFormValid || quoteStore.loading"
          >
            <i class="fas fa-save"></i>
            {{ quoteStore.loading ? 'Enregistrement...' : 'Enregistrer le devis' }}
          </button>
        </div>
      </form>

      <!-- Modal d'aperçu -->
      <div class="modal fade" id="previewModal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="previewModalLabel">
                <i class="fas fa-file-invoice"></i>
                Aperçu du devis
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="preview-document">
                <!-- En-tête du devis -->
                <div class="preview-header">
                  <div class="preview-title">
                    <h1>DEVIS</h1>
                    <div class="reference">{{ generateQuoteNumber() }}</div>
                  </div>
                  <div class="preview-date">
                    <div class="date-group">
                      <div class="label">Date d'émission</div>
                      <div class="value">{{ formatDate(quote.date) }}</div>
                    </div>
                    <div class="date-group mt-3">
                      <div class="label">Date d'échéance</div>
                      <div class="value">{{ formatDate(quote.dueDate) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Informations client -->
                <div class="preview-client">
                  <h2>
                    <i class="fas fa-user"></i>
                    Client
                  </h2>
                  <div class="preview-client-info">
                    <div class="name">{{ quote.clientName }}</div>
                    <div class="email" v-if="quote.clientEmail">{{ quote.clientEmail }}</div>
                    <div class="address" v-if="quote.clientAddress">{{ quote.clientAddress }}</div>
                  </div>
                </div>

                <!-- Table des produits -->
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in quote.items" :key="item.productId">
                      <td>{{ getProductName(item.productId) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatPrice(item.unitPrice) }} MAD</td>
                      <td>{{ formatPrice(item.total) }} MAD</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Totaux -->
                <div class="preview-totals">
                  <div class="preview-total-row">
                    <span class="label">Sous-total</span>
                    <span class="value">{{ formatPrice(subtotal) }} MAD</span>
                  </div>
                  <div class="preview-total-row" v-if="quote.discount > 0">
                    <span class="label">Remise ({{ quote.discount }}%)</span>
                    <span class="value">-{{ formatPrice(discountAmount) }} MAD</span>
                  </div>
                  <div class="preview-total-row final">
                    <span class="label">Total</span>
                    <span class="value">{{ formatPrice(total) }} MAD</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              <button type="button" class="btn btn-primary" @click="printQuote">
                <i class="fas fa-print"></i>
                Imprimer
              </button>
            </div>
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
import '@/assets/styles/quote.css';

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
      discount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'DRAFT'
    });

    // Calcul du sous-total
    const subtotal = computed(() => {
      return quote.value.items.reduce((sum, item) => {
        const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
    });

    // Calcul de la remise
    const discountAmount = computed(() => {
      const discount = parseFloat(quote.value.discount || 0);
      return (subtotal.value * discount) / 100;
    });

    // Calcul du total
    const total = computed(() => {
      return subtotal.value - discountAmount.value;
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
      const number = parseFloat(value);
      if (isNaN(number)) return '0,00';
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number);
    };

    const getProductName = (productId) => {
      const product = products.value.find(p => p.id === productId);
      return product ? product.name : 'Produit inconnu';
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
        item.unitPrice = parseFloat(product.salePrice);
        updateItemTotal(index);
      }
    };

    const updateItemTotal = (index) => {
      const item = quote.value.items[index];
      const quantity = parseFloat(item.quantity || 0);
      const unitPrice = parseFloat(item.unitPrice || 0);
      item.total = quantity * unitPrice;
      updateTotals();
    };

    const updateTotals = () => {
      // Les totaux sont automatiquement mis à jour grâce aux computed properties
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        const quoteData = {
          clientName: quote.value.clientName,
          clientEmail: quote.value.clientEmail,
          clientAddress: quote.value.clientAddress,
          items: quote.value.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          discount: quote.value.discount
        };
        
        await quoteStore.createQuote(quoteData);
        router.push('/quotes');
      } catch (error) {
        console.error('Error creating quote:', error);
      } finally {
        loading.value = false;
      }
    };

    const generateQuoteNumber = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${year}${month}-${random}`;
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const printQuote = () => {
      window.print();
    };

    const previewQuote = () => {
      if (previewModal) {
        previewModal.show();
      }
    };

    onMounted(() => {
      loadProducts();
      setTimeout(() => {
        const modalElement = document.getElementById('previewModal');
        if (modalElement) {
          previewModal = new Modal(modalElement);
        }
      }, 100);
    });

    return {
      quote,
      loading,
      products,
      subtotal,
      discountAmount,
      total,
      isFormValid,
      formatPrice,
      getProductName,
      loadProducts,
      addItem,
      removeItem,
      updateItemPrice,
      updateItemTotal,
      updateTotals,
      handleSubmit,
      quoteStore,
      generateQuoteNumber,
      formatDate,
      printQuote,
      previewQuote
    };
  }
};
</script>

<style scoped>
/* Base Layout */
.quote-create {
  padding: 2rem 0;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f3f9 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header Styling */
.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(78, 115, 223, 0.1);
}

.quote-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quote-reference {
  color: #858796;
  font-size: 1.1rem;
}

.quote-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.quote-title i {
  color: #4e73df;
  margin-right: 0.75rem;
  font-size: 1.8rem;
}

.quote-actions {
  display: flex;
  gap: 1rem;
}

/* Card Styling */
.quote-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1.5rem rgba(58, 59, 69, 0.1);
  margin-bottom: 2rem;
  border: 1px solid rgba(78, 115, 223, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quote-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 2rem rgba(58, 59, 69, 0.15);
}

.quote-card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e3e6f0;
  background-color: white;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quote-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quote-card-title i {
  color: #4e73df;
  font-size: 1.1rem;
}

.quote-card-body {
  padding: 2rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.75rem;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  display: block;
  font-size: 0.95rem;
}

.form-label .required {
  color: #e74a3b;
  margin-left: 0.25rem;
}

.input-group {
  position: relative;
}

.input-group-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #4e73df;
  z-index: 10;
  font-size: 1rem;
}

.input-group .form-control,
.input-group .form-select {
  padding: 0.75rem 1.25rem 0.75rem 3rem;
  border-radius: 0.75rem;
  border: 2px solid #e3e6f0;
  height: 3.25rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8f9fc;
}

.input-group .form-control:focus,
.input-group .form-select:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.15);
  background-color: white;
}

.input-group .form-control::placeholder {
  color: #858796;
  opacity: 0.7;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

/* Products Table */
.products-table {
  width: 100%;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.products-table thead th {
  background-color: #f8f9fc;
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  padding: 1.25rem;
  border-bottom: 2px solid #e3e6f0;
}

.products-table tbody td {
  padding: 1.25rem;
  vertical-align: middle;
  border-bottom: 1px solid #e3e6f0;
  background-color: white;
}

.products-table tbody tr:hover td {
  background-color: #f8f9fc;
}

.empty-products {
  text-align: center;
  padding: 4rem 2rem;
  color: #858796;
  background-color: #f8f9fc;
  border-radius: 0.75rem;
}

.empty-products i {
  font-size: 3rem;
  margin-bottom: 1.25rem;
  display: block;
  color: #4e73df;
  opacity: 0.5;
}

.empty-products p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Buttons */
.btn {
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  border-radius: 0.75rem;
  border-width: 2px;
  letter-spacing: 0.3px;
}

.btn i {
  font-size: 1rem;
}

.btn-primary {
  background-color: #4e73df;
  border-color: #4e73df;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2e59d9;
  border-color: #2e59d9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(78, 115, 223, 0.25);
}

.btn-secondary {
  background-color: #f8f9fc;
  border-color: #e3e6f0;
  color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e3e6f0;
  border-color: #d1d3e2;
  color: #2c3e50;
}

.btn-danger {
  background-color: #e74a3b;
  border-color: #e74a3b;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #be3e31;
  border-color: #be3e31;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 74, 59, 0.25);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Totals Section */
.totals-section {
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f3f9 100%);
  border-radius: 1rem;
  padding: 2rem;
  border: 2px solid #e3e6f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1.05rem;
  color: #2c3e50;
}

.total-row:not(:last-child) {
  border-bottom: 1px solid rgba(78, 115, 223, 0.1);
}

.total-row:last-child {
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 2px solid #4e73df;
  font-weight: 700;
  font-size: 1.25rem;
  color: #2c3e50;
}

/* Date Inputs */
input[type="date"] {
  padding-right: 1.25rem;
  cursor: pointer;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.quote-card {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive Design */
@media (max-width: 992px) {
  .quote-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .quote-col {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .quote-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    text-align: center;
  }

  .quote-header-content {
    align-items: center;
  }

  .quote-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .products-table {
    min-width: 800px;
  }

  .form-actions {
    padding-top: 1.5rem;
  }

  .btn-lg {
    width: 100%;
  }
}

/* Print Styles */
@media print {
  .quote-create {
    background: white;
    padding: 0;
  }

  .quote-actions,
  .btn-danger {
    display: none;
  }

  .quote-card {
    box-shadow: none;
    border: none;
    margin-bottom: 1.5rem;
  }

  .quote-card-header {
    border-bottom-color: #000;
  }

  .products-table th,
  .products-table td {
    border-color: #000;
  }

  .total-row:last-child {
    border-top-color: #000;
  }
}

/* Nouvelle structure en grille */
.quote-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.quote-col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.products-card {
  margin-bottom: 2rem;
}

/* Formulaire */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Actions du formulaire */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 2px solid rgba(78, 115, 223, 0.1);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Styles de la modal d'aperçu */
.modal-dialog {
  max-width: 800px;
}

.modal-content {
  border: none;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
  color: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  border: none;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title i {
  font-size: 1.25rem;
}

.btn-close {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

/* En-tête du devis */
.preview-document {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.preview-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e3e6f0;
}

.preview-title {
  margin: 0;
}

.preview-title h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  letter-spacing: -0.5px;
}

.preview-title .reference {
  color: #858796;
  font-size: 1.1rem;
}

.preview-date {
  text-align: right;
}

.preview-date .label {
  color: #858796;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.preview-date .value {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Informations client */
.preview-client {
  background: #f8f9fc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 3rem;
}

.preview-client h2 {
  color: #4e73df;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.preview-client-info {
  color: #2c3e50;
}

.preview-client-info .name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-client-info .email,
.preview-client-info .address {
  color: #5a5c69;
  line-height: 1.5;
}

/* Table des produits */
.preview-table {
  width: 100%;
  margin-bottom: 2rem;
  border-collapse: separate;
  border-spacing: 0;
}

.preview-table th {
  background: #f8f9fc;
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  padding: 1rem;
  border-bottom: 2px solid #e3e6f0;
  text-align: left;
}

.preview-table th:not(:first-child) {
  text-align: right;
}

.preview-table td {
  padding: 1rem;
  border-bottom: 1px solid #e3e6f0;
  color: #2c3e50;
}

.preview-table td:not(:first-child) {
  text-align: right;
}

.preview-table tr:last-child td {
  border-bottom: none;
}

/* Totaux */
.preview-totals {
  margin-left: auto;
  width: 300px;
}

.preview-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1rem;
}

.preview-total-row:not(:last-child) {
  border-bottom: 1px solid #e3e6f0;
}

.preview-total-row.final {
  border-top: 2px solid #4e73df;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #2c3e50;
}

.preview-total-row .label {
  color: #5a5c69;
}

.preview-total-row .value {
  font-weight: 500;
}

/* Pied de page modal */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e3e6f0;
}

.modal-footer .btn {
  min-width: 120px;
}

@media print {
  .modal-header,
  .modal-footer,
  .btn-close {
    display: none;
  }

  .modal-body {
    padding: 0;
  }

  .preview-document {
    box-shadow: none;
  }
}
</style> 