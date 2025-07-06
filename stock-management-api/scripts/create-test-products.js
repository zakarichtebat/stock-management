const axios = require('axios');

const products = [
  {
    name: 'Yaourt Nature',
    description: 'Yaourt nature frais',
    category: 'Produits laitiers',
    supplier: 'Laiterie Bio',
    barcode: 'YAO123456',
    quantity: 50,
    minStock: 20,
    purchasePrice: 0.45,
    salePrice: 0.89,
    imageUrl: '/images/pexels-melovick24-10141956.jpg',
    expirationDate: new Date(Date.now() + (10 * 24 * 60 * 60 * 1000)), // 10 jours
    isActive: true
  },
  {
    name: 'Jus d\'Orange',
    description: 'Jus d\'orange pressé',
    category: 'Boissons',
    supplier: 'Fruits Express',
    barcode: 'JUS789012',
    quantity: 30,
    minStock: 15,
    purchasePrice: 1.20,
    salePrice: 2.49,
    imageUrl: '/images/pexels-melovick24-10141956.jpg',
    expirationDate: new Date(Date.now() + (25 * 24 * 60 * 60 * 1000)), // 25 jours
    isActive: true
  },
  {
    name: 'Biscuits au Chocolat',
    description: 'Biscuits avec pépites de chocolat',
    category: 'Snacks',
    supplier: 'Biscuiterie Moderne',
    barcode: 'BIS345678',
    quantity: 100,
    minStock: 30,
    purchasePrice: 1.50,
    salePrice: 2.99,
    imageUrl: '/images/pexels-melovick24-10141956.jpg',
    expirationDate: new Date(Date.now() + (35 * 24 * 60 * 60 * 1000)), // 35 jours
    isActive: true
  }
];

async function login() {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@stockmanagement.com',
      password: 'admin123'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur de connexion:', error.message);
    throw error;
  }
}

async function createProducts() {
  try {
    const token = await login();
    console.log('Connecté avec succès');

    for (const product of products) {
      const response = await axios.post('http://localhost:3000/products', product, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Produit créé: ${response.data.name}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

createProducts(); 