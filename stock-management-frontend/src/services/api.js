import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ne pas définir Content-Type pour les requêtes multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Products API
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  // Si data est déjà un FormData, l'utiliser directement
  const formData = data instanceof FormData ? data : new FormData();
  
  // Si data n'est pas un FormData, convertir les données en FormData
  if (!(data instanceof FormData)) {
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
  }
  
  return api.post('/products', formData);
};
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const searchProducts = (query) => api.get(`/products/search?q=${query}`);

// Nouvelles fonctions pour la gestion du stock
export const adjustProductStock = (id, adjustment) => api.patch(`/products/${id}/adjust-stock`, { adjustment });
export const updateProductStock = (id, quantity) => api.patch(`/products/${id}/stock`, { quantity });

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

// Quotes API
export const createQuote = (data) => api.post('/quotes', data);
export const getQuotes = () => api.get('/quotes');
export const getQuote = (id) => api.get(`/quotes/${id}`);
export const updateQuoteStatus = (id, status) => api.patch(`/quotes/${id}/status`, { status });
export const convertQuoteToInvoice = (id) => api.post(`/quotes/${id}/convert`);
export const deleteQuote = (id) => api.delete(`/quotes/${id}`);
export const updateQuote = (id, data) => api.patch(`/quotes/${id}`, data);

// Invoices API
export const createInvoice = (data) => api.post('/invoices', data);
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status`, { status });
export const downloadInvoicePDF = (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);

export default api;

