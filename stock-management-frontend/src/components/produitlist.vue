<template>
    <div>
      <h2>Liste des Produits</h2>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }} - {{ product.quantity }} unités - {{ product.price }} DH
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import api from '../services/api';
  
  export default {
    data() {
      return {
        products: [],
      };
    },
    async mounted() {
      const res = await api.get('/products');
      this.products = res.data;
    },
  };
  </script>
  