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
import { dashboardAPI, reportsAPI } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentPending, setRecentPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dashboard stats and pending reports in parallel
      const [statsRes, pendingRes] = await Promise.all([
        dashboardAPI.getStats(),
        reportsAPI.getOfficerPending()
      ])
      
      setStats(statsRes.data.data)
      // Get first 3 pending reports for display
      setRecentPending(pendingRes.data.data?.reports?.slice(0, 3) || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilExpiry = (dateString) => {
    const expiry = new Date(dateString)
    const today = new Date()
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    const isAuthError = error.includes('token') || error.includes('authorized') || error.includes('Token')
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isAuthError ? 'Session Expired' : 'Error Loading Dashboard'}
        </h3>
        <p className="text-gray-500 mb-4">
          {isAuthError 
            ? 'Your session has expired. Please login again.' 
            : error
          }
        </p>
        {isAuthError ? (
          <button onClick={() => window.location.href = '/login'} className="btn-primary">
            Login Again
          </button>
        ) : (
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        )}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Officer!</h2>
            <p className="text-emerald-100">
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
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingReports}</p>
              <p className="text-yellow-600 text-sm mt-1">Needs review</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Reviewed Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reviewedToday}</p>
              <p className="text-green-600 text-sm mt-1">Today's work</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApproved}</p>
              <p className="text-emerald-600 text-sm mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Rejected</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRejected}</p>
              <p className="text-red-600 text-sm mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pending-reports')}
              className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-700" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Review Pending</p>
                  <p className="text-sm text-gray-500">{stats.pendingReports} reports waiting</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/reviewed-reports')}
              className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">View Reviewed</p>
                  <p className="text-sm text-gray-500">Check past decisions</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">All Reports</p>
                  <p className="text-sm text-gray-500">Browse all reports</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Expiring Soon</h3>
            <span className="text-sm text-gray-500">Reports expiring within 3 days</span>
          </div>
          
          {stats.recentExpiringReports?.length > 0 ? (
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
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {report.societyAccountId?.societyName || 'Unknown Society'}
                        </p>
                        <p className="text-sm text-gray-500">Expires: {formatDate(report.expiresAt)}</p>
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

      {/* Recent Pending Reports */}
      {recentPending.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Pending Reports</h3>
            <button 
              onClick={() => navigate('/pending-reports')}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentPending.map((report) => (
              <div
                key={report.reportId || report._id}
                onClick={() => navigate(`/report/${report.reportId || report._id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {report.society?.societyName || report.societyAccountId?.societyName || 'Unknown Society'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted by: {report.submittedBy?.name || 'Unknown'} • {formatDate(report.submissionDate)}
                    </p>
                  </div>
                </div>
                {report.aiTrustScore && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{report.aiTrustScore}%</p>
                    <p className="text-xs text-gray-500">AI Trust Score</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{stats.totalApproved}</p>
            <p className="text-gray-600 mt-1">Total Approved</p>
            <p className="text-sm text-gray-400">Reports verified</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-600">{stats.autoApproved}</p>
            <p className="text-gray-600 mt-1">Auto Approved</p>
            <p className="text-sm text-gray-400">By AI system</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-3xl font-bold text-red-600">{stats.totalRejected}</p>
            <p className="text-gray-600 mt-1">Total Rejected</p>
            <p className="text-sm text-gray-400">Reports declined</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard