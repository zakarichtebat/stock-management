<template>
  <div class="invoices">
    <h1>Factures</h1>
    
    <div class="actions mb-4">
      <router-link to="/invoices/create" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nouvelle facture
      </router-link>
    </div>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Date</th>
            <th>Client</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.id">
            <td>{{ invoice.number }}</td>
            <td>{{ new Date(invoice.date).toLocaleDateString() }}</td>
            <td>{{ invoice.clientName }}</td>
            <td>{{ invoice.total.toFixed(2) }} €</td>
            <td>
              <span :class="getStatusClass(invoice.status)">
                {{ getStatusLabel(invoice.status) }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <router-link :to="'/invoices/' + invoice.id" class="btn btn-sm btn-info">
                  <i class="fas fa-eye"></i>
                </router-link>
                <button 
                  v-if="invoice.status === 'PENDING'"
                  class="btn btn-sm btn-success"
                  @click="markAsPaid(invoice.id)"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  v-if="invoice.status === 'PENDING'"
                  class="btn btn-sm btn-danger"
                  @click="deleteInvoice(invoice.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useInvoiceStore } from '../stores/invoices';

export default {
  name: 'InvoicesView',
  setup() {
    const invoiceStore = useInvoiceStore();
    const invoices = ref([]);
    const loading = ref(false);

    const loadInvoices = async () => {
      loading.value = true;
      try {
        invoices.value = await invoiceStore.fetchInvoices();
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
      } finally {
        loading.value = false;
      }
    };

    const markAsPaid = async (id) => {
      try {
        await invoiceStore.updateInvoiceStatus(id, 'PAID');
        await loadInvoices();
      } catch (error) {
        console.error('Erreur lors du marquage comme payée:', error);
      }
    };

    const deleteInvoice = async (id) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
        try {
          await invoiceStore.deleteInvoice(id);
          await loadInvoices();
        } catch (error) {
          console.error('Erreur lors de la suppression de la facture:', error);
        }
      }
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

    onMounted(loadInvoices);

    return {
      invoices,
      loading,
      markAsPaid,
      deleteInvoice,
      getStatusClass,
      getStatusLabel
    };
  }
};
</script>

<style scoped>
.invoices {
  padding: 20px;
}

.actions {
  margin-bottom: 20px;
}

.badge {
  padding: 8px 12px;
  font-size: 0.9em;
}

.btn-group .btn {
  margin: 0 2px;
}
</style> 