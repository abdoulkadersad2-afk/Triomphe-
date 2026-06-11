import { useState, useEffect } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import api from '../utils/api'
import './Sales.css'

function Sales() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des produits')
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      setError('Produit en rupture de stock')
      return
    }

    const existingItem = cartItems.find(item => item.product_id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCartItems(cartItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setError('Stock insuffisant')
      }
    } else {
      setCartItems([...cartItems, {
        product_id: product.id,
        product_name: product.name,
        selling_price: product.selling_price,
        quantity: 1
      }])
    }
    setError('')
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      const product = products.find(p => p.id === productId)
      if (quantity <= product.stock_quantity) {
        setCartItems(cartItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity }
            : item
        ))
      }
    }
  }

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId))
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.selling_price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Le panier est vide')
      return
    }

    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const saleData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      }

      await api.post('/sales', saleData)
      setSuccess('Vente enregistrée avec succès! 🎉')
      setCartItems([])
      fetchProducts()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la vente')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="loading">Chargement des produits...</div>

  const total = calculateTotal()

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>🛒 Enregistrer une Vente</h1>
        <p>Sélectionnez les produits et validez la vente</p>
      </div>

      <div className="sales-container">
        <div className="products-section">
          <h2>Produits Disponibles</h2>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <div className="products-grid">
            {products.length === 0 ? (
              <p className="empty-message">Aucun produit disponible</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image" style={{
                    background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#f093fb', '#4facfe'][Math.floor(Math.random() * 4)]}, ${['#764ba2', '#667eea', '#43e97b', '#38f9d7'][Math.floor(Math.random() * 4)]})`
                  }}>
                    <span className="stock-badge">{product.stock_quantity} en stock</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">{product.selling_price.toFixed(2)} XOF</p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity <= 0}
                      className="add-btn"
                    >
                      <Plus size={20} /> Ajouter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cart-section">
          <h2>🛍️ Panier</h2>
          
          {cartItems.length === 0 ? (
            <p className="empty-cart">Panier vide</p>
          ) : (
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>{item.selling_price.toFixed(2)} XOF</p>
                  </div>
                  <div className="quantity-control">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                    />
                  </div>
                  <div className="item-total">
                    {(item.selling_price * item.quantity).toFixed(2)} XOF
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="remove-btn"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cart-footer">
            <div className="total-section">
              <span>Total:</span>
              <strong className="total-amount">{total.toFixed(2)} XOF</strong>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || processing}
              className="checkout-btn"
            >
              <Check size={20} />
              {processing ? 'Traitement...' : 'Valider la Vente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales
