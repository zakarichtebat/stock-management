import { defineStore } from 'pinia';
import { 
  getQuotes,
  getQuote,
  createQuote,
  updateQuoteStatus,
  convertQuoteToInvoice,
  deleteQuote as apiDeleteQuote
} from '../services/api';

export const useQuoteStore = defineStore('quotes', {
  state: () => ({
    quotes: [],
    currentQuote: null,
    loading: false,
    error: null
  }),

  getters: {
    getQuoteById: (state) => (id) => {
      return state.quotes.find(quote => quote.id === id);
    },
    sortedQuotes: (state) => {
      return [...state.quotes].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    }
  },

  actions: {
    async fetchQuotes() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getQuotes();
        this.quotes = response.data;
        return this.quotes;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des devis';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchQuote(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getQuote(id);
        this.currentQuote = response.data;
        return this.currentQuote;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du devis';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createQuote(quoteData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await createQuote(quoteData);
        this.quotes.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création du devis';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateQuoteStatus(id, status) {
      this.loading = true;
      this.error = null;
      try {
        const response = await updateQuoteStatus(id, status);
        const index = this.quotes.findIndex(q => q.id === id);
        if (index !== -1) {
          this.quotes[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour du statut';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async convertToInvoice(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await convertQuoteToInvoice(id);
        const index = this.quotes.findIndex(q => q.id === id);
        if (index !== -1) {
          this.quotes[index] = response.data.quote;
        }
        return response.data.invoice;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la conversion en facture';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteQuote(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiDeleteQuote(id);
        this.quotes = this.quotes.filter(q => q.id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression du devis';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 