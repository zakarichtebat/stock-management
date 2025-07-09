<template>
  <div class="invoice-print" :class="{ preview }">
    <!-- En-tête -->
    <div class="print-header">
      <div class="company-info">
        <h1>StockManager</h1>
        <div class="invoice-number">Facture #{{ invoice.number }}</div>
        <div class="invoice-date">
          Date d'émission: {{ formatDate(invoice.date) }}<br>
          Date d'échéance: {{ formatDate(invoice.dueDate) }}
        </div>
      </div>
    </div>

    <!-- Informations client -->
    <div class="client-section">
      <h2>Client</h2>
      <div class="client-info">
        <strong>{{ invoice.clientName }}</strong><br>
        <span v-if="invoice.clientEmail">{{ invoice.clientEmail }}</span><br>
        <span v-if="invoice.clientAddress">{{ invoice.clientAddress }}</span>
      </div>
    </div>

    <!-- Table des produits -->
    <div class="products-section">
      <table class="products-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th class="quantity">Qté</th>
            <th class="unit-price">Prix unitaire</th>
            <th class="total">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.invoiceitem" :key="item.id">
            <td>{{ item.product.name }}</td>
            <td class="quantity">{{ item.quantity }}</td>
            <td class="unit-price">{{ formatPrice(item.unitPrice) }}</td>
            <td class="total">{{ formatPrice(item.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totaux -->
    <div class="totals-section">
      <div class="total-row">
        <span class="label">Sous-total</span>
        <span class="value">{{ formatPrice(invoice.subtotal) }}</span>
      </div>
      <div v-if="invoice.discount > 0" class="total-row discount">
        <span class="label">Remise ({{ invoice.discount }}%)</span>
        <span class="value">-{{ formatPrice(getDiscountAmount()) }}</span>
      </div>
      <div class="total-row grand-total">
        <span class="label">Total</span>
        <span class="value">{{ formatPrice(invoice.total) }}</span>
      </div>
    </div>

    <!-- Pied de page -->
    <div class="print-footer">
      <p>Merci de votre confiance !</p>
    </div>
  </div>
</template>

<script setup>
import { formatDate, formatPrice } from '../utils/formatters'

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  },
  preview: {
    type: Boolean,
    default: false
  }
})

const getDiscountAmount = () => {
  if (!props.invoice.subtotal || !props.invoice.discount) return 0
  return (props.invoice.subtotal * props.invoice.discount) / 100
}
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