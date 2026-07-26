// Axios instance configured for Django backend with JWT auto-refresh
import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register:        (data) => api.post('/auth/register/', data),
  login:           (data) => api.post('/auth/login/', data),
  logout:          (data) => api.post('/auth/logout/', data),
  getProfile:      ()     => api.get('/auth/profile/'),
  updateProfile:   (data) => api.put('/auth/profile/', data),
  changePassword:  (data) => api.post('/auth/change-password/', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password/', data),
  resetPassword:   (data) => api.post('/auth/reset-password/', data),
  uploadPhoto:     (form) => api.post('/auth/profile/photo/', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUsers:        ()     => api.get('/auth/admin/users/'),
  updateUser:      (id, data) => api.put(`/auth/admin/users/${id}/`, data),
  deleteUser:      (id)  => api.delete(`/auth/admin/users/${id}/`),
}

// ─── Datasets ──────────────────────────────────────────
export const datasetsAPI = {
  upload:   (form) => api.post('/datasets/upload/', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list:     ()     => api.get('/datasets/'),
  detail:   (id)   => api.get(`/datasets/${id}/`),
  delete:   (id)   => api.delete(`/datasets/${id}/`),
  clean:    (id)   => api.post(`/datasets/${id}/clean/`),
  preview:  (id)   => api.get(`/datasets/${id}/preview/`),
}

// ─── Predictions ───────────────────────────────────────
export const predictionsAPI = {
  run:    (data) => api.post('/predictions/run/', data),
  list:   (params) => api.get('/predictions/', { params }),
  detail: (id)   => api.get(`/predictions/${id}/`),
  delete: (id)   => api.delete(`/predictions/${id}/`),
}

// ─── Scenarios ─────────────────────────────────────────
export const scenariosAPI = {
  simulate: (data) => api.post('/scenarios/simulate/', data),
  list:     ()     => api.get('/scenarios/'),
  detail:   (id)   => api.get(`/scenarios/${id}/`),
  delete:   (id)   => api.delete(`/scenarios/${id}/`),
}

// ─── Reports ───────────────────────────────────────────
export const reportsAPI = {
  generate: (data) => api.post('/reports/generate/', data),
  list:     ()     => api.get('/reports/'),
  download: (id)   => `${API_BASE_URL}/reports/${id}/download/`,
  delete:   (id)   => api.delete(`/reports/${id}/delete/`),
}

// ─── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats/'),
}

export default api
