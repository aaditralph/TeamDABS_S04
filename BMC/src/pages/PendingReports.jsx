import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  MapPin, 
  Eye, 
  CheckCircle, 
  XCircle,
  Calendar,
  Building2,
  Filter,
  Search
} from 'lucide-react'

const PendingReports = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data based on API documentation
  const mockReports = [
    {
      _id: '1',
      submissionDate: '2026-02-06T10:30:00.000Z',
      society: {
        id: 's1',
        societyName: 'Green Valley Apartments',
        email: 'greenvalley@society.com',
        phone: '9876543210'
      },
      submittedBy: {
        id: 'u1',
        name: 'Jane Resident',
        email: 'jane.resident@email.com'
      },
      submissionImages: [
        { url: '/api/placeholder/400/300', label: 'meter_image' },
        { url: '/api/placeholder/400/300', label: 'composter_image' }
      ],
      gpsMetadata: {
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: 10
      },
      iotSensorData: {
        deviceId: 'IOT-001',
        deviceType: 'VIBRATION_SENSOR',
        vibrationStatus: 'DETECTED',
        sensorValue: 0.75,
        batteryLevel: 85,
        isOnline: true
      },
      aiTrustScore: 78,
      verificationProbability: 82,
      expiresAt: '2026-02-13T10:30:00.000Z'
    },
    {
      _id: '2',
      submissionDate: '2026-02-05T14:20:00.000Z',
      society: {
        id: 's2',
        societyName: 'Sunrise Residency',
        email: 'sunrise@society.com',
        phone: '9876543211'
      },
      submittedBy: {
        id: 'u2',
        name: 'John Smith',
        email: 'john.smith@email.com'
      },
      submissionImages: [
        { url: '/api/placeholder/400/300', label: 'meter_image' }
      ],
      gpsMetadata: {
        latitude: 19.0820,
        longitude: 72.8900,
        accuracy: 8
      },
      iotSensorData: {
        deviceId: 'IOT-002',
        deviceType: 'VIBRATION_SENSOR',
        vibrationStatus: 'DETECTED',
        sensorValue: 0.85,
        batteryLevel: 92,
        isOnline: true
      },
      aiTrustScore: 92,
      verificationProbability: 95,
      expiresAt: '2026-02-12T14:20:00.000Z'
    },
    {
      _id: '3',
      submissionDate: '2026-02-04T09:15:00.000Z',
      society: {
        id: 's3',
        societyName: 'Metro Heights',
        email: 'metro@society.com',
        phone: '9876543212'
      },
      submittedBy: {
        id: 'u3',
        name: 'Alice Johnson',
        email: 'alice.j@email.com'
      },
      submissionImages: [
        { url: '/api/placeholder/400/300', label: 'meter_image' },
        { url: '/api/placeholder/400/300', label: 'composter_image' }
      ],
      gpsMetadata: {
        latitude: 19.0650,
        longitude: 72.8650,
        accuracy: 12
      },
      iotSensorData: {
        deviceId: 'IOT-003',
        deviceType: 'VIBRATION_SENSOR',
        vibrationStatus: 'NOT_DETECTED',
        sensorValue: 0.15,
        batteryLevel: 45,
        isOnline: true
      },
      aiTrustScore: 35,
      verificationProbability: 40,
      expiresAt: '2026-02-11T09:15:00.000Z'
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 800)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.society.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'high') return matchesSearch && report.aiTrustScore >= 80
    if (filterStatus === 'medium') return matchesSearch && report.aiTrustScore >= 50 && report.aiTrustScore < 80
    if (filterStatus === 'low') return matchesSearch && report.aiTrustScore < 50
    return matchesSearch
  })

  const getDaysUntilExpiry = (dateString) => {
    const expiry = new Date(dateString)
    const today = new Date()
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success bg-emerald-50 border-emerald-200'
    if (score >= 50) return 'text-warning bg-yellow-50 border-yellow-200'
    return 'text-danger bg-red-50 border-red-200'
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
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          return (
            <div key={report._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Society Info */}
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">{report.society.societyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(report.aiTrustScore)}`}>
                          AI Score: {report.aiTrustScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted: {new Date(report.submissionDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Lat: {report.gpsMetadata.latitude.toFixed(4)}, Lng: {report.gpsMetadata.longitude.toFixed(4)}</span>
                        </span>
                        <span className={`flex items-center space-x-1 font-medium ${
                          daysLeft <= 2 ? 'text-danger' : daysLeft <= 4 ? 'text-warning' : 'text-gray-500'
                        }`}>
                          <Clock className="w-4 h-4" />
                          <span>{daysLeft} days left</span>
                        </span>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium">Submitted by:</span> {report.submittedBy.name}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium">Images:</span> {report.submissionImages.length}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium">IoT:</span> {report.iotSensorData.vibrationStatus === 'DETECTED' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Verification Probability</span>
                  <span className="font-semibold text-gray-900">{report.verificationProbability}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      report.verificationProbability >= 80 ? 'bg-success' :
                      report.verificationProbability >= 50 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${report.verificationProbability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending reports</h3>
          <p className="text-gray-500">All reports have been reviewed</p>
        </div>
      )}
    </div>
  )
}

export default PendingReports
