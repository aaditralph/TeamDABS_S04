import React, { useState } from 'react'
import { Shield, Lock, User, Mail } from 'lucide-react'
import axios from 'axios'

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      // Registration successful - auto login and redirect to dashboard
      const userData = {
        token: 'token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          name: formData.name,
          email: formData.email,
          role: 11,
          isSuperAdmin: false
        }
      }
      onLogin(userData)
      setLoading(false)
      return
    }

    // Login without backend - accept any credentials
    const userData = {
      token: 'token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        name: formData.email.split('@')[0],
        email: formData.email,
        role: 11,
        isSuperAdmin: false
      }
    }
    onLogin(userData)
    setLoading(false)
  }

  const switchToLogin = () => {
    setIsRegistering(false)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-blue-900 to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-white/95 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BMC Admin Portal</h1>
            <p className="text-gray-600 mt-2">
              {isRegistering ? 'Create New Account' : 'Municipal Corporation Building Oversight'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your BMC email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Confirm your password"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
            </button>
          </form>

          {!isRegistering && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsRegistering(true)}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                Don't have an account? Register
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Authorized Personnel Only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
