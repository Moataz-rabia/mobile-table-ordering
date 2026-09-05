<template>
  <div class="card form-card">
    <h3>{{ initialData ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}</h3>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nom d'utilisateur</label>
        <input
          v-model.trim="form.username"
          type="text"
          required
          placeholder="ex: Youssef"
        />
      </div>

      <div class="form-group">
        <label>{{ initialData ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe' }}</label>
        <input
          v-model="form.password"
          type="password"
          :required="!initialData"
          placeholder="••••••••"
        />
      </div>

      <div class="form-group">
        <label>Rôle attribué</label>
        <select v-model="form.role" required class="select-input">
          <option value="KITCHEN">Cuisinier (KITCHEN)</option>
          <option value="WAITER">Serveur (WAITER)</option>
          <option value="ADMIN">Administrateur (ADMIN)</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ initialData ? '💾 Enregistrer les modifications' : '➕ Créer le compte' }}
        </button>
        <button
          v-if="initialData"
          type="button"
          class="btn-secondary"
          @click="$emit('cancel')"
        >
          ❌ Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import '../../assets/css/espace-admin-css/userForm.css';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({
  username: '',
  password: '',
  role: 'KITCHEN'
});

// Pré-remplir le formulaire quand on passe en mode édition
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    form.value = {
      username: newVal.username || '',
      password: '',
      role: newVal.role || 'KITCHEN'
    };
  } else {
    form.value = {
      username: '',
      password: '',
      role: 'KITCHEN'
    };
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('save', { ...form.value });
};
</script>
