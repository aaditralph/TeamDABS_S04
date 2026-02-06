import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Building2,
  User,
  Search,
  Filter
} from 'lucide-react'

const ReviewedReports = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const mockReports = [
    {
      _id: '101',
      societyAccountId: {
        _id: 's1',
        societyName: 'Green Valley Apartments'
      },
      submittedBy: {
        name: 'Jane Resident'
      },
      verificationStatus: 'OFFICER_APPROVED',
      approvalType: 'OFFICER',
      officerComments: 'All documents verified successfully',
      rebateAmount: 500,
      reviewTimestamp: '2026-02-05T11:00:00.000Z',
      aiTrustScore: 85
    },
    {
      _id: '102',
      societyAccountId: {
        _id: 's2',
        societyName: 'Sunrise Residency'
      },
      submittedBy: {
        name: 'John Smith'
      },
      verificationStatus: 'REJECTED',
      approvalType: 'OFFICER',
      officerComments: 'Meter reading unclear, please resubmit',
      rebateAmount: 0,
      reviewTimestamp: '2026-02-04T14:30:00.000Z',
      aiTrustScore: 45
    },
    {
      _id: '103',
      societyAccountId: {
        _id: 's3',
        societyName: 'Metro Heights'
      },
      submittedBy: {
        name: 'Alice Johnson'
      },
      verificationStatus: 'AUTO_APPROVED',
      approvalType: 'AUTOMATIC',
      officerComments: null,
      rebateAmount: 500,
      reviewTimestamp: '2026-02-03T09:15:00.000Z',
      aiTrustScore: 92
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 600)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.societyAccountId.societyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'approved') return matchesSearch && report.verificationStatus === 'OFFICER_APPROVED'
    if (filterStatus === 'rejected') return matchesSearch && report.verificationStatus === 'REJECTED'
    if (filterStatus === 'auto') return matchesSearch && report.verificationStatus === 'AUTO_APPROVED'
    return matchesSearch
  })

  const getStatusBadge = (status) => {
    const styles = {
      'OFFICER_APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'AUTO_APPROVED': 'bg-blue-100 text-blue-800 border-blue-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    if (status === 'OFFICER_APPROVED' || status === 'AUTO_APPROVED') {
      return <CheckCircle className="w-4 h-4" />
    }
    return <XCircle className="w-4 h-4" />
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviewed Reports</h2>
        <p className="text-gray-500 mt-1">View all reports you have reviewed</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by society name..."
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
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="auto">Auto Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Society
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rebate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reviewed On
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{report.societyAccountId.societyName}</p>
                        <p className="text-sm text-gray-500">by {report.submittedBy.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(report.verificationStatus)}`}>
                      {getStatusIcon(report.verificationStatus)}
                      <span>{report.verificationStatus.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      report.aiTrustScore >= 80 ? 'text-success' :
                      report.aiTrustScore >= 50 ? 'text-warning' : 'text-danger'
                    }`}>
                      {report.aiTrustScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${report.rebateAmount > 0 ? 'text-success' : 'text-gray-500'}`}>
                      ₹{report.rebateAmount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.reviewTimestamp).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/report/${report._id}`)}
                      className="flex items-center space-x-2 text-primary hover:text-primary-dark font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviewed reports found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewedReports
