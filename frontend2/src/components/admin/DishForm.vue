<template>
  <div class="card form-card">
    <h3>{{ initialData ? 'Modifier le plat' : 'Ajouter un plat' }}</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nom du plat</label>
        <input v-model="form.name" type="text" required placeholder="ex: Espresso Double" />
      </div>

      <div class="form-group">
        <label>Catégorie</label>
        <input v-model="form.category" type="text" required placeholder="ex: Boissons, Desserts..." />
      </div>

      <div class="form-group">
        <label>Prix (TND)</label>
        <input v-model.number="form.price" type="number" step="0.1" required placeholder="0.00" />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="3" placeholder="Description du plat..."></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ initialData ? 'Enregistrer les modifications' : '➕ Ajouter au menu' }}
        </button>
        <button v-if="initialData" type="button" class="btn-secondary" @click="$emit('cancel')">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import '../../assets/css/espace-admin-css/dishForm.css';

const props = defineProps({
  initialData: { type: Object, default: null }
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({ name: '', category: '', price: '', description: '' });

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  } else {
    form.value = { name: '', category: '', price: '', description: '' };
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('save', { ...form.value });
};
</script>