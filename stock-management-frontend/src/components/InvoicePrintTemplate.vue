<template>
  <div class="invoice-print" :class="{ 'preview-mode': preview }">
    <!-- En-tête -->
    <div class="header">
      <div class="company-info">
        <div class="brand">
          <h1 class="company-name">StockManager</h1>
          <div class="company-tagline">Gestion de Stock Professionnelle</div>
        </div>
        <div class="company-details">
          <p>123 Rue du Commerce</p>
          <p>75001 Paris, France</p>
          <p>Tél: +33 1 23 45 67 89</p>
          <p>Email: contact@stockmanager.com</p>
        </div>
      </div>
      <div class="invoice-details">
        <h2 class="invoice-title">FACTURE</h2>
        <div class="invoice-number">F{{ invoice.number }}</div>
        <div class="dates">
          <div class="date-row">
            <span class="label">Date d'émission:</span>
            <span class="value">{{ formatDate(invoice.date) }}</span>
          </div>
          <div class="date-row" v-if="invoice.dueDate">
            <span class="label">Date d'échéance:</span>
            <span class="value">{{ formatDate(invoice.dueDate) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Client -->
    <div class="client-section">
      <div class="section-title">FACTURER À</div>
      <div class="client-details">
        <h3 class="client-name">{{ invoice.clientName }}</h3>
        <p v-if="invoice.clientEmail" class="client-email">{{ invoice.clientEmail }}</p>
        <p v-if="invoice.clientAddress" class="client-address">{{ invoice.clientAddress }}</p>
      </div>
    </div>

    <!-- Table des produits -->
    <div class="products-section">
      <table class="products-table">
        <thead>
          <tr>
            <th class="description">DESCRIPTION</th>
            <th class="quantity">QUANTITÉ</th>
            <th class="unit-price">PRIX UNITAIRE</th>
            <th class="total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.items" :key="item.id">
            <td class="description">
              <div class="product-name">{{ item.product.name }}</div>
              <div v-if="item.product.description" class="product-description">
                {{ item.product.description }}
              </div>
            </td>
            <td class="quantity">{{ item.quantity }}</td>
            <td class="unit-price">{{ formatPrice(item.unitPrice) }} €</td>
            <td class="total">{{ formatPrice(item.total) }} €</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totaux -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="total-row">
          <span class="label">Sous-total</span>
          <span class="value">{{ formatPrice(invoice.subtotal) }} €</span>
        </div>
        <div v-if="invoice.discount > 0" class="total-row discount">
          <span class="label">Remise ({{ invoice.discount }}%)</span>
          <span class="value">-{{ formatPrice(getDiscountAmount()) }} €</span>
        </div>
        <div class="total-row">
          <span class="label">TVA ({{ invoice.taxRate }}%)</span>
          <span class="value">{{ formatPrice(invoice.taxAmount) }} €</span>
        </div>
        <div class="total-row grand-total">
          <span class="label">Total TTC</span>
          <span class="value">{{ formatPrice(invoice.total) }} €</span>
        </div>
      </div>
    </div>

   
   
  </div>
</template>

<script>
export default {
  name: 'InvoicePrintTemplate',
  props: {
    invoice: {
      type: Object,
      required: true
    },
    preview: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      const options = { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(date).toLocaleDateString('fr-FR', options);
    },
    formatPrice(value) {
      if (!value) return '0,00';
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
    getDiscountAmount() {
      return (this.invoice.subtotal * this.invoice.discount) / 100;
    }
  }
};
</script>

<style scoped>
.invoice-print {
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  background: white;
  color: #333;
  font-family: Arial, sans-serif;
}

.preview-mode {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.company-info {
  flex: 1;
}

.brand {
  margin-bottom: 20px;
}

.company-name {
  color: #2196F3;
  font-size: 28px;
  margin: 0;
  font-weight: bold;
}

.company-tagline {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.company-details p {
  margin: 3px 0;
  font-size: 12px;
  color: #666;
}

.invoice-details {
  text-align: right;
}

.invoice-title {
  color: #2196F3;
  font-size: 24px;
  margin: 0 0 10px 0;
}

.invoice-number {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.dates {
  font-size: 12px;
}

.date-row {
  margin: 5px 0;
}

.date-row .label {
  color: #666;
  margin-right: 10px;
}

.client-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.client-name {
  font-size: 18px;
  margin: 0 0 5px 0;
}

.client-email,
.client-address {
  margin: 3px 0;
  font-size: 14px;
  color: #666;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.products-table th {
  background: #f8f9fa;
  padding: 12px;
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
  border-bottom: 2px solid #dee2e6;
  text-align: left;
}

.products-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.products-table .description {
  width: 50%;
}

.products-table .quantity {
  width: 15%;
  text-align: center;
}

.products-table .unit-price,
.products-table .total {
  width: 17.5%;
  text-align: right;
}

.product-name {
  font-weight: 500;
}

.product-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.totals-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

.totals-table {
  width: 300px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.total-row .label {
  color: #666;
}

.total-row.discount .value {
  color: #e53935;
}

.grand-total {
  font-size: 16px;
  font-weight: bold;
  border-top: 2px solid #dee2e6;
  padding-top: 12px;
  margin-top: 8px;
}

.footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #666;
}

.payment-info {
  margin-bottom: 20px;
}

.payment-info h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 8px 0;
}

.terms {
  margin-bottom: 20px;
}

.legal {
  font-size: 10px;
  color: #999;
}

@media print {
  .invoice-print {
    padding: 0;
    max-width: none;
  }

  .preview-mode {
    box-shadow: none;
    margin: 0;
  }
}
</style> 