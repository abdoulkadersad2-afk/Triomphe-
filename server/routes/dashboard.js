const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's sales
    const salesResult = await req.app.locals.pool.query(
      'SELECT SUM(total_amount) as total_sales, SUM(profit) as total_profit, COUNT(*) as sales_count FROM sales WHERE user_id = $1 AND DATE(created_at) = DATE($2)',
      [req.user.id, today]
    );
    
    // Get products count
    const productsResult = await req.app.locals.pool.query(
      'SELECT COUNT(*) as products_count, SUM(stock_quantity) as total_stock FROM products WHERE user_id = $1',
      [req.user.id]
    );
    
    // Get low stock products
    const lowStockResult = await req.app.locals.pool.query(
      'SELECT * FROM products WHERE user_id = $1 AND stock_quantity < 10 ORDER BY stock_quantity ASC',
      [req.user.id]
    );
    
    const stats = {
      today: {
        sales: parseFloat(salesResult.rows[0].total_sales || 0),
        profit: parseFloat(salesResult.rows[0].total_profit || 0),
        transactions: parseInt(salesResult.rows[0].sales_count || 0)
      },
      products: {
        total: parseInt(productsResult.rows[0].products_count || 0),
        totalStock: parseInt(productsResult.rows[0].total_stock || 0),
        lowStock: lowStockResult.rows
      }
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
