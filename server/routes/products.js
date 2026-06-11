const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

// Get all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, purchase_price, selling_price, stock_quantity, category, image_url } = req.body;
    const id = uuidv4();
    
    const result = await req.app.locals.pool.query(
      'INSERT INTO products (id, user_id, name, description, purchase_price, selling_price, stock_quantity, category, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, req.user.id, name, description, purchase_price, selling_price, stock_quantity, category, image_url]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, purchase_price, selling_price, stock_quantity, category, image_url } = req.body;
    
    const result = await req.app.locals.pool.query(
      'UPDATE products SET name = $1, description = $2, purchase_price = $3, selling_price = $4, stock_quantity = $5, category = $6, image_url = $7 WHERE id = $8 AND user_id = $9 RETURNING *',
      [name, description, purchase_price, selling_price, stock_quantity, category, image_url, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.app.locals.pool.query(
      'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
