<template>
  <div class="menu-manager">
    <!-- Notification Banner -->
    <div v-if="alert.message" :class="['alert-banner', alert.type]">
      {{ alert.message }}
    </div>

    <div class="menu-grid">
      <!-- Left Column: Form -->
      <div class="form-container">
        <DishForm 
          :initial-data="editingDish" 
          @save="handleSaveDish" 
          @cancel="cancelEdit" 
        />
      </div>

      <!-- Right Column: Table -->
      <div class="table-container">
        <DishTable 
          :dishes="dishes" 
          :loading="loading" 
          @edit="startEdit" 
          @delete="handleDeleteDish" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DishForm from './DishForm.vue';
import DishTable from './DishTable.vue';
import api from '../../api/axios';
import '../../assets/css/espace-admin-css/MenuManager.css';
// State
const dishes = ref([]);
const loading = ref(false);
const editingDish = ref(null);
const alert = ref({ message: '', type: 'success' });

// Replace this base URL with your actual API endpoint or imported API service

const showAlert = (message, type = 'success') => {
  alert.value = { message, type };
  setTimeout(() => {
    alert.value = { message: '', type: 'success' };
  }, 4000);
};

// Fetch all dishes
const fetchDishes = async () => {
  loading.value = true;
  try {
    // Axios vérifie déjà les erreurs HTTP et convertit automatiquement le JSON !
    const response = await api.get('/admin/menu');
    
    // Les données JSON du serveur sont directement accessibles dans response.data
    dishes.value = response.data;
  } catch (error) {
    showAlert('Erreur lors du chargement du menu', 'error');
  } finally {
    loading.value = false;
  }
};

// Handle create or update
const handleSaveDish = async (formData) => {
      const isEditing = Boolean(editingDish.value);

  try {
    const dishId = isEditing ? (editingDish.value.id || editingDish.value._id) : null;
    
    // 1. Définition du chemin d'accès relatif (baseURL gère le reste)
    const endpoint = isEditing ? `/admin/menu/${dishId}` : '/admin/menu/create';

    // 2. Appel dynamique selon le mode (POST pour ajout, PUT pour modification)
    if (isEditing) {
      await api.put(endpoint, formData);
    } else {
      await api.post(endpoint, formData);
    }

    // 3. Notification et rafraîchissement
    showAlert(
      isEditing ? 'Plat modifié avec succès !' : 'Nouveau plat ajouté au menu !', 
      'success'
    );
    
    cancelEdit();
    await fetchDishes();
  } catch (error) {
    const message = error.response?.data?.message || (isEditing ? 'Échec de la modification' : 'Échec de l\'ajout du plat');
    showAlert(message, 'error');
  }
};

// Delete a dish
const handleDeleteDish = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;

  try {
    // 1. Axios gère la méthode DELETE et la concaténation avec ta baseURL
    await api.delete(`/admin/menu/${id}`);

    // 2. Pas besoin de vérifier response.ok : Axios lève une exception en cas d'erreur HTTP
    showAlert('Plat supprimé du menu avec succès.', 'success');
    await fetchDishes();
  } catch (error) {
    // 3. Récupère le message d'erreur renvoyé par le backend si disponible
    const message = error.response?.data?.message || 'Échec de la suppression du plat';
    showAlert(message, 'error');
  }
};

// Edit triggers
const startEdit = (dish) => {
  editingDish.value = dish;
};

const cancelEdit = () => {
  editingDish.value = null;
};

onMounted(() => {
  fetchDishes();
});
</script>

