import { apiClient } from './client'

export function getArtists(page = 1) {
  return apiClient.get('/artists', { page })
}

export function getArtist(id) {
  return apiClient.get(`/artists/${id}`)
}

export function createArtist(data) {
  return apiClient.post('/artists', data)
}

export function updateArtist(id, data) {
  return apiClient.put(`/artists/${id}`, data)
}

export function deleteArtist(id) {
  return apiClient.del(`/artists/${id}`)
}
