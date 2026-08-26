<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/axios'; // Centralized Axios instance.
import '../../assets/css/Menu.css';
const route = useRoute();

// Données
const menuItems = ref([]);
const cart = ref([]);

// Vos catégories exactes
const activeCategory = ref('Boissons Chaudes');
const categories = ['Boissons Chaudes', 'Boissons Froides', 'Pâtisseries', 'Desserts'];

const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);

// Numéro de table extrait de l'URL (/table/:tableNumber)
const tableNumber = computed(() => Number(route.params.tableNumber) || 1);

// Récupération du menu depuis Express
const fetchMenu = async () => {
  try {
    loading.value = true;
    const response = await api.get('/menu');
    menuItems.value = Array.isArray(response.data) ? response.data : response.data.menu || [];
  } catch (err) {
    console.error('Erreur chargement menu:', err);
    errorMessage.value = 'Impossible de charger la carte. Veuillez réessayer.';
  } finally {
    
    loading.value = false;

  }
};

onMounted(() => {
  fetchMenu();
});

// Filtrage insensible à la casse
const filteredItems = computed(() => {
  if (!menuItems.value || menuItems.value.length === 0) return [];
  return menuItems.value.filter(item => 
    item.category && item.category.trim().toLowerCase() === activeCategory.value.trim().toLowerCase()
  );
});

// Panier
const addToCart = (item) => {
  const existingItem = cart.value.find(i => i._id === item._id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.value.push({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  }
};

const updateQuantity = (itemId, delta) => {
  const index = cart.value.findIndex(i => i._id === itemId);
  if (index !== -1) {
    cart.value[index].quantity += delta;
    if (cart.value[index].quantity <= 0) {
      cart.value.splice(index, 1);
    }
  }
};

const totalAmount = computed(() => {
  return cart.value.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
});

// Validation
const sendOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      tableNumber: tableNumber.value,
      items: cart.value.map(item => ({
        menuItem: item._id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.price)
      })),
      totalAmount: totalAmount.value
    };

    const response = await api.post('/orders', payload);
    
    // Log de contrôle dans la console F12
    console.log("Réponse du serveur après création :", response.data);

    // Extraction sécurisée de l'ID
    const createdOrderId = response.data._id || response.data.id;

    if (!createdOrderId) {
      throw new Error("L'ID de la commande n'a pas été renvoyé par le serveur.");
    }

    // Vider le panier
    cart.value = [];

    // Redirection directe
    window.location.href = `/status/${createdOrderId}`;

  } catch (err) {
    console.error("Erreur d'envoi ou de redirection :", err);
    errorMessage.value = err.response?.data?.error || err.message || "Erreur lors de l'envoi de la commande.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <!-- Top Navigation -->
    <nav class="nav-scrolled">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none"><path d="M4 8h13a3 3 0 0 1 0 6h-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 8v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7 5c0 1-1 1-1 2M11 5c0 1-1 1-1 2M15 5c0 1-1 1-1 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        Cafe Paradise
      </div>
      <div class="table-badge mono">
        Table #{{ tableNumber }}
      </div>
    </nav>

    <!-- Header -->
    <section class="menu-head">
      <div class="eyebrow mono">Le Menu</div>
      <h2>Savourez l'instant, <em>préparé à la minute</em>.</h2>

      <div class="menu-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="['menu-tab', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- Content -->
    <section class="menu-content">
      <div v-if="loading" class="state-message">Chargement de la carte...</div>
      <div v-else-if="errorMessage" class="state-message error">{{ errorMessage }}</div>

      <div v-else class="menu-layout">
        <!-- Produits -->
        <div class="menu-grid">
          <div v-if="filteredItems.length === 0" class="empty-cat">
            Aucun article disponible dans cette catégorie.
          </div>
          <div v-for="item in filteredItems" :key="item._id" class="menu-item">
            <div class="menu-item-info">
              <div class="menu-item-name">{{ item.name }}</div>
              <div class="menu-item-desc">{{ item.description || 'Préparé avec soin par nos baristas.' }}</div>
              <div class="menu-item-price">{{ Number(item.price).toFixed(2) }} DT</div>
            </div>
            <button class="btn-add" @click="addToCart(item)">
              + Ajouter
            </button>
          </div>
        </div>

        <!-- Panier -->
        <div class="cart-card">
          <div class="cart-header">
            <h3>Votre Commande</h3>
            <span class="mono">Table {{ tableNumber }}</span>
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div v-if="cart.length === 0" class="cart-empty">
            Votre panier est vide.
          </div>

          <div v-else class="cart-items">
            <div v-for="item in cart" :key="item._id" class="cart-item">
              <div class="cart-item-details">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-price">{{ (item.price * item.quantity).toFixed(2) }} DT</span>
              </div>
              <div class="cart-item-controls">
                <button @click="updateQuantity(item._id, -1)">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="updateQuantity(item._id, 1)">+</button>
              </div>
            </div>

            <div class="cart-summary">
              <div class="total-row">
                <span>Total</span>
                <span class="total-amount">{{ totalAmount.toFixed(2) }} DT</span>
              </div>

              <button 
                class="btn-primary" 
                :disabled="isSubmitting"
                @click="sendOrder"
              >
                {{ isSubmitting ? 'Envoi en cours...' : 'Valider la commande' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
