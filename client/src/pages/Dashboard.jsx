import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import api from '../utils/api'
import StatCard from '../components/StatCard'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data.data)
      setError('')
    } catch (err) {
      setError('Erreur lors du chargement des statistiques')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Tableau de Bord</h1>
        <p className="subtitle">Vue d'ensemble de votre boutique</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <StatCard
              title="Ventes du Jour"
              value={`${stats.today.sales.toFixed(2)} XOF`}
              icon={<ShoppingCart size={24} />}
              color="blue"
            />
            <StatCard
              title="Bénéfice du Jour"
              value={`${stats.today.profit.toFixed(2)} XOF`}
              icon={<TrendingUp size={24} />}
              color="green"
            />
            <StatCard
              title="Transactions"
              value={stats.today.transactions}
              icon={<ShoppingCart size={24} />}
              color="purple"
            />
            <StatCard
              title="Articles en Stock"
              value={stats.products.totalStock}
              icon={<Package size={24} />}
              color="orange"
            />
          </div>

          <div className="dashboard-content">
            <div className="section">
              <h2>📦 Produits</h2>
              <div className="info-card">
                <p>Total de produits: <strong>{stats.products.total}</strong></p>
                <p>Stock total: <strong>{stats.products.totalStock}</strong> articles</p>
              </div>
            </div>

            {stats.products.lowStock.length > 0 && (
              <div className="section alert">
                <h2>⚠️ Produits en Stock Faible</h2>
                <div className="low-stock-list">
                  {stats.products.lowStock.map((product) => (
                    <div key={product.id} className="low-stock-item">
                      <AlertTriangle size={18} />
                      <span>{product.name}</span>
                      <strong>{product.stock_quantity} articles</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
