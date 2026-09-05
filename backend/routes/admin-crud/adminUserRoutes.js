import express from 'express';
import User from '../../models/User.js';

const router = express.Router();

// GET /api/admin/users - Get all staff users (excl. password hashes)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/users/register - Create a new user account
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Nom d'utilisateur déjà existant" });
    }

    const newUser = await User.create({
      username,
      passwordHash: password, // Aligned with your User schema
      role
    });

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      role: newUser.role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id - Update a user account
router.put('/:id', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, passwordHash: password, role },
      { new: true, select: '-passwordHash' }
    );

    if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user account
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;