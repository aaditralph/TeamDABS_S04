import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, Calendar, TrendingUp, Leaf, DollarSign, ArrowLeft, Loader2 } from 'lucide-react'
import { gamificationAPI } from '../services/api'

const SocietyDetails = () => {
  const { societyName } = useParams()
  const [society, setSociety] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchSocietyData()
  }, [societyName])

  const fetchSocietyData = async () => {
    try {
      setLoading(true)
      const [societyRes, reportsRes] = await Promise.all([
        gamificationAPI.getSocietyByName(societyName),
        gamificationAPI.getSocietyReports(societyName, { limit: 10 }),
      ])

      setSociety(societyRes.data.data?.society)
      setReports(reportsRes.data.data?.reports || [])
    } catch (error) {
      console.error('Error fetching society data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'AUTO_APPROVED': 'bg-blue-100 text-blue-800',
      'OFFICER_APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const approvedReports = reports.filter(r => 
    r.verificationStatus === 'OFFICER_APPROVED' || r.verificationStatus === 'AUTO_APPROVED'
  )

  const totalRebates = approvedReports.reduce((sum, r) => sum + (r.rebateAmount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!society) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Society not found</h2>
        <Link to="/search" className="btn-primary inline-flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5 mr-1" />
        <span>Back to Search</span>
      </Link>

      {/* Society Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{society.societyName}</h1>
            <div className="flex items-center text-primary-100 mb-1">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{society.address?.street}, {society.address?.city}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-primary-100">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {society.phone}
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {society.email}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{society.complianceStreak || 0}</div>
            <div className="text-primary-100">Day Streak 🔥</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">₹{totalRebates.toLocaleString()}</span>
          </div>
          <p className="text-gray-500 text-sm">Total Rebates Earned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Leaf className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">{approvedReports.length}</span>
          </div>
          <p className="text-gray-500 text-sm">Approved Reports</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-secondary-500" />
            <span className="text-2xl font-bold text-gray-900">
              {reports.length > 0 
                ? Math.round(reports.reduce((sum, r) => sum + (r.verificationProbability || 0), 0) / reports.length)
                : 0}%
            </span>
          </div>
          <p className="text-gray-500 text-sm">Avg Verification Score</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-6">
          {['overview', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          {reports.slice(0, 5).map((report, index) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    report.verificationStatus === 'PENDING' ? 'bg-yellow-100' :
                    report.verificationStatus === 'REJECTED' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      report.verificationStatus === 'PENDING' ? 'text-yellow-600' :
                      report.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Report Submitted
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.submissionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${getStatusColor(report.verificationStatus)}`}>
                    {report.verificationStatus.replace('_', ' ')}
                  </span>
                  {report.rebateAmount > 0 && (
                    <p className="text-green-600 font-semibold mt-1">
                      +₹{report.rebateAmount}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">All Reports</h2>
          {reports.map((report, index) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(report.submissionDate).toLocaleDateString('en-IN')}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>Verification Score: {report.verificationProbability}%</span>
                    {report.approvedDays && (
                      <span>Approved in {report.approvedDays} days</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${getStatusColor(report.verificationStatus)}`}>
                    {report.verificationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SocietyDetails