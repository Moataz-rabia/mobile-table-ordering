import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/waiters - Récupère uniquement la liste des serveurs
router.get('/waiters', async (req, res) => {
  try {
    const waiters = await User.find({ role: 'WAITER' }).select('username _id');
    res.json(waiters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;