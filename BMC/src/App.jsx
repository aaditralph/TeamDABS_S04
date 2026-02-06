import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PendingReports from './pages/PendingReports'
import ReviewedReports from './pages/ReviewedReports'
import AllReports from './pages/AllReports'
import ReportDetail from './pages/ReportDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('officerToken')
    const userData = localStorage.getItem('officerUser')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        console.log('✅ Restored session for:', parsedUser.email)
      } catch (e) {
        console.error('❌ Failed to parse user data:', e)
        localStorage.removeItem('officerToken')
        localStorage.removeItem('officerUser')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (data) => {
    console.log('✅ Login successful, storing token...')
    localStorage.setItem('officerToken', data.token)
    localStorage.setItem('officerUser', JSON.stringify(data.user))
    setUser(data.user)
  }

  const handleLogout = () => {
    console.log('👋 Logging out...')
    localStorage.removeItem('officerToken')
    localStorage.removeItem('officerUser')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
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
        <Route path="reports" element={<AllReports />} />
        <Route path="report/:id" element={<ReportDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App