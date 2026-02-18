import { apiClient } from './client'

export function getActs(page = 1) {
  return apiClient.get('/acts', { page })
}

export function getAct(id) {
  return apiClient.get(`/acts/${id}`)
}

export function createAct(data) {
  return apiClient.post('/acts', data)
}

export function updateAct(id, data) {
  return apiClient.put(`/acts/${id}`, data)
}

export function deleteAct(id) {
  return apiClient.del(`/acts/${id}`)
}

export function attachArtistToAct(actId, artistId) {
  return apiClient.post(`/acts/${actId}/artists`, { artist_id: artistId })
}

export function detachArtistFromAct(actId, artistId) {
  return apiClient.del(`/acts/${actId}/artists`, { artist_id: artistId })
}

export function attachStageToAct(actId, stageId) {
  return apiClient.post(`/acts/${actId}/stages`, { stage_id: stageId })
}

export function detachStageFromAct(actId, stageId) {
  return apiClient.del(`/acts/${actId}/stages`, { stage_id: stageId })
}
