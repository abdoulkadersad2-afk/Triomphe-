import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Inventory from './pages/Inventory'
import Agents from './pages/Agents'
import Invoices from './pages/Invoices'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="/*" element={<Login setUser={setUser} />} />
        ) : (
          <Route element={<Layout user={user} setUser={setUser} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>
        )}
      </Routes>
    </Router>
  )
}

export default App
