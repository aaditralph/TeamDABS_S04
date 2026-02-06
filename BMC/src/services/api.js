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
  // Get all pending reviews across all societies
  getPendingReviews: () => api.get('/bmc/pending-reviews'),
  
  // Get all reports with filters
  getAllReports: (params = {}) => api.get('/bmc/reports', { params }),
  
  // Get reports history for a specific society
  getReportsHistory: (societyId) => api.get(`/bmc/reports/history/${societyId}`),
  
  // Get officer's assigned pending reports
  getOfficerPending: () => api.get('/bmc/officer/pending'),
  
  // Get officer's reviewed reports
  getOfficerReviewed: () => api.get('/bmc/officer/reviewed'),
  
  // Get single report details
  getReportById: (id) => api.get(`/verification/reports/${id}`),
  
  // Submit review (approve/reject)
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