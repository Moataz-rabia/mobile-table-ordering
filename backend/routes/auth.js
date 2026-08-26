const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Assurez-vous d'avoir installé bcryptjs

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Vérification du mot de passe (ou comparaison directe si pas encore hashé)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    // On renvoie l'utilisateur et son rôle
    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        username: user.username,
        role: user.role // 'admin' ou 'cook'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;