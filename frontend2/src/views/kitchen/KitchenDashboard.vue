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
          </button>

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
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<style scoped>
/* Palette : #3D3323, #87674D, #CCBDAC */

.kitchen-container {
  min-height: 100vh;
  background-color: #3D3323;
  color: #FAF8F5;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.kitchen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #87674D;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.kitchen-header h1 {
  margin: 0;
  color: #CCBDAC;
  font-size: 1.8rem;
}

.active-count {
  background-color: #87674D;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background-color: #FAF8F5;
  color: #3D3323;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-top: 6px solid #87674D;
}

.border-pending { border-top-color: #d97706; }
.border-preparing { border-top-color: #2563eb; }
.border-ready { border-top-color: #16a34a; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.table-badge {
  background-color: #3D3323;
  color: #FAF8F5;
  font-weight: bold;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
}

.time-stamp {
  font-size: 0.85rem;
  color: #87674D;
  font-weight: 600;
}

.status-indicator {
  text-align: center;
  padding: 0.4rem;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.status-pending { background-color: #fef3c7; color: #92400e; }
.status-preparing { background-color: #dbeafe; color: #1e40af; }
.status-ready { background-color: #dcfce7; color: #166534; }

.items-list {
  border-top: 1px solid #CCBDAC;
  border-bottom: 1px solid #CCBDAC;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  gap: 0.75rem;
  font-size: 1rem;
}

.qty {
  font-weight: bold;
  color: #87674D;
}

.name {
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  width: 100%;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn:hover { opacity: 0.9; }

.btn-prepare { background-color: #d97706; color: white; }
.btn-ready { background-color: #2563eb; color: white; }
.btn-complete { background-color: #16a34a; color: white; }

.empty-state, .loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #CCBDAC;
}

.error-banner {
  background-color: #dc2626;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}
</style>