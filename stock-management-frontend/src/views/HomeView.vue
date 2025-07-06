<template>
    <div>
      <ProductForm />
      <ProductList />
    </div>
  </template>
  
  <script>
  import ProductList from '../components/produitlist.vue';
  import ProductForm from '../components/ProductForm.vue';
  
  export default {
    components: {
      ProductList,
      ProductForm,
    },
  };
  </script>
  