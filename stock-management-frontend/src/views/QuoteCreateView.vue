<template>
  <div class="quote-create">
    <h1>Nouveau devis</h1>

    <form @submit.prevent="handleSubmit" class="quote-form">
      <div class="card mb-4">
        <div class="card-header">
          <h3>Informations client</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nom du client *</label>
              <input
                v-model="quote.clientName"
                type="text"
                class="form-control"
                required
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="quote.clientEmail"
                type="email"
                class="form-control"
              >
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Adresse</label>
            <textarea
              v-model="quote.clientAddress"
              class="form-control"
              rows="3"
            ></textarea>
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
          <div v-for="(item, index) in quote.items" :key="index" class="item-row mb-3">
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
                v-model.number="quote.taxRate"
                type="number"
                class="form-control"
                step="0.1"
                @change="updateTotals"
              >
            </div>
            <div class="col-md-4">
              <label class="form-label">Remise (%)</label>
              <input
                v-model.number="quote.discount"
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
              <div class="col-md-4">{{ quote.subtotal.toFixed(2) }} €</div>
            </div>
            <div class="row" v-if="quote.discount > 0">
              <div class="col-md-8 text-end">Remise ({{ quote.discount }}%) :</div>
              <div class="col-md-4">-{{ getDiscountAmount().toFixed(2) }} €</div>
            </div>
            <div class="row">
              <div class="col-md-8 text-end">TVA ({{ quote.taxRate }}%) :</div>
              <div class="col-md-4">{{ quote.taxAmount.toFixed(2) }} €</div>
            </div>
            <div class="row fw-bold">
              <div class="col-md-8 text-end">Total TTC :</div>
              <div class="col-md-4">{{ quote.total.toFixed(2) }} €</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i class="fas fa-save"></i> Enregistrer
        </button>
        <router-link to="/quotes" class="btn btn-secondary">
          <i class="fas fa-times"></i> Annuler
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useQuoteStore } from '../stores/quotes';
import { useProductStore } from '../stores/products';
import { useRouter } from 'vue-router';

export default {
  name: 'QuoteCreateView',
  setup() {
    const quoteStore = useQuoteStore();
    const productStore = useProductStore();
    const router = useRouter();
    const loading = ref(false);
    const products = ref([]);

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
      // Calculate subtotal
      quote.value.subtotal = quote.value.items.reduce((sum, item) => sum + item.total, 0);

      // Calculate discount
      const discountAmount = getDiscountAmount();
      const taxableAmount = quote.value.subtotal - discountAmount;

      // Calculate tax
      quote.value.taxAmount = (taxableAmount * quote.value.taxRate) / 100;

      // Calculate total
      quote.value.total = taxableAmount + quote.value.taxAmount;
    };

    const handleSubmit = async () => {
      if (quote.value.items.length === 0) {
        alert('Veuillez ajouter au moins un produit au devis.');
        return;
      }

      loading.value = true;
      try {
        await quoteStore.createQuote(quote.value);
        router.push('/quotes');
      } catch (error) {
        console.error('Erreur lors de la création du devis:', error);
        alert('Une erreur est survenue lors de la création du devis.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadProducts();
      addItem(); // Add first empty item by default
    });

    return {
      quote,
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
.quote-create {
  padding: 20px;
}

.quote-form {
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