const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

// Create a sale
router.post('/', authMiddleware, async (req, res) => {
  const client = await req.app.locals.pool.connect();
  try {
    await client.query('BEGIN');
    
    const { items } = req.body; // items: [{product_id, quantity}, ...]
    const saleId = uuidv4();
    let totalAmount = 0;
    let totalCost = 0;
    
    // Process each item
    for (const item of items) {
      // Get product details
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 AND user_id = $2',
        [item.product_id, req.user.id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error(`Produit ${item.product_id} non trouvé`);
      }
      
      const product = productResult.rows[0];
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }
      
      const lineAmount = product.selling_price * item.quantity;
      const lineCost = product.purchase_price * item.quantity;
      totalAmount += lineAmount;
      totalCost += lineCost;
      
      // Create sale item
      await client.query(
        'INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)',
        [uuidv4(), saleId, item.product_id, item.quantity, product.selling_price, lineAmount]
      );
      
      // Update product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    const profit = totalAmount - totalCost;
    
    // Create sale record
    const saleResult = await client.query(
      'INSERT INTO sales (id, user_id, total_amount, total_cost, profit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [saleId, req.user.id, totalAmount, totalCost, profit]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({ success: true, data: saleResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Get all sales
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'SELECT s.*, json_agg(json_build_object(\'product_id\', si.product_id, \'quantity\', si.quantity, \'unit_price\', si.unit_price)) as items FROM sales s LEFT JOIN sale_items si ON s.id = si.sale_id WHERE s.user_id = $1 GROUP BY s.id ORDER BY s.created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
