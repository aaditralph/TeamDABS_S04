import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Building2, MapPin, ArrowRight, Loader2 } from 'lucide-react'
import { gamificationAPI } from '../services/api'

const SearchSociety = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [societies, setSocieties] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchSocieties()
  }, [])

  const fetchSocieties = async (query = '') => {
    try {
      setLoading(true)
      const response = await gamificationAPI.getAllSocieties(query)
      setSocieties(response.data.data?.societies || [])
    } catch (error) {
      console.error('Error fetching societies:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchSocieties(searchQuery)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Society</h1>
        <p className="text-gray-600">Search for your building to view reports and savings</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by society name..."
            className="input-field pl-14 pr-32 py-4 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-2 px-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {societies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No societies found</h3>
              <p className="text-gray-500">Try a different search term</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-4">
                Found {societies.length} society{societies.length !== 1 ? 'ies' : 'y'}
              </p>
              {societies.map((society, index) => (
                <motion.div
                  key={society._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/society/${encodeURIComponent(society.societyName)}`}
                    className="card card-hover p-6 block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl text-gray-900 mb-1">
                            {society.societyName}
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{society.address?.city || 'Mumbai'}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-primary-600 font-medium">
                              Rebates: ₹{society.totalRebatesEarned?.toLocaleString() || 0}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                              Streak: {society.complianceStreak || 0} days
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-primary-600">
                        <span className="mr-2 font-medium">View</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchSociety