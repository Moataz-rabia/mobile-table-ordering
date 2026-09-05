<template>
  <div class="user-manager">
    <!-- Bandeau de notification -->
    <div v-if="alert.message" :class="['alert-banner', alert.type]">
      {{ alert.message }}
    </div>
    <div class="admin-grid">
      <!-- Formulaire Enfant -->
      <UserForm
        :initial-data="editingUser"
        @save="handleSaveUser"
        @cancel="cancelEdit"
      />
      <!-- Tableau Enfant -->
      <UserTable
        :users="users"
        :loading="loading"
        @delete="handleDeleteUser"
        @edit="handleEditUser"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import UserForm from './UserForm.vue';
import UserTable from './UserTable.vue';
import '../../assets/css/espace-admin-css/userManager.css';
// Variables d'état

const users = ref([]);
const loading = ref(false);
const alert = ref({ message: '', type: 'success' });
const editingUser = ref(null);

// Seul endroit contenant l'URL Backend des utilisateurs
const showAlert = (message, type = 'success') => {
  alert.value = { message, type };
  setTimeout(() => {
    alert.value = { message: '', type: 'success' };
  }, 4000);
};

// 1. GET: Récupérer tous les utilisateurs
const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/admin/users");
    users.value = res.data;
  } catch (error) {
    showAlert("Erreur lors du chargement des utilisateurs", "error");
  } finally {
    loading.value = false;
  }
};

// 2. POST/PUT: Créer ou modifier un utilisateur (Reçoit l'événement @save de UserForm)
const handleSaveUser = async (userData) => {
  const isEditing = Boolean(editingUser.value);

  try {
    const userId = isEditing ? (editingUser.value.id || editingUser.value._id) : null;
    const endpoint = isEditing ? `/admin/users/${userId}` : '/admin/users/register';

    if (isEditing) {
      await api.put(endpoint, userData);
    } else {
      await api.post(endpoint, userData);
    }

    showAlert(
      isEditing ? 'Utilisateur modifié avec succès !' : 'Utilisateur créé avec succès !',
      'success'
    );

    cancelEdit();
    await fetchUsers(); // Rafraîchit la liste
  } catch (error) {
    const message = error.response?.data?.message || (isEditing ? 'Échec de la modification de l\'utilisateur' : "Échec de la création de l'utilisateur");
    showAlert(message, 'error');
  }
};

// 3. Sélectionner un utilisateur pour modification (Reçoit l'événement @edit de UserTable)
const handleEditUser = (user) => {
  editingUser.value = user;
};

// 4. Annuler le mode édition
const cancelEdit = () => {
  editingUser.value = null;
};

// 5. DELETE: Supprimer un utilisateur (Reçoit l'événement @delete de UserTable)
const handleDeleteUser = async (userId) => {
  if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

  try {
    await api.delete(`/admin/users/${userId}`);
    
    showAlert("Utilisateur supprimé avec succès.", "success");
    await fetchUsers(); // Rafraîchit la liste
  } catch (error) {
    const message = error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur";
    showAlert(message, "error");
  }
};

onMounted(() => {
  fetchUsers();
});
</script>