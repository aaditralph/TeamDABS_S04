import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ArrowUpDown, Building2, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [societies, setSocieties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [wardFilter, setWardFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'sustainabilityScore', direction: 'desc' })

  // Mock data - replace with actual API calls
  const mockSocieties = [
    {
      _id: '1',
      name: 'Green Valley Residency',
      societyName: 'Green Valley',
      ward: 'A-101',
      sustainabilityScore: 92,
      status: 'verified',
      email: 'secretary@greenvalley.com',
      createdAt: '2026-01-15T10:00:00Z',
      lastActive: '2026-02-05'
    },
    {
      _id: '2',
      name: 'Sunshine Apartments',
      societyName: 'Sunshine Complex',
      ward: 'B-205',
      sustainabilityScore: 78,
      status: 'verified',
      email: 'admin@sunshine.com',
      createdAt: '2026-01-10T10:00:00Z',
      lastActive: '2026-02-04'
    },
    {
      _id: '3',
      name: 'Park View Society',
      societyName: 'Park View',
      ward: 'A-103',
      sustainabilityScore: 45,
      status: 'flagged',
      email: 'contact@parkview.com',
      createdAt: '2026-01-08T10:00:00Z',
      lastActive: '2026-02-01'
    },
    {
      _id: '4',
      name: 'Riverside Heights',
      societyName: 'Riverside',
      ward: 'C-310',
      sustainabilityScore: 88,
      status: 'verified',
      email: 'info@riverside.com',
      createdAt: '2026-01-20T10:00:00Z',
      lastActive: '2026-02-05'
    },
    {
      _id: '5',
      name: 'Metro Towers',
      societyName: 'Metro Complex',
      ward: 'A-105',
      sustainabilityScore: 34,
      status: 'pending',
      email: 'metro@towers.com',
      createdAt: '2026-02-01T10:00:00Z',
      lastActive: '2026-02-03'
    },
    {
      _id: '6',
      name: 'Garden City',
      societyName: 'Garden City Residency',
      ward: 'B-220',
      sustainabilityScore: 95,
      status: 'verified',
      email: 'garden@city.com',
      createdAt: '2025-12-15T10:00:00Z',
      lastActive: '2026-02-06'
    },
    {
      _id: '7',
      name: 'Urban Nest',
      societyName: 'Urban Nest Complex',
      ward: 'C-315',
      sustainabilityScore: 28,
      status: 'flagged',
      email: 'contact@urbannest.com',
      createdAt: '2026-01-25T10:00:00Z',
      lastActive: '2026-01-28'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSocieties(mockSocieties)
      setLoading(false)
    }, 500)
  }, [])

  // Get unique wards for filter
  const wards = ['all', ...new Set(societies.map(s => s.ward))]

  // Filter and sort societies
  const filteredSocieties = societies
    .filter(society => {
      const matchesSearch = society.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           society.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesWard = wardFilter === 'all' || society.ward === wardFilter
      return matchesSearch && matchesWard
    })
    .sort((a, b) => {
      if (sortConfig.key === 'sustainabilityScore') {
        return sortConfig.direction === 'asc' 
          ? a.sustainabilityScore - b.sustainabilityScore
          : b.sustainabilityScore - a.sustainabilityScore
      }
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.societyName.localeCompare(b.societyName)
          : b.societyName.localeCompare(a.societyName)
      }
      return 0
    })

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />
      case 'flagged':
        return <AlertTriangle className="w-5 h-5 text-danger" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      verified: 'status-verified',
      pending: 'status-pending',
      flagged: 'status-flagged'
    }
    return (
      <span className={`status-badge ${styles[status]} flex items-center space-x-1 w-fit`}>
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-warning'
    return 'text-danger'
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Societies</p>
              <p className="text-3xl font-bold">{societies.length}</p>
            </div>
            <Building2 className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Verified</p>
              <p className="text-3xl font-bold text-success">
                {societies.filter(s => s.status === 'verified').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-success opacity-20" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-warning">
                {societies.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-warning opacity-20" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Flagged</p>
              <p className="text-3xl font-bold text-danger">
                {societies.filter(s => s.status === 'flagged').length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-danger opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search society name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Wards</option>
                {wards.filter(w => w !== 'all').map(ward => (
                  <option key={ward} value={ward}>Ward {ward}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Master Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Registered Societies</h3>
          <p className="text-sm text-gray-500">
            Showing {filteredSocieties.length} of {societies.length} societies
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Building Name</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('sustainabilityScore')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Sustainability Score</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSocieties.map((society) => (
                <tr key={society._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{society.societyName}</div>
                        <div className="text-sm text-gray-500">{society.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{society.ward}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${getScoreColor(society.sustainabilityScore)}`}>
                        {society.sustainabilityScore}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">/100</span>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          society.sustainabilityScore >= 80 ? 'bg-success' :
                          society.sustainabilityScore >= 50 ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${society.sustainabilityScore}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(society.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(society.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/society/${society._id}`)}
                      className="flex items-center space-x-1 text-primary hover:text-primary-dark font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSocieties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No societies found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
