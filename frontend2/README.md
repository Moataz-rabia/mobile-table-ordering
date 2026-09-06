# Cafe Paradise — Coffee Store Management System

A full-stack coffee shop management application with a Vue 3 frontend, Express.js/MongoDB backend, and real-time order tracking via Socket.IO.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Usage](#usage)
- [Seeding Test Data](#seeding-test-data)

---

## Overview

Cafe Paradise is a complete coffee shop management system that supports three user roles:

| Role | Access |
|------|--------|
| **Client** | Browse the menu, add items to cart, place orders, track order status |
| **Kitchen Staff** | View incoming orders, update order status (preparing → ready → served), assign waiters |
| **Admin** | Manage the menu (add/edit/delete dishes), manage user accounts (add/edit/delete staff) |

---

## Features

- **Client-facing menu** — Browse menu by category, add to cart, place orders by table number
- **Real-time order tracking** — Clients see live order status updates via Socket.IO
- **Kitchen dashboard** — Kitchen staff see new orders in real-time, update statuses, assign waiters
- **Admin panel** — Full CRUD for menu items and user accounts
- **Role-based authentication** — Login redirects to the appropriate dashboard based on role
- **Responsive design** — Works on desktop and mobile

---

## Project Structure

```
coffe_store_project/
├── backend/                          # Express.js API server
│   ├── server.js                     # Entry point — Express + Socket.IO + MongoDB
│   ├── .env                          # Environment variables
│   ├── seeders.js                    # Test data seeder
│   ├── models/
│   │   ├── User.js                   # User schema (ADMIN, KITCHEN, WAITER)
│   │   ├── MenuItem.js               # Menu item schema (with options)
│   │   └── Order.js                  # Order schema (with status workflow)
│   ├── routes/
│   │   ├── auth.js                   # Auth routes (login)
│   │   ├── users.js                  # Public user routes (login, waiters list)
│   │   ├── menuRoutes.js             # Public menu routes (get available items)
│   │   ├── orderRoutes.js            # Public order routes (create, track, status)
│   │   └── admin-crud/
│   │       ├── adminMenuRoutes.js    # Admin menu CRUD (create, update, delete)
│   │       └── adminUserRoutes.js    # Admin user CRUD (register, update, delete)
│   ├── package.json
│   └── package-lock.json
├── frontend2/                        # Vue 3 + Vite SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src/
│   │   ├── main.js                   # App entry point
│   │   ├── App.vue
│   │   ├── api/axios.js              # Centralized Axios instance (baseURL: <YOUR_LOCAL_IP>:5000/api)
│   │   ├── router/index.js           # Vue Router with auth guards
│   │   ├── views/
│   │   │   ├── LoginView.vue         # Login page
│   │   │   ├── Admin.vue             # Admin dashboard (menu & user management tabs)
│   │   │   ├── kitchen/
│   │   │   │   └── KitchenDashboard.vue  # Kitchen order management
│   │   │   └── client/
│   │   │       ├── Menu.vue          # Client menu & cart
│   │   │       └── OrderStatus.vue   # Order tracking page
│   │   ├── components/admin/
│   │   │   ├── AdminHeader.vue       # Admin header with tabs
│   │   │   ├── AdminTabs.vue         # Tab navigation
│   │   │   ├── MenuManager.vue       # Menu CRUD manager
│   │   │   ├── DishForm.vue          # Add/edit dish form
│   │   │   ├── DishTable.vue         # Dish list table
│   │   │   ├── UserManager.vue       # User CRUD manager
│   │   │   ├── UserForm.vue          # Add/edit user form
│   │   │   └── UserTable.vue         # User list table
│   │   └── assets/css/               # All stylesheets
│   └── public/                       # Static images
└── README.md
```

---

## Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** (via **Mongoose**) — Database
- **Socket.IO** — Real-time communication (new orders, status updates)
- **bcrypt** — Password hashing
- **cors** — Cross-origin resource sharing
- **dotenv** — Environment variable management
- **nodemon** (dev) — Auto-restart during development

### Frontend
- **Vue 3** (Composition API + `<script setup>`) — UI framework
- **Vite** — Build tool & dev server
- **Vue Router 4** — Client-side routing with auth guards
- **Axios** — HTTP client
- **Socket.IO Client** — Real-time updates

---

## Dependencies

### Backend (`backend/package.json`)

| Package | Version | Type | Description |
|---------|---------|------|-------------|
| `bcrypt` | ^6.0.0 | dependency | Password hashing |
| `cors` | ^2.8.5 | dependency | Cross-origin resource sharing |
| `dotenv` | ^16.4.5 | dependency | Environment variable management |
| `express` | ^4.19.2 | dependency | Web framework |
| `express-list-endpoints` | ^7.1.1 | dependency | Lists all registered routes at startup |
| `mongoose` | ^8.3.0 | dependency | MongoDB ODM |
| `multer` | ^2.3.0 | dependency | Multipart form-data (file uploads) |
| `socket.io` | ^4.7.5 | dependency | Real-time bidirectional communication |
| `nodemon` | ^3.1.0 | devDependency | Auto-restart server during development |

### Frontend (`frontend2/package.json`)

| Package | Version | Type | Description |
|---------|---------|------|-------------|
| `axios` | ^1.19.0 | dependency | HTTP client |
| `express-list-endpoints` | ^7.1.1 | dependency | Lists API endpoints (used in dev tooling) |
| `socket.io-client` | ^4.8.3 | dependency | Socket.IO client for real-time updates |
| `vue` | ^3.5.40 | dependency | Vue.js framework |
| `vue-router` | ^4.6.4 | dependency | Official router for Vue 3 |
| `@vitejs/plugin-vue` | ^6.0.8 | devDependency | Vite plugin for Vue SFC support |
| `vite` | ^8.2.0 | devDependency | Build tool and dev server |

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **MongoDB** — running locally on `mongodb://127.0.0.1:27017/cafe_db`

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd coffe_store_project
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cafe_db
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://<YOUR_LOCAL_IP>:5000/api`.

### 3. Set up the Frontend

```bash
cd ../frontend2
npm install
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> The Vite dev server proxies `/api` requests to `http://<YOUR_LOCAL_IP>:5000` automatically (see `vite.config.js`).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/cafe_db` | MongoDB connection string |

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/login` | Login with username + password; returns user info and role |
| GET | `/users/waiters` | Get all waiters (for kitchen waiter assignment) |
| GET | `/menu` | Get all available menu items |
| POST | `/orders` | Create a new order (emits `new_order` via Socket.IO) |
| GET | `/orders` | Get all active orders (for kitchen) |
| GET | `/orders/:id` | Get a specific order (for client tracking) |
| PUT | `/orders/:id/status` | Update order status (emits `order_status_updated`) |
| PUT | `/orders/:id/assign-waiter` | Assign a waiter to an order (emits `order_waiter_assigned`) |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/menu` | Get all menu items (including unavailable) |
| POST | `/admin/menu/create` | Create a new menu item |
| PUT | `/admin/menu/:id` | Update an existing menu item |
| DELETE | `/admin/menu/:id` | Delete a menu item |
| GET | `/admin/users` | Get all users (excludes password hashes) |
| POST | `/admin/users/register` | Register a new user |
| PUT | `/admin/users/:id` | Update a user |
| DELETE | `/admin/users/:id` | Delete a user |

---

## Frontend Routes

| Path | Name | Component | Auth Required |
|------|------|-----------|---------------|
| `/` | Login | `LoginView.vue` | No |
| `/admin` | Admin | `Admin.vue` | Yes (ADMIN) |
| `/kitchen` | Kitchen | `KitchenDashboard.vue` | Yes (KITCHEN) |
| `/table/:tableNumber` | CustomerMenu | `Menu.vue` | No |
| `/status/:orderId` | OrderStatus | `OrderStatus.vue` | No |

### Role-Based Access

- **ADMIN** → redirected to `/admin` after login
- **KITCHEN** → redirected to `/kitchen` after login
- **WAITER** → not currently redirected (login shows "Accès non autorisé")

---

## Usage

### For Customers
1. Navigate to `http://<YOUR_LOCAL_IP>:5173/table/1` (replace `1` with the table number)
2. Browse the menu by category
3. Add items to your cart
4. Click "Valider la commande" to place the order
5. You'll be redirected to the order status page to track your order in real-time

### For Kitchen Staff
1. Log in with a KITCHEN role account
2. View all active orders on the kitchen dashboard
3. Click "Lancer la préparation" to start preparing an order
4. Click "Marquer comme Prête" when the order is ready
5. Assign a waiter from the dropdown when the order is ready
6. Click "Terminer / Servie" once the order has been served

### For Admins
1. Log in with an ADMIN role account
2. Use the tab navigation to switch between **Gestion du Menu** and **Gestion des Utilisateurs**
3. **Menu tab**: Add, edit, or delete dishes
4. **Users tab**: Add, edit, or delete staff accounts (KITCHEN, WAITER, ADMIN roles)

---

## Seeding Test Data

The project includes a seeder script to populate the database with test users:

```bash
cd backend
node seeders.js
```

This creates three test users:
- `Sami` (WAITER) — password: `Sami123`
- `Youssef` (WAITER) — password: `Youssef123`
- `moataz` (ADMIN) — password: `moataz123`

---

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_order` | Server → Kitchen | Emitted when a new order is created |
| `order_status_updated` | Server → Kitchen & Client | Emitted when order status changes |
| `order_waiter_assigned` | Server → Kitchen | Emitted when a waiter is assigned to an order |

---

## Notes

- The backend uses `passwordHash` field directly (plaintext comparison in `users.js` login route) — this is for development only. In production, use proper bcrypt hashing.
- The Vite dev server proxies `/api` to the backend, so no CORS issues during development.
- The `auth.js` route file uses CommonJS (`require`) while the rest of the backend uses ES modules (`import`) — this file may need adjustment if used.
- **Socket.IO Configuration**: The Socket.IO client connections in `OrderStatus.vue` and `KitchenDashboard.vue` use the local network IP instead of `localhost` to ensure real-time updates work on mobile devices. Using `localhost` would only work on the machine running the backend server.

## Network Configuration

**For the Coffee Shop Owner/Developer:**

To access the application from mobile devices on the same network, you need to configure your local IP address in the following files. This is a one-time setup that the shop owner performs, not the customers.

### Finding Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for the IPv4 Address under your active network adapter (e.g., `192.168.1.28`).

**Mac/Linux:**
```bash
ifconfig
```
or
```bash
ip a
```
Look for the `inet` address under your active network adapter (e.g., `192.168.1.28`).

### Files to Update

Replace `<YOUR_LOCAL_IP>` with your actual local IP address in these files:

1. **`frontend2/src/api/axios.js`** (line 5):
   ```javascript
   baseURL: 'http://<YOUR_LOCAL_IP>:5000/api',
   ```

2. **`frontend2/src/views/client/OrderStatus.vue`** (line 71):
   ```javascript
   const socket = io('http://<YOUR_LOCAL_IP>:5000');
   ```

3. **`frontend2/src/views/kitchen/KitchenDashboard.vue`** (line 111):
   ```javascript
   const socket = io('http://<YOUR_LOCAL_IP>:5000');
   ```

4. **`frontend2/vite.config.js`** (line 11):
   ```javascript
   target: 'http://<YOUR_LOCAL_IP>:5000',
   ```

5. **`backend/scripts/generateTableQRs.js`** (line 10):
   ```javascript
   const LOCAL_IP = '<YOUR_LOCAL_IP>';
   ```

### Regenerating QR Codes

After updating the IP address, regenerate the QR codes for each table:

```bash
cd backend/scripts
node generateTableQRs.js
```

This will create new QR codes in `backend/public/qrcodes/` with the correct URLs containing your IP address.

### Example

If your local IP is `192.168.1.45`, the configuration would be:
- Axios baseURL: `http://192.168.1.45:5000/api`
- Socket.IO: `http://192.168.1.45:5000`
- Vite proxy: `http://192.168.1.45:5000`
- QR codes URL: `http://192.168.1.45:5173/table/{tableNumber}`

> **Important**: 
> - All devices (laptop, phone, tablet) must be connected to the same WiFi network.
> - If your IP address changes (e.g., router restart), you'll need to update these files and regenerate the QR codes.
> - Customers do not need to configure anything - they simply scan the QR code and use the app.
