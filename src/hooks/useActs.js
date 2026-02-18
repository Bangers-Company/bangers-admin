import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  getActs, getAct, createAct, updateAct, deleteAct,
  attachArtistToAct, detachArtistFromAct,
  attachStageToAct, detachStageFromAct,
} from '@/api/acts'

export function useActs(page = 1) {
  return useQuery({
    queryKey: ['acts', page],
    queryFn: () => getActs(page),
    placeholderData: keepPreviousData,
  })
}

export function useAct(id) {
  return useQuery({
    queryKey: ['acts', id],
    queryFn: () => getAct(id),
    enabled: !!id,
  })
}

export function useCreateAct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createAct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acts'] })
    },
  })
}

export function useUpdateAct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateAct(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      queryClient.invalidateQueries({ queryKey: ['acts', variables.id] })
    },
  })
}

export function useDeleteAct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteAct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acts'] })
    },
  })
}

export function useAttachArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ actId, artistId }) => attachArtistToAct(actId, artistId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acts', variables.actId] })
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}

export function useDetachArtist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ actId, artistId }) => detachArtistFromAct(actId, artistId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acts', variables.actId] })
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}

export function useAttachStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ actId, stageId }) => attachStageToAct(actId, stageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acts', variables.actId] })
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      queryClient.invalidateQueries({ queryKey: ['stages'] })
    },
  })
}

export function useDetachStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ actId, stageId }) => detachStageFromAct(actId, stageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acts', variables.actId] })
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      queryClient.invalidateQueries({ queryKey: ['stages'] })
    },
  })
}
