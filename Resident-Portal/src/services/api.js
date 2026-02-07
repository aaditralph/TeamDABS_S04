import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Gamification/Public APIs
export const gamificationAPI = {
  // Get all societies
  getAllSocieties: (search) => api.get('/resident/societies', { params: { search } }),
  
  // Get society by name
  getSocietyByName: (societyName) => api.get(`/resident/societies/${encodeURIComponent(societyName)}`),
  
  // Get society reports
  getSocietyReports: (societyName, params) => 
    api.get(`/resident/societies/${encodeURIComponent(societyName)}/reports`, { params }),
  
  // Get report details
  getReportDetails: (societyName, reportId) => 
    api.get(`/resident/societies/${encodeURIComponent(societyName)}/reports/${reportId}`),
  
  // Get tax rebates
  getTaxRebates: (societyName, params) => 
    api.get(`/resident/societies/${encodeURIComponent(societyName)}/tax-rebates`, { params }),
  
  // Get full leaderboard
  getLeaderboard: (params) => api.get('/resident/leaderboard', { params }),
  
  // Get top N societies
  getTopSocieties: (n) => api.get(`/resident/leaderboard/top/${n}`),
  
  // Get society rank
  getSocietyRank: (societyName) => api.get(`/resident/leaderboard/society/${encodeURIComponent(societyName)}`),
}

export default api