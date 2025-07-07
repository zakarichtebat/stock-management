<template>
  <form @submit.prevent="createProduct" class="product-form">
    <div class="form-group">
      <label for="name">Nom du produit</label>
      <input id="name" v-model="name" placeholder="Nom" required />
    </div>

    <div class="form-group">
      <label for="quantity">Quantité</label>
      <input id="quantity" v-model.number="quantity" type="number" placeholder="Quantité" required />
    </div>

    <div class="form-group">
      <label for="price">Prix</label>
      <input id="price" v-model.number="price" type="number" step="0.01" placeholder="Prix" required />
    </div>

    <div class="form-group">
      <label for="image">Image du produit</label>
      <input 
        id="image" 
        type="file" 
        @change="handleImageChange" 
        accept="image/*"
      />
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Aperçu du produit" />
      </div>
    </div>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Chargement...' : 'Ajouter le produit' }}
    </button>
  </form>
</template>

<script>
import { createProduct } from '../services/api';

export default {
  data() {
    return {
      name: '',
      quantity: 0,
      price: 0,
      image: null,
      imagePreview: null,
      loading: false
    };
  },
  methods: {
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.image = file;
        // Créer un aperçu de l'image
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    async createProduct() {
      try {
        this.loading = true;
        const formData = new FormData();
        formData.append('name', this.name);
        formData.append('quantity', this.quantity);
        formData.append('price', this.price);
        if (this.image) {
          formData.append('image', this.image);
        }

        await createProduct(formData);
        this.$emit('product-created');
        
        // Réinitialiser le formulaire
        this.name = '';
        this.quantity = 0;
        this.price = 0;
        this.image = null;
        this.imagePreview = null;
        
        // Notification de succès
        alert('Produit ajouté avec succès');
      } catch (error) {
        alert('Erreur lors de la création du produit: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  },
  beforeUnmount() {
    // Nettoyer l'URL de l'aperçu
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }
};
</script>

<style scoped>
.product-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

input[type="file"] {
  border: none;
  padding: 0;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}
</style>
  