import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Users, FileText } from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

function Layout({ user, setUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>🏪 Triomphe</h1>
          </div>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li>
              <a
                href="/"
                className={isActive('/') ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                📊 Tableau de Bord
              </a>
            </li>
            <li>
              <a
                href="/sales"
                className={isActive('/sales') ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                🛒 Ventes
              </a>
            </li>
            <li>
              <a
                href="/inventory"
                className={isActive('/inventory') ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                📦 Inventaire
              </a>
            </li>
            <li>
              <a
                href="/agents"
                className={isActive('/agents') ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                <Users size={18} /> Agents
              </a>
            </li>
            <li>
              <a
                href="/invoices"
                className={isActive('/invoices') ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                <FileText size={18} /> Factures
              </a>
            </li>
          </ul>

          <div className="nav-user">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn" title="Se déconnecter">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
