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
import { formatDate, formatPrice } from '../utils/formatters'

const quoteStore = useQuoteStore()
const router = useRouter()
const quotes = computed(() => quoteStore.quotes)
const sortedQuotes = computed(() => [...quotes.value].sort((a, b) => new Date(b.date) - new Date(a.date)))

const loadQuotes = async () => {
  try {
    await quoteStore.fetchQuotes()
  } catch (error) {
    console.error('Erreur lors du chargement des devis:', error)
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

onMounted(loadQuotes)
</script>

<style scoped>
.quotes-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.page-subtitle {
  color: #666;
  margin: 5px 0 0;
}

.quotes-table {
  width: 100%;
  border-collapse: collapse;
}

.quotes-table th,
.quotes-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.quote-number {
  color: #2196F3;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-email {
  font-size: 0.9em;
  color: #666;
}

.quote-total {
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-draft { background: #e3f2fd; color: #1976d2; }
.status-sent { background: #fff3e0; color: #f57c00; }
.status-accepted { background: #e8f5e9; color: #388e3c; }
.status-rejected { background: #ffebee; color: #d32f2f; }
.status-converted { background: #f3e5f5; color: #7b1fa2; }

.actions-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-icon {
  padding: 6px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: transparent;
}

.btn-icon:hover {
  background: #f5f5f5;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 