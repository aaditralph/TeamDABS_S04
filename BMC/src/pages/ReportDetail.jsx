import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Building2,
  CheckCircle,
  XCircle,
  Activity,
  Battery,
  Signal,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

const ReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rebateAmount, setRebateAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Mock data
  const mockReport = {
    _id: id,
    societyAccountId: {
      _id: 's1',
      societyName: 'Green Valley Apartments',
      email: 'greenvalley@society.com',
      phone: '9876543210',
      address: '123 Green Valley Road, Mumbai'
    },
    submittedBy: {
      _id: 'u1',
      name: 'Jane Resident',
      email: 'jane.resident@email.com',
      phone: '9876543210'
    },
    submissionImages: [
      {
        url: '/api/placeholder/600/400',
        uploadedAt: '2026-02-06T10:30:00.000Z',
        label: 'meter_image',
        gpsMetadata: {
          latitude: 19.0760,
          longitude: 72.8777,
          accuracy: 10,
          timestamp: '2026-02-06T10:25:00.000Z'
        }
      },
      {
        url: '/api/placeholder/600/400',
        uploadedAt: '2026-02-06T10:30:00.000Z',
        label: 'composter_image'
      }
    ],
    verificationImages: [],
    gpsMetadata: {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 10,
      timestamp: '2026-02-06T10:30:00.000Z'
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
    verificationStatus: 'PENDING',
    approvalType: 'NONE',
    submissionDate: '2026-02-06T10:30:00.000Z',
    expiresAt: '2026-02-13T10:30:00.000Z',
    createdAt: '2026-02-06T10:30:00.000Z'
  }

  useEffect(() => {
    setTimeout(() => {
      setReport(mockReport)
      setLoading(false)
    }, 600)
  }, [id])

  const handleReview = async () => {
    setSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      setShowReviewModal(false)
      
      // Show success message and navigate back
      alert(`Report ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully!`)
      navigate('/pending-reports')
    }, 1500)
  }

  const openReviewModal = (action) => {
    setReviewAction(action)
    setReviewComment('')
    setRebateAmount('')
    setShowReviewModal(true)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-danger'
  }

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'OFFICER_APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'AUTO_APPROVED': 'bg-blue-100 text-blue-800 border-blue-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status] || styles['PENDING']
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Report not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
            <p className="text-gray-500">ID: {report._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(report.verificationStatus)}`}>
            {report.verificationStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* AI Score Card */}
      <div className="card bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Trust Score</h3>
            <p className="text-gray-600">
              This report has been analyzed by our AI system based on image quality, GPS data, and IoT sensor readings.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${getScoreColor(report.aiTrustScore)}`}>
                {report.aiTrustScore}%
              </p>
              <p className="text-gray-500 text-sm mt-1">Trust Score</p>
            </div>
            <div className="text-center">
              <p className={`text-5xl font-bold ${getScoreColor(report.verificationProbability)}`}>
                {report.verificationProbability}%
              </p>
              <p className="text-gray-500 text-sm mt-1">Verification Probability</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Images */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span>Submitted Images</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.submissionImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full capitalize">
                      {image.label.replace('_', ' ')}
                    </span>
                  </div>
                  {image.gpsMetadata && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* IoT Sensor Data */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>IoT Sensor Data</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-sm text-gray-600">Vibration</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.iotSensorData.vibrationStatus === 'DETECTED' ? 'Detected' : 'Not Detected'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-gray-600">Sensor Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{report.iotSensorData.sensorValue}</p>
                <p className="text-xs text-gray-500 mt-1">Reading</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Battery className="w-5 h-5 text-success" />
                  <span className="text-sm text-gray-600">Battery</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{report.iotSensorData.batteryLevel}%</p>
                <p className="text-xs text-gray-500 mt-1">Level</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Signal className="w-5 h-5 text-warning" />
                  <span className="text-sm text-gray-600">Connection</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.iotSensorData.isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="space-y-6">
          {/* Society Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Society Information</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{report.societyAccountId.societyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{report.societyAccountId.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{report.societyAccountId.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{report.societyAccountId.address}</p>
              </div>
            </div>
          </div>

          {/* Submitted By */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Submitted By</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{report.submittedBy.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{report.submittedBy.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{report.submittedBy.phone}</p>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Submission Details</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(report.submissionDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expires On</p>
                <p className="font-semibold text-gray-900">
                  {new Date(report.expiresAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GPS Location</p>
                <p className="font-medium text-gray-900">
                  {report.gpsMetadata.latitude.toFixed(6)}, {report.gpsMetadata.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">Accuracy: ±{report.gpsMetadata.accuracy}m</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {report.verificationStatus === 'PENDING' && (
            <div className="card bg-gray-50 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Review Report</h3>
              <div className="space-y-3">
                <button
                  onClick={() => openReviewModal('APPROVE')}
                  className="w-full btn-success flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Report</span>
                </button>
                <button
                  onClick={() => openReviewModal('REJECT')}
                  className="w-full btn-danger flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {reviewAction === 'APPROVE' ? 'Approve Report' : 'Reject Report'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={reviewAction === 'APPROVE' ? 'Add your approval comments...' : 'Add rejection reason...'}
                ></textarea>
              </div>

              {reviewAction === 'APPROVE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rebate Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={rebateAmount}
                    onChange={(e) => setRebateAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter rebate amount"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={submitting}
                className={`flex-1 ${reviewAction === 'APPROVE' ? 'btn-success' : 'btn-danger'} disabled:opacity-50`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </span>
                ) : (
                  reviewAction === 'APPROVE' ? 'Approve' : 'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportDetail
