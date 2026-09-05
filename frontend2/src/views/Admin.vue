<template>
  <div class="admin-container">
    <!-- Header avec onglets -->
    <AdminHeader v-model:activeTab="currentTab" />

    <!-- Contenu dynamique selon l'onglet sélectionné -->
    <main class="tab-content">
      <MenuManager v-if="currentTab === 'menu'" />
      <UserManager v-else-if="currentTab === 'users'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminHeader from '../components/admin/AdminHeader.vue';
import MenuManager from '../components/admin/MenuManager.vue';
import UserManager from '../components/admin/UserManager.vue';
import '../assets/css/espace-admin-css/Admin.css';

// État de l'onglet actif ('menu' par défaut)
const currentTab = ref('menu');
</script>