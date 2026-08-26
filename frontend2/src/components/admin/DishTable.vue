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

<style scoped>
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-top: 1rem;
}

.table-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eef2f5;
}

.data-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.font-medium {
  font-weight: 600;
  color: #1e293b;
}

.price-cell {
  font-weight: 600;
  color: #2563eb;
}

.description-cell {
  color: #64748b;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e0f2fe;
  color: #0369a1;
}

.text-right {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #f1f5f9;
}

.delete-btn:hover {
  background-color: #fef2f2;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
</style>