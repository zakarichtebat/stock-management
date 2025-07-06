<template>
  <div class="quotes-view">
    <div class="container">
      <!-- En-tête -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <font-awesome-icon icon="file-invoice" /> Gestion des Devis
          </h1>
          <p class="page-subtitle">Gérez vos devis et convertissez-les en factures</p>
        </div>
        <div class="header-actions">
          <router-link to="/quotes/create" class="btn btn-primary">
            <font-awesome-icon icon="plus" /> Nouveau Devis
          </router-link>
        </div>
      </header>

      <!-- États de chargement et d'erreur -->
      <div v-if="quoteStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des devis...</p>
      </div>

      <div v-else-if="quoteStore.error" class="error-state">
        <font-awesome-icon icon="exclamation-circle" />
        <p>{{ quoteStore.error }}</p>
        <button @click="loadQuotes" class="btn btn-primary">
          <font-awesome-icon icon="sync" /> Réessayer
        </button>
      </div>

      <!-- Liste vide -->
      <div v-else-if="!quotes.length" class="empty-state">
        <font-awesome-icon icon="file-invoice" class="empty-icon" />
        <h3>Aucun devis</h3>
        <p>Commencez par créer votre premier devis</p>
        <router-link to="/quotes/create" class="btn btn-primary">
          <font-awesome-icon icon="plus" /> Créer un devis
        </router-link>
      </div>

      <!-- Tableau des devis -->
      <div v-else class="card">
        <div class="table-responsive">
          <table class="quotes-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Client</th>
                <th>Total</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quote in sortedQuotes" :key="quote.id" class="quote-row">
                <td class="quote-number">
                  <strong>{{ quote.number }}</strong>
                </td>
                <td>{{ formatDate(quote.date) }}</td>
                <td>
                  <div class="client-info">
                    <span class="client-name">{{ quote.clientName }}</span>
                    <span v-if="quote.clientEmail" class="client-email">{{ quote.clientEmail }}</span>
                  </div>
                </td>
                <td class="quote-total">
                  {{ formatPrice(quote.total) }}
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(quote.status)]">
                    {{ getStatusLabel(quote.status) }}
                  </span>
                </td>
                <td>
                  <div class="actions-group">
                    <router-link 
                      :to="'/quotes/' + quote.id" 
                      class="btn btn-icon"
                      title="Voir le détail"
                    >
                      <font-awesome-icon icon="eye" />
                    </router-link>
                    <button 
                      v-if="quote.status === 'DRAFT'"
                      class="btn btn-icon btn-success"
                      @click="convertToInvoice(quote.id)"
                      title="Convertir en facture"
                    >
                      <font-awesome-icon icon="file-invoice" />
                    </button>
                    <button 
                      v-if="quote.status === 'DRAFT'"
                      class="btn btn-icon btn-danger"
                      @click="confirmDelete(quote)"
                      title="Supprimer"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuoteStore } from '../stores/quotes'
import { useRouter } from 'vue-router'

const quoteStore = useQuoteStore()
const router = useRouter()
const quotes = computed(() => quoteStore.quotes)
const sortedQuotes = computed(() => quoteStore.sortedQuotes)

const loadQuotes = async () => {
  try {
    await quoteStore.fetchQuotes()
  } catch (error) {
    console.error('Erreur lors du chargement des devis:', error)
  }
}

const convertToInvoice = async (quoteId) => {
  try {
    const invoice = await quoteStore.convertToInvoice(quoteId)
    router.push(`/invoices/${invoice.id}`)
  } catch (error) {
    console.error('Erreur lors de la conversion en facture:', error)
  }
}

const confirmDelete = (quote) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quote.number} ?`)) {
    deleteQuote(quote.id)
  }
}

const deleteQuote = async (quoteId) => {
  try {
    await quoteStore.deleteQuote(quoteId)
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error)
  }
}

const getStatusClass = (status) => {
  const classes = {
    'DRAFT': 'status-draft',
    'SENT': 'status-sent',
    'ACCEPTED': 'status-accepted',
    'REJECTED': 'status-rejected',
    'CONVERTED': 'status-converted'
  }
  return classes[status] || 'status-draft'
}

const getStatusLabel = (status) => {
  const labels = {
    'DRAFT': 'Brouillon',
    'SENT': 'Envoyé',
    'ACCEPTED': 'Accepté',
    'REJECTED': 'Refusé',
    'CONVERTED': 'Converti'
  }
  return labels[status] || status
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(loadQuotes)
</script>

<style scoped>
.quotes-view {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* En-tête */
.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-size: 1rem;
}

/* États */
.loading-state,
.error-state,
.empty-state {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon,
.error-state svg {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.error-state svg {
  color: #e74c3c;
}

/* Tableau */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.quotes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.quotes-table th,
.quotes-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.quotes-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  white-space: nowrap;
}

.quote-row {
  transition: all 0.3s ease;
}

.quote-row:hover {
  background-color: #f8f9fa;
}

.quote-number {
  color: #3498db;
  font-family: monospace;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  color: #2c3e50;
}

.client-email {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.quote-total {
  font-weight: 600;
  color: #2c3e50;
}

/* Badges de statut */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-draft {
  background: #f8f9fa;
  color: #7f8c8d;
}

.status-sent {
  background: #e3f2fd;
  color: #2196f3;
}

.status-accepted {
  background: #e8f5e9;
  color: #4caf50;
}

.status-rejected {
  background: #ffebee;
  color: #f44336;
}

.status-converted {
  background: #f3e5f5;
  color: #9c27b0;
}

/* Actions */
.actions-group {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-decoration: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-icon {
  padding: 0.5rem;
  border-radius: 8px;
  color: #7f8c8d;
  background: transparent;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.btn-success {
  color: #2ecc71;
}

.btn-success:hover {
  background: #e8f5e9;
}

.btn-danger {
  color: #e74c3c;
}

.btn-danger:hover {
  background: #ffebee;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .quotes-table th,
  .quotes-table td {
    padding: 0.75rem;
  }

  .actions-group {
    flex-wrap: wrap;
  }
}
</style> 