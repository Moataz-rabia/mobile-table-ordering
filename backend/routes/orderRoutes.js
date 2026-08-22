import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// 1. POST - Créer une nouvelle commande
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    req.io.emit('new_order', savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Mongoose Validation Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// 2. GET (Toutes les commandes) - POUR LA CUISINE
router.get('/', async (req, res) => {
  try {
    const activeOrders = await Order.find({
      status: { $nin: ['served', 'Served', 'completed', 'Completed'] }
    }).sort({ createdAt: -1 });

    res.json(activeOrders);
  } catch (error) {
    console.error("❌ Erreur GET /orders :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET PAR ID (Une seule commande) - POUR LE SUIVI CLIENT
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "ID de commande manquant." });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Erreur GET /orders/:id :", error.message);
    res.status(500).json({ error: "Format d'ID invalide." });
  }
});

// 4. PUT - Mettre à jour le statut depuis la cuisine
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    req.io.emit('order_status_updated', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/assign-waiter - Assigner un serveur à une commande
router.put('/:id/assign-waiter', async (req, res) => {
  try {
    const { waiterId } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { waiter: waiterId },
      { new: true }
    ).populate('waiter', 'username'); // Permet de récupérer le nom du serveur

    if (!updatedOrder) {
      return res.status(404).json({ error: "Commande non trouvée." });
    }

    req.io.emit('order_waiter_assigned', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;