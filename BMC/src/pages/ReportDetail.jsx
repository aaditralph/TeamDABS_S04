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
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { reportsAPI } from '../services/api'

const ReportDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [rebateAmount, setRebateAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await reportsAPI.getReportById(id)
      setReport(response.data.data.report)
    } catch (err) {
      console.error('Error fetching report:', err)
      setError(err.response?.data?.message || 'Failed to load report details')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!reviewAction) return
    
    setSubmitting(true)
    try {
      const data = {
        action: reviewAction,
        comments: reviewComment || undefined,
        rebateAmount: reviewAction === 'APPROVE' && rebateAmount ? parseFloat(rebateAmount) : undefined
      }
      
      await reportsAPI.submitReview(id, data)
      setShowReviewModal(false)
      alert(`Report ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully!`)
      navigate('/pending-reports')
    } catch (err) {
      console.error('Error submitting review:', err)
      alert(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const openReviewModal = (action) => {
    setReviewAction(action)
    setReviewComment('')
    setRebateAmount('')
    setShowReviewModal(true)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'OFFICER_APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'AUTO_APPROVED': 'bg-blue-100 text-blue-800 border-blue-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'EXPIRED': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return styles[status] || styles['PENDING']
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Report</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchReport} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
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

  const isPending = report.verificationStatus === 'PENDING'

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
            {report.verificationStatus?.replace('_', ' ')}
          </span>
          {isPending && (
            <>
              <button
                onClick={() => openReviewModal('REJECT')}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => openReviewModal('APPROVE')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI Score Card */}
      {(report.aiTrustScore || report.verificationProbability) && (
        <div className="card bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-emerald-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                This report has been analyzed by our AI system based on image quality, GPS data, and IoT sensor readings.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {report.aiTrustScore && (
                <div className="text-center">
                  <p className={`text-5xl font-bold ${getScoreColor(report.aiTrustScore)}`}>
                    {report.aiTrustScore}%
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Trust Score</p>
                </div>
              )}
              {report.verificationProbability && (
                <div className="text-center">
                  <p className={`text-5xl font-bold ${getScoreColor(report.verificationProbability)}`}>
                    {report.verificationProbability}%
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Verification Probability</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Images */}
          {report.submissionImages && report.submissionImages.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <span>Submitted Images</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.submissionImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.label || `Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available'
                        }}
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full capitalize">
                        {(image.label || `image_${index + 1}`).replace('_', ' ')}
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
          )}

          {/* IoT Sensor Data */}
          {report.iotSensorData && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>IoT Sensor Data</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-600">Vibration</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.iotSensorData.vibrationStatus === 'DETECTED' ? 'Detected' : 'Not Detected'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Status</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Battery className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-600">Battery</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{report.iotSensorData.batteryLevel}%</p>
                  <p className="text-xs text-gray-500 mt-1">Level</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Signal className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-600">Signal</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.iotSensorData.isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Connection</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-gray-600">Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{report.iotSensorData.sensorValue}</p>
                  <p className="text-xs text-gray-500 mt-1">Sensor Reading</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Device ID:</span> {report.iotSensorData.deviceId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Society Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Society Information</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">
                  {report.societyAccountId?.societyName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{report.societyAccountId?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{report.societyAccountId?.phone || 'N/A'}</p>
              </div>
              {report.societyAccountId?.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold text-gray-900">{report.societyAccountId.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submitter Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Submitted By</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{report.submittedBy?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{report.submittedBy?.email || 'N/A'}</p>
              </div>
              {report.submittedBy?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{report.submittedBy.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* GPS Data */}
          {report.gpsMetadata && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>GPS Location</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Latitude</span>
                  <span className="font-semibold">{report.gpsMetadata.latitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Longitude</span>
                  <span className="font-semibold">{report.gpsMetadata.longitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Accuracy</span>
                  <span className="font-semibold">{report.gpsMetadata.accuracy}m</span>
                </div>
              </div>
            </div>
          )}

          {/* Review Info */}
          {!isPending && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Review Details</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Reviewed By</span>
                  <span className="font-semibold">{report.officerId?.name || 'System'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Review Date</span>
                  <span className="font-semibold">{formatDate(report.reviewTimestamp)}</span>
                </div>
                {report.rebateAmount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Rebate Amount</span>
                    <span className="font-semibold text-green-600">₹{report.rebateAmount}</span>
                  </div>
                )}
                {report.officerComments && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Comments</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{report.officerComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Dates */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Timeline</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="font-semibold">{formatDate(report.submissionDate || report.createdAt)}</span>
              </div>
              {report.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Expires</span>
                  <span className="font-semibold text-red-600">{formatDate(report.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {reviewAction === 'APPROVE' ? 'Approve Report' : 'Reject Report'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none h-24"
                  placeholder="Add your comments..."
                />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter rebate amount"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={submitting}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                  reviewAction === 'APPROVE' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </span>
                ) : (
                  reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'
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