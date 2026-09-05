<template>
  <div class="table-card">
    <div class="table-header">
      <h3>Plats au menu ({{ dishes.length }})</h3>
    </div>

    <div v-if="loading" class="loading-state">
      Chargement du menu...
    </div>

    <div v-else-if="dishes.length === 0" class="empty-state">
      Aucun plat disponible pour le moment.
    </div>

    <div v-else class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Description</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dish in dishes" :key="dish.id || dish._id">
            <td class="font-medium">{{ dish.name }}</td>
            <td>
              <span class="badge category-badge">{{ dish.category }}</span>
            </td>
            <td class="price-cell">{{ Number(dish.price).toFixed(2) }} TND</td>
            <td class="description-cell">{{ dish.description || '-' }}</td>
            <td class="text-right actions-cell">
              <button 
                class="btn-icon edit-btn" 
                title="Modifier" 
                @click="$emit('edit', dish)"
              >
                ✏️
              </button>
              <button 
                class="btn-icon delete-btn" 
                title="Supprimer" 
                @click="$emit('delete', dish.id || dish._id)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import '../../assets/css/espace-admin-css/DishTable.css';
defineProps({
  dishes: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete']);
</script>

