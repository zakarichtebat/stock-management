import { defineStore } from 'pinia';
import { 
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice as apiDeleteInvoice,
  downloadInvoicePDF
} from '../services/api';

export const useInvoiceStore = defineStore('invoices', {
  state: () => ({
    invoices: [],
    currentInvoice: null,
    loading: false,
    error: null
  }),

  getters: {
    getInvoiceById: (state) => (id) => {
      return state.invoices.find(invoice => invoice.id === id);
    },
    sortedInvoices: (state) => {
      return [...state.invoices].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    },
    pendingInvoices: (state) => {
      return state.invoices.filter(invoice => invoice.status === 'PENDING');
    },
    overdueInvoices: (state) => {
      const now = new Date();
      return state.invoices.filter(invoice => 
        invoice.status === 'PENDING' && new Date(invoice.dueDate) < now
      );
    }
  },

  actions: {
    async fetchInvoices() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getInvoices();
        this.invoices = response.data;
        return this.invoices;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des factures';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchInvoice(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getInvoice(id);
        this.currentInvoice = response.data;
        return this.currentInvoice;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement de la facture';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createInvoice(invoiceData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await createInvoice(invoiceData);
        this.invoices.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la création de la facture';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateInvoiceStatus(id, status) {
      this.loading = true;
      this.error = null;
      try {
        const response = await updateInvoiceStatus(id, status);
        const index = this.invoices.findIndex(i => i.id === id);
        if (index !== -1) {
          this.invoices[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la mise à jour du statut';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteInvoice(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiDeleteInvoice(id);
        this.invoices = this.invoices.filter(i => i.id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la suppression de la facture';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async downloadPDF(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await downloadInvoicePDF(id);
        
        // Créer un URL pour le blob
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Créer un lien temporaire et cliquer dessus pour télécharger
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Nettoyer l'URL
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du téléchargement du PDF';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 