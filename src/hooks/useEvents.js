import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '@/api/events'

export function useEvents(page = 1, perPage) {
  return useQuery({
    queryKey: ['events', page, perPage],
    queryFn: () => getEvents(page, perPage),
    placeholderData: keepPreviousData,
  })
}

export function useEvent(id) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
