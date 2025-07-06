<template>
  <div class="invoice-detail">
    <div class="header d-flex justify-content-between align-items-center mb-4">
      <h1>Facture {{ invoice?.number }}</h1>
      <div class="actions">
        <button 
          class="btn btn-primary me-2"
          @click="handleDownloadPDF"
          :disabled="loading"
        >
          <i class="fas fa-download"></i> Télécharger PDF
        </button>
        <button 
          class="btn btn-secondary me-2"
          @click="handlePrint"
        >
          <i class="fas fa-print"></i> Imprimer
        </button>
        <router-link to="/invoices" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Retour
        </router-link>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h3>Informations client</h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Nom :</strong> {{ invoice?.clientName }}</p>
                <p v-if="invoice?.clientEmail"><strong>Email :</strong> {{ invoice.clientEmail }}</p>
              </div>
              <div class="col-md-6">
                <p v-if="invoice?.clientAddress"><strong>Adresse :</strong> {{ invoice.clientAddress }}</p>
                <p><strong>Date :</strong> {{ formatDate(invoice?.date) }}</p>
                <p><strong>Échéance :</strong> {{ formatDate(invoice?.dueDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <h3>Produits</h3>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in invoice?.items" :key="item.id">
                    <td>{{ item.product.name }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unitPrice.toFixed(2) }} €</td>
                    <td>{{ item.total.toFixed(2) }} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card mb-4" v-if="invoice?.quote">
          <div class="card-header">
            <h3>Devis associé</h3>
          </div>
          <div class="card-body">
            <p><strong>Numéro de devis :</strong> {{ invoice.quote.number }}</p>
            <p><strong>Date du devis :</strong> {{ formatDate(invoice.quote.date) }}</p>
            <router-link :to="'/quotes/' + invoice.quote.id" class="btn btn-info">
              <i class="fas fa-eye"></i> Voir le devis
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h3>Statut</h3>
          </div>
          <div class="card-body">
            <span :class="getStatusClass(invoice?.status)">
              {{ getStatusLabel(invoice?.status) }}
            </span>
            <div class="mt-3" v-if="invoice?.status === 'PENDING'">
              <button 
                class="btn btn-success w-100"
                @click="markAsPaid"
                :disabled="loading"
              >
                <i class="fas fa-check"></i> Marquer comme payée
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Totaux</h3>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>Sous-total :</span>
              <span>{{ invoice?.subtotal.toFixed(2) }} €</span>
            </div>
            <div class="d-flex justify-content-between mb-2" v-if="invoice?.discount > 0">
              <span>Remise ({{ invoice.discount }}%) :</span>
              <span>-{{ getDiscountAmount().toFixed(2) }} €</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>TVA ({{ invoice?.taxRate }}%) :</span>
              <span>{{ invoice?.taxAmount.toFixed(2) }} €</span>
            </div>
            <div class="d-flex justify-content-between fw-bold">
              <span>Total TTC :</span>
              <span>{{ invoice?.total.toFixed(2) }} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useInvoiceStore } from '../stores/invoices';

export default {
  name: 'InvoiceDetailView',
  setup() {
    const route = useRoute();
    const invoiceStore = useInvoiceStore();
    const invoice = ref(null);
    const loading = ref(false);

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

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    };

    const getStatusClass = (status) => {
      const classes = {
        'PENDING': 'badge bg-warning',
        'PAID': 'badge bg-success',
        'CANCELLED': 'badge bg-danger',
        'OVERDUE': 'badge bg-danger'
      };
      return classes[status] || 'badge bg-secondary';
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

    const handleDownloadPDF = async () => {
      try {
        await invoiceStore.downloadPDF(invoice.value.id);
      } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);
      }
    };

    const getDiscountAmount = () => {
      if (!invoice.value) return 0;
      return (invoice.value.subtotal * invoice.value.discount) / 100;
    };

    const handlePrint = () => {
      window.print();
    };

    onMounted(loadInvoice);

    return {
      invoice,
      loading,
      formatDate,
      getStatusClass,
      getStatusLabel,
      markAsPaid,
      handleDownloadPDF,
      getDiscountAmount,
      handlePrint
    };
  }
};
</script>

<style scoped>
.invoice-detail {
  padding: 20px;
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

.badge {
  padding: 8px 12px;
  font-size: 0.9em;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media print {
  .actions, .btn {
    display: none !important;
  }

  .card {
    border: none !important;
    box-shadow: none !important;
  }

  .card-header {
    background-color: transparent !important;
    border-bottom: 2px solid #000 !important;
  }
}
</style> 