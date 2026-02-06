import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PendingReports from './pages/PendingReports'
import ReportDetail from './pages/ReportDetail'
import ReviewedReports from './pages/ReviewedReports'
import Notifications from './pages/Notifications'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Clear any existing session on app load
    localStorage.removeItem('officerToken')
    localStorage.removeItem('officerUser')
    setUser(null)
    setLoading(false)
  }, [])

  const handleLogin = (data) => {
    localStorage.setItem('officerToken', data.token)
    localStorage.setItem('officerUser', JSON.stringify(data.user))
    setUser(data.user)
  }

  const handleLogout = () => {
    localStorage.removeItem('officerToken')
    localStorage.removeItem('officerUser')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sidebar via-slate-800 to-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} />
      <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="pending-reports" element={<PendingReports />} />
        <Route path="reviewed-reports" element={<ReviewedReports />} />
        <Route path="report/:id" element={<ReportDetail />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}

export default App
