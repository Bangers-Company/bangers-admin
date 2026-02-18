import { apiClient } from './client'

export function getMediaList(page = 1) {
  return apiClient.get('/media', { page })
}

export function getMedia(id) {
  return apiClient.get(`/media/${id}`)
}

export function uploadMedia(file, type, isPublic = true) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('is_public', isPublic ? '1' : '0')
  return apiClient.upload('/media', formData)
}

export function deleteMedia(id) {
  return apiClient.del(`/media/${id}`)
}
