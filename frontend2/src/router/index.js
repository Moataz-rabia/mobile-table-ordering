import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import KitchenDashboard from '../views/kitchen/KitchenDashboard.vue';

// 1. Imports des vues Client (Adaptez les chemins si vos fichiers sont dans /components ou /views)
import CustomerMenu from '../views/client/Menu.vue';
import OrderStatus from '../views/client/OrderStatus.vue';

const routes = [
  // Route Login
  { 
    path: '/', 
    name: 'login',
    component: LoginView 
  },
  
  // Route Cuisinier / Espace Cuisine (Protégée)
  { 
    path: '/kitchen', 
    name: 'kitchen',
    component: KitchenDashboard,
    meta: { requiresAuth: true, role: 'KITCHEN' } 
  },

  // Routes Publiques Client (Accessible via QR Code sur les tables)
  { 
    path: '/table/:tableNumber', 
    name: 'CustomerMenu',
    component: CustomerMenu 
  },
  {
    path: '/status/:orderId',
    name: 'OrderStatus',
    component: OrderStatus
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navigation sécurisé anti-boucle
router.beforeEach((to, from, next) => {
  // Au lieu de localStorage.getItem :
  const userJson = sessionStorage.getItem('user');
  let user = null;

  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    localStorage.removeItem('user');
  }

  // A. Si la route demande une authentification (ex: /kitchen)
  if (to.meta.requiresAuth) {
    if (!user) {
      return next({ name: 'login' });
    }

    const userRole = (user.role || '').toUpperCase();
    
    if (to.meta.role && userRole !== to.meta.role && userRole !== 'COOK' && userRole !== 'ADMIN') {
      return next({ name: 'login' });
    }

    return next();
  }

  // B. Si l'utilisateur est connecté et consulte la page /login
  if (to.path === '/' && user) {
    const userRole = (user.role || '').toUpperCase();
    if (userRole === 'KITCHEN' || userRole === 'COOK') {
      return next({ name: 'kitchen' });
    }
  }

  // C. Pour toutes les routes publiques (/table/:tableNumber, /status/:orderId)
  next();
});

export default router;