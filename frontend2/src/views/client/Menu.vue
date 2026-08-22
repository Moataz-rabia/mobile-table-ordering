<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/axios'; // Centralized Axios instance.

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

<style scoped>
/*
  PALETTE DE COULEURS HARMONISÉE
  --dark-espresso: #3D3323 (Arrière-plan sombre et structuré)
  --warm-brown:    #87674D (Boutons d'action, accents et séparateurs)
  --soft-sand:     #CCBDAC (Textes secondaires, descriptions et bordures douces)
  --light-cream:   #F8F5F0 (Titres principaux et textes à fort contraste)
*/

.page-container {
  --dark-espresso: #3D3323;
  --warm-brown:    #87674D;
  --soft-sand:     #CCBDAC;
  --light-cream:   #F8F5F0;

  background-color: var(--dark-espresso);
  color: var(--light-cream);
  min-height: 100vh;
  font-family: 'Work Sans', sans-serif;
  padding-bottom: 60px;
}

.mono {
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Nav */
nav.nav-scrolled {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 5vw;
  background: rgba(61, 51, 35, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(204, 189, 172, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--light-cream);
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-style: italic;
}
.logo svg { width: 26px; height: 26px; stroke: var(--soft-sand); }

.table-badge {
  border: 1px solid var(--warm-brown);
  color: var(--soft-sand);
  background: rgba(135, 103, 77, 0.15);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 12px;
}

/* Header */
.menu-head {
  text-align: center;
  padding: 40px 5vw 20px;
}

.eyebrow {
  color: var(--soft-sand);
  font-size: 12px;
  margin-bottom: 10px;
}

.menu-head h2 {
  font-family: 'Fraunces', serif;
  font-size: clamp(32px, 4vw, 48px);
  color: var(--light-cream);
}
.menu-head h2 em { color: var(--soft-sand); font-style: italic; }

.menu-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.menu-tab {
  padding: 10px 22px;
  border-radius: 100px;
  border: 1px solid rgba(204, 189, 172, 0.3);
  color: var(--soft-sand);
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  transition: all 0.25s ease;
}

.menu-tab.active, .menu-tab:hover {
  background: var(--warm-brown);
  border-color: var(--warm-brown);
  color: var(--light-cream);
}

/* Structure */
.menu-content {
  max-width: 1100px;
  margin: 40px auto 0;
  padding: 0 5vw;
}

.menu-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
}

.menu-grid {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px dashed rgba(204, 189, 172, 0.25);
}

.menu-item-name {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  color: var(--light-cream);
}

.menu-item-desc {
  color: var(--soft-sand);
  font-size: 13.5px;
  margin-top: 4px;
  line-height: 1.4;
}

.menu-item-price {
  color: var(--light-cream);
  font-size: 17px;
  margin-top: 6px;
  font-weight: 600;
}

.btn-add {
  background: transparent;
  border: 1px solid var(--soft-sand);
  color: var(--soft-sand);
  padding: 8px 18px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-add:hover {
  background: var(--warm-brown);
  border-color: var(--warm-brown);
  color: var(--light-cream);
}

/* Card Panier */
.cart-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(204, 189, 172, 0.2);
  position: sticky;
  top: 90px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(204, 189, 172, 0.2);
  padding-bottom: 12px;
}

.cart-header h3 {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  color: var(--light-cream);
}

.cart-header span {
  color: var(--soft-sand);
  font-size: 12px;
}

.cart-empty {
  color: var(--soft-sand);
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.cart-item-details {
  display: flex;
  flex-direction: column;
}

.item-name { font-size: 14px; color: var(--light-cream); }
.item-price { font-size: 13px; color: var(--soft-sand); font-weight: 500; }

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(204, 189, 172, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.cart-item-controls button {
  background: none;
  border: none;
  color: var(--light-cream);
  cursor: pointer;
  font-weight: bold;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgba(204, 189, 172, 0.2);
  font-weight: bold;
}

.total-amount { color: var(--light-cream); font-size: 18px; }

.btn-primary {
  background: var(--warm-brown);
  color: var(--light-cream);
  border: none;
  width: 100%;
  padding: 14px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: filter 0.2s;
}

.btn-primary:hover:not(:disabled) { filter: brightness(1.15); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.alert {
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 14px;
}
.alert-success { 
  background: rgba(135, 103, 77, 0.25); 
  color: var(--light-cream); 
  border: 1px solid var(--warm-brown); 
}
.empty-cat { color: var(--soft-sand); padding: 20px 0; }
.state-message { text-align: center; padding: 40px; color: var(--soft-sand); }

@media (max-width: 860px) {
  .menu-layout { grid-template-columns: 1fr; }
  .cart-card { position: static; margin-top: 40px; }
}
</style>