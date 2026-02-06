import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  CheckCircle, 
  Clock,
  Filter,
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react'
import { notificationsAPI } from '../services/api'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        limit: 50,
        unreadOnly: filter === 'unread'
      }
      const response = await notificationsAPI.getNotifications(params)
      setNotifications(response.data.data?.notifications || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    await Promise.all(unreadNotifications.map(n => notificationsAPI.markAsRead(n._id)))
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.reportId) {
      navigate(`/report/${notification.reportId}`)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
      case 'REPORT_EXPIRING':
        return <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
      case 'REPORT_APPROVED':
        return <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
      case 'REPORT_REJECTED':
        return <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><Bell className="w-5 h-5 text-red-600" /></div>
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Bell className="w-5 h-5 text-gray-500" /></div>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
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
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchNotifications} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex space-x-2">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={`card p-4 transition-colors cursor-pointer hover:shadow-md ${
              !notification.isRead ? 'bg-blue-50/50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification._id)
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <div className={`w-2.5 h-2.5 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-emerald-600'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Notifications