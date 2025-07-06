import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },

  async register(userData) {
    return await api.post('/auth/register', userData);
  },

  async getProfile() {
    return await api.get('/auth/profile');
  },

  async validateToken() {
    return await api.post('/auth/validate-token');
  }
};

// Services des produits
export const productService = {
  async getAll() {
    return await api.get('/products');
  },

  async getById(id) {
    return await api.get(`/products/${id}`);
  },

  async create(productData) {
    return await api.post('/products', productData);
  },

  async update(id, productData) {
    return await api.patch(`/products/${id}`, productData);
  },

  async delete(id) {
    return await api.delete(`/products/${id}`);
  },

  async search(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return await api.get(`/products/search?${params.toString()}`);
  },

  async updateStock(id, quantity) {
    return await api.patch(`/products/${id}/stock`, { quantity });
  },

  async adjustStock(id, adjustment) {
    return await api.patch(`/products/${id}/adjust-stock`, { adjustment });
  },

  async getStats() {
    return await api.get('/products/stats');
  },

  async getLowStock() {
    return await api.get('/products/low-stock');
  },

  async getExpiring(days = 30) {
    return await api.get(`/products/expiring?days=${days}`);
  },

  async getExpired() {
    return await api.get('/products/expired');
  }
};

// Services des utilisateurs
export const userService = {
  async getAll() {
    return await api.get('/users');
  },

  async getById(id) {
    return await api.get(`/users/${id}`);
  },

  async create(userData) {
    return await api.post('/users', userData);
  },

  async update(id, userData) {
    return await api.patch(`/users/${id}`, userData);
  },

  async delete(id) {
    return await api.delete(`/users/${id}`);
  }
};

export default api;
