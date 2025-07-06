<template>
  <div class="quote-detail">
    <!-- Vue normale -->
    <div class="container" v-if="!isPrinting">
      <!-- En-tête -->
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <font-awesome-icon icon="file-invoice" /> Devis {{ quote?.number }}
          </h1>
          <p class="page-subtitle">Créé le {{ formatDate(quote?.date) }}</p>
        </div>
        <div class="header-actions">
          <button 
            v-if="quote?.status === 'DRAFT'"
            class="btn btn-success"
            @click="handleConvert"
            :disabled="loading"
          >
            <font-awesome-icon icon="file-invoice" /> Convertir en facture
          </button>
          <button 
            class="btn btn-primary"
            @click="generatePDF"
            :disabled="loading"
          >
            <font-awesome-icon icon="download" /> Télécharger PDF
          </button>
          <router-link to="/quotes" class="btn btn-secondary">
            <font-awesome-icon icon="arrow-left" /> Retour
          </router-link>
        </div>
      </header>

      <!-- État de chargement -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement du devis...</p>
      </div>

      <!-- Contenu principal -->
      <div v-else class="quote-content">
        <div class="quote-grid">
          <!-- Colonne principale -->
          <div class="main-column">
            <!-- Informations client -->
            <div class="card client-card">
              <div class="card-header">
                <h3>
                  <font-awesome-icon icon="user" /> Informations client
                </h3>
              </div>
              <div class="card-body">
                <div class="client-info-grid">
                  <div class="info-group">
                    <label>Nom</label>
                    <p>{{ quote?.clientName }}</p>
                  </div>
                  <div class="info-group" v-if="quote?.clientEmail">
                    <label>Email</label>
                    <p>{{ quote.clientEmail }}</p>
                  </div>
                  <div class="info-group" v-if="quote?.clientAddress">
                    <label>Adresse</label>
                    <p>{{ quote.clientAddress }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Liste des produits -->
            <div class="card products-card">
              <div class="card-header">
                <h3>
                  <font-awesome-icon icon="box" /> Produits
                </h3>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="products-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in quote?.items" :key="item.id">
                        <td>
                          <div class="product-info">
                            <span class="product-name">{{ item.product.name }}</span>
                            <span class="product-category" v-if="item.product.category">
                              {{ item.product.category }}
                            </span>
                          </div>
                        </td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatPrice(item.unitPrice) }}</td>
                        <td>{{ formatPrice(item.total) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne latérale -->
          <div class="side-column">
            <!-- Statut -->
            <div class="card status-card">
              <div class="card-header">
                <h3>
                  <font-awesome-icon icon="info-circle" /> Statut
                </h3>
              </div>
              <div class="card-body">
                <div class="status-content">
                  <span :class="['status-badge', getStatusClass(quote?.status)]">
                    {{ getStatusLabel(quote?.status) }}
                  </span>
                  
                  <div class="status-actions" v-if="quote?.status === 'DRAFT'">
                    <button 
                      class="btn btn-primary btn-block"
                      @click="updateStatus('SENT')"
                      :disabled="loading"
                    >
                      <font-awesome-icon icon="paper-plane" /> Marquer comme envoyé
                    </button>
                  </div>

                  <div class="status-actions" v-if="quote?.status === 'SENT'">
                    <button 
                      class="btn btn-success btn-block"
                      @click="updateStatus('ACCEPTED')"
                      :disabled="loading"
                    >
                      <font-awesome-icon icon="check" /> Marquer comme accepté
                    </button>
                    <button 
                      class="btn btn-danger btn-block"
                      @click="updateStatus('REJECTED')"
                      :disabled="loading"
                    >
                      <font-awesome-icon icon="times" /> Marquer comme refusé
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totaux -->
            <div class="card totals-card">
              <div class="card-header">
                <h3>
                  <font-awesome-icon icon="calculator" /> Totaux
                </h3>
              </div>
              <div class="card-body">
                <div class="totals-list">
                  <div class="total-item">
                    <span>Sous-total</span>
                    <span>{{ formatPrice(quote?.subtotal) }}</span>
                  </div>
                  <div class="total-item" v-if="quote?.discount > 0">
                    <span>Remise ({{ quote.discount }}%)</span>
                    <span class="text-danger">-{{ formatPrice(getDiscountAmount()) }}</span>
                  </div>
                  <div class="total-item">
                    <span>TVA ({{ quote?.taxRate }}%)</span>
                    <span>{{ formatPrice(quote?.taxAmount) }}</span>
                  </div>
                  <div class="total-item total-final">
                    <span>Total TTC</span>
                    <span>{{ formatPrice(quote?.total) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template pour le PDF -->
    <div id="pdf-content" ref="pdfContent" :class="{ 'pdf-container': true, 'visible': isPrinting }">
      <div class="pdf-page">
        <!-- En-tête de l'entreprise -->
        <div class="company-section">
          <div class="company-info">
            <h2>{{ companyName }}</h2>
            <p>{{ companyAddress }}</p>
            <p>{{ companyPostalCode }} {{ companyCity }}</p>
            <p>Tél/Fax : {{ companyPhone }}</p>
            <p>{{ companyWebsite }}</p>
          </div>
        </div>

        <!-- Titre DEVIS -->
        <div class="quote-title">
          <h1>DEVIS</h1>
        </div>

        <!-- Section référence et client -->
        <div class="quote-header-grid">
          <!-- Références -->
          <div class="reference-section">
            <table class="ref-table">
              <tr>
                <td><strong>Référence :</strong></td>
                <td>{{ quote?.number }}</td>
              </tr>
              <tr>
                <td><strong>Date :</strong></td>
                <td>{{ formatDate(quote?.date) }}</td>
              </tr>
              <tr>
                <td><strong>N° Client :</strong></td>
                <td>{{ quote?.id }}</td>
              </tr>
            </table>
          </div>

          <!-- Informations client -->
          <div class="client-section">
            <div class="client-box">
              <h3>Client</h3>
              <p class="client-name">{{ quote?.clientName }}</p>
              <p v-if="quote?.clientAddress">{{ quote?.clientAddress }}</p>
              <p v-if="quote?.clientEmail">{{ quote?.clientEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3>Description du projet</h3>
        </div>

        <!-- Tableau des produits -->
        <div class="products-section">
          <table class="products-table">
            <thead>
              <tr>
                <th>Quantité</th>
                <th>Désignation</th>
                <th>Prix unitaire HT</th>
                <th>Prix total HT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in quote?.items" :key="item.id">
                <td class="text-center">{{ item.quantity }}</td>
                <td>{{ item.product.name }}</td>
                <td class="text-right">{{ formatPrice(item.unitPrice, false) }}</td>
                <td class="text-right">{{ formatPrice(item.total, false) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totaux -->
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Total HT</td>
              <td class="text-right">{{ formatPrice(quote?.subtotal, false) }}</td>
            </tr>
            <tr>
              <td>TVA {{ quote?.taxRate }}%</td>
              <td class="text-right">{{ formatPrice(quote?.taxAmount, false) }}</td>
            </tr>
            <tr class="total-ttc">
              <td>Total TTC</td>
              <td class="text-right">{{ formatPrice(quote?.total, false) }}</td>
            </tr>
          </table>
        </div>

        <!-- Pied de page -->
        <div class="footer-section">
          <p>Nous restons à votre disposition pour toute information complémentaire.</p>
          <p>Cordialement,</p>

          <div class="signature-section">
            <p class="signature-text">Si ce devis vous convient, veuillez nous le retourner signé précédé de la mention :</p>
            <p class="signature-mention">"BON POUR ACCORD ET EXECUTION DU DEVIS"</p>
            
            <div class="signature-lines">
              <div class="signature-line">
                <span>Date : .........................</span>
              </div>
              <div class="signature-line">
                <span>Signature : .........................</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuoteStore } from '../stores/quotes'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()
const quoteStore = useQuoteStore()
const quote = ref(null)
const loading = ref(false)
const isPrinting = ref(false)
const pdfContent = ref(null)

// Informations de l'entreprise (à personnaliser)
const companyName = ref('StockManager')
const companyAddress = ref('123 rue du Commerce')
const companyPostalCode = ref('75000')
const companyCity = ref('Paris')
const companyPhone = ref('01 23 45 67 89')
const companyWebsite = ref('www.stockmanager.com')

const loadQuote = async () => {
  loading.value = true
  try {
    quote.value = await quoteStore.fetchQuote(parseInt(route.params.id))
  } catch (error) {
    console.error('Erreur lors du chargement du devis:', error)
  } finally {
    loading.value = false
  }
}

const generatePDF = async () => {
  if (!quote.value) return

  loading.value = true
  isPrinting.value = true

  try {
    const element = pdfContent.value
    const options = {
      filename: `devis_${quote.value.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: 'avoid-all' }
    }

    await html2pdf().set(options).from(element).save()
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
  } finally {
    loading.value = false
    isPrinting.value = false
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

const updateStatus = async (status) => {
  loading.value = true
  try {
    quote.value = await quoteStore.updateQuoteStatus(quote.value.id, status)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  } finally {
    loading.value = false
  }
}

const handleConvert = async () => {
  loading.value = true
  try {
    const invoice = await quoteStore.convertToInvoice(quote.value.id)
    router.push(`/invoices/${invoice.id}`)
  } catch (error) {
    console.error('Erreur lors de la conversion en facture:', error)
  } finally {
    loading.value = false
  }
}

const getDiscountAmount = () => {
  if (!quote.value) return 0
  return (quote.value.subtotal * quote.value.discount) / 100
}

const formatPrice = (price, withCurrency = true) => {
  if (!price) return '0,00' + (withCurrency ? ' €' : '')
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
  return formatted + (withCurrency ? ' €' : '')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(loadQuote)
</script>

<style scoped>
.quote-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* En-tête */
.page-header {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-subtitle {
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* État de chargement */
.loading-state {
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

/* Grille principale */
.quote-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Cartes */
.card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-body {
  padding: 1.5rem;
}

/* Informations client */
.client-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-group label {
  display: block;
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.info-group p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

/* Tableau des produits */
.products-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.products-table th,
.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.products-table th {
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
  background: #f8f9fa;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 500;
  color: #2c3e50;
}

.product-category {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Statut */
.status-content {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
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

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Totaux */
.totals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #2c3e50;
}

.total-final {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover {
  background: #27ae60;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .quote-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .products-table {
    font-size: 0.875rem;
  }

  .products-table th,
  .products-table td {
    padding: 0.75rem;
  }
}

@media print {
  .quote-detail {
    background: white;
    padding: 20mm;
    max-width: 210mm;
    margin: 0 auto;
    font-size: 12pt;
    color: #000;
  }

  .container {
    display: none;
  }

  .pdf-container {
    position: static;
    top: auto;
    left: auto;
  }

  .pdf-page {
    box-shadow: none;
  }

  .company-section {
    margin-bottom: 20mm;
  }

  .company-info h2 {
    font-size: 16pt;
    margin: 0 0 5mm 0;
  }

  .company-info p {
    margin: 1mm 0;
    font-size: 10pt;
  }

  .quote-title {
    text-align: center;
    background: #f0f9ff;
    padding: 5mm;
    margin: 10mm 0;
  }

  .quote-title h1 {
    margin: 0;
    font-size: 24pt;
    color: #000;
  }

  .quote-header-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10mm;
    margin: 10mm 0;
  }

  .reference-section {
    background: #f0f9ff;
    padding: 5mm;
  }

  .ref-table {
    width: 100%;
  }

  .ref-table td {
    padding: 2mm;
  }

  .client-section {
    border: 1px solid #ddd;
    padding: 5mm;
  }

  .client-box h3 {
    margin: 0 0 5mm 0;
    font-size: 12pt;
  }

  .client-box p {
    margin: 2mm 0;
  }

  .description-section {
    margin: 10mm 0;
  }

  .description-section h3 {
    font-size: 12pt;
    margin: 0 0 5mm 0;
  }

  .products-section {
    margin: 10mm 0;
  }

  .products-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10mm;
  }

  .products-table th,
  .products-table td {
    border: 1px solid #000;
    padding: 3mm;
    text-align: left;
  }

  .products-table th {
    background: #f0f9ff;
    font-weight: bold;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .totals-section {
    margin: 10mm 0;
  }

  .totals-table {
    width: 50%;
    margin-left: auto;
  }

  .totals-table td {
    padding: 2mm;
  }

  .total-ttc {
    font-weight: bold;
    border-top: 1px solid #000;
  }

  .footer-section {
    margin-top: 20mm;
  }

  .signature-section {
    margin-top: 15mm;
  }

  .signature-text {
    margin-bottom: 5mm;
  }

  .signature-mention {
    font-weight: bold;
    margin-bottom: 10mm;
  }

  .signature-lines {
    margin-top: 15mm;
    display: flex;
    justify-content: space-between;
  }

  .signature-line {
    flex: 1;
    margin: 0 5mm;
  }

  /* Cache les éléments non nécessaires pour l'impression */
  .header-actions,
  .status-actions,
  .btn {
    display: none !important;
  }
}

/* Style pour la vue normale (non-impression) */
.pdf-container {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 210mm;
  background: white;
  z-index: -1;
}

.pdf-container.visible {
  position: static;
  top: auto;
  left: auto;
}

.pdf-page {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
  font-family: Arial, sans-serif;
  color: #000;
}

/* Sections du PDF */
.company-section {
  margin-bottom: 20mm;
}

.company-info h2 {
  font-size: 18pt;
  margin: 0 0 5mm 0;
  color: #000;
}

.company-info p {
  margin: 2mm 0;
  font-size: 10pt;
}

.quote-title {
  text-align: center;
  background: #f0f9ff;
  padding: 5mm;
  margin: 10mm 0;
}

.quote-title h1 {
  margin: 0;
  font-size: 24pt;
  color: #000;
}

.quote-header-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10mm;
  margin: 10mm 0;
}

.reference-section {
  background: #f0f9ff;
  padding: 5mm;
}

.ref-table {
  width: 100%;
}

.ref-table td {
  padding: 2mm;
}

.client-section {
  border: 1px solid #ddd;
  padding: 5mm;
}

.client-box h3 {
  margin: 0 0 5mm 0;
  font-size: 12pt;
}

.client-box p {
  margin: 2mm 0;
}

.description-section {
  margin: 10mm 0;
}

.description-section h3 {
  font-size: 12pt;
  margin: 0 0 5mm 0;
}

.products-section {
  margin: 10mm 0;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10mm;
}

.products-table th,
.products-table td {
  border: 1px solid #000;
  padding: 3mm;
  text-align: left;
}

.products-table th {
  background: #f0f9ff;
  font-weight: bold;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.totals-section {
  margin: 10mm 0;
}

.totals-table {
  width: 50%;
  margin-left: auto;
}

.totals-table td {
  padding: 2mm;
}

.total-ttc {
  font-weight: bold;
  border-top: 1px solid #000;
}

.footer-section {
  margin-top: 20mm;
}

.signature-section {
  margin-top: 15mm;
}

.signature-text {
  margin-bottom: 5mm;
}

.signature-mention {
  font-weight: bold;
  margin-bottom: 10mm;
}

.signature-lines {
  margin-top: 15mm;
  display: flex;
  justify-content: space-between;
}

.signature-line {
  flex: 1;
  margin: 0 5mm;
}

/* Styles pour les boutons */
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-success:hover:not(:disabled) {
  background: #27ae60;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}
</style> 