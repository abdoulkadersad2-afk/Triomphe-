const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

// Generate invoice number
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
}

// Create invoice from sale
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sale_id, client_name, client_phone, client_email, notes } = req.body;

    // Get sale details
    const saleResult = await req.app.locals.pool.query(
      'SELECT * FROM sales WHERE id = $1 AND user_id = $2',
      [sale_id, req.user.id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vente non trouvée' });
    }

    const sale = saleResult.rows[0];
    const invoiceId = uuidv4();
    const invoiceNumber = generateInvoiceNumber();

    const result = await req.app.locals.pool.query(
      `INSERT INTO invoices 
       (id, user_id, sale_id, client_name, client_phone, client_email, invoice_number, total_amount, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [invoiceId, req.user.id, sale_id, client_name, client_phone, client_email, invoiceNumber, sale.total_amount, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all invoices
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      `SELECT i.*, s.total_amount 
       FROM invoices i 
       JOIN sales s ON i.sale_id = s.id 
       WHERE i.user_id = $1 
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get invoice by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.app.locals.pool.query(
      `SELECT i.*, s.total_amount, s.total_cost, s.profit 
       FROM invoices i 
       JOIN sales s ON i.sale_id = s.id 
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send invoice via WhatsApp
router.post('/:id/send-whatsapp', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Get invoice
    const invoiceResult = await req.app.locals.pool.query(
      'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    const invoice = invoiceResult.rows[0];

    // Validate phone number
    if (!invoice.client_phone) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone manquant' });
    }

    // Format phone number (remove non-digits)
    const phoneNumber = invoice.client_phone.replace(/\D/g, '');
    if (phoneNumber.length < 10) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
    }

    // Create WhatsApp message
    const whatsappMessage = message || `Bonjour ${invoice.client_name},\n\n` +
      `Voici votre facture:\n\n` +
      `📄 Numéro: ${invoice.invoice_number}\n` +
      `💰 Montant: ${invoice.total_amount.toFixed(2)} XOF\n\n` +
      `Merci pour votre achat!`;

    // Note: For actual WhatsApp integration, you would use services like:
    // - Twilio WhatsApp API
    // - WhatsApp Business API
    // - Third-party services like Whatsapp

    // For now, we'll simulate and log the message
    console.log(`WhatsApp Message to ${phoneNumber}: ${whatsappMessage}`);

    // Update invoice
    const result = await req.app.locals.pool.query(
      'UPDATE invoices SET whatsapp_sent = true, whatsapp_sent_at = CURRENT_TIMESTAMP, status = $1 WHERE id = $2 RETURNING *',
      ['sent', id]
    );

    res.json({
      success: true,
      message: 'Facture envoyée via WhatsApp avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update invoice
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, client_phone, client_email, notes, status } = req.body;

    const result = await req.app.locals.pool.query(
      `UPDATE invoices 
       SET client_name = COALESCE($1, client_name),
           client_phone = COALESCE($2, client_phone),
           client_email = COALESCE($3, client_email),
           notes = COALESCE($4, notes),
           status = COALESCE($5, status)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [client_name, client_phone, client_email, notes, status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete invoice
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.app.locals.pool.query(
      'DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    res.json({ success: true, message: 'Facture supprimée' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get invoice details with items
router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.app.locals.pool.query(
      `SELECT i.*, s.total_amount, s.total_cost, s.profit, u.name as user_name, u.email as user_email
       FROM invoices i 
       JOIN sales s ON i.sale_id = s.id
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    // Get sale items
    const itemsResult = await req.app.locals.pool.query(
      `SELECT si.*, p.name as product_name 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [result.rows[0].sale_id]
    );

    res.json({ 
      success: true, 
      data: {
        invoice: result.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
