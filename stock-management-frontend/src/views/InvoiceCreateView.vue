<template>
  <div class="invoice-create-page">
    <!-- En-tête -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <font-awesome-icon icon="file-invoice-dollar" /> Nouvelle Facture
        </h1>
        <p class="page-subtitle">Créez une nouvelle facture</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="$router.push('/invoices')">
          <font-awesome-icon icon="arrow-left" /> Retour
        </button>
      </div>
    </header>

    <div class="invoice-form-container">
      <form @submit.prevent="handleSubmit" class="invoice-form card">
        <div class="card-body">
          <!-- Informations client -->
          <div class="form-section">
            <h2 class="section-title">
              <font-awesome-icon icon="user" /> Informations client
            </h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="clientName">Nom du client *</label>
                <input
                  id="clientName"
                  v-model="invoice.clientName"
                  type="text"
                  class="form-control"
                  required
                  :class="{ 'is-invalid': errors.clientName }"
                >
                <div class="invalid-feedback" v-if="errors.clientName">
                  {{ errors.clientName }}
                </div>
              </div>

              <div class="form-group">
                <label for="clientEmail">Email</label>
                <input
                  id="clientEmail"
                  v-model="invoice.clientEmail"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.clientEmail }"
                >
                <div class="invalid-feedback" v-if="errors.clientEmail">
                  {{ errors.clientEmail }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="clientAddress">Adresse</label>
                <textarea
                  id="clientAddress"
                  v-model="invoice.clientAddress"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Date et échéance -->
          <div class="form-section">
            <h2 class="section-title">
              <font-awesome-icon icon="calendar" /> Dates
            </h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="date">Date de facturation *</label>
                <input
                  id="date"
                  v-model="invoice.date"
                  type="date"
                  class="form-control"
                  required
                >
              </div>

              <div class="form-group">
                <label for="dueDate">Date d'échéance *</label>
                <input
                  id="dueDate"
                  v-model="invoice.dueDate"
                  type="date"
                  class="form-control"
                  required
                >
              </div>
            </div>
          </div>

          <!-- Produits -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">
                <font-awesome-icon icon="box" /> Produits
              </h2>
              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                @click="addProduct"
              >
                <font-awesome-icon icon="plus" /> Ajouter un produit
              </button>
            </div>

            <div class="products-table-container">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Produit *</th>
                    <th>Quantité *</th>
                    <th>Prix unitaire *</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in invoice.items" :key="index">
                    <td>
                      <select
                        v-model="item.productId"
                        class="form-control"
                        required
                        @change="updateProductPrice(index)"
                      >
                        <option value="">Sélectionnez un produit</option>
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
                        type="number"
                        v-model.number="item.quantity"
                        class="form-control"
                        min="1"
                        required
                        @input="updateItemTotal(index)"
                      >
                    </td>
                    <td>
                      <input
                        type="number"
                        v-model.number="item.unitPrice"
                        class="form-control"
                        min="0"
                        step="0.01"
                        required
                        @input="updateItemTotal(index)"
                      >
                    </td>
                    <td class="text-right">
                      {{ formatPrice(item.total) }}
                    </td>
                    <td>
                      <button 
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="removeProduct(index)"
                      >
                        <font-awesome-icon icon="trash" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totaux -->
          <div class="form-section totals-section">
            <h2 class="section-title">
              <font-awesome-icon icon="calculator" /> Totaux
            </h2>
            <div class="totals-grid">
              <div class="form-group">
                <label for="taxRate">Taux de TVA (%)</label>
                <input
                  id="taxRate"
                  v-model.number="invoice.taxRate"
                  type="number"
                  class="form-control"
                  min="0"
                  max="100"
                  @input="calculateTotals"
                >
              </div>

              <div class="form-group">
                <label for="discount">Remise (%)</label>
                <input
                  id="discount"
                  v-model.number="invoice.discount"
                  type="number"
                  class="form-control"
                  min="0"
                  max="100"
                  @input="calculateTotals"
                >
              </div>

              <div class="totals-summary">
                <div class="total-line">
                  <span>Sous-total :</span>
                  <span>{{ formatPrice(invoice.subtotal) }}</span>
                </div>
                <div class="total-line" v-if="invoice.discount > 0">
                  <span>Remise ({{ invoice.discount }}%) :</span>
                  <span class="text-danger">-{{ formatPrice(getDiscountAmount()) }}</span>
                </div>
                <div class="total-line">
                  <span>TVA ({{ invoice.taxRate }}%) :</span>
                  <span>{{ formatPrice(invoice.taxAmount) }}</span>
                </div>
                <div class="total-line total-final">
                  <span>Total TTC :</span>
                  <span>{{ formatPrice(invoice.total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="loading"
            >
              <font-awesome-icon 
                :icon="loading ? 'spinner' : 'save'" 
                :spin="loading"
              /> 
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="$router.push('/invoices')"
              :disabled="loading"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '../stores/invoices';
import { useProductStore } from '../stores/products';
import { formatPrice } from '../utils/formatters';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const productStore = useProductStore();

const loading = ref(false);
const errors = ref({});
const products = ref([]);

// Initialize invoice data
const invoice = ref({
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  items: [],
  taxRate: 20,
  discount: 0,
  subtotal: 0,
  taxAmount: 0,
  total: 0,
  status: 'PENDING'
});

// Load products on mount
onMounted(async () => {
  try {
    const response = await productStore.fetchProducts();
    // Si la réponse est un tableau, l'utiliser directement
    if (Array.isArray(response)) {
      products.value = response.filter(p => p.isActive);
    } 
    // Si la réponse contient les données dans une propriété data
    else if (response.data) {
      products.value = response.data.filter(p => p.isActive);
    }
    // Si aucun format valide n'est trouvé, initialiser un tableau vide
    else {
      products.value = [];
      console.error('Format de réponse inattendu pour les produits:', response);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    errors.value.products = 'Erreur lors du chargement des produits';
  }
});

// Methods
const addProduct = () => {
  invoice.value.items.push({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  });
};

const removeProduct = (index) => {
  invoice.value.items.splice(index, 1);
  calculateTotals();
};

const updateProductPrice = (index) => {
  const item = invoice.value.items[index];
  const product = products.value.find(p => p.id === item.productId);
  if (product) {
    item.unitPrice = product.salePrice;
    updateItemTotal(index);
  }
};

const updateItemTotal = (index) => {
  const item = invoice.value.items[index];
  item.total = item.quantity * item.unitPrice;
  calculateTotals();
};

const getDiscountAmount = () => {
  return (invoice.value.subtotal * invoice.value.discount) / 100;
};

const calculateTotals = () => {
  // Calculate subtotal
  invoice.value.subtotal = invoice.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  // Calculate discount
  const discountAmount = (invoice.value.subtotal * invoice.value.discount) / 100;

  // Calculate tax
  const taxableAmount = invoice.value.subtotal - discountAmount;
  invoice.value.taxAmount = (taxableAmount * invoice.value.taxRate) / 100;

  // Calculate total
  invoice.value.total = taxableAmount + invoice.value.taxAmount;

  // Format all numbers to 2 decimal places
  invoice.value.subtotal = parseFloat(invoice.value.subtotal.toFixed(2));
  invoice.value.taxAmount = parseFloat(invoice.value.taxAmount.toFixed(2));
  invoice.value.total = parseFloat(invoice.value.total.toFixed(2));
};

const validateForm = () => {
  errors.value = {};
  
  if (!invoice.value.clientName) {
    errors.value.clientName = 'Le nom du client est requis';
  }
  
  if (invoice.value.clientEmail && !isValidEmail(invoice.value.clientEmail)) {
    errors.value.clientEmail = 'Email invalide';
  }
  
  if (!invoice.value.items.length) {
    errors.value.items = 'Ajoutez au moins un produit';
  }
  
  return Object.keys(errors.value).length === 0;
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    // Helper function to convert date to ISO format with time
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString();
    };

    // Prepare the data with correct formats
    const formattedData = {
      clientName: invoice.value.clientName,
      clientEmail: invoice.value.clientEmail || null,
      clientAddress: invoice.value.clientAddress || null,
      // Format dates as ISO DateTime
      date: formatDate(invoice.value.date),
      dueDate: formatDate(invoice.value.dueDate),
      status: 'PENDING',
      // Format items
      items: invoice.value.items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number((item.quantity * item.unitPrice).toFixed(2))
      })),
      // Format numeric values
      taxRate: Number(invoice.value.taxRate),
      discount: Number(invoice.value.discount),
      subtotal: Number(invoice.value.subtotal.toFixed(2)),
      taxAmount: Number(invoice.value.taxAmount.toFixed(2)),
      total: Number(invoice.value.total.toFixed(2))
    };

    console.log('Sending invoice data:', formattedData);
    const response = await invoiceStore.createInvoice(formattedData);
    console.log('Invoice created:', response);
    router.push('/invoices');
  } catch (error) {
    console.error('Error creating invoice:', error);
    errors.value.submit = error.response?.data?.message || 'Une erreur est survenue lors de la création de la facture';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.invoice-create-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.page-subtitle {
  color: #666;
  margin: 0.5rem 0 0;
}

.invoice-form-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.products-table th,
.products-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.products-table th {
  background: #f8f9fa;
  font-weight: 600;
  text-align: left;
}

.totals-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.totals-summary {
  grid-column: 1 / -1;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.total-final {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.text-right {
  text-align: right;
}

.text-danger {
  color: #e74c3c;
}

.invalid-feedback {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.is-invalid {
  border-color: #e74c3c;
}

@media (max-width: 768px) {
  .invoice-create-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .totals-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style> 