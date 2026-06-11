import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import api from '../utils/api'
import './Inventory.css'

function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(''))

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    category: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement')
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
      if (editing) {
        await api.put(`/products/${editing.id}`, formData)
        setSuccess('Produit modifié avec succès')
      } else {
        await api.post('/products', formData)
        setSuccess('Produit ajouté avec succès')
      }
      
      setFormData({
        name: '',
        description: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        category: ''
      })
      setEditing(null)
      setShowForm(false)
      fetchProducts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      stock_quantity: product.stock_quantity,
      category: product.category || ''
    })
    setEditing(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return

    try {
      await api.delete(`/products/${id}`)
      setSuccess('Produit supprimé')
      fetchProducts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      purchase_price: '',
      selling_price: '',
      stock_quantity: '',
      category: ''
    })
    setEditing(null)
    setShowForm(false)
    setError('')
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>📦 Inventaire / Stock</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-product-btn"
        >
          <Plus size={20} /> Ajouter un Produit
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editing ? 'Modifier' : 'Ajouter'} un Produit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom du Produit *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: T-Shirt Bleu"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ex: Vêtements"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Prix d\'Achat (XOF) *</label>
                <input
                  type="number"
                  name="purchase_price"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prix de Vente (XOF) *</label>
                <input
                  type="number"
                  name="selling_price"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantité en Stock *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Description du produit..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <Save size={18} /> {editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                <X size={18} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-container">
        {products.length === 0 ? (
          <p className="empty-message">Aucun produit. Commencez par en ajouter un!</p>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th>Prix d\'Achat</th>
                  <th>Prix de Vente</th>
                  <th>Marge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const margin = ((product.selling_price - product.purchase_price) / product.purchase_price * 100).toFixed(1)
                  return (
                    <tr key={product.id} className={product.stock_quantity < 10 ? 'low-stock' : ''}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category || '-'}</td>
                      <td>
                        <span className={`stock-badge ${product.stock_quantity < 10 ? 'warning' : ''}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td>{product.purchase_price.toFixed(2)} XOF</td>
                      <td>{product.selling_price.toFixed(2)} XOF</td>
                      <td className="margin">{margin}%</td>
                      <td className="actions">
                        <button
                          onClick={() => handleEdit(product)}
                          className="edit-btn"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="delete-btn"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
