<template>
  <nav class="admin-tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="['tab-btn', { active: currentTab === tab.id }]"
      @click="$emit('select-tab', tab.id)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import '../../assets/css/espace-admin-css/adminTabs.css';
defineProps({
  currentTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    default: () => [
      { id: 'menu', label: 'Gestion du Menu', icon: '🍽️' },
      { id: 'users', label: 'Gestion des Utilisateurs', icon: '👥' }
    ]
  }
});

defineEmits(['select-tab']);

</script>
