import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data based on API documentation
  const mockStats = {
    pendingReports: 15,
    reviewedToday: 5,
    totalApproved: 120,
    totalRejected: 8,
    autoApproved: 45,
    recentExpiringReports: [
      {
        _id: '1',
        societyAccountId: {
          _id: 's1',
          societyName: 'Green Valley Apartments'
        },
        expiresAt: '2026-02-09T10:30:00.000Z'
      },
      {
        _id: '2',
        societyAccountId: {
          _id: 's2',
          societyName: 'Sunrise Society'
        },
        expiresAt: '2026-02-10T10:30:00.000Z'
      }
    ]
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 800)
  }, [])

  const getDaysUntilExpiry = (dateString) => {
    const expiry = new Date(dateString)
    const today = new Date()
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Officer!</h2>
            <p className="text-blue-100">
              You have {stats.pendingReports} pending reports to review today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingReports}</p>
              <p className="text-warning text-sm mt-1">Needs review</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Reviewed Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reviewedToday}</p>
              <p className="text-success text-sm mt-1">+2 from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApproved}</p>
              <p className="text-primary text-sm mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Rejected</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRejected}</p>
              <p className="text-danger text-sm mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-danger" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Expiring Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pending-reports')}
              className="w-full flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-xl hover:bg-warning/10 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Review Pending</p>
                  <p className="text-sm text-gray-500">{stats.pendingReports} reports waiting</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-warning transition-colors" />
            </button>

            <button
              onClick={() => navigate('/reviewed-reports')}
              className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">View Reviewed</p>
                  <p className="text-sm text-gray-500">Check past decisions</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Expiring Soon</h3>
            <span className="text-sm text-gray-500">Reports expiring within 3 days</span>
          </div>
          
          {stats.recentExpiringReports.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExpiringReports.map((report) => {
                const daysLeft = getDaysUntilExpiry(report.expiresAt)
                return (
                  <div
                    key={report._id}
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-danger" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{report.societyAccountId.societyName}</p>
                        <p className="text-sm text-gray-500">Expires: {new Date(report.expiresAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      daysLeft <= 1 
                        ? 'bg-red-100 text-red-700' 
                        : daysLeft <= 2 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reports expiring soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-success/5 rounded-xl">
            <p className="text-3xl font-bold text-success">{stats.totalApproved}</p>
            <p className="text-gray-600 mt-1">Total Approved</p>
            <p className="text-sm text-gray-400">Reports verified</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-xl">
            <p className="text-3xl font-bold text-primary">{stats.autoApproved}</p>
            <p className="text-gray-600 mt-1">Auto Approved</p>
            <p className="text-sm text-gray-400">By AI system</p>
          </div>
          <div className="text-center p-4 bg-danger/5 rounded-xl">
            <p className="text-3xl font-bold text-danger">{stats.totalRejected}</p>
            <p className="text-gray-600 mt-1">Total Rejected</p>
            <p className="text-sm text-gray-400">Reports declined</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
