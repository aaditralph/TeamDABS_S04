import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  CheckCircle, 
  Clock,
  Trash2,
  Filter
} from 'lucide-react'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Mock data based on API
  const mockNotifications = [
    {
      _id: '1',
      type: 'REPORT_SUBMITTED',
      title: 'New Report Submitted',
      message: 'Green Valley Apartments has submitted a new report',
      reportId: '101',
      societyId: 's1',
      isRead: false,
      createdAt: '2026-02-06T10:30:00.000Z'
    },
    {
      _id: '2',
      type: 'REPORT_SUBMITTED',
      title: 'New Report Submitted',
      message: 'Sunrise Residency has submitted a new report',
      reportId: '102',
      societyId: 's2',
      isRead: false,
      createdAt: '2026-02-05T14:20:00.000Z'
    },
    {
      _id: '3',
      type: 'REPORT_EXPIRING',
      title: 'Report Expiring Soon',
      message: 'Report from Metro Heights will expire in 2 days',
      reportId: '103',
      societyId: 's3',
      isRead: true,
      createdAt: '2026-02-04T09:15:00.000Z'
    },
    {
      _id: '4',
      type: 'REPORT_SUBMITTED',
      title: 'New Report Submitted',
      message: 'Ocean View Society has submitted a new report',
      reportId: '104',
      societyId: 's4',
      isRead: true,
      createdAt: '2026-02-03T16:45:00.000Z'
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 600)
  }, [])

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n._id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
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
        return <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Bell className="w-5 h-5 text-primary" /></div>
      case 'REPORT_EXPIRING':
        return <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Bell className="w-5 h-5 text-gray-500" /></div>
    }
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
                  ? 'bg-primary text-white'
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
            className={`card p-4 transition-colors ${
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
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <div className={`w-2.5 h-2.5 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`}></div>
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
