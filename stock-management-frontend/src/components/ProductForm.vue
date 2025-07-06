<template>
    <form @submit.prevent="createProduct">
      <input v-model="name" placeholder="Nom" />
      <input v-model.number="quantity" type="number" placeholder="Quantité" />
      <input v-model.number="price" type="number" placeholder="Prix" />
      <button type="submit">Ajouter</button>
    </form>
  </template>
  
  <script>
  import api from '../services/api';
  
  export default {
    data() {
      return {
        name: '',
        quantity: 0,
        price: 0,
      };
    },
    methods: {
      async createProduct() {
        await api.post('/products', {
          name: this.name,
          quantity: this.quantity,
          price: this.price,
        });
        alert('Produit ajouté');
        this.name = '';
        this.quantity = 0;
        this.price = 0;
      },
    },
  };
  </script>
  