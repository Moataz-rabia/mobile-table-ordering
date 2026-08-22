import express from 'express';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new menu item
router.post('/', async (req, res) => {
  try {
    const newItem = await MenuItem.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;