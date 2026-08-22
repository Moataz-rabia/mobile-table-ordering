import { createRouter, createWebHistory } from 'vue-router';
import CustomerMenu from '../views/client/Menu.vue';
import KitchenDashboard from '../views/kitchen/KitchenDashboard.vue';
import OrderStatus from '../views/client/OrderStatus.vue';
const routes = [
  // Redirect root path to table 1
  { 
    path: '/', 
    redirect: '/table/1' 
  },
  // Customer menu route with dynamic table number
  { 
    path: '/table/:tableNumber', 
    name: 'CustomerMenu',
    component: CustomerMenu 
  },
  {
    path: '/status/:orderId',
    name: 'OrderStatus',
    component: OrderStatus
  },
  // KDS Kitchen View
  { 
    path: '/kitchen', 
    name: 'Kitchen',
    component: KitchenDashboard 
  },
  // Catch-all route for unknown URLs (404)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/table/1'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;