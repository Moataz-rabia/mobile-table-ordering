import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// 1. POST /api/users/login - Connexion et vérification du rôle
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Recherche de l'utilisateur en base
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe (comparaison simple ou bcrypt)
    if (user.passwordHash !== password) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Connexion réussie : renvoie les infos de l'utilisateur et son rôle
    res.json({
      message: "Connexion réussie",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role // 'ADMIN', 'COOK', ou 'WAITER'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/users/waiters - Récupère la liste des serveurs pour la cuisine
router.get('/waiters', async (req, res) => {
  try {
    const waiters = await User.find({ role: 'WAITER' }).select('username _id');
    res.json(waiters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;