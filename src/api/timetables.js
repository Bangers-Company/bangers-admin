import { apiClient } from './client'

export function getTimetables(params = {}) {
  return apiClient.get('/admin/timetables', params)
}

export function getTimetable(id) {
  return apiClient.get(`/admin/timetables/${id}`)
}

export function createTimetable(data) {
  return apiClient.post('/admin/timetables', data)
}

export function updateTimetable(id, data) {
  return apiClient.put(`/admin/timetables/${id}`, data)
}

export function deleteTimetable(id) {
  return apiClient.del(`/admin/timetables/${id}`)
}

export function publishTimetable(id, is_public = true) {
  return apiClient.patch(`/admin/timetables/${id}/publish`, { is_public })
}
