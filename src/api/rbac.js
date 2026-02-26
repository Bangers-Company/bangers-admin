import { apiClient } from './client'

export const rbacApi = {
  async listRoles() {
    return apiClient.get('/roles')
  },

  async getRole(id) {
    return apiClient.get(`/roles/${id}`)
  },

  async saveRole(role) {
    if (role.id) {
      return apiClient.put(`/roles/${role.id}`, role)
    }
    return apiClient.post('/roles', role)
  },

  async deleteRole(id) {
    return apiClient.del(`/roles/${id}`)
  },

  async listPermissions() {
    return apiClient.get('/permissions')
  },
}
