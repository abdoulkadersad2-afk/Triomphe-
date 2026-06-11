const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get all agents for the current shop owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      `SELECT a.*, u.name, u.email, u.is_active 
       FROM agents a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.owner_id = $1 
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new agent account
router.post('/', authMiddleware, async (req, res) => {
  const client = await req.app.locals.pool.connect();
  try {
    await client.query('BEGIN');

    const { name, email, password, shop_name, commission_percentage } = req.body;

    // Check if email already exists
    const checkResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    const userId = uuidv4();
    const agentId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user for agent
    await client.query(
      'INSERT INTO users (id, name, email, password, role, owner_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, name, email, hashedPassword, 'agent', req.user.id]
    );

    // Create agent record
    const agentResult = await client.query(
      'INSERT INTO agents (id, owner_id, user_id, shop_name, commission_percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [agentId, req.user.id, userId, shop_name, commission_percentage || 0]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Compte agent créé avec succès',
      data: agentResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Update agent details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { shop_name, commission_percentage, is_active } = req.body;

    const result = await req.app.locals.pool.query(
      'UPDATE agents SET shop_name = $1, commission_percentage = $2, is_active = $3 WHERE id = $4 AND owner_id = $5 RETURNING *',
      [shop_name, commission_percentage, is_active, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent non trouvé' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete agent
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await req.app.locals.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get agent to find user_id
    const agentResult = await client.query(
      'SELECT user_id FROM agents WHERE id = $1 AND owner_id = $2',
      [id, req.user.id]
    );

    if (agentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Agent non trouvé' });
    }

    const userId = agentResult.rows[0].user_id;

    // Delete agent
    await client.query('DELETE FROM agents WHERE id = $1', [id]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({ success: true, message: 'Agent supprimé avec succès' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Get agent's sales
router.get('/:id/sales', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get user_id for the agent
    const agentResult = await req.app.locals.pool.query(
      'SELECT user_id FROM agents WHERE id = $1 AND owner_id = $2',
      [id, req.user.id]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent non trouvé' });
    }

    const userId = agentResult.rows[0].user_id;

    const result = await req.app.locals.pool.query(
      'SELECT * FROM sales WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
