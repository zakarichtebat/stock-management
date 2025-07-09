<template>
  <div class="invoice-detail">
    <!-- En-tête avec actions -->
    <div class="invoice-header">
      <div class="company-info">
        <h1 class="company-name">DIDOPRO</h1>
        <div class="invoice-number">Facture #{{ invoice?.number }}</div>
      </div>
      <div class="actions">
        <button 
          class="btn btn-primary"
          @click="handleDownloadPDF"
          :disabled="loading"
        >
          <i class="fas fa-download"></i> Télécharger PDF
        </button>
        
        <router-link to="/invoices" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left"></i> Retour
        </router-link>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="invoice-content">
      <!-- Section informations -->
      <div class="info-section">
        <div class="client-info">
          <h2>Client</h2>
          <div class="info-card">
            <div class="client-name">{{ invoice?.clientName }}</div>
            <div class="client-details" v-if="invoice?.clientEmail">
              <i class="fas fa-envelope"></i> {{ invoice.clientEmail }}
            </div>
            <div class="client-details" v-if="invoice?.clientAddress">
              <i class="fas fa-map-marker-alt"></i> {{ invoice.clientAddress }}
            </div>
          </div>
        </div>

        <div class="invoice-info">
          <h2>Détails</h2>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Date d'émission</span>
              <span class="value">{{ formatDate(invoice?.date) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Date d'échéance</span>
              <span class="value">{{ formatDate(invoice?.dueDate) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Statut</span>
              <span :class="['status-badge', getStatusClass(invoice?.status)]">
                {{ getStatusLabel(invoice?.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table des produits -->
      <div class="products-section">
        <h2>Produits</h2>
        <div class="table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoice?.invoiceitem" :key="item.id">
                <td>{{ item.product.name }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">{{ formatPrice(item.unitPrice) }}</td>
                <td class="text-right">{{ formatPrice(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section totaux -->
      <div class="totals-section">
        <div class="totals-card">
          <div class="total-row">
            <span>Sous-total</span>
            <span>{{ formatPrice(invoice?.subtotal) }}</span>
          </div>
          <div class="total-row" v-if="invoice?.discount > 0">
            <span>Remise ({{ invoice.discount }}%)</span>
            <span class="discount">-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>{{ formatPrice(invoice?.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Devis associé -->
      <div class="quote-section" v-if="invoice?.quote">
        <h2>Devis associé</h2>
        <div class="quote-card">
          <div class="quote-info">
            <div class="info-row">
              <span class="label">Numéro de devis</span>
              <span class="value">{{ invoice.quote.number }}</span>
            </div>
            <div class="info-row">
              <span class="label">Date du devis</span>
              <span class="value">{{ formatDate(invoice.quote.date) }}</span>
            </div>
          </div>
          <router-link :to="'/quotes/' + invoice.quote.id" class="btn btn-outline-info">
            <i class="fas fa-eye"></i> Voir le devis
          </router-link>
        </div>
      </div>
    </div>

    <!-- Template caché pour l'impression -->
    <div v-if="invoice" class="d-none">
      <InvoicePrintTemplate
        ref="printTemplate"
        :invoice="invoice"
        :preview="false"
      />
    </div>
  </div>
</template>

<style scoped>
.invoice-detail {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  border-radius: 8px;
  color: white;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.company-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.invoice-number {
  font-size: 1.2rem;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 1rem;
}

.actions .btn {
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.invoice-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.client-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.client-details {
  color: #666;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.value {
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
}

.products-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  text-align: left;
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.totals-section {
  display: flex;
  justify-content: flex-end;
}

.totals-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 300px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.discount {
  color: #dc3545;
}

.grand-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-size: 1.25rem;
  font-weight: 600;
}

.quote-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quote-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quote-info {
  flex: 1;
}

@media (max-width: 768px) {
  .invoice-header {
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .actions .btn {
    flex: 1;
  }

  .quote-card {
    flex-direction: column;
    gap: 1rem;
  }

  .quote-info {
    width: 100%;
  }
}

.d-none {
  display: none !important;
}
</style>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInvoiceStore } from '../stores/invoices';
import InvoicePrintTemplate from '../components/InvoicePrintTemplate.vue';
import { formatDate, formatPrice } from '../utils/formatters';

export default {
  name: 'InvoiceDetailView',
  components: {
    InvoicePrintTemplate
  },
  setup() {
    const route = useRoute();
    const invoiceStore = useInvoiceStore();
    const invoice = ref(null);
    const loading = ref(false);
    const printTemplate = ref(null);

    // Computed properties
    const discountAmount = computed(() => {
      if (!invoice.value) return 0;
      return (invoice.value.subtotal * invoice.value.discount) / 100;
    });

    const loadInvoice = async () => {
      loading.value = true;
      try {
        invoice.value = await invoiceStore.fetchInvoice(parseInt(route.params.id));
      } catch (error) {
        console.error('Erreur lors du chargement de la facture:', error);
      } finally {
        loading.value = false;
      }
    };

    const getStatusClass = (status) => {
      const classes = {
        'PENDING': 'bg-warning',
        'PAID': 'bg-success',
        'CANCELLED': 'bg-danger',
        'OVERDUE': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    };

    const getStatusLabel = (status) => {
      const labels = {
        'PENDING': 'En attente',
        'PAID': 'Payée',
        'CANCELLED': 'Annulée',
        'OVERDUE': 'En retard'
      };
      return labels[status] || status;
    };

    const markAsPaid = async () => {
      loading.value = true;
      try {
        invoice.value = await invoiceStore.updateInvoiceStatus(invoice.value.id, 'PAID');
      } catch (error) {
        console.error('Erreur lors du marquage comme payée:', error);
      } finally {
        loading.value = false;
      }
    };

    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour l\'impression');
        return;
      }

      // Écrire le contenu dans la nouvelle fenêtre
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Facture ${invoice.value.number}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 20mm;
              }
              ${document.querySelector('[data-v-' + InvoicePrintTemplate.__scopeId + ']')?.innerHTML || ''}
            </style>
          </head>
          <body>
            ${printTemplate.value.$el.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      
      // Attendre que les styles soient chargés
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    const handleDownloadPDF = async () => {
      try {
        loading.value = true;
        const { default: html2pdf } = await import('html2pdf.js');
        
        const element = printTemplate.value.$el;
        
        const opt = {
          margin: 20,
          filename: `facture-${invoice.value.number}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
          }
        };
        
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadInvoice();
    });

    return {
      invoice,
      loading,
      printTemplate,
      discountAmount,
      formatDate,
      formatPrice,
      getStatusClass,
      getStatusLabel,
      markAsPaid,
      handlePrint,
      handleDownloadPDF
    };
  }
}
</script> 