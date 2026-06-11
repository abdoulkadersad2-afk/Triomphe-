import { useState, useEffect } from 'react'
import { Plus, Send, Trash2, Eye, MessageCircle } from 'lucide-react'
import api from '../utils/api'
import './Invoices.css'

function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(null)

  const [formData, setFormData] = useState({
    sale_id: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    notes: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices')
      setInvoices(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des factures')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await api.post('/invoices', formData)
      setSuccess('Facture créée avec succès')
      setFormData({
        sale_id: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        notes: ''
      })
      setShowForm(false)
      fetchInvoices()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      await api.delete(`/invoices/${id}`)
      setSuccess('Facture supprimée')
      fetchInvoices()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const handleSendWhatsApp = async (invoiceId) => {
    setSendingWhatsApp(invoiceId)
    setError('')

    try {
      await api.post(`/invoices/${invoiceId}/send-whatsapp`, {
        message: null
      })
      setSuccess('Facture envoyée via WhatsApp avec succès! 📱')
      fetchInvoices()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi WhatsApp')
    } finally {
      setSendingWhatsApp(null)
    }
  }

  const handleViewDetails = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/details`)
      setSelectedInvoice(response.data.data)
    } catch (err) {
      setError('Erreur lors du chargement des détails')
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="invoices-page">
      <div className="invoices-header">
        <h1>📄 Gestion des Factures</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="create-invoice-btn"
        >
          <Plus size={20} /> Créer Facture
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Créer une Facture</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>ID Vente *</label>
                <input
                  type="text"
                  name="sale_id"
                  placeholder="ID de la vente"
                  value={formData.sale_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom Client *</label>
                <input
                  type="text"
                  name="client_name"
                  placeholder="Nom du client"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="client_phone"
                  placeholder="+221 77 XXX XX XX"
                  value={formData.client_phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="client_email"
                  placeholder="client@email.com"
                  value={formData.client_email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Notes supplémentaires..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Créer Facture</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="cancel-btn"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="invoices-table-container">
        {invoices.length === 0 ? (
          <p className="empty-message">Aucune facture. Créez-en une!</p>
        ) : (
          <div className="table-responsive">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Montant</th>
                  <th>Status</th>
                  <th>WhatsApp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="invoice-number">{invoice.invoice_number}</td>
                    <td>{invoice.client_name}</td>
                    <td>{invoice.client_phone}</td>
                    <td className="amount">{invoice.total_amount.toFixed(2)} XOF</td>
                    <td>
                      <span className={`status ${invoice.status}`}>
                        {invoice.status === 'sent' ? '✓ Envoyée' : 'En attente'}
                      </span>
                    </td>
                    <td>
                      {invoice.whatsapp_sent ? (
                        <span className="whatsapp-badge">✓ Envoyée</span>
                      ) : (
                        <button
                          onClick={() => handleSendWhatsApp(invoice.id)}
                          disabled={sendingWhatsApp === invoice.id}
                          className="whatsapp-btn"
                          title="Envoyer par WhatsApp"
                        >
                          <MessageCircle size={16} />
                          {sendingWhatsApp === invoice.id ? 'Envoi...' : 'Envoyer'}
                        </button>
                      )}
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleViewDetails(invoice.id)}
                        className="view-btn"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="delete-btn"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails Facture</h2>
              <button onClick={() => setSelectedInvoice(null)} className="close-btn">
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="invoice-details">
                <div className="detail-row">
                  <span className="label">Numéro:</span>
                  <span className="value">{selectedInvoice.invoice.invoice_number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Client:</span>
                  <span className="value">{selectedInvoice.invoice.client_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Téléphone:</span>
                  <span className="value">{selectedInvoice.invoice.client_phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedInvoice.invoice.client_email || '-'}</span>
                </div>
                <div className="divider"></div>
                <div className="items-section">
                  <h3>Articles</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit_price.toFixed(2)} XOF</td>
                          <td>{item.total_price.toFixed(2)} XOF</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divider"></div>
                <div className="detail-row total">
                  <span className="label">Montant Total:</span>
                  <span className="value amount">{selectedInvoice.invoice.total_amount.toFixed(2)} XOF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invoices
