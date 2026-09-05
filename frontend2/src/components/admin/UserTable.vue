<template>
  <div class="card list-card">
    <h3>Utilisateurs enregistrés ({{ users.length }})</h3>

    <div v-if="loading" class="state-msg">
      Chargement des comptes...
    </div>

    <div v-else-if="users.length === 0" class="state-msg">
      Aucun utilisateur enregistré.
    </div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id || user._id">
            <td>
              <strong class="user-name">{{ user.username }}</strong>
            </td>
            <td>
              <span :class="['role-tag', user.role ? user.role.toLowerCase() : '']">
                {{ user.role }}
              </span>
            </td>
            <td class="text-right actions-cell">
              <!-- Bouton Modifier -->
              <button 
                class="btn-icon edit" 
                title="Modifier ce compte"
                @click="$emit('edit', user)"
              >
                ✏️
              </button>

              <!-- Bouton Supprimer -->
              <button 
                class="btn-icon delete" 
                title="Supprimer ce compte"
                @click="$emit('delete', user.id || user._id)"
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
import '../../assets/css/espace-admin-css/userTable.css';

defineProps({
  users: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Ajout de 'edit' dans les événements émis
defineEmits(['delete', 'edit']);
</script>