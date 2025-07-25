<template>
  <div class="invoice-print" :class="{ preview }">
    <div class="invoice-container">
      <!-- Header section -->
      <div class="header-section">
        <div class="le-box"></div>
        <div class="right-header">
          <div class="facture-box">
            <span>Facture N°</span>
            <span class="number">{{ invoice.number.slice(-2) }}</span>
          </div>
          <div class="client-box">
            <span>M:</span>
            <span class="client-name">{{ invoice.clientName }}</span>
          </div>
        </div>
      </div>

      <!-- Table section -->
      <div class="table-container">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="quantity">Quantité</th>
              <th class="designation">Désignation</th>
              <th class="unit-price">P. Unit.</th>
              <th class="total">P. Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in invoice.invoiceitem" :key="index">
              <td class="quantity">{{ item.quantity }}</td>
              <td class="designation">{{ item.product.name }}</td>
              <td class="unit-price">{{ formatPrice(item.unitPrice) }}</td>
              <td class="total">{{ formatPrice(item.total) }}</td>
            </tr>
            <!-- Empty rows with dotted lines -->
            <tr v-for="n in 20" :key="'empty-'+n" class="empty-row">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total section -->
      <div class="total-section">
        <div class="total-box">
          <span>Total:</span>
          <span class="total-amount">{{ formatPrice(invoice.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '../utils/formatters';

defineProps({
  invoice: {
    type: Object,
    required: true
  },
  preview: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.invoice-print {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.invoice-container {
  border: 2px solid navy;
  border-radius: 10px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  height: 900px;
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.le-box {
  border: 1px solid navy;
  border-radius: 5px;
  width: 100px;
  height: 30px;
}

.right-header {
  width: 250px;
}

.facture-box {
  border: 1px solid navy;
  border-radius: 5px;
  padding: 5px 10px;
  margin-bottom: 5px;
  height: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-box {
  border: 1px solid navy;
  border-radius: 5px;
  padding: 5px 10px;
  height: 25px;
  display: flex;
  align-items: center;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.invoice-table {
  width: 100%;
  border-collapse: separate;
  border: 1px solid navy;
  border-radius: 5px;
  height: calc(100% - 60px); /* Reduced height to make room for total */
}

.invoice-table th,
.invoice-table td {
  border: none;
  padding: 8px;
  text-align: left;
  font-size: 12px;
}

.invoice-table th {
  font-weight: normal;
  border-bottom: 1px solid navy;
}

.invoice-table td {
  border-bottom: 1px dotted navy;
}

.quantity {
  width: 80px;
}

.designation {
  width: auto;
}

.unit-price,
.total {
  width: 100px;
}

.empty-row td {
  height: 25px;
  border-bottom: 1px dotted navy;
}

/* Vertical lines */
.invoice-table th,
.invoice-table td {
  border-right: 1px solid navy;
}

.invoice-table th:last-child,
.invoice-table td:last-child {
  border-right: none;
}

.total-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.total-box {
  border: 1px solid navy;
  border-radius: 5px;
  padding: 5px 10px;
  width: 250px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-amount {
  font-weight: bold;
}

@media print {
  .invoice-print {
    padding: 0;
  }
  
  .invoice-container {
    height: 100vh;
    page-break-after: avoid;
    page-break-inside: avoid;
  }
}
</style> 