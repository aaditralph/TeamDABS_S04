import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Camera,
  Zap,
  Droplets,
  Thermometer,
  Wind,
  Calendar,
  Download,
  AlertTriangle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const SocietyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [society, setSociety] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('2026-02-06')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  // Mock data - replace with actual API call
  const mockSocietyData = {
    _id: id,
    name: 'Green Valley Residency',
    societyName: 'Green Valley',
    ward: 'A-101',
    sustainabilityScore: 92,
    status: 'verified',
    email: 'secretary@greenvalley.com',
    phone: '+91 98765 43210',
    address: '123 Green Valley Road, Andheri West, Mumbai',
    createdAt: '2026-01-15T10:00:00Z',
    lastActive: '2026-02-06',
    contactPerson: 'Rahul Sharma',
    taxRebateStatus: 'eligible',
    monthlyData: [
      { date: '2026-01-01', moisture: 65, temperature: 32, methane: 12, power: 45 },
      { date: '2026-01-02', moisture: 63, temperature: 33, methane: 11, power: 42 },
      { date: '2026-01-03', moisture: 68, temperature: 31, methane: 14, power: 48 },
      { date: '2026-01-04', moisture: 62, temperature: 34, methane: 10, power: 40 },
      { date: '2026-01-05', moisture: 70, temperature: 30, methane: 15, power: 50 },
      { date: '2026-01-06', moisture: 64, temperature: 32, methane: 12, power: 44 },
      { date: '2026-02-06', moisture: 66, temperature: 31, methane: 13, power: 46 }
    ],
    dailyEvidence: {
      '2026-02-06': {
        geotaggedPhotos: [
          { id: 1, url: '/api/placeholder/400/300', caption: 'Compost Machine - Morning Reading', timestamp: '08:30 AM' },
          { id: 2, url: '/api/placeholder/400/300', caption: 'Compost Machine - Evening Reading', timestamp: '06:30 PM' },
          { id: 3, url: '/api/placeholder/400/300', caption: 'Electricity Meter', timestamp: '08:35 AM' },
          { id: 4, url: '/api/placeholder/400/300', caption: 'Waste Collection Area', timestamp: '08:40 AM' }
        ],
        iotMetrics: {
          moisture: 66,
          temperature: 31,
          methane: 13,
          power: 46
        }
      }
    }
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSociety(mockSocietyData)
      setLoading(false)
    }, 500)
  }, [id])

  const handleApprove = () => {
    // API call to approve
    alert('Tax rebate approved for ' + society.societyName)
  }

  const handleMarkPending = () => {
    // API call to mark as pending
    alert('Society marked as pending review')
  }

  const handleSendEmail = () => {
    // API call to send email
    alert('Email sent to ' + society.email)
    setShowEmailModal(false)
    setEmailMessage('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!society) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-gray-500">Society not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const currentEvidence = society.dailyEvidence[selectedDate]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{society.societyName}</h2>
            <p className="text-gray-500">Digital Evidence Logbook</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowEmailModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Society</span>
          </button>
          <button
            onClick={handleMarkPending}
            className="btn-secondary flex items-center space-x-2 border-warning text-warning hover:bg-warning hover:text-white"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mark as Pending</span>
          </button>
          <button
            onClick={handleApprove}
            className="btn-success flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve Tax Rebate</span>
          </button>
        </div>
      </div>

      {/* Society Info Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-gray-500">Building Name</p>
              <p className="font-medium">{society.societyName}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-gray-500">Ward</p>
              <p className="font-medium">{society.ward}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{society.email}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{society.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="card bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Sustainability Score</h3>
            <p className="text-gray-600">Based on composting activity, power consumption, and IoT metrics</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-success">{society.sustainabilityScore}</p>
            <p className="text-gray-500">/100</p>
          </div>
        </div>
        <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
            style={{ width: `${society.sustainabilityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center space-x-4">
        <Calendar className="w-5 h-5 text-gray-500" />
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-field w-48"
        >
          <option value="2026-02-06">Feb 6, 2026 (Today)</option>
          <option value="2026-02-05">Feb 5, 2026</option>
          <option value="2026-02-04">Feb 4, 2026</option>
        </select>
        <span className="text-sm text-gray-500">3-Way Check: Geotagged Photos + Meter + IoT Data</span>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geotagged Photos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-primary" />
              <span>Geotagged Evidence</span>
            </h3>
            <button className="text-primary text-sm hover:underline flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Download All</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {currentEvidence?.geotaggedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{photo.caption}</p>
                  <p className="text-xs text-gray-500">{photo.timestamp}</p>
                </div>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IoT Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>IoT Sensor Metrics - {selectedDate}</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Moisture</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{currentEvidence?.iotMetrics.moisture}%</p>
              <p className="text-xs text-gray-500">Optimal: 60-70%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Temperature</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{currentEvidence?.iotMetrics.temperature}°C</p>
              <p className="text-xs text-gray-500">Optimal: 30-35°C</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Power Usage</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{currentEvidence?.iotMetrics.power} kWh</p>
              <p className="text-xs text-gray-500">Units used today</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={society.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate()} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="moisture" stackId="1" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} name="Moisture %" />
                <Area type="monotone" dataKey="temperature" stackId="2" stroke="#ea580c" fill="#f97316" fillOpacity={0.6} name="Temp °C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Contact Society Secretary</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input type="text" value={society.email} disabled className="input-field bg-gray-100" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input type="text" value="BMC: Building Oversight - Action Required" disabled className="input-field bg-gray-100" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={5}
                className="input-field"
                placeholder="Enter your message regarding anomalies or concerns..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="btn-primary"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SocietyDetail
