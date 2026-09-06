import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import listEndpoints from 'express-list-endpoints';
import path from 'path';

import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/users.js';

//admin routes
import adminMenuRoutes from './routes/admin-crud/adminMenuRoutes.js';
import adminUserRoutes from './routes/admin-crud/adminUserRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Allow requests from any origin (for QR code / mobile access)
app.use(cors({
  origin: '*'
}));

// Make socket.io available inside express routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});
// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

//admin routes
app.use('/api/admin/menu', adminMenuRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Serve QR codes statically
app.use('/qrcodes', express.static(path.join(process.cwd(), 'public', 'qrcodes')));


// Affiche la liste au démarrage du serveur
console.log('LISTE DES ENDPOINTS BACKEND :');
console.table(listEndpoints(app));

// Socket.IO Event Handler
io.on('connection', (socket) => {
  console.log(`⚡ Staff / Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

// Connect to Database & Start Server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });