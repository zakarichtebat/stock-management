<template>
  <div class="invoices-page">
    <!-- En-tête -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <font-awesome-icon icon="file-invoice-dollar" /> Factures
        </h1>
        <p class="page-subtitle">Gérez vos factures et leur statut</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="$router.push('/invoices/create')">
          <font-awesome-icon icon="plus" /> Nouvelle facture
        </button>
      </div>
    </header>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des factures...</p>
    </div>

    <!-- Table des factures -->
    <div v-else class="invoices-table-container">
      <div class="card">
        <div class="card-body">
          <!-- Barre d'outils -->
          <div class="table-toolbar">
            <div class="search-box">
              <font-awesome-icon icon="search" />
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Rechercher une facture..."
                @input="filterInvoices"
              >
            </div>
            <div class="filters">
              <select v-model="statusFilter" @change="filterInvoices">
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PAID">Payée</option>
                <option value="CANCELLED">Annulée</option>
                <option value="OVERDUE">En retard</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="invoices-table">
              <thead>
                <tr>
                  <th @click="sortBy('number')" class="sortable">
                    Numéro
                    <font-awesome-icon 
                      :icon="sortKey === 'number' ? (sortOrder === 'asc' ? 'sort-up' : 'sort-down') : 'sort'" 
                    />
                  </th>
                  <th @click="sortBy('date')" class="sortable">
                    Date
                    <font-awesome-icon 
                      :icon="sortKey === 'date' ? (sortOrder === 'asc' ? 'sort-up' : 'sort-down') : 'sort'" 
                    />
                  </th>
                  <th @click="sortBy('clientName')" class="sortable">
                    Client
                    <font-awesome-icon 
                      :icon="sortKey === 'clientName' ? (sortOrder === 'asc' ? 'sort-up' : 'sort-down') : 'sort'" 
                    />
                  </th>
                  <th @click="sortBy('total')" class="sortable">
                    Total
                    <font-awesome-icon 
                      :icon="sortKey === 'total' ? (sortOrder === 'asc' ? 'sort-up' : 'sort-down') : 'sort'" 
                    />
                  </th>
                  <th @click="sortBy('status')" class="sortable">
                    Statut
                    <font-awesome-icon 
                      :icon="sortKey === 'status' ? (sortOrder === 'asc' ? 'sort-up' : 'sort-down') : 'sort'" 
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in sortedAndFilteredInvoices" :key="invoice.id">
                  <td class="invoice-number">
                    <router-link :to="'/invoices/' + invoice.id">
                      {{ invoice.number }}
                    </router-link>
                  </td>
                  <td>{{ formatDate(invoice.date) }}</td>
                  <td>{{ invoice.clientName }}</td>
                  <td class="text-right">{{ formatPrice(invoice.total) }}</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(invoice.status)]">
                      {{ getStatusLabel(invoice.status) }}
                    </span>
                  </td>
                  <td class="actions">
                    <div class="action-buttons">
                      <button 
                        class="btn btn-icon btn-info" 
                        @click="$router.push('/invoices/' + invoice.id)"
                        title="Voir les détails"
                      >
                        <font-awesome-icon icon="eye" />
                      </button>
                      <button 
                        v-if="invoice.status === 'PENDING'"
                        class="btn btn-icon btn-success" 
                        @click="markAsPaid(invoice)"
                        title="Marquer comme payée"
                      >
                        <font-awesome-icon icon="check" />
                      </button>
                      <button 
                        class="btn btn-icon btn-primary" 
                        @click="downloadPDF(invoice)"
                        title="Télécharger PDF"
                      >
                        <font-awesome-icon icon="download" />
                      </button>
                      <button 
                        v-if="invoice.status === 'PENDING'"
                        class="btn btn-icon btn-danger" 
                        @click="cancelInvoice(invoice)"
                        title="Annuler"
                      >
                        <font-awesome-icon icon="times" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="table-footer">
            <div class="pagination-info">
              Affichage de {{ paginationStart }} à {{ paginationEnd }} sur {{ totalItems }} factures
            </div>
            <div class="pagination">
              <button 
                class="btn btn-sm" 
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <font-awesome-icon icon="chevron-left" />
              </button>
              <span class="page-number">Page {{ currentPage }} sur {{ totalPages }}</span>
              <button 
                class="btn btn-sm" 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <font-awesome-icon icon="chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInvoiceStore } from '../stores/invoices';
import { formatDate, formatPrice } from '../utils/formatters';

const invoiceStore = useInvoiceStore();
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');
const sortKey = ref('date');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = 10;

// Fetch invoices
onMounted(async () => {
  try {
    await invoiceStore.fetchInvoices();
  } finally {
    loading.value = false;
  }
});

// Computed properties
const filteredInvoices = computed(() => {
  let result = invoiceStore.invoices;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(invoice => 
      invoice.number.toLowerCase().includes(query) ||
      invoice.clientName.toLowerCase().includes(query)
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    result = result.filter(invoice => invoice.status === statusFilter.value);
  }
  
  return result;
});

const sortedAndFilteredInvoices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  
  return filteredInvoices.value
    .sort((a, b) => {
      let aValue = a[sortKey.value];
      let bValue = b[sortKey.value];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    })
    .slice(start, end);
});

const totalItems = computed(() => filteredInvoices.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
const paginationStart = computed(() => ((currentPage.value - 1) * itemsPerPage) + 1);
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value));

// Methods
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const filterInvoices = () => {
  currentPage.value = 1;
};

const getStatusClass = (status) => {
  const classes = {
    'PENDING': 'status-pending',
    'PAID': 'status-paid',
    'CANCELLED': 'status-cancelled',
    'OVERDUE': 'status-overdue'
  };
  return classes[status] || '';
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

const markAsPaid = async (invoice) => {
  try {
    await invoiceStore.updateInvoiceStatus(invoice.id, 'PAID');
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
  }
};

const cancelInvoice = async (invoice) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
    try {
      await invoiceStore.updateInvoiceStatus(invoice.id, 'CANCELLED');
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  }
};

const downloadPDF = async (invoice) => {
  try {
    await invoiceStore.downloadInvoicePDF(invoice.id);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};
</script>

<style scoped>
.invoices-page {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-box .fa-search {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-left: 1rem;
}

.invoices-table {
  width: 100%;
  border-collapse: collapse;
}

.invoices-table th,
.invoices-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.invoices-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #edf2f7;
}

.invoice-number a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.invoice-number a:hover {
  text-decoration: underline;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-overdue {
  background: #dc3545;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  transform: translateY(-1px);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-number {
  font-size: 0.9rem;
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-info {
  background: #3498db;
  color: white;
}

.text-right {
  text-align: right;
}

@media (max-width: 768px) {
  .invoices-page {
    padding: 1rem;
  }

  .table-toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .search-box {
    max-width: 100%;
  }

  .filters select {
    margin-left: 0;
    width: 100%;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .table-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style> 