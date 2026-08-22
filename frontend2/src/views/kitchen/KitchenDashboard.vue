<template>
  <div class="kitchen-container">
    <header class="kitchen-header">
      <h1>Écran Cuisine</h1>
      <span class="active-count">{{ activeOrders.length }} commande(s) active(s)</span>
    </header>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="loading-state">
      Chargement des commandes...
    </div>

    <!-- Grille des commandes -->
    <div v-else class="orders-grid">
      <div v-if="activeOrders.length === 0" class="empty-state">
        Aucune commande en attente pour le moment.
      </div>

      <div 
        v-for="order in activeOrders" 
        :key="order._id" 
        class="order-card"
        :class="'border-' + order.status"
      >
        <!-- En-tête de la carte -->
        <div class="card-header">
          <span class="table-badge">Table {{ order.tableNumber }}</span>
          <span class="time-stamp">{{ formatTime(order.createdAt) }}</span>
        </div>

        <!-- Statut actuel -->
        <div class="status-indicator" :class="'status-' + order.status">
          {{ formatStatus(order.status) }}
        </div>

        <!-- Liste des articles -->
        <div class="items-list">
          <div v-for="(item, idx) in order.items" :key="idx" class="item-row">
            <span class="qty">{{ item.quantity }}x</span>
            <span class="name">{{ item.name }}</span>
          </div>
        </div>
  
        <div v-if="order.status === 'ready'" class="waiter-assignment">
            <label>Serveur attribué :</label>
            <select 
              :value="order.waiter?._id || order.waiter || ''" 
              @change="assignWaiter(order._id, $event.target.value)"
            >
              <option value="" disabled>-- Choisir un serveur --</option>
              <option 
                v-for="waiter in waitersList" 
                :key="waiter._id" 
                :value="waiter._id"
              >
                {{ waiter.username }}
              </option>
            </select>
          </div>
          <br>
        <!-- Actions Cuisinier -->
        <div class="card-actions">
          <button 
            v-if="order.status === 'pending'" 
            class="btn btn-prepare" 
            @click="updateStatus(order._id, 'preparing')"
          >
            Lancer la préparation
          </button>

          <button 
            v-if="order.status === 'preparing'" 
            class="btn btn-ready" 
            @click="updateStatus(order._id, 'ready')"
          >
            Marquer comme Prête
          </button
          
          >

          <button 
            v-if="order.status === 'ready'" 
            class="btn btn-complete" 
            @click="updateStatus(order._id, 'served')"
          >
            Terminer / Servie
          </button>
        </div>
          
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api/axios'; // Instance Axios centralisée
import { io } from 'socket.io-client';
import '../../assets/css/KitchenDashboard.css';
const orders = ref([]);
const loading = ref(true);
const errorMessage = ref(''); 
const waitersList = ref([]); // Lista des serveurs

// Connexion au serveur Socket.IO
const socket = io('http://localhost:5000');

// Récupération des commandes actives
const fetchOrders = async () => {
  try {   
    loading.value = true;
    const response = await api.get('/orders');
    orders.value = response.data;
  } catch (err) {
    console.error("Erreur récupération commandes :", err);
    errorMessage.value = "Impossible de charger les commandes.";
  } finally {
    loading.value = false;
  }
};

// Mettre à jour le statut d'une commande
const updateStatus = async (orderId, newStatus) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    
    // Mettre à jour localement si le serveur ne réémet pas immédiatement
    const idx = orders.value.findIndex(o => o._id === orderId);
    if (idx !== -1) {
      orders.value[idx].status = newStatus;
    }
  } catch (err) {
    console.error("Erreur mise à jour statut :", err);
    alert("Impossible de changer le statut.");
  }
};

// Filtrer uniquement les commandes non terminées
const activeOrders = computed(() => {
  return orders.value
    .filter(o => {
      const status = o.status?.toLowerCase();
      return status === 'pending' || status === 'preparing' || status === 'ready';
    })
    .map(o => ({
      ...o,
      status: o.status ? o.status.toLowerCase() : 'pending' // Normalise le statut
    }));
});

// Formatage heure et statuts
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatStatus = (status) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'preparing': return 'En préparation';
    case 'ready': return 'Prête à servir';
    default: return status;
  }
};

// 1. Charger les serveurs depuis MongoDB
const fetchWaiters = async () => {
  try {
    const res = await api.get('/users/waiters');
    waitersList.value = res.data;
  } catch (err) {
    console.error("Erreur chargement serveurs :", err);
  }
};

// 2. Envoyer le serveur choisi au backend
const assignWaiter = async (orderId, waiterId) => {
  try {
    const res = await api.put(`/orders/${orderId}/assign-waiter`, { waiterId });
    // Mettre à jour la commande localement
    const idx = orders.value.findIndex(o => o._id === orderId);
    if (idx !== -1) orders.value[idx] = res.data;
  } catch (err) {
    console.error("Erreur affectation serveur :", err);
  }
};

onMounted(() => {
  fetchWaiters(); // <-- Ajouter cet appel ici
  // fetchOrders();
});
// Initialisation et gestion Socket.IO
onMounted(() => {
  fetchOrders();

  // Écoute de la création d'une nouvelle commande par un client
  socket.on('new_order', (newOrder) => {
    orders.value.unshift(newOrder); // Ajoute en haut de liste
  });

  // Écoute des mises à jour de statut
  socket.on('order_status_updated', (updatedOrder) => {
    const idx = orders.value.findIndex(o => o._id === updatedOrder._id);
    if (idx !== -1) {
      orders.value[idx] = updatedOrder;
    }
  });
  socket.on('order_waiter_assigned', (updatedOrder) => {
    const idx = orders.value.findIndex(o => o._id === updatedOrder._id);
    if (idx !== -1) orders.value[idx] = updatedOrder;
  });
});

onUnmounted(() => {
  socket.disconnect();
});
</script>
