import { useQuery } from '@tanstack/react-query'
import { search } from '@/api/search'

export function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => search({ query, entities: 'events,artists,acts' }),
    enabled: query.length >= 2,
  })
}
