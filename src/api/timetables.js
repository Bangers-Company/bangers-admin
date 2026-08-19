import { apiClient } from './client'

export function getTimetables(params = {}) {
  return apiClient.get('/timetables', params)
}

export function getTimetable(id) {
  return apiClient.get(`/timetables/${id}`)
}

export function createTimetable(data) {
  return apiClient.post('/timetables', data)
}

export function updateTimetable(id, data) {
  return apiClient.put(`/timetables/${id}`, data)
}

export function deleteTimetable(id) {
  return apiClient.del(`/timetables/${id}`)
}

export function publishTimetable(id, is_public = true) {
  return apiClient.patch(`/timetables/${id}/publish`, { is_public })
}
