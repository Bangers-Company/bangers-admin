import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getTimetables, 
  getTimetable, 
  createTimetable, 
  updateTimetable, 
  deleteTimetable, 
  publishTimetable 
} from '@/api/timetables'

export function useTimetables(params = {}) {
  return useQuery({
    queryKey: ['timetables', params],
    queryFn: () => getTimetables(params),
  })
}

export function useTimetable(id) {
  return useQuery({
    queryKey: ['timetables', id],
    queryFn: () => getTimetable(id),
    enabled: !!id,
  })
}

export function useCreateTimetable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createTimetable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
    },
  })
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateTimetable(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
      queryClient.invalidateQueries({ queryKey: ['timetables', variables.id] })
    },
  })
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteTimetable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] })
    },
  })
}

export function usePublishTimetable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_public }) => publishTimetable(id, is_public),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timetables', variables.id] })
    },
  })
}
