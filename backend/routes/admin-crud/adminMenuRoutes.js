import express from 'express';
import MenuItem from '../../models/MenuItem.js';

const router = express.Router();

// GET /api/admin/menu - Get all menu items (including unavailable)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/menu/:id - Update an existing menu item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Plat non trouvé" });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/menu/:id - Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Plat non trouvé" });
    res.json({ message: "Plat supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/create', async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
export default router;