import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  MapPin, 
  Eye, 
  CheckCircle, 
  Building2,
  Filter,
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { reportsAPI } from '../services/api'

const PendingReports = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [threshold, setThreshold] = useState(50)

  useEffect(() => {
    fetchPendingReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [searchTerm, filterStatus, reports])

  const fetchPendingReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await reportsAPI.getOfficerPending()
      const data = response.data.data
      setReports(data?.reports || [])
      setFilteredReports(data?.reports || [])
      setThreshold(data?.autoApprovalThreshold || 50)
    } catch (err) {
      console.error('Error fetching pending reports:', err)
      setError(err.response?.data?.message || 'Failed to load pending reports')
    } finally {
      setLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = [...reports]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const societyName = report.society?.societyName || report.societyAccountId?.societyName || ''
        const submitterName = report.submittedBy?.name || ''
        return (
          societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submitterName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // AI Score filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => {
        const score = report.aiTrustScore || 0
        if (filterStatus === 'high') return score >= 80
        if (filterStatus === 'medium') return score >= 50 && score < 80
        if (filterStatus === 'low') return score < 50
        return true
      })
    }

    setFilteredReports(filtered)
  }

  const getDaysUntilExpiry = (dateString) => {
    if (!dateString) return 0
    const expiry = new Date(dateString)
    const today = new Date()
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchPendingReports} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Reports</h2>
          <p className="text-gray-500 mt-1">Review and verify society submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredReports.length} of {reports.length} reports
          </span>
        </div>
      </div>

      {/* Guidelines Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Review Guidelines</p>
          <p>
            Reports with Verification Score ≥ {threshold}% are auto-approved. 
            Please prioritize reports with low verification scores or those expiring soon.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by society or resident name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Scores</option>
              <option value="high">High Trust (≥80%)</option>
              <option value="medium">Medium Trust (50-79%)</option>
              <option value="low">Low Trust (&lt;50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const daysLeft = getDaysUntilExpiry(report.expiresAt)
          const societyName = report.society?.societyName || report.societyAccountId?.societyName || 'Unknown Society'
          const submitterName = report.submittedBy?.name || 'Unknown'
          
          return (
            <div key={report.reportId || report._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Society Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">{societyName}</h3>
                        {report.aiTrustScore && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(report.aiTrustScore)}`}>
                            Verification Score: {report.aiTrustScore}%
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Submitted: {formatDate(report.submissionDate)}</span>
                        </span>
                        {report.gpsMetadata && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Lat: {report.gpsMetadata.latitude?.toFixed(4)}, Lng: {report.gpsMetadata.longitude?.toFixed(4)}</span>
                          </span>
                        )}
                        <span className={`flex items-center space-x-1 font-medium ${
                          daysLeft <= 2 ? 'text-red-600' : daysLeft <= 4 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          <Clock className="w-4 h-4" />
                          <span>{daysLeft} days left</span>
                        </span>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium">Submitted by:</span> {submitterName}
                        </span>
                        {report.submissionImages && (
                          <span className="text-gray-600">
                            <span className="font-medium">Images:</span> {report.submissionImages.length}
                          </span>
                        )}
                        {report.iotSensorData && (
                          <span className="text-gray-600">
                            <span className="font-medium">IoT:</span> {report.iotSensorData.vibrationStatus === 'DETECTED' ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(`/report/${report.reportId || report._id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {report.verificationProbability && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Verification Probability</span>
                    <span className="font-semibold text-gray-900">{report.verificationProbability}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        report.verificationProbability >= 80 ? 'bg-green-500' :
                        report.verificationProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${report.verificationProbability}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No matching reports' : 'No pending reports'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'All reports have been reviewed. Great job!'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default PendingReports