import { apiClient } from './client'

export function getStages(page = 1) {
  return apiClient.get('/stages', { page })
}

export function getStage(id) {
  return apiClient.get(`/stages/${id}`)
}

export function createStage(data) {
  return apiClient.post('/stages', data)
}

export function updateStage(id, data) {
  return apiClient.put(`/stages/${id}`, data)
}

export function deleteStage(id) {
  return apiClient.del(`/stages/${id}`)
}
