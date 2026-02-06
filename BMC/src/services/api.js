import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('officerToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('officerToken')
      localStorage.removeItem('officerUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication APIs
export const authAPI = {
  login: (email, password) => api.post('/officer/login', { email, password }),
  register: (formData) => api.post('/officer/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProfile: () => api.get('/officer/me'),
}

// Report Management APIs
export const reportsAPI = {
  getPendingReviews: () => api.get('/bmc/pending-reviews'),
  getAllReports: (params = {}) => api.get('/bmc/reports', { params }),
  getReportsHistory: (societyId) => api.get(`/bmc/reports/history/${societyId}`),
  getOfficerPending: () => api.get('/bmc/officer/pending'),
  getOfficerReviewed: () => api.get('/bmc/officer/reviewed'),
  getReportById: (id) => api.get(`/verification/reports/${id}`),
  submitReview: (id, data) => api.patch(`/bmc/review/${id}`, data),
}

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/bmc/officer/dashboard'),
}

// Notification APIs
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/bmc/officer/notifications', { params }),
  markAsRead: (id) => api.patch(`/bmc/officer/notifications/${id}/read`),
}

export default api