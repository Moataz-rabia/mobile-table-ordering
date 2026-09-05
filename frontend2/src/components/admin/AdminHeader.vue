<template>
<nav class="nav-scrolled">
  <div class="nav-brand">
    <h2 class="brand-title">Espace Administration</h2>
    <p class="brand-subtitle">Panneau de contrôle et gestion</p>
  </div>

  <div class="nav-tabs-wrapper">
    <AdminTabs 
      :current-tab="activeTab" 
      @select-tab="$emit('update:activeTab', $event)" 
    />
  </div>
</nav>
</template>

<script setup>
import AdminTabs from './AdminTabs.vue';
import '../../assets/css/espace-admin-css/adminHeader.css';
defineProps({
  activeTab: {
    type: String,
    required: true
  }
});

defineEmits(['update:activeTab']);
</script>


