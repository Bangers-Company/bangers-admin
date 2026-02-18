import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getStages, getStage, createStage, updateStage, deleteStage } from '@/api/stages'

export function useStages(page = 1) {
  return useQuery({
    queryKey: ['stages', page],
    queryFn: () => getStages(page),
    placeholderData: keepPreviousData,
  })
}

export function useStage(id) {
  return useQuery({
    queryKey: ['stages', id],
    queryFn: () => getStage(id),
    enabled: !!id,
  })
}

export function useCreateStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateStage(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages'] })
      queryClient.invalidateQueries({ queryKey: ['stages', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
