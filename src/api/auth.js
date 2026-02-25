import { apiClient } from './client'

export const authApi = {
  async login(credentials, options = {}) {
    const data = await apiClient.post('/auth/login', credentials, options)
    // The backend returns 'accessToken' (based on AuthController.php research)
    if (data.accessToken) {
      localStorage.setItem('auth_token', data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  async me() {
    return apiClient.get('/users/me')
  },
}
