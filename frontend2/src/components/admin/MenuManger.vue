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
    const response = await api.get('/dishes');
    if (!response.ok) throw new Error('Erreur lors du chargement du menu');
    const data = await response.json();
    dishes.value = data;
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    loading.value = false;
  }
};

// Handle create or update
const handleSaveDish = async (formData) => {
  try {
    const isEditing = Boolean(editingDish.value);
    const dishId = isEditing ? (editingDish.value.id || editingDish.value._id) : null;
    const url = isEditing ? `${API_URL}/${dishId}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(isEditing ? 'Échec de la modification' : 'Échec de l\'ajout du plat');
    }

    showAlert(
      isEditing ? 'Plat modifié avec succès !' : 'Nouveau plat ajouté au menu !', 
      'success'
    );
    
    cancelEdit();
    await fetchDishes();
  } catch (error) {
    showAlert(error.message, 'error');
  }
};

// Delete a dish
const handleDeleteDish = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Échec de la suppression du plat');

    showAlert('Plat supprimé du menu avec succès.', 'success');
    await fetchDishes();
  } catch (error) {
    showAlert(error.message, 'error');
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

<style scoped>
.menu-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}

.alert-banner {
  padding: 0.85rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.alert-banner.success {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.alert-banner.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
</style>