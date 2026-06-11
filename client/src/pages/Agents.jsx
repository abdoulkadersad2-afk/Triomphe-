import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, Eye } from 'lucide-react'
import api from '../utils/api'
import './Agents.css'

function Agents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [agentSales, setAgentSales] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: '',
    commission_percentage: 0
  })

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents')
      setAgents(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des agents')
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
        await api.put(`/agents/${editing.id}`, {
          shop_name: formData.shop_name,
          commission_percentage: formData.commission_percentage,
          is_active: true
        })
        setSuccess('Agent modifié avec succès')
      } else {
        await api.post('/agents', formData)
        setSuccess('Agent créé avec succès')
      }
      
      setFormData({
        name: '',
        email: '',
        password: '',
        shop_name: '',
        commission_percentage: 0
      })
      setEditing(null)
      setShowForm(false)
      fetchAgents()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (agent) => {
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      password: '',
      shop_name: agent.shop_name || '',
      commission_percentage: agent.commission_percentage || 0
    })
    setEditing(agent)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent?')) return

    try {
      await api.delete(`/agents/${id}`)
      setSuccess('Agent supprimé')
      fetchAgents()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de la suppression')
    }
  }

  const handleViewSales = async (agent) => {
    try {
      const response = await api.get(`/agents/${agent.id}/sales`)
      setSelectedAgent(agent)
      setAgentSales(response.data.data || [])
    } catch (err) {
      setError('Erreur lors du chargement des ventes')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      shop_name: '',
      commission_percentage: 0
    })
    setEditing(null)
    setShowForm(false)
    setError('')
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="agents-page">
      <div className="agents-header">
        <h1>👥 Gestion des Agents</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-agent-btn"
        >
          <Plus size={20} /> Créer un Agent
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editing ? 'Modifier' : 'Créer'} un Agent</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom Complet *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                  required={!editing}
                  disabled={editing}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="agent@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required={!editing}
                  disabled={editing}
                />
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe sécurisé"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Nom de la Boutique</label>
                <input
                  type="text"
                  name="shop_name"
                  placeholder="Ma Boutique"
                  value={formData.shop_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Commission (%)</label>
                <input
                  type="number"
                  name="commission_percentage"
                  placeholder="0"
                  step="0.01"
                  value={formData.commission_percentage}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <Save size={18} /> {editing ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                <X size={18} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="agents-grid">
        {agents.length === 0 ? (
          <p className="empty-message">Aucun agent. Créez-en un pour commencer!</p>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-avatar">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="agent-basic-info">
                  <h3>{agent.name}</h3>
                  <p className="email">{agent.email}</p>
                </div>
              </div>
              
              <div className="agent-details">
                {agent.shop_name && (
                  <div className="detail-item">
                    <span className="label">Boutique:</span>
                    <span className="value">{agent.shop_name}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Commission:</span>
                  <span className="value">{agent.commission_percentage}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`status ${agent.is_active ? 'active' : 'inactive'}`}>
                    {agent.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              <div className="agent-actions">
                <button
                  onClick={() => handleViewSales(agent)}
                  className="view-btn"
                  title="Voir les ventes"
                >
                  <Eye size={18} /> Ventes
                </button>
                <button
                  onClick={() => handleEdit(agent)}
                  className="edit-btn"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="delete-btn"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAgent && (
        <div className="modal-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ventes de {selectedAgent.name}</h2>
              <button onClick={() => setSelectedAgent(null)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              {agentSales.length === 0 ? (
                <p>Aucune vente enregistrée</p>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Bénéfice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentSales.map(sale => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                        <td>{sale.total_amount.toFixed(2)} XOF</td>
                        <td className="profit">{sale.profit.toFixed(2)} XOF</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agents
