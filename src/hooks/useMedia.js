import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getMediaList, uploadMedia, deleteMedia } from '@/api/media'

export function useMediaList(page = 1) {
  return useQuery({
    queryKey: ['media', page],
    queryFn: () => getMediaList(page),
    placeholderData: keepPreviousData,
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, type, isPublic }) => uploadMedia(file, type, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })
}
