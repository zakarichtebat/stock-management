<template>
  <div class="invoice-create">
    <h1>Nouvelle facture</h1>

    <form @submit.prevent="handleSubmit" class="invoice-form">
      <div class="card mb-4">
        <div class="card-header">
          <h3>Informations client</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nom du client *</label>
              <input
                v-model="invoice.clientName"
                type="text"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="invoice.clientEmail"
                type="email"
                class="form-control"
              >
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Adresse</label>
            <textarea
              v-model="invoice.clientAddress"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Date *</label>
              <input
                v-model="invoice.date"
                type="date"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Date d'échéance *</label>
              <input
                v-model="invoice.dueDate"
                type="date"
                class="form-control"
                required
              >
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3>Produits</h3>
          <button type="button" class="btn btn-primary" @click="addItem">
            <i class="fas fa-plus"></i> Ajouter un produit
          </button>
        </div>
        <div class="card-body">
          <div v-for="(item, index) in invoice.items" :key="index" class="item-row mb-3">
            <div class="row align-items-end">
              <div class="col-md-4">
                <label class="form-label">Produit *</label>
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
                    {{ product.name }} ({{ product.salePrice }}€)
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Quantité *</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  class="form-control"
                  min="1"
                  required
                  @change="updateItemTotal(index)"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">Prix unitaire *</label>
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  class="form-control"
                  step="0.01"
                  required
                  @change="updateItemTotal(index)"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">Total</label>
                <input
                  :value="item.total"
                  type="number"
                  class="form-control"
                  readonly
                >
              </div>
              <div class="col-md-2">
                <button
                  type="button"
                  class="btn btn-danger w-100"
                  @click="removeItem(index)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h3>Totaux</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label class="form-label">Taux de TVA (%)</label>
              <input
                v-model.number="invoice.taxRate"
                type="number"
                class="form-control"
                step="0.1"
                @change="updateTotals"
              >
            </div>
            <div class="col-md-4">
              <label class="form-label">Remise (%)</label>
              <input
                v-model.number="invoice.discount"
                type="number"
                class="form-control"
                step="0.1"
                @change="updateTotals"
              >
            </div>
          </div>
          <div class="totals mt-4">
            <div class="row">
              <div class="col-md-8 text-end">Sous-total :</div>
              <div class="col-md-4">{{ invoice.subtotal.toFixed(2) }} €</div>
            </div>
            <div class="row" v-if="invoice.discount > 0">
              <div class="col-md-8 text-end">Remise ({{ invoice.discount }}%) :</div>
              <div class="col-md-4">-{{ getDiscountAmount().toFixed(2) }} €</div>
            </div>
            <div class="row">
              <div class="col-md-8 text-end">TVA ({{ invoice.taxRate }}%) :</div>
              <div class="col-md-4">{{ invoice.taxAmount.toFixed(2) }} €</div>
            </div>
            <div class="row fw-bold">
              <div class="col-md-8 text-end">Total TTC :</div>
              <div class="col-md-4">{{ invoice.total.toFixed(2) }} €</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="fas fa-save"></i> Enregistrer
        </button>
        <router-link to="/invoices" class="btn btn-secondary">
          <i class="fas fa-times"></i> Annuler
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useInvoiceStore } from '../stores/invoices';
import { useProductStore } from '../stores/products';
import { useRouter } from 'vue-router';

export default {
  name: 'InvoiceCreateView',
  setup() {
    const invoiceStore = useInvoiceStore();
    const productStore = useProductStore();
    const router = useRouter();
    const loading = ref(false);
    const products = ref([]);

    // Initialiser la date d'aujourd'hui et la date d'échéance (par défaut +30 jours)
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const defaultDueDate = dueDate.toISOString().split('T')[0];

    const invoice = ref({
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      date: today,
      dueDate: defaultDueDate,
      items: [],
      taxRate: 20,
      discount: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    });

    const loadProducts = async () => {
      try {
        products.value = await productStore.fetchProducts();
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };

    const addItem = () => {
      invoice.value.items.push({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      });
    };

    const removeItem = (index) => {
      invoice.value.items.splice(index, 1);
      updateTotals();
    };

    const updateItemPrice = (index) => {
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
      updateTotals();
    };

    const getDiscountAmount = () => {
      return (invoice.value.subtotal * invoice.value.discount) / 100;
    };

    const updateTotals = () => {
      // Calculate subtotal
      invoice.value.subtotal = invoice.value.items.reduce((sum, item) => sum + item.total, 0);

      // Calculate discount
      const discountAmount = getDiscountAmount();
      const taxableAmount = invoice.value.subtotal - discountAmount;

      // Calculate tax
      invoice.value.taxAmount = (taxableAmount * invoice.value.taxRate) / 100;

      // Calculate total
      invoice.value.total = taxableAmount + invoice.value.taxAmount;
    };

    const handleSubmit = async () => {
      if (invoice.value.items.length === 0) {
        alert('Veuillez ajouter au moins un produit à la facture.');
        return;
      }

      loading.value = true;
      try {
        await invoiceStore.createInvoice(invoice.value);
        router.push('/invoices');
      } catch (error) {
        console.error('Erreur lors de la création de la facture:', error);
        alert('Une erreur est survenue lors de la création de la facture.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadProducts();
      addItem(); // Add first empty item by default
    });

    return {
      invoice,
      products,
      loading,
      addItem,
      removeItem,
      updateItemPrice,
      updateItemTotal,
      updateTotals,
      getDiscountAmount,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.invoice-create {
  padding: 20px;
}

.invoice-form {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.item-row {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.totals .row {
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  font-weight: 500;
}
</style> 