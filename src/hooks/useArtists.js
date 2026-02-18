import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getArtists, getArtist, createArtist, updateArtist, deleteArtist } from '@/api/artists'

export function useArtists(page = 1) {
  return useQuery({
    queryKey: ['artists', page],
    queryFn: () => getArtists(page),
    placeholderData: keepPreviousData,
  })
}

export function useArtist(id) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: () => getArtist(id),
    enabled: !!id,
  })
}

export function useCreateArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createArtist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}

export function useUpdateArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateArtist(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      queryClient.invalidateQueries({ queryKey: ['artists', variables.id] })
    },
  })
}

export function useDeleteArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteArtist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}
