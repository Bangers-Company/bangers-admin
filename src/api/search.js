import { apiClient } from './client'

export function search(params = {}) {
  return apiClient.get('/search', params)
}
