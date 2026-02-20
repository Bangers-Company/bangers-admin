import { apiClient } from './client'

export function getEvents(page = 1, params = {}) {
  return apiClient.get('/events', { page, ...params })
}

export function getEvent(id) {
  return apiClient.get(`/events/${id}`)
}

export function createEvent(data) {
  return apiClient.post('/events', data)
}

export function updateEvent(id, data) {
  return apiClient.put(`/events/${id}`, data)
}

export function deleteEvent(id) {
  return apiClient.del(`/events/${id}`)
}
