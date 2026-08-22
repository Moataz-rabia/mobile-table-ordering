<template>
  <div class="status-container">
    <div class="status-card">
      
      <!-- État de chargement -->
      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <p>Chargement du suivi de commande...</p>
      </div>

      <!-- En cas d'erreur -->
      <div v-else-if="errorMessage" class="state-block error-block">
        <div class="error-icon">!</div>
        <p>{{ errorMessage }}</p>
        <button class="btn-retry" @click="fetchOrderStatus">Réessayer</button>
      </div>

      <!-- Contenu de la commande -->
      <div v-else-if="order" class="order-content">
        <!-- Header -->
        <header class="header">
          <span class="table-badge">Table N° {{ order.tableNumber }}</span>
          <h2>Suivi de commande</h2>
          <p class="order-id">ID: {{ order._id }}</p>
        </header>

        <!-- Indicateur de Statut -->
        <div class="status-banner" :class="currentStatusClass">
          <span class="status-title">{{ statusText }}</span>
        </div>

        <!-- Récapitulatif des articles -->
        <div class="summary-section">
          <h3>Détails de la commande</h3>
          <div class="items-list">
            <div v-for="(item, index) in order.items" :key="index" class="item-row">
              <span class="item-quantity">{{ item.quantity }}x</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">{{ (item.unitPrice * item.quantity).toFixed(2) }} DT</span>
            </div>
          </div>

          <div class="total-row">
            <span>Total :</span>
            <span class="total-amount">{{ order.totalAmount?.toFixed(2) }} DT</span>
          </div>
        </div>

        <!-- Bouton retour -->
        <div class="actions">
          <button class="btn-back" @click="goBackToMenu">Retour au menu</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api/axios'; // Centralized Axios instance.
import { io } from 'socket.io-client';
import '../../assets/css/orderStatus.css';
const route = useRoute();
const router = useRouter();

const orderId = route.params.orderId;
const order = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const socket = io('http://localhost:5000');

// Récupération initiale de la commande
const fetchOrderStatus = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    const response = await api.get(`/orders/${orderId}`);
    order.value = response.data;
  } catch (err) {
    console.error("Erreur de récupération :", err);
    errorMessage.value = err.response?.data?.error || "Impossible de charger la commande.";
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  // Charge l'état actuel de la commande
  fetchOrderStatus();

  // Écoute les mises à jour en direct envoyées par le serveur
  socket.on('order_status_updated', (updatedOrder) => {
    if (updatedOrder._id === orderId) {
      order.value = updatedOrder; // La vue se met à jour automatiquement
    }
  });
});

// Traduction et formatage des statuts
const statusText = computed(() => {
  if (!order.value) return '';
  switch (order.value.status) {
    case 'pending': return 'En attente de confirmation...';
    case 'in-progress': case 'preparing': return 'En cours de préparation...';
    case 'ready': return 'Votre commande est prête !';
    case 'served': case 'completed': return 'Commande servie. Bon appétit !';
    case 'cancelled': return 'Commande annulée.';
    default: return 'En cours de traitement...';
  }
});

const currentStatusClass = computed(() => {
  if (!order.value) return '';
  return `status-${order.value.status}`;
});

const goBackToMenu = () => {
  if (order.value?.tableNumber) {
    router.push(`/table/${order.value.tableNumber}`);
  } else {
    router.push('/');
  }
};

onMounted(() => {
  if (orderId) {
    fetchOrderStatus();
  } else {
    errorMessage.value = "Aucun identifiant de commande spécifié.";
    loading.value = false;
  }
});
</script>

